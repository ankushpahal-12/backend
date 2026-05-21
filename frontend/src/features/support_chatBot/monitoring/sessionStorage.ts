/**
 * sessionStorage.ts
 * Local log buffer — stores monitoring entries in window.sessionStorage.
 * Ring buffer capped at MAX_ENTRIES to prevent memory bloat.
 * Logs stay local until a ticket is created, then they are flushed.
 */

export interface LogEntry {
  id: string;
  type: 'console_error' | 'console_warn' | 'api_failure' | 'runtime_error' | 'user_event' | 'navigation';
  message: string;
  timestamp: string;
  stackTrace?: string;
  meta?: Record<string, unknown>;
}

const STORAGE_KEY = 'support_session_logs';
const MAX_ENTRIES = 200;

const generateId = () => `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const appendLog = (entry: Omit<LogEntry, 'id'>): void => {
  try {
    const logs = getLogs();
    const newEntry: LogEntry = { id: generateId(), ...entry };
    logs.push(newEntry);

    // Ring buffer — drop oldest entries if over limit
    const trimmed = logs.length > MAX_ENTRIES ? logs.slice(logs.length - MAX_ENTRIES) : logs;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // sessionStorage may be unavailable in private mode — fail silently
  }
};

export const getLogs = (): LogEntry[] => {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LogEntry[];
  } catch {
    return [];
  }
};

export const clearLogs = (): void => {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Fail silently
  }
};

export const getLogCount = (): number => getLogs().length;
