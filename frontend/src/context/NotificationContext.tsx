import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

type AlertColor = 'success' | 'info' | 'warning' | 'error';

import ToggleNotification from '../components/ui/ToggleNotification';

interface NotificationContextType {
    showNotification: (message: string, severity?: AlertColor) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<AlertColor>('info');

    const showNotification = useCallback((msg: string, sev: AlertColor = 'info') => {
        setMessage(msg);
        setSeverity(sev);
        setOpen(true);

        // Auto-close after 6 seconds like standard Snackbar
        setTimeout(() => {
            setOpen(false);
        }, 6000);
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <ToggleNotification
                open={open}
                message={message}
                severity={severity}
            />
        </NotificationContext.Provider>
    );
};
