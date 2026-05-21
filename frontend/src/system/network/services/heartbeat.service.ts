import type { Socket } from 'socket.io-client';
import { ENV } from '../../../config/env';

export interface HeartbeatSnapshot {
	socketConnected: boolean;
	backendHealthy: boolean;
	websocketLatencyMs: number | null;
	backendLatencyMs: number | null;
	lastPongAt: number | null;
	lastBackendCheckAt: number | null;
	stale: boolean;
	reconnecting: boolean;
	errorMessage: string | null;
}

export interface HeartbeatOptions {
	pingIntervalMs?: number;
	healthIntervalMs?: number;
	staleAfterMs?: number;
}

type Listener = (snapshot: HeartbeatSnapshot) => void;

const DEFAULT_OPTIONS: Required<HeartbeatOptions> = {
	pingIntervalMs: 3500,
	healthIntervalMs: 15000,
	staleAfterMs: 10000,
};

const listeners = new Set<Listener>();

let snapshot: HeartbeatSnapshot = {
	socketConnected: false,
	backendHealthy: true,
	websocketLatencyMs: null,
	backendLatencyMs: null,
	lastPongAt: null,
	lastBackendCheckAt: null,
	stale: false,
	reconnecting: false,
	errorMessage: null,
};

let activeSocket: Socket | null = null;
let pingTimer: ReturnType<typeof window.setInterval> | null = null;
let healthTimer: ReturnType<typeof window.setInterval> | null = null;
let currentOptions: Required<HeartbeatOptions> = DEFAULT_OPTIONS;

const withTimeout = async <T>(operation: (signal: AbortSignal) => Promise<T>, timeoutMs: number): Promise<T> => {
	const controller = new AbortController();
	const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

	try {
		return await operation(controller.signal);
	} finally {
		window.clearTimeout(timeout);
	}
};

const publish = (patch: Partial<HeartbeatSnapshot>) => {
	snapshot = {
		...snapshot,
		...patch,
	};

	listeners.forEach(listener => listener(snapshot));
};

const isPublicSocket = (socket: Socket | null): boolean => Boolean(socket?.io?.opts?.auth && typeof socket.io.opts.auth === 'object' && 'requestId' in socket.io.opts.auth);

const stopTimers = () => {
	if (pingTimer) {
		window.clearInterval(pingTimer);
		pingTimer = null;
	}

	if (healthTimer) {
		window.clearInterval(healthTimer);
		healthTimer = null;
	}
};

const updateStaleState = () => {
	const lastPongAt = snapshot.lastPongAt;
	const stale = Boolean(snapshot.socketConnected && lastPongAt && Date.now() - lastPongAt > currentOptions.staleAfterMs);
	if (stale !== snapshot.stale) {
		publish({ stale });
	}
};

const pingSocket = async () => {
	if (!activeSocket || !activeSocket.connected || isPublicSocket(activeSocket)) {
		return;
	}

	const startedAt = Date.now();

	try {
		activeSocket.volatile.emit('ping');
		await new Promise<void>((resolve, reject) => {
			const timeout = window.setTimeout(() => {
				activeSocket?.off('pong', onPong);
				reject(new Error('Heartbeat timed out'));
			}, 2500);

			const onPong = () => {
				window.clearTimeout(timeout);
				resolve();
			};

			activeSocket?.once('pong', onPong);
		});
		publish({
			websocketLatencyMs: Date.now() - startedAt,
			lastPongAt: Date.now(),
			errorMessage: null,
		});
	} catch (error) {
		publish({
			errorMessage: error instanceof Error ? error.message : 'Ping failed',
		});
	} finally {
		updateStaleState();
	}
};

const checkBackendHealth = async () => {
	const startedAt = Date.now();

	try {
		const response = await withTimeout(
			async (signal) => fetch(`${ENV.apiUrl.replace(/\/$/, '')}/health`, {
				method: 'GET',
				credentials: 'include',
				signal,
			}),
			5000,
		);

		const healthy = response.ok;
		publish({
			backendHealthy: healthy,
			backendLatencyMs: healthy ? Date.now() - startedAt : null,
			lastBackendCheckAt: Date.now(),
			errorMessage: healthy ? null : `Backend health returned ${response.status}`,
		});
	} catch (error) {
		publish({
			backendHealthy: false,
			backendLatencyMs: null,
			lastBackendCheckAt: Date.now(),
			errorMessage: error instanceof Error ? error.message : 'Backend health check failed',
		});
	}
};

const startTimers = () => {
	stopTimers();

	if (activeSocket && activeSocket.connected && !isPublicSocket(activeSocket)) {
		pingTimer = window.setInterval(() => {
			void pingSocket();
		}, currentOptions.pingIntervalMs);
	}

	healthTimer = window.setInterval(() => {
		void checkBackendHealth();
	}, currentOptions.healthIntervalMs);
};

function handleConnect() {
	publish({ socketConnected: true, reconnecting: false, errorMessage: null });
	startTimers();
	void pingSocket();
}

function handleDisconnect() {
	publish({ socketConnected: false, websocketLatencyMs: null, stale: false, reconnecting: true });
	stopTimers();
}

function handlePong() {
	publish({ lastPongAt: Date.now(), errorMessage: null });
	updateStaleState();
}

const bindSocket = (socket: Socket | null) => {
	if (activeSocket && activeSocket !== socket) {
		activeSocket.off('connect', handleConnect);
		activeSocket.off('disconnect', handleDisconnect);
		activeSocket.off('pong', handlePong);
	}

	activeSocket = socket;

	if (!socket) {
		stopTimers();
		publish({
			socketConnected: false,
			websocketLatencyMs: null,
			stale: false,
			reconnecting: false,
		});
		return;
	}

	socket.off('connect', handleConnect);
	socket.off('disconnect', handleDisconnect);
	socket.off('pong', handlePong);
	socket.on('connect', handleConnect);
	socket.on('disconnect', handleDisconnect);
	socket.on('pong', handlePong);

	publish({
		socketConnected: socket.connected,
		reconnecting: false,
	});

	if (socket.connected) {
		startTimers();
	}
};

export const heartbeatService = {
	start(socket: Socket | null, options: HeartbeatOptions = {}) {
		currentOptions = { ...DEFAULT_OPTIONS, ...options };
		bindSocket(socket);
		void checkBackendHealth();

		if (socket?.connected) {
			void pingSocket();
		}
	},

	stop() {
		if (activeSocket) {
			activeSocket.off('connect', handleConnect);
			activeSocket.off('disconnect', handleDisconnect);
			activeSocket.off('pong', handlePong);
		}

		activeSocket = null;
		stopTimers();
		publish({
			socketConnected: false,
			reconnecting: false,
			websocketLatencyMs: null,
			stale: false,
		});
	},

	subscribe(listener: Listener) {
		listeners.add(listener);
		listener(snapshot);

		return () => {
			listeners.delete(listener);
		};
	},

	getSnapshot() {
		return snapshot;
	},

	refresh() {
		void checkBackendHealth();
		void pingSocket();
	},

	isPublicSocket,
};
