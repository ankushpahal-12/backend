import React, { useCallback, useEffect } from 'react';

export interface UseSessionTimeoutWarningOptions {
  isSessionExpiring: boolean;
  onContinue?: () => void;
  onLogout?: () => void;
}

/**
 * Hook for Session Timeout Warning Logic
 * Manages warning dialog visibility and actions
 */
export const useSessionTimeoutWarning = (options: UseSessionTimeoutWarningOptions = {}) => {
  const { isSessionExpiring, onContinue, onLogout } = options;

  const [isVisible, setIsVisible] = React.useState(false);
  const [userAction, setUserAction] = React.useState<'continue' | 'logout' | null>(null);

  /**
   * Handle continue session
   */
  const handleContinue = useCallback(() => {
    setUserAction('continue');
    setIsVisible(false);
    
    // Emit custom event
    window.dispatchEvent(new Event('zeroTrust:sessionContinued'));
    
    // Call custom callback if provided
    onContinue?.();
  }, [onContinue]);

  /**
   * Handle logout
   */
  const handleLogout = useCallback(() => {
    setUserAction('logout');
    setIsVisible(false);
    
    // Emit custom event
    window.dispatchEvent(new Event('zeroTrust:sessionEnded'));
    
    // Call custom callback if provided
    onLogout?.();
  }, [onLogout]);

  /**
   * Update visibility based on session status
   */
  useEffect(() => {
    setIsVisible(isSessionExpiring);
  }, [isSessionExpiring]);

  /**
   * Auto-dismiss after session expires (if not dismissed)
   */
  useEffect(() => {
    if (userAction === 'logout') {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [userAction]);

  const dismiss = useCallback(() => {
    setIsVisible(false);
  }, []);

  const show = useCallback(() => {
    setIsVisible(true);
  }, []);

  const reset = useCallback(() => {
    setUserAction(null);
    setIsVisible(false);
  }, []);

  return {
    isVisible,
    userAction,
    handleContinue,
    handleLogout,
    dismiss,
    show,
    reset,
  };
};

export type UseSessionTimeoutWarningReturn = ReturnType<typeof useSessionTimeoutWarning>;

export default useSessionTimeoutWarning;
