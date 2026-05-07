import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';
import api from '../utils/api';
import { cleanupLegacyStorage } from '../utils/storageUtils';
import toast from 'react-hot-toast';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
    twoFactorEnabled?: boolean;
    avatar?: string;
    createdAt?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (userData: User, token?: string) => void;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            const response = await api.get('/users/me');
            setUser(response.data.data.user);
        } catch (error: any) {
            // Silent failure - user is not authenticated (expected on public pages)
            setUser(null);
            localStorage.removeItem('user');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Purge legacy storage junk on initialization
        cleanupLegacyStorage();

        // Always attempt to hydrate user state from the server.
        // The jwt cookie is HttpOnly, so document.cookie cannot read it —
        // a cookie-presence sniff would always return false and break page reloads.
        // The API will return 401 if no session exists, and fetchUser() handles that gracefully.
        fetchUser();
    }, [fetchUser]);

    const login = useCallback((userData: User, _token?: string) => {
        setUser(userData);
    }, []);

    const logout = useCallback(async () => {
        const isAdmin = user?.role === 'admin';
        try {
            await authService.logout();
        } catch {
            // Logout error ignored for client-side cleanup
        }

        setUser(null);
        toast.success('Session terminated successfully');
        setTimeout(() => {
            window.location.href = isAdmin ? '/admin/login' : '/';
        }, 800);
    }, [user]);

    const updateUser = useCallback((userData: Partial<User>) => {
        setUser(prev => {
            if (!prev) return null;
            return { ...prev, ...userData };
        });
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            token: null,
            isAuthenticated: !!user,
            login: (userData: User, token?: string) => login(userData, token),
            logout,
            updateUser
        }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
