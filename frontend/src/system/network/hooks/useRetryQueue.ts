import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNetworkStatus } from './useNetworkGlobal';
import {
	clearRetryQueue,
	enqueueRetryRequest,
	flushRetryQueue,
	getRetryQueueEntries,
	queueOfflineRequest,
	subscribeRetryQueue,
	type RetryQueueEntry,
	type RetryQueueRequest,
} from '../services/retryQueue.service';

export const useRetryQueue = () => {
	const { isOnline } = useNetworkStatus();
	const [entries, setEntries] = useState<RetryQueueEntry[]>(() => getRetryQueueEntries());
	const [isFlushing, setIsFlushing] = useState(false);

	useEffect(() => subscribeRetryQueue(setEntries), []);

	const flush = useCallback(async () => {
		if (!isOnline) {
			return { processed: 0, succeeded: 0, failed: 0, remaining: entries.length };
		}

		setIsFlushing(true);
		try {
			return await flushRetryQueue();
		} finally {
			setIsFlushing(false);
		}
	}, [isOnline]);

	const queueRequest = useCallback((request: RetryQueueRequest, reason?: unknown) => {
		return queueOfflineRequest(request, reason);
	}, []);

	const queueManualRequest = useCallback((request: RetryQueueRequest, reason?: string) => {
		return enqueueRetryRequest(request, reason);
	}, []);

	const clearQueue = useCallback(() => {
		clearRetryQueue();
	}, []);

	return useMemo(() => ({
		entries,
		queueLength: entries.length,
		isFlushing,
		queueRequest,
		queueManualRequest,
		flush,
		clearQueue,
	}), [clearQueue, entries, flush, isFlushing, queueManualRequest, queueRequest]);
};
