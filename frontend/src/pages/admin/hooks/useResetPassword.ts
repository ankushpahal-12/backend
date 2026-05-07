/**
 * Hook for resetting user password
 */

import { useState, useCallback } from 'react';
import * as adminApi from '../services/adminApi';
import { validators, type ValidationError } from '../utils/validators';
import { toastNotify } from '../utils/toastNotify';

interface PasswordResetFormData {
  newPassword: string;
  confirmPassword: string;
}

interface UseResetPasswordState {
  formData: PasswordResetFormData;
  loading: boolean;
  errors: ValidationError[];
}

export const useResetPassword = () => {
  const [state, setState] = useState<UseResetPasswordState>({
    formData: {
      newPassword: '',
      confirmPassword: '',
    },
    loading: false,
    errors: [],
  });

  const setFormField = useCallback((field: keyof PasswordResetFormData, value: string) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
      },
      errors: [],
    }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors = validators.validatePasswordResetForm(state.formData);
    setState(prev => ({ ...prev, errors }));
    return errors.length === 0;
  }, [state.formData]);

  const resetPassword = useCallback(async (userId: string, userName: string): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    setState(prev => ({ ...prev, loading: true }));

    try {
      const toastId = toastNotify.loading(`Resetting ${userName}'s password...`, 'Processing');

      await adminApi.resetUserPassword(userId, state.formData.newPassword);

      toastNotify.update(toastId, {
        render: `Password reset successfully!`,
        type: 'success',
        autoClose: 3000,
      });

      setState(prev => ({
        ...prev,
        formData: { newPassword: '', confirmPassword: '' },
        loading: false,
        errors: [],
      }));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
      toastNotify.error(errorMessage, 'Reset Failed');

      setState(prev => ({ ...prev, loading: false }));
      return false;
    }
  }, [state.formData, validateForm]);

  const resetForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      formData: { newPassword: '', confirmPassword: '' },
      errors: [],
      loading: false,
    }));
  }, []);

  const getFieldError = useCallback((field: keyof PasswordResetFormData): string | undefined => {
    return validators.getFieldError(state.errors, field);
  }, [state.errors]);

  return {
    formData: state.formData,
    loading: state.loading,
    errors: state.errors,
    setFormField,
    validateForm,
    resetPassword,
    resetForm,
    getFieldError,
    hasErrors: validators.hasErrors(state.errors),
    firstError: validators.getFirstError(state.errors),
  };
};

/**
 * Hook for force logout (terminate all sessions)
 */

interface UseForceLogoutState {
  loading: boolean;
  error: string | null;
}

export const useForceLogout = () => {
  const [state, setState] = useState<UseForceLogoutState>({
    loading: false,
    error: null,
  });

  const forceLogout = useCallback(async (userId: string, userName: string): Promise<boolean> => {
    setState({ loading: true, error: null });

    try {
      const toastId = toastNotify.loading(`Logging out ${userName} from all devices...`, 'Processing');

      // Call the new force logout endpoint
      await adminApi.forceLogoutUser(userId);

      toastNotify.update(toastId, {
        render: `${userName} logged out from all devices!`,
        type: 'success',
        autoClose: 3000,
      });

      setState({ loading: false, error: null });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to logout user';
      toastNotify.error(errorMessage, 'Logout Failed');

      setState({ loading: false, error: errorMessage });
      return false;
    }
  }, []);

  return {
    loading: state.loading,
    error: state.error,
    forceLogout,
  };
};
