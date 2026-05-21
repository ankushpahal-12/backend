import { ENV } from '../../../config/env';
import { buildScopedKey, readStorageItem, removeStorageItem, saveStorageItem } from '../utils/storage.utils';
import { isLikelyOfflineError } from '../utils/network.utils';

export type RetryMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RetryQueueEntry {
	id: string;
	url: string;
	method: RetryMethod;
	headers: Record<string, string>;
	body?: string | null;
	createdAt: number;
	attempts: number;
	nextRetryAt: number;
	lastError?: string | null;
}

export interface RetryQueueRequest {
	url: string;
	method: RetryMethod;
	headers?: Record<string, string>;
	body?: unknown;
	idempotencyKey?: string;
}

interface RetryQueueState {
	entries: RetryQueueEntry[];
}

interface FlushResult {
	processed: number;
	succeeded: number;
	failed: number;
	remaining: number;
}

const STORAGE_KEY = buildScopedKey('network', 'retry-queue');
const MAX_QUEUE_SIZE = 100;
const BASE_DELAY_MS = 2000;
const MAX_DELAY_MS = 5 * 60 * 1000;

const listeners = new Set<(entries: RetryQueueEntry[]) => void>();

const serializeBody = (body: unknown): string | null => {
	if (body === null || body === undefined) {
		return null;
	}

	if (typeof body === 'string') {
		return body;
	}

	return JSON.stringify(body);
};

const normalizeQueueState = (): RetryQueueState => readStorageItem<RetryQueueState>(STORAGE_KEY, { entries: [] });

const persistQueueState = (state: RetryQueueState) => {
	saveStorageItem(STORAGE_KEY, state);
	listeners.forEach(listener => listener(state.entries));
};

const createId = (): string => {
	if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
		return crypto.randomUUID();
	}

	return `rq_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const resolveUrl = (url: string): string => {
	if (/^https?:\/\//i.test(url)) {
		return url;
	}

	if (url.startsWith('/api/')) {
		return `${ENV.apiUrl.replace(/\/$/, '')}${url.replace(/^\/api/, '')}`;
	}

	if (url.startsWith('/')) {
		return `${ENV.apiUrl.replace(/\/$/, '')}${url}`;
	}

	return `${ENV.apiUrl.replace(/\/$/, '')}/${url}`;
};

const computeDelay = (attempts: number): number => Math.min(BASE_DELAY_MS * (2 ** Math.max(0, attempts - 1)), MAX_DELAY_MS);

export const getRetryQueueEntries = (): RetryQueueEntry[] => normalizeQueueState().entries;

export const subscribeRetryQueue = (listener: (entries: RetryQueueEntry[]) => void): (() => void) => {
	listeners.add(listener);
	listener(getRetryQueueEntries());

	return () => {
		listeners.delete(listener);
	};
};

export const clearRetryQueue = (): void => {
	removeStorageItem(STORAGE_KEY);
	listeners.forEach(listener => listener([]));
};

export const enqueueRetryRequest = (request: RetryQueueRequest, reason?: string): RetryQueueEntry => {
	const state = normalizeQueueState();
	const entry: RetryQueueEntry = {
		id: createId(),
		url: request.url,
		method: request.method,
		headers: {
			'Content-Type': 'application/json',
			...(request.headers || {}),
			...(request.idempotencyKey ? { 'Idempotency-Key': request.idempotencyKey } : {}),
		},
		body: serializeBody(request.body),
		createdAt: Date.now(),
		attempts: 0,
		nextRetryAt: Date.now(),
		lastError: reason || null,
	};

	const entries = [...state.entries, entry].slice(-MAX_QUEUE_SIZE);
	persistQueueState({ entries });
	return entry;
};

export const removeRetryQueueEntry = (id: string): void => {
	const state = normalizeQueueState();
	persistQueueState({ entries: state.entries.filter(entry => entry.id !== id) });
};

export const flushRetryQueue = async (options: {
	onlyReady?: boolean;
	fetchImpl?: typeof fetch;
} = {}): Promise<FlushResult> => {
	const { onlyReady = true, fetchImpl = fetch } = options;
	const state = normalizeQueueState();
	const now = Date.now();
	let processed = 0;
	let succeeded = 0;
	let failed = 0;
	const remaining: RetryQueueEntry[] = [];

	for (const entry of state.entries) {
		const isReady = !onlyReady || entry.nextRetryAt <= now;

		if (!isReady) {
			remaining.push(entry);
			continue;
		}

		processed += 1;

		try {
			const response = await fetchImpl(resolveUrl(entry.url), {
				method: entry.method,
				credentials: 'include',
				headers: entry.headers,
				body: entry.body,
			});

			if (response.ok) {
				succeeded += 1;
			} else if (response.status >= 400 && response.status < 500) {
				// 4xx = permanent failure (deleted resource, forbidden, bad request).
				// Drop the entry — retrying will never help.
				succeeded += 1; // Count as "processed and resolved"
				console.warn(`[RetryQueue] Dropping entry ${entry.id}: server returned ${response.status} for ${entry.method} ${entry.url}`);
			} else {
				throw new Error(`Replay failed with status ${response.status}`);
			}
		} catch (error) {
			failed += 1;
			const nextAttempts = entry.attempts + 1;
			remaining.push({
				...entry,
				attempts: nextAttempts,
				nextRetryAt: Date.now() + computeDelay(nextAttempts),
				lastError: error instanceof Error ? error.message : 'Retry failed',
			});
		}
	}

	persistQueueState({ entries: remaining });

	return {
		processed,
		succeeded,
		failed,
		remaining: remaining.length,
	};
};

export const queueOfflineRequest = (request: RetryQueueRequest, error?: unknown): RetryQueueEntry | null => {
	if (!isLikelyOfflineError(error)) {
		return null;
	}

	return enqueueRetryRequest(request, error instanceof Error ? error.message : 'Offline request queued');
};
