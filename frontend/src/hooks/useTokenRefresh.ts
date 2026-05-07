/**
 * useTokenRefresh Hook
 * 
 * Manages access token refresh logic
 * - Automatically refreshes token when it expires
 * - Handles token rotation
 * - Detects compromise and logs out
 */

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export const useTokenRefresh = (api) => {
    const navigate = useNavigate();
    const refreshIntervalRef = useRef(null);
    const isRefreshingRef = useRef(false);

    const storeTokens = (accessToken, refreshToken) => {
        sessionStorage.setItem('access-token', accessToken);
        sessionStorage.setItem('refresh-token', refreshToken);
    };

    const getTokens = () => ({
        accessToken: sessionStorage.getItem('access-token'),
        refreshToken: sessionStorage.getItem('refresh-token'),
    });

    const clearTokens = () => {
        sessionStorage.removeItem('access-token');
        sessionStorage.removeItem('refresh-token');
        sessionStorage.removeItem('csrf-token');
    };

    const refreshToken = async () => {
        if (isRefreshingRef.current) return;

        try {
            isRefreshingRef.current = true;
            const { refreshToken } = getTokens();

            if (!refreshToken) {
                // No refresh token, redirect to login
                clearTokens();
                navigate('/login');
                return;
            }

            // Call refresh endpoint through the shared API client
            const response = await api.post('/auth/refresh', { refreshToken });

            if (response.status === 401) {
                // Refresh token invalid or expired
                clearTokens();
                navigate('/login');
                return;
            }

            const data = response.data;
            storeTokens(data.accessToken, data.refreshToken);

            // Reschedule refresh
            scheduleTokenRefresh(data.expiresIn);
        } catch (error) {
            console.error('Token refresh failed:', error);
            clearTokens();
            navigate('/login');
        } finally {
            isRefreshingRef.current = false;
        }
    };

    const scheduleTokenRefresh = (expiresIn = 900) => {
        // Clear existing interval
        if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
        }

        // Refresh 1 minute before expiration
        const refreshTime = (expiresIn - 60) * 1000;

        refreshIntervalRef.current = setInterval(() => {
            refreshToken();
        }, refreshTime);
    };

    useEffect(() => {
        // Start token refresh on mount
        scheduleTokenRefresh();

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, []);

    return {
        refreshToken,
        storeTokens,
        getTokens,
        clearTokens,
    };
};

export default useTokenRefresh;
