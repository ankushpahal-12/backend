// ── Network Information API types (not yet in lib.dom.d.ts) ─────────────────
interface NetworkInformation {
	effectiveType?: string;
	downlink?: number;
	rtt?: number;
	saveData?: boolean;
	adventureEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void;
	addEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void;
	removeEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void;
}

declare global {
	interface Navigator {
		connection?: NetworkInformation;
		mozConnection?: NetworkInformation;
		webkitConnection?: NetworkInformation;
	}
}

export type NetworkQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'offline';

export interface ConnectionSnapshot {
	supported: boolean;
	effectiveType: string | null;
	downlinkMbps: number | null;
	rttMs: number | null;
	saveData: boolean;
	quality: NetworkQuality;
	qualityLabel: string;
	isSlow: boolean;
}

const LATENCY_THRESHOLDS = {
	excellent: 80,
	good: 250,
	fair: 500,
};

const getNetworkConnection = () => {
	if (typeof navigator === 'undefined') {
		return null;
	}

	return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
};

export const getConnectionSnapshot = (): ConnectionSnapshot => {
	const connection = getNetworkConnection();

	if (!connection) {
		return {
			supported: false,
			effectiveType: null,
			downlinkMbps: null,
			rttMs: null,
			saveData: false,
			quality: 'good',
			qualityLabel: 'Standard connection',
			isSlow: false,
		};
	}

	const effectiveType = connection.effectiveType ?? null;
	const downlinkMbps = typeof connection.downlink === 'number' ? connection.downlink : null;
	const rttMs = typeof connection.rtt === 'number' ? connection.rtt : null;
	const saveData = Boolean(connection.saveData);

	const isVerySlow = effectiveType === 'slow-2g' || effectiveType === '2g';
	const isSlow = saveData || isVerySlow || (rttMs !== null && rttMs > 500) || (downlinkMbps !== null && downlinkMbps < 1.5);

	const quality: NetworkQuality = !navigator.onLine
		? 'offline'
		: isVerySlow
			? 'poor'
			: effectiveType === '3g'
				? 'fair'
				: isSlow
					? 'fair'
					: 'excellent';

	return {
		supported: true,
		effectiveType,
		downlinkMbps,
		rttMs,
		saveData,
		quality,
		qualityLabel: getQualityLabel(quality),
		isSlow,
	};
};

export const formatLatency = (latencyMs: number | null | undefined): string => {
	if (latencyMs === null || latencyMs === undefined || Number.isNaN(latencyMs)) {
		return '—';
	}

	if (latencyMs < 1000) {
		return `${Math.round(latencyMs)}ms`;
	}

	return `${(latencyMs / 1000).toFixed(1)}s`;
};

export const formatDownlink = (downlinkMbps: number | null | undefined): string => {
	if (downlinkMbps === null || downlinkMbps === undefined || Number.isNaN(downlinkMbps)) {
		return '—';
	}

	return downlinkMbps >= 10
		? `${downlinkMbps.toFixed(1)} Mbps`
		: `${downlinkMbps.toFixed(2)} Mbps`;
};

export const getQualityLabel = (quality: NetworkQuality): string => {
	switch (quality) {
		case 'excellent':
			return 'Fast connection';
		case 'good':
			return 'Stable connection';
		case 'fair':
			return 'Slow connection';
		case 'poor':
			return 'Unstable connection';
		case 'offline':
			return 'Offline';
		default:
			return 'Unknown';
	}
};

export const classifyLatency = (latencyMs: number | null): NetworkQuality => {
	if (latencyMs === null) {
		return 'good';
	}

	if (latencyMs < LATENCY_THRESHOLDS.excellent) {
		return 'excellent';
	}

	if (latencyMs < LATENCY_THRESHOLDS.good) {
		return 'good';
	}

	if (latencyMs < LATENCY_THRESHOLDS.fair) {
		return 'fair';
	}

	return 'poor';
};

export const isLikelyOfflineError = (error: unknown): boolean => {
	if (!error || typeof error !== 'object') {
		return false;
	}

	const typedError = error as { message?: string; code?: string; name?: string };
	const message = `${typedError.message || ''} ${typedError.code || ''} ${typedError.name || ''}`.toLowerCase();

	return [
		'network error',
		'failed to fetch',
		'offline',
		'connection refused',
		'internet disconnected',
		'timeout',
	].some(fragment => message.includes(fragment));
};

export const measureAsyncLatency = async <T>(operation: () => Promise<T>): Promise<{ result: T; latencyMs: number }> => {
	const startedAt = performance.now();
	const result = await operation();
	return {
		result,
		latencyMs: Math.max(0, Math.round(performance.now() - startedAt)),
	};
};
