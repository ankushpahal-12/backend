import { useNotification } from '../context/NotificationContext';
import { useCallback } from 'react';
import {
  formatErrorForUI,
  isAuthError,
  getValidationErrors,
} from '../utils/errorHandler';

interface UseAPIErrorOptions {
  showNotification?: boolean;
  onAuthError?: () => void;
  customErrorHandler?: (error: any) => void;
}

/**
 * Hook for handling API errors consistently across the app
 * 
 * Usage:
 * const { handleError } = useAPIError();
 * 
 * try {
 *   await someAPI();
 * } catch (error) {
 *   handleError(error);
 * }
 */
export const useAPIError = (options: UseAPIErrorOptions = {}) => {
  const { showNotification } = useNotification();
  const {
    showNotification: shouldShow = true,
    onAuthError,
    customErrorHandler,
  } = options;

  const handleError = useCallback(
    (error: any, context?: string) => {
      // Custom handler takes priority
      if (customErrorHandler) {
        customErrorHandler(error);
        return;
      }

      // Handle auth errors
      if (isAuthError(error)) {
        if (onAuthError) {
          onAuthError();
        } else {
          // Default: redirect to login
          localStorage.removeItem('auth-token');
          sessionStorage.clear();
          window.location.href = '/login';
        }
        return;
      }

      // Get validation errors
      const validationErrors = getValidationErrors(error);
      if (Object.keys(validationErrors).length > 0) {
        if (shouldShow) {
          showNotification(
            'Please fix the validation errors',
            'warning'
          );
        }
        return validationErrors;
      }

      // Format error for display
      const { title, message } = formatErrorForUI(error);

      if (shouldShow) {
        showNotification(message, 'error');
      }

      console.error(`[${context || 'API Error'}] ${title}: ${message}`, error);
    },
    [showNotification, onAuthError, customErrorHandler, shouldShow]
  );

  return { handleError, formatError: formatErrorForUI };
};
