/**
 * Hook for banning/blocking users
 */

import { useState, useCallback } from 'react';
import * as adminApi from '../services/adminApi';
import { toastNotify } from '../utils/toastNotify';

interface UseBanUserState {
  loading: boolean;
  error: string | null;
}

export const useBanUser = () => {
  const [state, setState] = useState<UseBanUserState>({
    loading: false,
    error: null,
  });

  const blockUser = useCallback(async (userId: string, reason: string, userName: string): Promise<boolean> => {
    setState({ loading: true, error: null });

    try {
      const toastId = toastNotify.loading(`Blocking ${userName}...`, 'Processing');

      await adminApi.blockUser(userId, reason);

      toastNotify.update(toastId, {
        render: `User ${userName} blocked successfully!`,
        type: 'success',
        autoClose: 3000,
      });

      setState({ loading: false, error: null });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to block user';
      toastNotify.error(errorMessage, 'Block Failed');

      setState({ loading: false, error: errorMessage });
      return false;
    }
  }, []);

  return {
    loading: state.loading,
    error: state.error,
    blockUser,
  };
};

/**
 * Hook for unblocking users
 */

interface UseUnblockUserState {
  loading: boolean;
  error: string | null;
}

export const useUnblockUser = () => {
  const [state, setState] = useState<UseUnblockUserState>({
    loading: false,
    error: null,
  });

  const unblockUser = useCallback(async (userId: string, userName: string): Promise<boolean> => {
    setState({ loading: true, error: null });

    try {
      const toastId = toastNotify.loading(`Unblocking ${userName}...`, 'Processing');

      await adminApi.unblockUser(userId);

      toastNotify.update(toastId, {
        render: `User ${userName} unblocked successfully!`,
        type: 'success',
        autoClose: 3000,
      });

      setState({ loading: false, error: null });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unblock user';
      toastNotify.error(errorMessage, 'Unblock Failed');

      setState({ loading: false, error: errorMessage });
      return false;
    }
  }, []);

  return {
    loading: state.loading,
    error: state.error,
    unblockUser,
  };
};
