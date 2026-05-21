import { io, Socket } from 'socket.io-client';
import { ENV } from '../../../config/env';

export interface SocketConnectionCallbacks {
	onConnect?: () => void;
	onDisconnect?: () => void;
	onConnectError?: (message: string) => void;
	onPong?: (latencyMs: number) => void;
	onServerLoad?: (data: unknown) => void;
	onSecurityAlert?: (data: unknown) => void;
}

export interface SocketConnectionOptions {
	requestId?: string;
	withCredentials?: boolean;
	callbacks?: SocketConnectionCallbacks;
}

export const createSocketConnection = (options: SocketConnectionOptions = {}): Socket => {
	const socket = io(ENV.socketUrl, {
		withCredentials: options.withCredentials ?? true,
		transports: ['websocket'],
		reconnection: true,
		reconnectionAttempts: 5,
		reconnectionDelay: 1000,
		auth: options.requestId ? { requestId: options.requestId } : undefined,
	});

	const callbacks = options.callbacks || {};

	socket.on('connect', () => callbacks.onConnect?.());
	socket.on('disconnect', () => callbacks.onDisconnect?.());
	socket.on('connect_error', error => callbacks.onConnectError?.(error.message));
	socket.on('server_load', data => callbacks.onServerLoad?.(data));
	socket.on('security_alert', data => callbacks.onSecurityAlert?.(data));

	return socket;
};

export const measureSocketLatency = (socket: Socket): Promise<number | null> => {
	return new Promise(resolve => {
		if (!socket.connected) {
			resolve(null);
			return;
		}

		const startedAt = Date.now();
		const timeout = window.setTimeout(() => {
			socket.off('pong', onPong);
			resolve(null);
		}, 2500);

		const onPong = () => {
			window.clearTimeout(timeout);
			resolve(Date.now() - startedAt);
		};

		socket.volatile.emit('ping');
		socket.once('pong', onPong);
	});
};

export const disconnectSocket = (socket: Socket | null): void => {
	socket?.removeAllListeners();
	socket?.disconnect();
};

export const isSocketLive = (socket: Socket | null): boolean => Boolean(socket?.connected);
