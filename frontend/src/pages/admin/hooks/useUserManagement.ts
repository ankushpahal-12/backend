import { useState, useCallback, useRef } from 'react';
import * as adminApi from '../services/adminApi';
import { toastNotify } from '../utils/toastNotify';
import { validators } from '../utils/validators';


 
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

export type UserEvent = 
  | 'fetching_users'
  | 'users_fetched'
  | 'creating_user'
  | 'user_created'
  | 'deleting_user'
  | 'user_deleted'
  | 'updating_role'
  | 'role_updated'
  | 'blocking_user'
  | 'user_blocked'
  | 'unblocking_user'
  | 'user_unblocked'
  | 'resetting_password'
  | 'password_reset'
  | 'force_logout_user'
  | 'user_logout'
  | 'error';

export interface UserEventLog {
  type: UserEvent;
  message: string;
  timestamp: Date;
  userId?: string;
  error?: Error;
}

interface UserManagementState {
  users: User[];
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
  eventLog: UserEventLog[];
}

interface UseUserManagementReturn {
  // State
  users: User[];
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
  eventLog: UserEventLog[];
  
  // Fetch operations
  fetchUsers: (page?: number, limit?: number) => Promise<{ users: User[]; total: number }>;
  refreshUsers: () => Promise<{ users: User[]; total: number }>;
  setPage: (page: number) => Promise<void>;
  searchUsers: (term: string) => User[];
  
  // User management operations
  addUser: (userData: { name: string; email: string; role?: string }) => Promise<boolean>;
  deleteUser: (userId: string, userName: string) => Promise<boolean>;
  updateUserRole: (userId: string, newRole: 'user' | 'admin', userName: string) => Promise<boolean>;
  blockUser: (userId: string, reason: string, userName: string) => Promise<boolean>;
  unblockUser: (userId: string, userName: string) => Promise<boolean>;
  resetPassword: (userId: string, userName: string) => Promise<boolean>;
  forceLogout: (userId: string, userName: string) => Promise<boolean>;
  
