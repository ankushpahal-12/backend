/**
 * consoleLogger.ts
 * Patches console.error and console.warn to capture messages into the session log buffer.
 * Only patches once (idempotent). Never patches console.log (too noisy).
 */

import { appendLog } from './sessionStorage';

let patched = false;

export const initConsoleLogger = (): void => {
  if (patched || typeof window === 'undefined') return;
  patched = true;

  const originalError = console.error.bind(console);
  const originalWarn = console.warn.bind(console);

  console.error = (...args: unknown[]) => {
    originalError(...args);
    const message = args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
    // Extract stack from Error objects
    const errorObj = args.find((a) => a instanceof Error) as Error | undefined;
    appendLog({
      type: 'console_error',
      message: message.slice(0, 2000),
      timestamp: new Date().toISOString(),
      stackTrace: errorObj?.stack?.slice(0, 3000),
    });
  };

  console.warn = (...args: unknown[]) => {
    originalWarn(...args);
    const message = args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
    appendLog({
      type: 'console_warn',
      message: message.slice(0, 2000),
      timestamp: new Date().toISOString(),
    });
  };
};
