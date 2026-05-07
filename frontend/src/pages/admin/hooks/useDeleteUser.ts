/**
 * Hook for deleting users
 */

import { useState, useCallback } from 'react';
import * as adminApi from '../services/adminApi';
import { toastNotify } from '../utils/toastNotify';

interface UseDeleteUserState {
  loading: boolean;
  error: string | null;
}

export const useDeleteUser = () => {
  const [state, setState] = useState<UseDeleteUserState>({
    loading: false,
    error: null,
  });

  const deleteUser = useCallback(async (userId: string, userName: string): Promise<boolean> => {
    setState({ loading: true, error: null });

    try {
      const toastId = toastNotify.loading(`Deleting ${userName}...`, 'Processing');

      await adminApi.deleteUser(userId);

      toastNotify.update(toastId, {
        render: `User ${userName} deleted successfully!`,
        type: 'success',
        autoClose: 3000,
      });

      setState({ loading: false, error: null });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      toastNotify.error(errorMessage, 'Deletion Failed');

      setState({ loading: false, error: errorMessage });
      return false;
    }
  }, []);

  return {
    loading: state.loading,
    error: state.error,
    deleteUser,
  };
};
