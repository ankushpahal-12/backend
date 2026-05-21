import { buildScopedKey, clearCacheStore, clearStorageByPrefix, getCacheStore, readStorageItem, removeStorageItem, saveStorageItem } from '../utils/storage.utils';

export interface CachedJsonEntry<T = unknown> {
	key: string;
	value: T;
	cachedAt: number;
	ttlMs?: number;
}

interface CachePayload<T = unknown> {
	value: T;
	cachedAt: number;
	ttlMs?: number;
}

const DATA_PREFIX = buildScopedKey('network', 'offline-data');

const isExpired = (cachedAt: number, ttlMs?: number): boolean => {
	if (!ttlMs) {
		return false;
	}

	return Date.now() - cachedAt > ttlMs;
};

export const cacheJsonValue = <T>(key: string, value: T, ttlMs?: number): CachedJsonEntry<T> => {
	const payload: CachePayload<T> = { value, cachedAt: Date.now(), ttlMs };
	saveStorageItem(`${DATA_PREFIX}:${key}`, payload);
	return { key, value, cachedAt: payload.cachedAt, ttlMs };
};

export const getCachedJsonValue = <T>(key: string): T | null => {
	const payload = readStorageItem<CachePayload<T> | null>(`${DATA_PREFIX}:${key}`, null);

	if (!payload || isExpired(payload.cachedAt, payload.ttlMs)) {
		removeStorageItem(`${DATA_PREFIX}:${key}`);
		return null;
	}

	return payload.value;
};

export const removeCachedJsonValue = (key: string): void => {
	removeStorageItem(`${DATA_PREFIX}:${key}`);
};

export const cacheApiResponse = async (request: RequestInfo, response: Response): Promise<void> => {
	const cache = await getCacheStore();
	if (!cache) {
		return;
	}

	const normalizedRequest = typeof request === 'string' ? new Request(request) : request;
	await cache.put(normalizedRequest, response.clone());
};

export const getCachedApiResponse = async (request: RequestInfo): Promise<Response | undefined> => {
	const cache = await getCacheStore();
	if (!cache) {
		return undefined;
	}

	const normalizedRequest = typeof request === 'string' ? new Request(request) : request;
	const cached = await cache.match(normalizedRequest);
	return cached || undefined;
};

export const cacheStaticAsset = async (url: string): Promise<void> => {
	const cache = await getCacheStore();
	if (!cache) {
		return;
	}

	await cache.add(url);
};

export const clearOfflineCache = async (): Promise<void> => {
	await clearCacheStore();
};

export const clearOfflineData = (): void => {
	clearStorageByPrefix(DATA_PREFIX);
};

export const restoreOfflineJson = <T>(key: string, fallback: T): T => {
	return readStorageItem<CachePayload<T> | null>(`${DATA_PREFIX}:${key}`, null)?.value ?? fallback;
};
