import React, { useCallback, useEffect, useRef } from 'react';

export interface UseAutoLogoutOptions {
  timeoutMinutes?: number;
  warningMinutesBefore?: number;
  onSessionTimeout?: () => void;
  onWarning?: () => void;
}

/**
 * Hook for Auto-Logout Logic
 * Handles session timeout and inactivity tracking
 */
export const useAutoLogoutLogic = (options: UseAutoLogoutOptions = {}) => {
  const {
    timeoutMinutes = 15,
    warningMinutesBefore = 1,
    onSessionTimeout,
    onWarning,
  } = options;

  const [isLoggedOut, setIsLoggedOut] = React.useState(false);
  const [sessionExpiring, setSessionExpiring] = React.useState(false);
  const [timeRemaining, setTimeRemaining] = React.useState(timeoutMinutes * 60); // in seconds

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Perform logout
   */
  const logout = useCallback(() => {
    setIsLoggedOut(true);
    setSessionExpiring(false);
    
    // Dispatch event for components to listen to
    window.dispatchEvent(new Event('zeroTrust:logout'));
    
    // Call custom callback if provided
    onSessionTimeout?.();
  }, [onSessionTimeout]);

  /**
   * Show warning before logout
   */
  const showWarning = useCallback(() => {
    setSessionExpiring(true);
    
    // Dispatch warning event
    window.dispatchEvent(
      new CustomEvent('zeroTrust:sessionWarning', {
        detail: { message: `Your session will expire in ${warningMinutesBefore} minute(s) due to inactivity` },
      })
    );
    
    // Call custom callback if provided
    onWarning?.();

    // Start countdown timer
    let remaining = warningMinutesBefore * 60;
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    countdownRef.current = setInterval(() => {
      remaining--;
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
      }
    }, 1000);
  }, [warningMinutesBefore, onWarning]);

  /**
   * Reset timeout and warning timers
   */
  const resetTimer = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    // Reset state
    setSessionExpiring(false);
    setTimeRemaining(timeoutMinutes * 60);

    // Set warning timer (1 minute before timeout)
    const warningTime = (timeoutMinutes - warningMinutesBefore) * 60 * 1000;
    warningRef.current = setTimeout(() => {
      showWarning();
    }, warningTime);

    // Set logout timer
    const logoutTime = timeoutMinutes * 60 * 1000;
    timeoutRef.current = setTimeout(() => {
      logout();
    }, logoutTime);
  }, [timeoutMinutes, warningMinutesBefore, showWarning, logout]);

  /**
   * Extend session (reset timer)
   */
  const extendSession = useCallback(() => {
    resetTimer();
    
    // Dispatch event
    window.dispatchEvent(new Event('zeroTrust:sessionExtended'));
  }, [resetTimer]);

  /**
   * Setup activity listeners
   */
  useEffect(() => {
    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      // Only reset if not already logged out
      if (!isLoggedOut) {
        resetTimer();
      }
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Initialize timer on mount
    resetTimer();

    // Cleanup on unmount
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [resetTimer, isLoggedOut]);

  return {
    isLoggedOut,
    sessionExpiring,
    timeRemaining,
    logout,
    extendSession,
    resetTimer,
    showWarning,
  };
};

export type UseAutoLogoutLogicReturn = ReturnType<typeof useAutoLogoutLogic>;

export default useAutoLogoutLogic;
