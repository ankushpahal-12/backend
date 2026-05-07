/**
 * Hook for verifying email OTP during account creation flow
 */

import { useState, useCallback } from 'react';
import * as adminApi from '../services/adminApi';
import { toastNotify } from '../utils/toastNotify';

interface UseVerifyEmailOTPState {
  otp: string;
  loading: boolean;
  error: string | null;
  userId: string | null;
  verified: boolean;
}

export const useVerifyEmailOTP = () => {
  const [state, setState] = useState<UseVerifyEmailOTPState>({
    otp: '',
    loading: false,
    error: null,
    userId: null,
    verified: false,
  });

  // Update OTP field
  const setOTP = useCallback((otp: string) => {
    setState(prev => ({
      ...prev,
      otp,
      error: null,
    }));
  }, []);

  // Verify OTP
  const verifyOTP = useCallback(async (email: string): Promise<boolean> => {
    if (!state.otp.trim()) {
      setState(prev => ({
        ...prev,
        error: 'OTP is required',
      }));
      return false;
    }

    if (state.otp.length !== 6) {
      setState(prev => ({
        ...prev,
        error: 'OTP must be 6 digits',
      }));
      return false;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const toastId = toastNotify.loading('Verifying OTP...', 'Processing');

      const result = await adminApi.verifyEmailOTP(email, state.otp);

      setState(prev => ({
        ...prev,
        userId: result.userId,
        verified: true,
        loading: false,
      }));

      toastNotify.update(toastId, {
        render: 'Email verified successfully!',
        type: 'success',
        autoClose: 3000,
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify OTP';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      toastNotify.error(errorMessage, 'Verification Failed');
      return false;
    }
  }, [state.otp]);

  // Reset state
  const reset = useCallback(() => {
    setState({
      otp: '',
      loading: false,
      error: null,
      userId: null,
      verified: false,
    });
  }, []);

  return {
    otp: state.otp,
    loading: state.loading,
    error: state.error,
    userId: state.userId,
    verified: state.verified,
    setOTP,
    verifyOTP,
    reset,
  };
};
