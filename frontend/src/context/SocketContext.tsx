import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { ENV } from '../config/env';
import toast from 'react-hot-toast';

export type SignalStrength = 'strong' | 'moderate' | 'weak' | 'offline';

export interface ServerLoad {
    cpuUsagePercent: number;
    loadAvg: number;
    freeMemMb: number;
    totalMemMb: number;
}

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    latencyMs: number | null;
    signalStrength: SignalStrength;
    serverLoad: ServerLoad | null;
    emit: (event: string, data: unknown) => void;
    connectPublic: (requestId: string) => void;
    startPinging: () => void;
    stopPinging: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

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

    const signalStrength = computeSignalStrength(latencyMs, isConnected);

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

    // ── Authenticated socket (for logged-in users) ──
    useEffect(() => {
        if (isAuthenticated) {
            const socketUrl = ENV.socketUrl;

            // SECURITY: Do not pass the JWT token in the auth object — `token` from AuthContext
            // is always null (cookie-only auth). Use withCredentials so the browser sends
            // the HttpOnly cookie automatically, just like HTTP requests.
            const newSocket = io(socketUrl, {
                withCredentials: true,
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });

            newSocket.on('connect', () => {
                console.log('[SOCKET] Connected to bridge');
                setIsConnected(true);
            });

            newSocket.on('disconnect', () => {
                console.log('[SOCKET] Disconnected from bridge');
                setIsConnected(false);
                setLatencyMs(null);
            });

            newSocket.on('connect_error', (err) => {
                console.error('[SOCKET] Connection error:', err.message);
                setIsConnected(false);
            });

            newSocket.on('server_load', (data: ServerLoad) => {
                setServerLoad(data);
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
            setSocket(newSocket);

            return () => {
                stopPinging();
                newSocket.close();
                socketRef.current = null;
                setSocket(null);
            };
        }
    }, [isAuthenticated, token, stopPinging]);

    // ── Public tracking socket (for auth flows before login) ──
    const connectPublic = useCallback((requestId: string) => {
        if (socketRef.current) socketRef.current.close();
        stopPinging();

        const socketUrl = ENV.socketUrl;
        const newSocket = io(socketUrl, {
            auth: { requestId },
            transports: ['websocket']
        });

        newSocket.on('connect', () => {
            console.log('[SOCKET] Public tracking connected:', requestId);
            setIsConnected(true);
            // Auto-start pinging so latency shows in loading overlay
            if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = setInterval(() => {
                if (!newSocket.connected) return;
                const sent = Date.now();
                newSocket.volatile.emit('ping');
                newSocket.once('pong', () => {
                    setLatencyMs(Date.now() - sent);
                });
            }, 3000);
            // First ping immediately
            const sent = Date.now();
            newSocket.volatile.emit('ping');
            newSocket.once('pong', () => setLatencyMs(Date.now() - sent));
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
            setLatencyMs(null);
            stopPinging();
        });

        newSocket.on('server_load', (data: ServerLoad) => {
            setServerLoad(data);
        });

        socketRef.current = newSocket;
        setSocket(newSocket);
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

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
