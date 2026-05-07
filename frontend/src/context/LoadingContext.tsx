import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useSocket } from './SocketContext';
import type { ServerLoad } from './SocketContext';

type LoadingType = 'login' | 'register' | 'sync' | 'general' | 'verifying' | 'web3' | 'google';

interface LoadingContextType {
    isLoading: boolean;
    loadingType: LoadingType;
    loadingText: string;
    requestId: string | null;
    progress: number; // 0–100, driven by socket steps
    serverLoad: ServerLoad | null;
    startLoading: (type?: LoadingType, text?: string) => string;
    stopLoading: (delay?: number) => Promise<void>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Each loading type has a known number of backend steps; used to compute progress %
const STEP_COUNTS: Record<LoadingType, number> = {
    login: 4,
    register: 5,
    verifying: 3,
    google: 2,
    sync: 3,
    web3: 3,
    general: 3,
};

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { socket, serverLoad: socketServerLoad } = useSocket();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingType, setLoadingType] = useState<LoadingType>('general');
    const [loadingText, setLoadingText] = useState('Loading...');
    const [requestId, setRequestId] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [serverLoad, setServerLoad] = useState<ServerLoad | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const stepRef = useRef(0);
    const loadingTypeRef = useRef<LoadingType>('general');

    // Mirror socket serverLoad into context state
    useEffect(() => {
        if (socketServerLoad) {
            setServerLoad(socketServerLoad);
        }
    }, [socketServerLoad]);

    // Subscribe to loading_update — update text + compute progress from step count
    useEffect(() => {
        if (!socket || !requestId) return;

        const handleUpdate = (data: { status: string; step?: number | null; total?: number | null }) => {
            setLoadingText(data.status);

            // If backend sends explicit step/total, use that; otherwise increment internally
            if (data.step !== null && data.step !== undefined && data.total) {
                setProgress(Math.round((data.step / data.total) * 90)); // cap at 90 until done
            } else {
                stepRef.current += 1;
                const totalSteps = STEP_COUNTS[loadingTypeRef.current] || 3;
                setProgress(Math.min(Math.round((stepRef.current / totalSteps) * 90), 90));
            }
        };

        socket.on('loading_update', handleUpdate);
        return () => {
            socket.off('loading_update', handleUpdate);
        };
    }, [socket, requestId]);

    const startLoading = useCallback((type: LoadingType = 'general', text?: string) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        const newRequestId = `rid-${Math.random().toString(36).substring(2, 11)}-${Date.now()}`;
        setRequestId(newRequestId);
        setLoadingType(type);
        loadingTypeRef.current = type;
        stepRef.current = 0;
        setProgress(5); // initial progress indicator
        setLoadingText(text || (
            type === 'login' ? 'Authenticating...' :
                type === 'register' ? 'Creating your account...' :
                    type === 'sync' ? 'Synchronizing data...' :
                        type === 'verifying' ? 'Verifying identity...' :
                            type === 'web3' ? 'Connecting to wallet...' : 'Loading...'
        ));

        setIsLoading(true);
        return newRequestId;
    }, []);

    const stopLoading = useCallback((delay: number = 0) => {
        return new Promise<void>((resolve) => {
            // Snap progress to 100 just before hiding
            setProgress(100);
            timerRef.current = setTimeout(() => {
                setIsLoading(false);
                setRequestId(null);
                setProgress(0);
                stepRef.current = 0;
                resolve();
            }, delay);
        });
    }, []);

    return (
        <LoadingContext.Provider value={{
            isLoading, loadingType, loadingText, requestId,
            progress, serverLoad,
            startLoading, stopLoading
        }}>
            {children}
        </LoadingContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};
