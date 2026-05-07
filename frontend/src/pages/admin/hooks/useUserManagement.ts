import { useState, useCallback } from 'react';
import * as adminApi from '../services/adminApi';

export type UserEvent = 
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
  | 'terminating_session'
  | 'session_terminated'
  | 'fetching_users'
  | 'users_fetched'
  | 'error';

export interface UserEventLog {
  type: UserEvent;
  message: string;
  timestamp: Date;
  userId?: string;
  error?: Error;
}

interface UseUserManagementReturn {
  loading: boolean;
  error: string | null;
  eventLog: UserEventLog[];
  createUser: (data: { name: string; email: string; password: string; role?: string }) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  updateUserRole: (userId: string, role: string) => Promise<void>;
  blockUser: (userId: string, reason?: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  resetPassword: (userId: string, password: string) => Promise<void>;
  terminateSession: (userId: string, sessionId: string) => Promise<void>;
  clearEventLog: () => void;
  getLatestEvent: () => UserEventLog | null;
}

export const useUserManagement = (onEventChange?: (event: UserEventLog) => void): UseUserManagementReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventLog, setEventLog] = useState<UserEventLog[]>([]);

  const addEvent = useCallback((event: UserEventLog) => {
    setEventLog((prev) => [event, ...prev]);
    onEventChange?.(event);
  }, [onEventChange]);

  const createUser = useCallback(async (data: { name: string; email: string; password: string; role?: string }) => {
    setLoading(true);
    setError(null);

    try {
      addEvent({
        type: 'creating_user',
        message: `Creating user ${data.name}...`,
        timestamp: new Date(),
      });

      await adminApi.createUser(data);

      addEvent({
        type: 'user_created',
        message: `User ${data.name} created successfully`,
        timestamp: new Date(),
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create user';
      setError(errorMsg);
      addEvent({
        type: 'error',
        message: errorMsg,
        timestamp: new Date(),
        error: err instanceof Error ? err : new Error(errorMsg),
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addEvent]);

  const deleteUser = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      addEvent({
        type: 'deleting_user',
        message: 'Deleting user...',
        timestamp: new Date(),
        userId,
      });

      await adminApi.deleteUser(userId);

      addEvent({
        type: 'user_deleted',
        message: 'User deleted successfully',
        timestamp: new Date(),
        userId,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete user';
      setError(errorMsg);
      addEvent({
        type: 'error',
        message: errorMsg,
        timestamp: new Date(),
        userId,
        error: err instanceof Error ? err : new Error(errorMsg),
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addEvent]);

  const updateUserRole = useCallback(async (userId: string, role: string) => {
    setLoading(true);
    setError(null);

    try {
      addEvent({
        type: 'updating_role',
        message: `Changing role to ${role}...`,
        timestamp: new Date(),
        userId,
      });

      await adminApi.updateUserRole(userId, role);

      addEvent({
        type: 'role_updated',
        message: `Role changed to ${role} successfully`,
        timestamp: new Date(),
        userId,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update role';
      setError(errorMsg);
      addEvent({
        type: 'error',
        message: errorMsg,
        timestamp: new Date(),
        userId,
        error: err instanceof Error ? err : new Error(errorMsg),
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addEvent]);

  const blockUser = useCallback(async (userId: string, reason?: string) => {
    setLoading(true);
    setError(null);

    try {
      addEvent({
        type: 'blocking_user',
        message: 'Blocking user...',
        timestamp: new Date(),
        userId,
      });

      await adminApi.blockUser(userId, reason);

      addEvent({
        type: 'user_blocked',
        message: 'User blocked successfully',
        timestamp: new Date(),
        userId,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to block user';
      setError(errorMsg);
      addEvent({
        type: 'error',
        message: errorMsg,
        timestamp: new Date(),
        userId,
        error: err instanceof Error ? err : new Error(errorMsg),
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addEvent]);

  const unblockUser = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      addEvent({
        type: 'unblocking_user',
        message: 'Unblocking user...',
        timestamp: new Date(),
        userId,
      });

      await adminApi.unblockUser(userId);

      addEvent({
        type: 'user_unblocked',
        message: 'User unblocked successfully',
        timestamp: new Date(),
        userId,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to unblock user';
      setError(errorMsg);
      addEvent({
        type: 'error',
        message: errorMsg,
        timestamp: new Date(),
        userId,
        error: err instanceof Error ? err : new Error(errorMsg),
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addEvent]);

  const resetPassword = useCallback(async (userId: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      addEvent({
        type: 'resetting_password',
        message: 'Resetting password...',
        timestamp: new Date(),
        userId,
      });

      await adminApi.resetUserPassword(userId, password);

      addEvent({
        type: 'password_reset',
        message: 'Password reset successfully',
        timestamp: new Date(),
        userId,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to reset password';
      setError(errorMsg);
      addEvent({
        type: 'error',
        message: errorMsg,
        timestamp: new Date(),
        userId,
        error: err instanceof Error ? err : new Error(errorMsg),
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addEvent]);

  const terminateSession = useCallback(async (userId: string, sessionId: string) => {
    setLoading(true);
    setError(null);

    try {
      addEvent({
        type: 'terminating_session',
        message: 'Terminating session...',
        timestamp: new Date(),
        userId,
      });

      await adminApi.terminateSession(userId, sessionId);

      addEvent({
        type: 'session_terminated',
        message: 'Session terminated successfully',
        timestamp: new Date(),
        userId,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to terminate session';
      setError(errorMsg);
      addEvent({
        type: 'error',
        message: errorMsg,
        timestamp: new Date(),
        userId,
        error: err instanceof Error ? err : new Error(errorMsg),
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addEvent]);

  const clearEventLog = useCallback(() => {
    setEventLog([]);
    setError(null);
  }, []);

  const getLatestEvent = useCallback(() => {
    return eventLog.length > 0 ? eventLog[0] : null;
  }, [eventLog]);

  return {
    loading,
    error,
    eventLog,
    createUser,
    deleteUser,
    updateUserRole,
    blockUser,
    unblockUser,
    resetPassword,
    terminateSession,
    clearEventLog,
    getLatestEvent,
  };
};
