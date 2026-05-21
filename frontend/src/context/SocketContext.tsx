import React, { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { ENV } from '../config/env';
import toast from 'react-hot-toast';
import { SocketContext, type ServerLoad, type SignalStrength } from './SocketContextDef';

export { SocketContext } from './SocketContextDef';
export type { SocketContextType, ServerLoad, SignalStrength } from './SocketContextDef';

function computeSignalStrength(latencyMs: number | null, connected: boolean): SignalStrength {
    if (!connected) return 'offline';
    if (latencyMs === null) return 'moderate';
    if (latencyMs < 80) return 'strong';
    if (latencyMs < 250) return 'moderate';
    return 'weak';
}

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [latencyMs, setLatencyMs] = useState<number | null>(null);
    const [serverLoad, setServerLoad] = useState<ServerLoad | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isMountedRef = useRef(true);
    const isConnectingRef = useRef(false);

    // ── Ping/pong for latency measurement ──
    const startPinging = useCallback(() => {
        if (pingIntervalRef.current) return;
        pingIntervalRef.current = setInterval(() => {
            const sock = socketRef.current;
            if (!sock || !sock.connected) return;
            const sent = Date.now();
            sock.volatile.emit('ping');
            const handler = (data: { serverTime: number }) => {
                const rtt = Date.now() - sent;
                setLatencyMs(rtt);
                // server-to-client half is (serverTime - sent), client-to-server is (now - serverTime)
                void data; // serverTime available for clock skew if needed
                sock.off('pong', handler);
            };
            sock.once('pong', handler);
        }, 3000);
    }, []);

    const stopPinging = useCallback(() => {
        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
        }
    }, []);

    const signalStrength = computeSignalStrength(latencyMs, isConnected);

    // Track mounted state to prevent setState on unmounted component
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
            // Cleanup public socket on unmount
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            stopPinging();
        };
    }, [stopPinging]);

    // ── Authenticated socket (for logged-in users) ──
    useEffect(() => {
        if (isAuthenticated) {
            const socketUrl = ENV.socketUrl;

            // SECURITY: Do not pass the JWT token in the auth object — `token` from AuthContext
            // is always null (cookie-only auth). Use withCredentials so the browser sends
            // the HttpOnly cookie automatically, just like HTTP requests.
            const newSocket = io(socketUrl, {
                withCredentials: true,
                transports: ['polling', 'websocket'],
                reconnection: true,
                reconnectionAttempts: 8,
                reconnectionDelay: 1500,
                reconnectionDelayMax: 10000,
                closeOnBeforeunload: false,
                autoConnect: true
            });

            newSocket.on('connect', () => {
                if (isMountedRef.current) {
                    setIsConnected(true);
                    setSocket(newSocket);
                }
            });

            newSocket.on('disconnect', () => {
                if (isMountedRef.current) {
                    setIsConnected(false);
                    setLatencyMs(null);
                    setSocket(null);
                }
            });

            newSocket.on('connect_error', (err) => {
                if (isMountedRef.current) {
                    console.error('[SOCKET] Connection error:', err.message);
                    setIsConnected(false);
                }
            });

            newSocket.on('server_load', (data: ServerLoad) => {
                if (isMountedRef.current) {
                    setServerLoad(data);
                }
            });

            // ── Real-time security alert toasts ──
            // The backend emits security_alert after password change, session
            // termination, deactivation, etc. — show an instant toast on every
            // connected tab so the user is notified immediately.
            newSocket.on('security_alert', (data: {
                type: string;
                severity: 'success' | 'error' | 'warning' | 'info';
                message: string;
            }) => {
                if (!isMountedRef.current) return;
                const toastFn = data.severity === 'success'
                    ? toast.success
                    : data.severity === 'error'
                        ? toast.error
                        : data.severity === 'warning'
                            ? (msg: string) => toast(msg, {
                                icon: '⚠️',
                                style: { borderColor: 'rgba(245,158,11,0.3)' }
                            })
                            : (msg: string) => toast(msg, { icon: '🔔' });
                toastFn(data.message);
            });

            socketRef.current = newSocket;

            return () => {
                stopPinging();
                if (isMountedRef.current) {
                    setSocket(null);
                }
                newSocket.close();
                socketRef.current = null;
            };
        }
    }, [isAuthenticated, token, stopPinging]);

    // ── Public tracking socket (for auth flows before login) ──
    const connectPublic = useCallback((requestId: string) => {
        // Prevent race condition: don't create multiple sockets simultaneously
        if (isConnectingRef.current) {
            console.warn('[Socket] Connection attempt in progress, skipping duplicate');
            return;
        }

        isConnectingRef.current = true;

        // Close previous socket gracefully (don't immediately dispose)
        if (socketRef.current?.connected) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        stopPinging();

        const socketUrl = ENV.socketUrl;
        const newSocket = io(socketUrl, {
            auth: { requestId },
            transports: ['polling', 'websocket'],
            reconnection: true,
            reconnectionAttempts: 8,
            reconnectionDelay: 1500,
            reconnectionDelayMax: 10000,
            closeOnBeforeunload: false,
            autoConnect: true
        });

        newSocket.on('connect', () => {
            isConnectingRef.current = false;
            if (isMountedRef.current) {
                setIsConnected(true);
                setSocket(newSocket);
                socketRef.current = newSocket;
            }
            // Auto-start pinging so latency shows in loading overlay
            if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = setInterval(() => {
                if (!newSocket.connected) return;
                const sent = Date.now();
                newSocket.volatile.emit('ping');
                newSocket.once('pong', () => {
                    if (isMountedRef.current) {
                        setLatencyMs(Date.now() - sent);
                    }
                });
            }, 3000);
            // First ping immediately
            const sent = Date.now();
            newSocket.volatile.emit('ping');
            newSocket.once('pong', () => {
                if (isMountedRef.current) {
                    setLatencyMs(Date.now() - sent);
                }
            });
        });

        newSocket.on('connect_error', (err) => {
            isConnectingRef.current = false;
            console.error('[Socket:Public] Connection error:', err.message);
        });

        newSocket.on('disconnect', () => {
            isConnectingRef.current = false;
            if (isMountedRef.current) {
                setIsConnected(false);
                setLatencyMs(null);
                setSocket(null);
            }
            stopPinging();
        });

        newSocket.on('server_load', (data: ServerLoad) => {
            if (isMountedRef.current) {
                setServerLoad(data);
            }
        });

        socketRef.current = newSocket;
    }, [stopPinging]);

    const emit = useCallback((event: string, data: unknown) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit(event, data);
        }
    }, [isConnected]);

    return (
        <SocketContext.Provider value={{
            socket, isConnected, latencyMs, signalStrength, serverLoad,
            emit, connectPublic, startPinging, stopPinging
        }}>
            {children}
        </SocketContext.Provider>
    );
};
