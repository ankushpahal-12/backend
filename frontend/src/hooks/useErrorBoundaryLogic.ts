import { useState, useCallback } from 'react';

/**
 * Hook for Error Boundary Logic
 * Manages error state and recovery
 */
export const useErrorBoundaryLogic = () => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [errorInfo, setErrorInfo] = useState<{ componentStack: string } | null>(null);

  /**
   * Handle error caught by error boundary
   */
  const handleError = useCallback((error: Error, errorInfo: { componentStack: string }) => {
    setHasError(true);
    setError(error);
    setErrorInfo(errorInfo);

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }

    // Emit custom event for error tracking
    window.dispatchEvent(
      new CustomEvent('zeroTrust:error', {
        detail: { error: error.message, type: 'boundary' },
      })
    );
  }, []);

  /**
   * Reset error state to recover
   */
  const resetError = useCallback(() => {
    setHasError(false);
    setError(null);
    setErrorInfo(null);
  }, []);

  /**
   * Force error for testing
   */
  const throwError = useCallback((message: string = 'Test error') => {
    throw new Error(message);
  }, []);

  return {
    hasError,
    error,
    errorInfo,
    handleError,
    resetError,
    throwError,
  };
};

export type UseErrorBoundaryLogicReturn = ReturnType<typeof useErrorBoundaryLogic>;

export default useErrorBoundaryLogic;
