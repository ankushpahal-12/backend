import { useEffect, useMemo, useState,useCallback } from 'react';
import { useSocket } from '../../../context/useSocket';
import { heartbeatService, type HeartbeatSnapshot } from '../services/heartbeat.service';
import { 
    getConnectionSnapshot, 
    formatDownlink, 
    formatLatency, 
    type ConnectionSnapshot
 } from '../utils/network.utils';
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

export interface ConnectionSpeedState extends ConnectionSnapshot {
    connectionLabel: string;
    latencyLabel: string;
    downlinkLabel: string;
}

const getNavigatorConnection = () => {
    if (typeof navigator === 'undefined') {
        return null;
    }

    return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
};

export const useConnectionSpeed = (): ConnectionSpeedState => {
    const [snapshot, setSnapshot] = useState<ConnectionSnapshot>(getConnectionSnapshot);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const connection = getNavigatorConnection();

        if (!connection) {
            return;
        }

        const updateSnapshot = () => setSnapshot(getConnectionSnapshot());

        connection.addEventListener?.('change', updateSnapshot);
        window.addEventListener('online', updateSnapshot);
        window.addEventListener('offline', updateSnapshot);

        return () => {
            connection.removeEventListener?.('change', updateSnapshot);
            window.removeEventListener('online', updateSnapshot);
            window.removeEventListener('offline', updateSnapshot);
        };
    }, []);

    return useMemo(() => ({
        ...snapshot,
        connectionLabel: snapshot.effectiveType ? snapshot.effectiveType.toUpperCase() : 'UNKNOWN',
        latencyLabel: formatLatency(snapshot.rttMs),
        downlinkLabel: formatDownlink(snapshot.downlinkMbps),
    }), [snapshot]);
};
export const useHeartbeat = () => {
    const { socket } = useSocket();
    const [snapshot, setSnapshot] = useState<HeartbeatSnapshot>(() => heartbeatService.getSnapshot());

    useEffect(() => heartbeatService.subscribe(setSnapshot), []);

    useEffect(() => {
        heartbeatService.start(socket);

        return () => {
            heartbeatService.stop();
        };
    }, [socket]);

    return {
        ...snapshot,
        refreshHeartbeat: heartbeatService.refresh,
        isPublicSocket: heartbeatService.isPublicSocket(socket),
    };
};
export interface NetworkStatusSnapshot {
	isOnline: boolean;
	wentOfflineAt: number | null;
	wentOnlineAt: number | null;
	offlineDurationMs: number | null;
}

const getInitialState = (): NetworkStatusSnapshot => ({
	isOnline: typeof navigator === 'undefined' ? true : navigator.onLine,
	wentOfflineAt: null,
	wentOnlineAt: null,
	offlineDurationMs: null,
});

export const useNetworkStatus = () => {
	const [status, setStatus] = useState<NetworkStatusSnapshot>(getInitialState);

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		const handleOnline = () => {
			setStatus(previous => ({
				isOnline: true,
				wentOnlineAt: Date.now(),
				offlineDurationMs: previous.wentOfflineAt ? Date.now() - previous.wentOfflineAt : null,
				wentOfflineAt: null,
			}));
		};

		const handleOffline = () => {
			setStatus(previous => ({
				isOnline: false,
				wentOfflineAt: previous.wentOfflineAt ?? Date.now(),
				wentOnlineAt: null,
				offlineDurationMs: null,
			}));
		};

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, []);

	return status;
};

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
