import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { ENV } from '../config/env';
import { isLikelyOfflineError } from '../system/network/utils/network.utils';
import { enqueueRetryRequest, type RetryMethod } from '../system/network/services/retryQueue.service';

const getApiBaseUrl = () => {
    let url = ENV.apiUrl;
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    if (!url.endsWith('/api')) {
        url = `${url}/api`;
    }
    return url;
};

const CSRF_TOKEN_STORAGE_KEY = 'csrf-token';
const CSRF_REFRESH_STORAGE_KEY = 'csrf-token-refresh';
const CSRF_TOKEN_EXPIRY_MS = 60 * 60 * 1000;

const normalizeApiPath = (url: string) => {
    if (url.startsWith('/api/v1/')) {
        return url.replace(/^\/api/, '');
    }

    if (url.startsWith('/api/')) {
        return url.replace(/^\/api/, '/v1');
    }

    if (url.startsWith('/v1/')) {
        return url;
    }

    return url.startsWith('/') ? `/v1${url}` : `/v1/${url}`;
};

const getCachedCSRFToken = () => {
    // Check sessionStorage first (most reliable cache)
    if (typeof sessionStorage !== 'undefined') {
        const stored = sessionStorage.getItem(CSRF_TOKEN_STORAGE_KEY);
        if (stored && stored.length > 0) {
            return stored;
        }
    }

    // Only check meta tag if it has non-empty content
    if (typeof document !== 'undefined') {
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        const metaToken = metaTag?.getAttribute('content');
        if (metaToken && metaToken.length > 0) {
            // If found in meta, store it for future use
            if (typeof sessionStorage !== 'undefined') {
                storeCSRFToken(metaToken);
            }
            return metaToken;
        }
    }

    return null;
};

const storeCSRFToken = (token: string) => {
    if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(CSRF_TOKEN_STORAGE_KEY, token);
        sessionStorage.setItem(CSRF_REFRESH_STORAGE_KEY, Date.now().toString());
    }
};

let csrfTokenPromise: Promise<string | null> | null = null;
let csrfTokenInitialized = false;

const fetchCSRFToken = async (retryCount = 0): Promise<string | null> => {
    // If a fetch is already in progress, wait for it instead of making another request
    if (csrfTokenPromise) {
        return csrfTokenPromise;
    }

    // Check cache one more time before fetching
    const cached = getCachedCSRFToken();
    if (cached && !tokenIsStale()) {
        return cached;
    }

    csrfTokenPromise = (async () => {
        try {
            const response = await fetch(`${getApiBaseUrl()}/v1/csrf-token`, {
                method: 'GET',
                credentials: 'include',
                signal: AbortSignal.timeout(5000), // 5 second timeout
            });

            if (!response.ok) {
                if (response.status === 429 && retryCount < 2) {
                    // Rate limited - exponential backoff retry
                    await new Promise(resolve => 
                        setTimeout(resolve, Math.pow(2, retryCount) * 1000)
                    );
                    // Retry recursively
                    return fetchCSRFToken(retryCount + 1);
                }
                console.error(`[CSRF] Token fetch failed: ${response.status}`);
                return null;
            }

            const data = await response.json();
            if (data?.csrfToken && data.csrfToken.length > 0) {
                storeCSRFToken(data.csrfToken);
                return data.csrfToken as string;
            }

            return null;
        } catch (err) {
            if ((err as any).name === 'AbortError') {
                console.error('[CSRF] Token fetch timeout');
            } else {
                console.error('[CSRF] Error fetching token:', err);
            }
            return null;
        }
    })().finally(() => {
        csrfTokenPromise = null;
    });

    return csrfTokenPromise;
};

const tokenIsStale = () => {
    if (typeof sessionStorage === 'undefined') {
        return true;
    }

    const lastRefresh = sessionStorage.getItem(CSRF_REFRESH_STORAGE_KEY);
    if (!lastRefresh) {
        return true;
    }

    return Date.now() - Number(lastRefresh) > CSRF_TOKEN_EXPIRY_MS - (5 * 60 * 1000);
};

