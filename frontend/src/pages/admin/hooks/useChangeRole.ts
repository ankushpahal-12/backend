/**
 * Hook for changing user role
 */

import { useState, useCallback } from 'react';
import * as adminApi from '../services/adminApi';
import { toastNotify } from '../utils/toastNotify';

interface UseChangeRoleState {
  loading: boolean;
  error: string | null;
}

export const useChangeRole = () => {
  const [state, setState] = useState<UseChangeRoleState>({
    loading: false,
    error: null,
  });

  const updateRole = useCallback(async (userId: string, newRole: 'user' | 'admin', userName: string): Promise<boolean> => {
    setState({ loading: true, error: null });

    try {
      const toastId = toastNotify.loading(`Updating ${userName}'s role...`, 'Processing');

      await adminApi.updateUserRole(userId, newRole);

      toastNotify.update(toastId, {
        render: `Role updated to ${newRole} successfully!`,
        type: 'success',
        autoClose: 3000,
      });

      setState({ loading: false, error: null });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update role';
      toastNotify.error(errorMessage, 'Role Update Failed');

      setState({ loading: false, error: errorMessage });
      return false;
    }
  }, []);

  return {
    loading: state.loading,
    error: state.error,
    updateRole,
  };
};
