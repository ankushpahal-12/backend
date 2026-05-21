/**
 * errorLogger.ts
 * Captures unhandled JS runtime errors and promise rejections.
 * Attaches to window.onerror and unhandledrejection events.
 */

import { appendLog } from './sessionStorage';

let initialized = false;

export const initErrorLogger = (): void => {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  // Synchronous JS errors (TypeError, ReferenceError, etc.)
  window.onerror = (message, source, lineno, colno, error) => {
    appendLog({
      type: 'runtime_error',
      message: String(message).slice(0, 2000),
      timestamp: new Date().toISOString(),
      stackTrace: error?.stack?.slice(0, 3000),
      meta: { source, lineno, colno },
    });
    return false; // don't suppress default browser error handling
  };

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message =
      reason instanceof Error
        ? reason.message
        : typeof reason === 'string'
        ? reason
        : JSON.stringify(reason);

    appendLog({
      type: 'runtime_error',
      message: `Unhandled Promise Rejection: ${message}`.slice(0, 2000),
      timestamp: new Date().toISOString(),
      stackTrace: reason instanceof Error ? reason.stack?.slice(0, 3000) : undefined,
    });
  });
};
