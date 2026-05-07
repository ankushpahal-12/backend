/**
 * Hook for setting password after email verification
 */

import { useState, useCallback } from 'react';
import * as adminApi from '../services/adminApi';
import { validators } from '../utils/validators';
import type { ValidationError } from '../utils/validators';
import { toastNotify } from '../utils/toastNotify';

interface UseSetPasswordState {
  password: string;
  confirmPassword: string;
  loading: boolean;
  errors: ValidationError[];
  success: boolean;
}

export const useSetPassword = () => {
  const [state, setState] = useState<UseSetPasswordState>({
    password: '',
    confirmPassword: '',
    loading: false,
    errors: [],
    success: false,
  });

  // Update field
  const setField = useCallback((field: 'password' | 'confirmPassword', value: string) => {
    setState(prev => ({
      ...prev,
      [field]: value,
      errors: [], // Clear errors on change
    }));
  }, []);

  // Validate password
  const validatePassword = useCallback((): boolean => {
    const errors: ValidationError[] = [];

    if (!state.password) {
      errors.push({ field: 'password', message: 'Password is required' });
    } else if (!validators.isStrongPassword(state.password)) {
      errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
    }

    if (!state.confirmPassword) {
      errors.push({ field: 'confirmPassword', message: 'Confirm password is required' });
    } else if (!validators.passwordsMatch(state.password, state.confirmPassword)) {
      errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
    }

    setState(prev => ({ ...prev, errors }));
    return errors.length === 0;
  }, [state.password, state.confirmPassword]);

  // Set password
  const setPassword = useCallback(async (userId: string): Promise<boolean> => {
    if (!validatePassword()) {
      return false;
    }

    setState(prev => ({ ...prev, loading: true }));

    try {
      const toastId = toastNotify.loading('Setting password...', 'Processing');

      await adminApi.setPasswordAfterVerification(userId, state.password);

      setState(prev => ({
        ...prev,
        success: true,
        loading: false,
        password: '',
        confirmPassword: '',
      }));

      toastNotify.update(toastId, {
        render: 'Password set successfully! Your account is now active.',
        type: 'success',
        autoClose: 3000,
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set password';
      setState(prev => ({
        ...prev,
        loading: false,
        errors: [{ field: 'password', message: errorMessage }],
      }));
      toastNotify.error(errorMessage, 'Password Setup Failed');
      return false;
    }
  }, [state.password, validatePassword]);

  // Reset state
  const reset = useCallback(() => {
    setState({
      password: '',
      confirmPassword: '',
      loading: false,
      errors: [],
      success: false,
    });
  }, []);

  const getFieldError = useCallback((field: string): string | undefined => {
    return state.errors.find(e => e.field === field)?.message;
  }, [state.errors]);

  return {
    password: state.password,
    confirmPassword: state.confirmPassword,
    loading: state.loading,
    errors: state.errors,
    success: state.success,
    setField,
    setPassword,
    reset,
    validatePassword,
    getFieldError,
    firstError: validators.getFirstError(state.errors),
  };
};
