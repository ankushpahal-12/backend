/**
 * useCSRFToken Hook - Enhanced with Auto-Refresh
 * 
 * ✅ Properly handles CSRF tokens with HTTP-only cookies
 * ✅ Uses credentials: 'include' to send HTTP-only auth cookie
 * ✅ Includes CSRF token from meta tag or fetches from server
 * ✅ Auto-refreshes token before expiration (1 hour default)
 * 
 * IMPORTANT: This hook works ALONGSIDE HTTP-only auth cookies!
 * Auth tokens are in HTTP-only cookies (cannot be read by JS)
 * CSRF tokens are needed for cross-origin protection (separate concern)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';

interface CSRFTokenState {
  csrfToken: string | null;
  loading: boolean;
  error: string | null;
  expiresAt?: number;
}

const CSRF_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const CSRF_REFRESH_BEFORE_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiry

export const useCSRFToken = (options = { autoRefresh: true, retryCount: 3 }) => {
  const [state, setState] = useState<CSRFTokenState>({
    csrfToken: null,
    loading: false,
    error: null,
    expiresAt: undefined,
  });

  const [retries, setRetries] = useState(0);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  /**
   * Fetch CSRF token from server
   */
  const fetchCSRFToken = useCallback(async (): Promise<string | null> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await api.get('/csrf-token');
      const data = response.data;
      const token = data.csrfToken;
      const expiresIn = data.expiresIn || 3600; // Default 1 hour

      if (!token) {
        throw new Error('CSRF token not provided by server');
      }

      const expiresAt = Date.now() + expiresIn * 1000;

      setState((prev) => ({
        ...prev,
        csrfToken: token,
        loading: false,
        error: null,
        expiresAt,
      }));

      console.log('[CSRF] Token fetched successfully, expires at:', new Date(expiresAt).toISOString());
      return token;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMsg,
      }));

      // Retry logic with exponential backoff
      if (retries < options.retryCount) {
        setRetries((prev) => prev + 1);
        console.warn(`[CSRF] Retry ${retries + 1}/${options.retryCount}`);
        await new Promise((resolve) =>
          setTimeout(resolve, 100 * Math.pow(2, retries))
        );
        return fetchCSRFToken();
      }

      console.error('[CSRF] Failed to fetch token after retries:', errorMsg);
      return null;
    }
  }, [options.retryCount, retries]);

  /**
   * Check if token is expired and needs refresh
   */
  const isTokenExpired = useCallback((): boolean => {
    if (!state.expiresAt) return true;
    const now = Date.now();
    const timeUntilExpiry = state.expiresAt - now;
    // Refresh if less than CSRF_REFRESH_BEFORE_MS until expiry
    return timeUntilExpiry < CSRF_REFRESH_BEFORE_MS;
  }, [state.expiresAt]);

  /**
   * Schedule auto-refresh of CSRF token
   */
  const scheduleTokenRefresh = useCallback(() => {
    if (!options.autoRefresh || !state.expiresAt) return;

    // Clear existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    const now = Date.now();
    const timeUntilRefresh = state.expiresAt - now - CSRF_REFRESH_BEFORE_MS;

    if (timeUntilRefresh > 0) {
      console.log(
        `[CSRF] Scheduled refresh in ${Math.round(timeUntilRefresh / 1000)} seconds`
      );

      refreshTimerRef.current = setTimeout(() => {
        if (!isRefreshingRef.current) {
          isRefreshingRef.current = true;
          console.log('[CSRF] Auto-refreshing token...');
          fetchCSRFToken().finally(() => {
            isRefreshingRef.current = false;
          });
        }
      }, timeUntilRefresh);
    }
  }, [state.expiresAt, options.autoRefresh, fetchCSRFToken]);

  /**
   * Get CSRF token from meta tag or fetch from server
   */
  const getCSRFToken = useCallback((): string | null => {
    // Try to get from meta tag first (set by backend on initial page load)
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
      const token = metaTag.getAttribute('content');
      if (token) {
        console.log('[CSRF] Token found in meta tag');
        setState((prev) => ({
          ...prev,
          csrfToken: token,
          expiresAt: Date.now() + CSRF_TOKEN_EXPIRY_MS,
        }));
        return token;
      }
    }

    return state.csrfToken;
  }, [state.csrfToken]);

  /**
   * Make fetch request with CSRF token and HTTP-only cookie
   * 
   * ✅ CRITICAL: credentials: 'include' sends HTTP-only auth cookie
   * ✅ X-CSRF-Token header protects against CSRF attacks
   */
  const fetchWithCSRF = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      try {
        // Check if token needs refresh
        if (isTokenExpired()) {
          console.log('[CSRF] Token expired, fetching new one...');
          await fetchCSRFToken();
        }

        // Get CSRF token
        let csrfToken = state.csrfToken || getCSRFToken();

        // If no token and method is state-changing, fetch it
        if (
          !csrfToken &&
          ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method?.toUpperCase() || 'GET')
        ) {
          csrfToken = await fetchCSRFToken();
        }

        // Prepare headers
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...((options.headers as Record<string, string>) || {}),
        };

        // Add CSRF token for state-changing requests
        if (csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method?.toUpperCase() || 'GET')) {
          headers['X-CSRF-Token'] = csrfToken;
        }

        // ✅ CRITICAL: credentials: 'include' sends HTTP-only auth_token!
        const response = await api.request({
          url,
          method: options.method || 'GET',
          data: options.body ? JSON.parse(String(options.body)) : undefined,
          headers,
          withCredentials: true,
          validateStatus: () => true,
        });

        const responseBody = typeof response.data === 'string'
          ? response.data
          : JSON.stringify(response.data ?? {});
        const responseHeaders = new Headers();

        Object.entries(response.headers || {}).forEach(([key, value]) => {
          if (typeof value === 'string') {
            responseHeaders.set(key, value);
          }
        });

        const wrappedResponse = new Response(responseBody, {
          status: response.status,
          headers: responseHeaders,
        });

        // If 403 CSRF error, refresh token and retry once
        if (wrappedResponse.status === 403) {
          const errorData = await wrappedResponse.clone().json().catch(() => ({}));
          if (
            errorData.code === 'CSRF_TOKEN_INVALID' ||
            errorData.code === 'CSRF_TOKEN_EXPIRED'
          ) {
            console.warn('[CSRF] Token invalid/expired, refreshing...');
            const newToken = await fetchCSRFToken();

            if (newToken) {
              // Retry with new token
              headers['X-CSRF-Token'] = newToken;
              const retryResponse = await api.request({
                url,
                method: options.method || 'GET',
                data: options.body ? JSON.parse(String(options.body)) : undefined,
                headers,
                withCredentials: true,
                validateStatus: () => true,
              });

              const retryBody = typeof retryResponse.data === 'string'
                ? retryResponse.data
                : JSON.stringify(retryResponse.data ?? {});
              const retryHeaders = new Headers();

              Object.entries(retryResponse.headers || {}).forEach(([key, value]) => {
                if (typeof value === 'string') {
                  retryHeaders.set(key, value);
                }
              });

              return new Response(retryBody, {
                status: retryResponse.status,
                headers: retryHeaders,
              });
            }
          }
        }

        // If 401 Unauthorized, auth cookie likely expired or invalid
        if (wrappedResponse.status === 401) {
          console.warn('[CSRF] Authentication failed (401) - redirecting to login');
          window.location.href = '/login';
        }

        return wrappedResponse;
      } catch (error) {
        console.error('[CSRF] Fetch error:', error);
        throw error;
      }
    },
    [state.csrfToken, getCSRFToken, fetchCSRFToken]
  );

  /**
   * Refresh CSRF token manually
   */
  const refreshToken = useCallback(async (): Promise<string | null> => {
    setRetries(0);
    return fetchCSRFToken();
  }, [fetchCSRFToken]);

  /**
   * Initialize CSRF token on mount and set up auto-refresh
   */
  useEffect(() => {
    // Try to get from meta tag first
    const token = getCSRFToken();

    // If not found, fetch from server
    if (!token) {
      fetchCSRFToken();
    }

    // Return cleanup function
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [fetchCSRFToken, getCSRFToken]);

  /**
   * Schedule token refresh when expiresAt changes
   */
  useEffect(() => {
    scheduleTokenRefresh();

    // Cleanup
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [state.expiresAt, scheduleTokenRefresh]);

  return {
    csrfToken: state.csrfToken,
    loading: state.loading,
    error: state.error,
    expiresAt: state.expiresAt,
    isExpired: isTokenExpired(),
    fetchWithCSRF,
    refreshToken,
  };
};

export default useCSRFToken;
