import { useContext } from 'react';
import { SocketContext } from './SocketContextDef';
export type { SocketContextType, SignalStrength, ServerLoad } from './SocketContextDef';

/**
 * Hook to access the Socket context in components
 * @throws Error if used outside of SocketProvider
 */
export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
