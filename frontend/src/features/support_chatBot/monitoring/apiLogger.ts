/**
 * apiLogger.ts
 * Intercepts fetch requests to capture failed API calls (status >= 400).
 * Sanitizes payloads — strips passwords, tokens, secrets.
 * Also captures request timing for performance insights.
 */

import { appendLog } from './sessionStorage';

const SENSITIVE_KEYS = ['password', 'token', 'secret', 'key', 'authorization', 'auth', 'credential', 'passwd'];

const sanitize = (obj: unknown): unknown => {
  if (!obj || typeof obj !== 'object') return obj;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.some((s) => k.toLowerCase().includes(s))) {
      out[k] = '***';
    } else if (typeof v === 'object') {
      out[k] = sanitize(v);
    } else {
      out[k] = v;
    }
  }
  return out;
};

let patched = false;

export const initApiLogger = (): void => {
  if (patched || typeof window === 'undefined') return;
  patched = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const method = init?.method?.toUpperCase() || 'GET';
    const startTime = Date.now();

    let payload: unknown;
    if (init?.body) {
      try {
        payload = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
        payload = sanitize(payload);
      } catch {
        payload = '[non-JSON body]';
      }
    }

    try {
      const response = await originalFetch(input, init);
      const duration = Date.now() - startTime;

      // Only log failures (4xx / 5xx)
      if (!response.ok) {
        appendLog({
          type: 'api_failure',
          message: `${method} ${url} → ${response.status} ${response.statusText}`,
          timestamp: new Date().toISOString(),
          meta: {
            method,
            url,
            status: response.status,
            statusText: response.statusText,
            duration: `${duration}ms`,
            payload,
          },
        });
      }

      return response;
    } catch (err) {
      const duration = Date.now() - startTime;
      const message = err instanceof Error ? err.message : String(err);

      appendLog({
        type: 'api_failure',
        message: `${method} ${url} → Network Error: ${message}`,
        timestamp: new Date().toISOString(),
        meta: {
          method,
          url,
          status: 0,
          statusText: 'Network Error',
          duration: `${duration}ms`,
          payload,
          errorDetail: message,
        },
      });

      throw err;
    }
  };
};
