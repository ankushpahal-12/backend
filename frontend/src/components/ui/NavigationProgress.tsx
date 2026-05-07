/**
 * NavigationProgress
 * A slim NProgress-style top loading bar that fires on:
 * 1. React Router navigation changes
 * 2. Axios request start/complete (via interceptors registered below)
 *
 * Uses react-hot-toast's CSS-variable-based color so it matches the app theme.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../utils/api';

// ── Singleton counter so multiple parallel requests share one bar ──────────────
let activeRequests = 0;
const listeners: Array<(active: boolean) => void> = [];

function notifyListeners() {
    listeners.forEach((fn) => fn(activeRequests > 0));
}

// Axios interceptors (registered once at module load)
api.interceptors.request.use((config) => {
    activeRequests++;
    notifyListeners();
    return config;
});

api.interceptors.response.use(
    (response) => {
        activeRequests = Math.max(0, activeRequests - 1);
        notifyListeners();
        return response;
    },
    (error) => {
        activeRequests = Math.max(0, activeRequests - 1);
        notifyListeners();
        return Promise.reject(error);
    }
);

// ── Component ─────────────────────────────────────────────────────────────────
export default function NavigationProgress() {
    const location = useLocation();
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const start = useCallback(() => {
        if (timerRef.current) return; // already running
        setProgress(0);
        setVisible(true);

        // Simulate progress: fast to 70%, slow crawl to 90%
        let p = 0;
        timerRef.current = setInterval(() => {
            p = p < 70 ? p + 8 : p < 90 ? p + 0.5 : p;
            setProgress(Math.min(p, 90));
        }, 80);
    }, []);

    const complete = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setProgress(100);
        hideTimerRef.current = setTimeout(() => {
            setVisible(false);
            setProgress(0);
        }, 350);
    }, []);

    // Route changes
    useEffect(() => {
        start();
        const t = setTimeout(complete, 400);
        return () => clearTimeout(t);
    }, [location.pathname, location.search, start, complete]);

    // Axios request state
    useEffect(() => {
        const handler = (active: boolean) => {
            if (active) start();
            else complete();
        };
        listeners.push(handler);
        return () => {
            const idx = listeners.indexOf(handler);
            if (idx !== -1) listeners.splice(idx, 1);
        };
    }, [start, complete]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        };
    }, []);

    if (!visible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 99999,
                height: '3px',
                pointerEvents: 'none',
            }}
        >
            <div
                style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #10b981, #06b6d4, #6366f1)',
                    boxShadow: '0 0 10px #10b981, 0 0 5px #06b6d4',
                    transition: progress === 100
                        ? 'width 0.15s ease-out, opacity 0.3s ease'
                        : 'width 0.08s linear',
                    borderRadius: '0 2px 2px 0',
                }}
            />
            {/* Glowing leading edge */}
            <div
                style={{
                    position: 'absolute',
                    top: '-1px',
                    right: `${100 - progress}%`,
                    width: '80px',
                    height: '5px',
                    background: 'radial-gradient(ellipse at right, rgba(16,185,129,0.8) 0%, transparent 70%)',
                    filter: 'blur(3px)',
                    transition: 'right 0.08s linear',
                }}
            />
        </div>
    );
}
