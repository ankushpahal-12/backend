/**
 * sessionManager.ts
 * Central monitoring orchestrator.
 * Call initMonitoring() once at app startup (in main.tsx).
 * All loggers are initialized here and run silently in the background.
 */

import { initConsoleLogger } from './consoleLogger';
import { initErrorLogger } from './errorLogger';
import { initApiLogger } from './apiLogger';
import { initEventLogger } from './eventLogger';
import { getLogs, clearLogs, getLogCount } from './sessionStorage';
import { collectMetadata, type DeviceMetadata } from './metadataCollector';

let sessionId: string | null = null;
let sessionStartTime: number | null = null;

const generateSessionId = (): string => {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Initialize the full monitoring pipeline.
 * Idempotent — safe to call multiple times.
 */
export const initMonitoring = (): void => {
  if (sessionId) return; // already initialized

  sessionId = generateSessionId();
  sessionStartTime = Date.now();

  initConsoleLogger();
  initErrorLogger();
  initApiLogger();
  initEventLogger();
};

/** Returns the current session ID (generated once per page load). */
export const getSessionId = (): string => {
  if (!sessionId) initMonitoring();
  return sessionId!;
};

/** Returns how many seconds the session has been active. */
export const getSessionDuration = (): number => {
  if (!sessionStartTime) return 0;
  return Math.round((Date.now() - sessionStartTime) / 1000);
};

/**
 * Collects the full monitoring payload to attach to a ticket.
 * Call this immediately before submitting a ticket.
 */
export const collectTicketPayload = (): {
  consoleLogs: ReturnType<typeof getLogs>;
  apiFailures: ReturnType<typeof getLogs>;
  timeline: ReturnType<typeof getLogs>;
  sessionMetadata: DeviceMetadata;
  sessionId: string;
  sessionDuration: number;
} => {
  const allLogs = getLogs();
  const metadata = collectMetadata();

  // Partition logs by type
  const consoleLogs = allLogs
    .filter((l) => l.type === 'console_error' || l.type === 'console_warn' || l.type === 'runtime_error')
    .slice(-100); // last 100

  const apiFailures = allLogs.filter((l) => l.type === 'api_failure').slice(-50);

  const timeline = allLogs
    .filter((l) => l.type === 'user_event' || l.type === 'navigation')
    .slice(-200);

  return {
    consoleLogs,
    apiFailures,
    timeline,
    sessionMetadata: metadata,
    sessionId: getSessionId(),
    sessionDuration: getSessionDuration(),
  };
};

/**
 * Clears all locally buffered logs after a successful ticket submission.
 */
export const flushLogs = (): void => {
  clearLogs();
};

export { getLogs, getLogCount };
