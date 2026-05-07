/**
 * Hook for fetching users from backend
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import * as adminApi from '../services/adminApi';
import { toastNotify } from '../utils/toastNotify';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isBlocked: boolean;
  blockedReason?: string;
  blockedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface UseFetchUsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
}

export const useFetchUsers = () => {
  const [state, setState] = useState<UseFetchUsersState>({
    users: [],
    loading: false,
    error: null,
    page: 0,
    limit: 10,
    total: 0,
  });

  const hasInitialized = useRef(false);

  const fetchUsers = useCallback(async (page: number, limit: number) => {
    try {
      const apiPage = page + 1; // Convert 0-indexed to 1-indexed
      console.log(`📥 Fetching users: page=${apiPage}, limit=${limit}`);
      const response = await adminApi.getAllUsers(apiPage, limit);
      console.log(`Received users:`, response);
      
      // Type-cast response to match our User interface
      const users: User[] = (response.users as unknown as User[]) || [];
      const total = response.total || 0;

      setState(prev => ({
        ...prev,
        users,
        total,
        page,
        limit,
        loading: false,
      }));

      return { users, total };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      console.error(`❌ Error fetching users:`, err);
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      toastNotify.error(errorMessage, 'Failed to Load Users');
      return { users: [], total: 0 };
    }
  }, []);

  // Refresh users - capture state at call time
  const refreshUsers = useCallback(async () => {
    return fetchUsers(state.page, state.limit);
  }, [fetchUsers]);

  // Change page
  const setPage = useCallback((newPage: number) => {
    fetchUsers(newPage, state.limit);
  }, [fetchUsers, state.limit]);

  // Change limit
  const setLimit = useCallback((newLimit: number) => {
    fetchUsers(0, state.limit);
  }, [fetchUsers, state.limit]);

  // Search users locally (in-memory search)
  const searchUsers = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) {
      return state.users;
    }

    const term = searchTerm.toLowerCase();
    return state.users.filter(user =>
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user._id.toLowerCase().includes(term)
    );
  }, [state.users]);

  // Filter users by role
  const filterByRole = useCallback((role: 'user' | 'admin' | 'all') => {
    if (role === 'all') return state.users;
    return state.users.filter(user => user.role === role);
  }, [state.users]);

  // Filter users by status
  const filterByStatus = useCallback((status: 'active' | 'blocked' | 'all') => {
    if (status === 'all') return state.users;
    if (status === 'blocked') return state.users.filter(user => user.isBlocked);
    return state.users.filter(user => !user.isBlocked);
  }, [state.users]);

  // Fetch on mount - only once
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      console.log('🚀 useFetchUsers mounted, fetching initial data...');
      fetchUsers(0, 10);
    }
  }, [fetchUsers]);

  return {
    users: state.users,
    loading: state.loading,
    error: state.error,
    page: state.page,
    limit: state.limit,
    total: state.total,
    fetchUsers,
    refreshUsers,
    setPage,
    setLimit,
    searchUsers,
    filterByRole,
    filterByStatus,
  };
};
