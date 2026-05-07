/**
 * useAutoLogout Hook
 * 
 * Automatically logs out user after inactivity period
 * - Detects user activity (mouse, keyboard)
 * - Shows warning before logout
 * - Logs user out on expiration
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

interface AutoLogoutOptions {
    inactivityTimeout: number;    // ms until auto-logout (default: 30 min)
    warningTime: number;          // ms before logout to show warning (default: 5 min)
    onWarning?: (remainingTime: number) => void;
    onLogout?: () => void;
}

export const useAutoLogout = (options: AutoLogoutOptions) => {
    const navigate = useNavigate();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastActivityRef = useRef(Date.now());
    const [showWarning, setShowWarning] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);

    const {
        inactivityTimeout = 30 * 60 * 1000,  // 30 minutes
        warningTime = 5 * 60 * 1000,         // 5 minutes
        onWarning,
        onLogout,
    } = options;

    // Reset inactivity timer
    const resetTimer = useCallback(() => {
        lastActivityRef.current = Date.now();
        setShowWarning(false);

        // Clear existing timers
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

        // Set warning timer
        warningTimeoutRef.current = setTimeout(() => {
            setShowWarning(true);
            onWarning?.(warningTime / 1000);

            // Start countdown
            const countdownInterval = setInterval(() => {
                const elapsed = Date.now() - lastActivityRef.current;
                const remaining = Math.max(0, inactivityTimeout - elapsed);
                setRemainingTime(Math.floor(remaining / 1000));

                if (remaining <= 0) {
                    clearInterval(countdownInterval);
                }
            }, 1000);
        }, inactivityTimeout - warningTime);

        // Set logout timer
        timeoutRef.current = setTimeout(async () => {
            setShowWarning(false);

            // Logout
            try {
                await api.post('/auth/logout', {});
            } catch (err) {
                console.error('Logout error:', err);
            }

            // Clear session
            sessionStorage.clear();
            onLogout?.();

            // Redirect to login
            navigate('/login', {
                replace: true,
                state: { reason: 'Session expired due to inactivity' },
            });
        }, inactivityTimeout);
    }, [inactivityTimeout, warningTime, navigate, onWarning, onLogout]);

    // Activity listeners
    useEffect(() => {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

        const handleActivity = () => {
            resetTimer();
        };

        // Add listeners
        events.forEach((event) => {
            document.addEventListener(event, handleActivity);
        });

        // Initial timer setup
        resetTimer();

        // Cleanup
        return () => {
            events.forEach((event) => {
                document.removeEventListener(event, handleActivity);
            });

            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
        };
    }, [resetTimer]);

    // Manual logout
    const logout = useCallback(async () => {
        setShowWarning(false);

        try {
            await api.post('/auth/logout', {});
        } catch (err) {
            console.error('Logout error:', err);
        }

        sessionStorage.clear();
        onLogout?.();
        navigate('/login', { replace: true });
    }, [navigate, onLogout]);

    // Extend session (dismiss warning)
    const extendSession = useCallback(() => {
        setShowWarning(false);
        resetTimer();
    }, [resetTimer]);

    return {
        showWarning,
        remainingTime,
        logout,
        extendSession,
    };
};

export default useAutoLogout;
