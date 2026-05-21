const isStorageAvailable = (storage: Storage | undefined): storage is Storage => Boolean(storage);

const safeJsonParse = <T>(value: string | null, fallback: T): T => {
	if (!value) {
		return fallback;
	}

	try {
		return JSON.parse(value) as T;
	} catch {
		return fallback;
	}
};

export const saveStorageItem = <T>(key: string, value: T, storage: Storage = window.localStorage): void => {
	if (!isStorageAvailable(storage)) {
		return;
	}

	storage.setItem(key, JSON.stringify(value));
};

export const readStorageItem = <T>(key: string, fallback: T, storage: Storage = window.localStorage): T => {
	if (!isStorageAvailable(storage)) {
		return fallback;
	}

	return safeJsonParse<T>(storage.getItem(key), fallback);
};

export const removeStorageItem = (key: string, storage: Storage = window.localStorage): void => {
	if (!isStorageAvailable(storage)) {
		return;
	}

	storage.removeItem(key);
};

export const clearStorageByPrefix = (prefix: string, storage: Storage = window.localStorage): void => {
	if (!isStorageAvailable(storage)) {
		return;
	}

	Object.keys(storage)
		.filter(key => key.startsWith(prefix))
		.forEach(key => storage.removeItem(key));
};

export const buildScopedKey = (scope: string, key: string): string => `${scope}:${key}`;

export const getCacheStore = async (): Promise<Cache | null> => {
	if (typeof caches === 'undefined') {
		return null;
	}

	return caches.open('expense-tracker-network-v1');
};

export const clearCacheStore = async (cacheName = 'expense-tracker-network-v1'): Promise<boolean> => {
	if (typeof caches === 'undefined') {
		return false;
	}

	return caches.delete(cacheName);
};