  // Utility
  clearEventLog: () => void;
  getLatestEvent: () => UserEventLog | null;
  clearError: () => void;
}
// HOOK IMPLEMENTATION
export const useUserManagement = (onEventChange?: (event: UserEventLog) => void): UseUserManagementReturn => {
  // STATE MANAGEMENT
 
  const [state, setState] = useState<UserManagementState>({
    users: [],
    loading: false,
    error: null,
    page: 0,
    limit: 10,
    total: 0,
    eventLog: [],
  });

  const stateRef = useRef<UserManagementState>(state);

  // Update ref whenever state changes
  stateRef.current = state;

 
  // UTILITY FUNCTIONS
 

  /**
   * Add event to log and trigger callback
   */
  const addEvent = useCallback((event: UserEventLog) => {
    setState((prev) => ({
      ...prev,
      eventLog: [event, ...prev.eventLog].slice(0, 50), // Keep last 50 events
    }));
    onEventChange?.(event);
  }, [onEventChange]);

  /**
   * Create event object with standardized structure
   */
  const createEvent = (type: UserEvent, message: string, userId?: string, error?: Error): UserEventLog => {
    return {
      type,
      message,
      timestamp: new Date(),
      userId,
      error,
    };
  };

  /**
   * Handle operation errors with logging
   */
  const handleError = useCallback((err: unknown, operationName: string, userId?: string): string => {
    const errorMsg = err instanceof Error ? err.message : `${operationName} failed`;
    console.error(`❌ Error in ${operationName}:`, err);
    
    setState((prev) => ({ ...prev, error: errorMsg }));
    addEvent(createEvent('error', errorMsg, userId, err instanceof Error ? err : new Error(errorMsg)));
    
    return errorMsg;
  }, [addEvent]);

  /**
   * Fetch users from backend with pagination
   */
  const fetchUsers = useCallback(async (page: number = 0, limit: number = 10) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    addEvent(createEvent('fetching_users', `Fetching users (page ${page + 1}, limit ${limit})...`));

    try {
      const apiPage = page + 1; // Convert 0-indexed to 1-indexed for API

      const response = await adminApi.getAllUsers(apiPage, limit);

      const users: User[] = (response.users as unknown as User[]) || [];
      const total = response.total || 0;

      setState((prev) => ({
        ...prev,
        users,
        total,
        page,
        limit,
        loading: false,
      }));

      addEvent(createEvent('users_fetched', `Successfully fetched ${users.length} users`));
      toastNotify.success(`Loaded ${users.length} users`, 'Users Fetched');

      return { users, total };
    } catch (err) {
      const errorMsg = handleError(err, 'fetchUsers');
      toastNotify.error(errorMsg, 'Failed to Load Users');
      setState((prev) => ({ ...prev, loading: false }));
      return { users: [], total: 0 };
    } finally {
      // fetchUsers operation completed
    }
  }, [addEvent, handleError]);

  /**
   Refresh users with current page/limit**/

  const refreshUsers = useCallback(async () => {
    try {
      const { page, limit } = stateRef.current;
      return await fetchUsers(page, limit);
    } catch (err) {
      handleError(err, 'refreshUsers');
      return { users: [], total: 0 };
    }
  }, [fetchUsers, handleError]);

  /**
   * Change page and fetch
   */
  const setPage = useCallback(async (newPage: number) => {
    try {
      const { limit } = stateRef.current;
      await fetchUsers(newPage, limit);
    } catch (err) {
      handleError(err, 'setPage');
    }
  }, [fetchUsers, handleError]);

  /**
   * Search users locally (in-memory search)*/
  const searchUsers = useCallback((searchTerm: string): User[] => {
    try {
      if (!searchTerm.trim()) {
        return stateRef.current.users;
      }

      const term = searchTerm.toLowerCase();
      const results = stateRef.current.users.filter(
        (user) =>
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
      );

      return results;
    } catch (err) {
      handleError(err, 'searchUsers');
      return [];
    }
  }, [handleError]);



  /**
   * Add new user
   */
  const addUser = useCallback(async (userData: { name: string; email: string; role?: string }): Promise<boolean> => {
    let toastId: string | number | null = null;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    addEvent(createEvent('creating_user', `Creating user ${userData.name}...`));

    try {
      toastId = toastNotify.loading(`Creating user ${userData.name}...`, 'Processing');

      // Validate input
      if (!userData.name?.trim()) {
        throw new Error('Name is required');
      }
      if (!validators.isValidEmail(userData.email)) {
        throw new Error('Invalid email format');
      }

      await adminApi.createUser(userData);

      // Refresh users list
      await refreshUsers();

      if (toastId) {
        toastNotify.update(toastId, {
          render: `User ${userData.name} created successfully! OTP sent to their email.`,
          type: 'success',
          autoClose: 3000,
        });
      }

      addEvent(createEvent('user_created', `User ${userData.name} created successfully`));

      return true;
    } catch (err) {
      const errorMsg = handleError(err, 'addUser');
      if (toastId) {
        toastNotify.update(toastId, {
          render: errorMsg,
          type: 'error',
          autoClose: 3000,
        });
      }
      return false;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [addEvent, handleError, refreshUsers]);

  /**
   * Delete user
   */
  const deleteUser = useCallback(async (userId: string, userName: string): Promise<boolean> => {
    let toastId: string | number | null = null;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    addEvent(createEvent('deleting_user', `Deleting user ${userName}...`, userId));

    try {
      toastId = toastNotify.loading(`Deleting ${userName}...`, 'Processing');

      await adminApi.deleteUser(userId);

      // Update users list immediately
      setState((prev) => ({
        ...prev,
        users: prev.users.filter((u) => u._id !== userId),
      }));

      if (toastId) {
        toastNotify.update(toastId, {
          render: `User ${userName} deleted successfully!`,
          type: 'success',
          autoClose: 3000,
        });
      }

      addEvent(createEvent('user_deleted', `User ${userName} deleted successfully`, userId));

      return true;
    } catch (err) {
      const errorMsg = handleError(err, 'deleteUser', userId);
      if (toastId) {
        toastNotify.update(toastId, {
          render: errorMsg,
          type: 'error',
          autoClose: 3000,
        });
      }
      return false;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [addEvent, handleError]);

  /**
   * Update user role
   */
  const updateUserRole = useCallback(
    async (userId: string, newRole: 'user' | 'admin', userName: string): Promise<boolean> => {
      let toastId: string | number | null = null;

      setState((prev) => ({ ...prev, loading: true, error: null }));
      addEvent(createEvent('updating_role', `Changing ${userName}'s role to ${newRole}...`, userId));

      try {
        toastId = toastNotify.loading(`Updating ${userName}'s role...`, 'Processing');

        await adminApi.updateUserRole(userId, newRole);

        // Update users list immediately
        setState((prev) => ({
          ...prev,
          users: prev.users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)),
        }));

      if (toastId) {
        toastNotify.update(toastId, {
          render: `Role updated to ${newRole} successfully!`,
          type: 'success',
          autoClose: 3000,
        });
      }
        return true;
      } catch (err) {
        const errorMsg = handleError(err, 'updateUserRole', userId);
        if (toastId) {
          toastNotify.update(toastId, {
            render: errorMsg,
            type: 'error',
            autoClose: 3000,
          });
        }
        return false;
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    [addEvent, handleError]
  );

  /**
   * Block user
   */
  const blockUser = useCallback(async (userId: string, reason: string, userName: string): Promise<boolean> => {
    let toastId: string | number | null = null;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    addEvent(createEvent('blocking_user', `Blocking user ${userName}...`, userId));

    try {
      toastId = toastNotify.loading(`Blocking ${userName}...`, 'Processing');

      if (!reason?.trim()) {
        throw new Error('Block reason is required');
      }

      await adminApi.blockUser(userId, reason);

      // Update users list immediately
      setState((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u._id === userId ? { ...u, isBlocked: true, blockedReason: reason, blockedAt: new Date().toISOString() } : u
        ),
      }));

      if (toastId) {
        toastNotify.update(toastId, {
          render: `User ${userName} blocked successfully!`,
          type: 'success',
          autoClose: 3000,
        });
      }

      addEvent(createEvent('user_blocked', `User ${userName} blocked: ${reason}`, userId));

      return true;
    } catch (err) {
      const errorMsg = handleError(err, 'blockUser', userId);
      if (toastId) {
        toastNotify.update(toastId, {
          render: errorMsg,
          type: 'error',
          autoClose: 3000,
        });
      }
      return false;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [addEvent, handleError]);

  /**
   * Unblock user
   */
  const unblockUser = useCallback(async (userId: string, userName: string): Promise<boolean> => {
    let toastId: string | number | null = null;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    addEvent(createEvent('unblocking_user', `Unblocking user ${userName}...`, userId));

    try {
      toastId = toastNotify.loading(`Unblocking ${userName}...`, 'Processing');

      await adminApi.unblockUser(userId);

      // Update users list immediately
      setState((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u._id === userId ? { ...u, isBlocked: false, blockedReason: undefined, blockedAt: undefined } : u
        ),
      }));

      if (toastId) {
        toastNotify.update(toastId, {
          render: `User ${userName} unblocked successfully!`,
          type: 'success',
          autoClose: 3000,
        });
      }

      addEvent(createEvent('user_unblocked', `User ${userName} unblocked successfully`, userId));

      return true;
    } catch (err) {
      const errorMsg = handleError(err, 'unblockUser', userId);
      if (toastId) {
        toastNotify.update(toastId, {
          render: errorMsg,
          type: 'error',
          autoClose: 3000,
        });
      }
      return false;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [addEvent, handleError]);

  /**
   * Reset user password
   */
  const resetPassword = useCallback(async (userId: string, userName: string): Promise<boolean> => {
    let toastId: string | number | null = null;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    addEvent(createEvent('resetting_password', `Resetting password for ${userName}...`, userId));

    try {
      toastId = toastNotify.loading(`Resetting ${userName}'s password...`, 'Processing');

      await adminApi.resetUserPassword(userId, 'send-reset-link');

      if (toastId) {
        toastNotify.update(toastId, {
          render: `Password reset link sent to ${userName}'s email!`,
          type: 'success',
          autoClose: 3000,
        });
      }

      addEvent(createEvent('password_reset', `Password reset link sent to ${userName}`, userId));

      return true;
    } catch (err) {
      const errorMsg = handleError(err, 'resetPassword', userId);
      if (toastId) {
        toastNotify.update(toastId, {
          render: errorMsg,
          type: 'error',
          autoClose: 3000,
        });
      }
      return false;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [addEvent, handleError]);

  /**
   * Force logout user from all sessions*/
  const forceLogout = useCallback(async (userId: string, userName: string): Promise<boolean> => {
    let toastId: string | number | null = null;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    addEvent(createEvent('force_logout_user', `Force logging out ${userName} from all sessions...`, userId));

    try {
      toastId = toastNotify.loading(`Logging out ${userName} from all sessions...`, 'Processing');

      await adminApi.forceLogoutUser(userId);

      if (toastId) {
        toastNotify.update(toastId, {
          render: `${userName} has been logged out from all sessions!`,
          type: 'success',
          autoClose: 3000,
        });
      }

      addEvent(createEvent('user_logout', `${userName} logged out from all sessions`, userId));

      return true;
    } catch (err) {
      const errorMsg = handleError(err, 'forceLogout', userId);
      if (toastId) {
        toastNotify.update(toastId, {
          render: errorMsg,
          type: 'error',
          autoClose: 3000,
        });
      }
      return false;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [addEvent, handleError]);


  // UTILITY FUNCTIONS


  /**
   * Clear event log
   */
  const clearEventLog = useCallback(() => {
    setState((prev) => ({
      ...prev,
      eventLog: [],
      error: null,
    }));
  }, []);

  /**
   * Get latest event from log
   */
  const getLatestEvent = useCallback((): UserEventLog | null => {
    return state.eventLog.length > 0 ? state.eventLog[0] : null;
  }, [state.eventLog]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);


  // RETURN OBJECT


  return {
    // State
    users: state.users,
    loading: state.loading,
    error: state.error,
    page: state.page,
    limit: state.limit,
    total: state.total,
    eventLog: state.eventLog,

    // Fetch operations
    fetchUsers,
    refreshUsers,
    setPage,
    searchUsers,

    // User management operations
    addUser,
    deleteUser,
    updateUserRole,
    blockUser,
    unblockUser,
    resetPassword,
    forceLogout,

    // Utilities
    clearEventLog,
    getLatestEvent,
    clearError,
  };
};
