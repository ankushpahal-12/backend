/**
 * Hook for handling add user form and creation
 * Now uses email-based OTP verification - no password in creation
 */

import { useState, useCallback } from 'react';
import * as adminApi from '../services/adminApi';
import { validators } from '../utils/validators';
import type { ValidationError } from '../utils/validators';
import { toastNotify } from '../utils/toastNotify';

interface AddUserFormData {
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface UseAddUserState {
  formData: AddUserFormData;
  loading: boolean;
  errors: ValidationError[];
  isValidating: boolean;
}

export const useAddUser = () => {
  const [state, setState] = useState<UseAddUserState>({
    formData: {
      name: '',
      email: '',
      role: 'user',
    },
    loading: false,
    errors: [],
    isValidating: false,
  });

  // Update form field
  const setFormField = useCallback((field: keyof AddUserFormData, value: string) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
      },
      errors: [], // Clear errors on field change
    }));
  }, []);

  // Update entire form data
  const setFormData = useCallback((data: Partial<AddUserFormData>) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        ...data,
      },
      errors: [],
    }));
  }, []);

  // Validate form
  const validateForm = useCallback((): boolean => {
    setState(prev => ({ ...prev, isValidating: true }));

    // Simple validation - only name and email required
    const errors: ValidationError[] = [];
    
    if (!state.formData.name.trim()) {
      errors.push({ field: 'name', message: 'Name is required' });
    }
    if (!state.formData.email.trim()) {
      errors.push({ field: 'email', message: 'Email is required' });
    } else if (!validators.isValidEmail(state.formData.email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }

    setState(prev => ({
      ...prev,
      errors,
      isValidating: false,
    }));

    return errors.length === 0;
  }, [state.formData]);

  // Submit form and create user
  const submitForm = useCallback(async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    setState(prev => ({ ...prev, loading: true }));

    try {
      const toastId = toastNotify.loading('Creating user...', 'Processing');

      await adminApi.createUser(state.formData);

      toastNotify.update(toastId, {
        render: `User ${state.formData.name} created successfully! OTP sent to their email.`,
        type: 'success',
        autoClose: 3000,
      });

      // Reset form
      setState(prev => ({
        ...prev,
        formData: {
          name: '',
          email: '',
          role: 'user',
        },
        loading: false,
        errors: [],
      }));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      toastNotify.error(errorMessage, 'User Creation Failed');

      setState(prev => ({ ...prev, loading: false }));
      return false;
    }
  }, [state.formData, validateForm]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      formData: {
        name: '',
        email: '',
        role: 'user',
      },
      errors: [],
      loading: false,
    }));
  }, []);

  const getFieldError = useCallback((field: keyof AddUserFormData): string | undefined => {
    return validators.getFieldError(state.errors, field);
  }, [state.errors]);

  return {
    formData: state.formData,
    loading: state.loading,
    errors: state.errors,
    isValidating: state.isValidating,
    setFormField,
    setFormData,
    validateForm,
    submitForm,
    resetForm,
    getFieldError,
    hasErrors: validators.hasErrors(state.errors),
    firstError: validators.getFirstError(state.errors),
  };
};
