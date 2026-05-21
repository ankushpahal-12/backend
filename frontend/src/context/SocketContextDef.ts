import { createContext } from 'react';
import type { Socket } from 'socket.io-client';

export type SignalStrength = 'strong' | 'moderate' | 'weak' | 'offline';

export interface ServerLoad {
    cpuUsagePercent: number;
    loadAvg: number;
    freeMemMb: number;
    totalMemMb: number;
}

export interface SocketContextType {
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

export const SocketContext = createContext<SocketContextType | undefined>(undefined);