/**
 * Initialize CSRF token on app startup
 * Call this once when the app loads to pre-fetch and cache the token
 */
export const initializeCSRFToken = async () => {
    if (csrfTokenInitialized) {
        return;
    }
    csrfTokenInitialized = true;
    
    // Check if we already have a valid cached token
    const cached = getCachedCSRFToken();
    if (cached && !tokenIsStale()) {
        return;
    }

    // Fetch and cache for future use
    await fetchCSRFToken();
};

const api = axios.create({
    baseURL: getApiBaseUrl(),
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (config) => {
    if (config.url) {
        config.url = normalizeApiPath(config.url);
    }

    const method = String(config.method || 'get').toUpperCase();
    const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    if (isStateChanging) {
        let csrfToken = getCachedCSRFToken();

        // Only fetch if we don't have a cached token or it's stale
        if (!csrfToken || tokenIsStale()) {
            csrfToken = await fetchCSRFToken();
        }

        if (csrfToken) {
            config.headers = config.headers ?? {};
            (config.headers as Record<string, string>)['X-CSRF-Token'] = csrfToken;
        }
    }

    return config;
});

// VULN-10 FIX: Removed sessionStorage Bearer token interceptor.
// Authentication is now exclusively via the HttpOnly cookie (withCredentials: true above).
// Storing JWTs in sessionStorage is XSS-accessible; HttpOnly cookies are not.

/**
 * Response interceptor for handling backend error format
 * Backend returns: { status, statusCode, error: { code, message, details, timestamp } }
 */
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        // Handle backend error response format
        const backendError = error.response?.data as any;

        if (backendError?.error?.code) {
            // NEW backend error format detected
            console.warn(`Backend Error [${backendError.error.code}]:`, backendError.error.message);
            
            // Enhance error with backend details
            error.message = backendError.error.message;
            (error as any).errorCode = backendError.error.code;
            (error as any).errorDetails = backendError.error.details;
        }

        // ── Auto-enqueue offline mutating requests into the retry queue ──────
        // When a POST / PUT / PATCH / DELETE fails due to a network/offline error
        // (not a 4xx/5xx server response), we persist the request so it is
        // automatically replayed once the connection is restored.
        const cfg: InternalAxiosRequestConfig | undefined = error.config;
        const METHOD_ALLOWLIST: string[] = ['POST', 'PUT', 'PATCH', 'DELETE'];
        const method = String(cfg?.method ?? '').toUpperCase();

        const isOfflineFailure =
            !error.response &&          // no HTTP response  → network-level failure
            isLikelyOfflineError(error) &&
            METHOD_ALLOWLIST.includes(method) &&
            cfg?.url;

        if (isOfflineFailure && cfg) {
            const rawUrl = cfg.url as string;
            const baseURL = (cfg.baseURL ?? getApiBaseUrl()).replace(/\/$/, '');
            const absoluteUrl = /^https?:\/\//i.test(rawUrl)
                ? rawUrl
                : `${baseURL}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;

            // Collect any custom headers the request was about to send
            const safeHeaders: Record<string, string> = {};
            if (cfg.headers) {
                for (const [k, v] of Object.entries(cfg.headers)) {
                    if (typeof v === 'string') {
                        safeHeaders[k] = v;
                    }
                }
            }

            enqueueRetryRequest({
                url: absoluteUrl,
                method: method as RetryMethod,
                headers: safeHeaders,
                body: cfg.data,
            }, `Offline – queued for retry (${error.message})`);

            console.info(
                `[RetryQueue] Queued ${method} ${rawUrl} — will replay when back online.`,
            );
        }

        // Re-throw for caller to handle
        return Promise.reject(error);
    }
);

export default api;
