import React, { useCallback, useEffect } from 'react';

export interface SuspiciousActivityAlertState {
  isVisible: boolean;
  message: string;
  type: 'warning' | 'error' | 'info';
}

export interface UseSuspiciousActivityAlertOptions {
  autoDismissMs?: number;
  onDismiss?: () => void;
}

/**
 * Hook for Suspicious Activity Alert Logic
 * Manages alert visibility and auto-dismiss
 */
export const useSuspiciousActivityAlert = (options: UseSuspiciousActivityAlertOptions = {}) => {
  const { autoDismissMs = 5000, onDismiss } = options;

  const [alert, setAlert] = React.useState<SuspiciousActivityAlertState>({
    isVisible: false,
    message: '',
    type: 'warning',
  });

  const [dismissTimer, setDismissTimer] = React.useState<NodeJS.Timeout | null>(null);

  /**
   * Show alert
   */
  const showAlert = useCallback((message: string, type: 'warning' | 'error' | 'info' = 'warning') => {
    setAlert({
      isVisible: true,
      message,
      type,
    });
  }, []);

  /**
   * Dismiss alert
   */
  const dismissAlert = useCallback(() => {
    setAlert(prev => ({
      ...prev,
      isVisible: false,
    }));
    
    // Clear any pending dismiss timer
    if (dismissTimer) clearTimeout(dismissTimer);
    
    // Call custom callback if provided
    onDismiss?.();
  }, [dismissTimer, onDismiss]);

  /**
   * Show alert with auto-dismiss
   */
  const showAlertWithAutoClose = useCallback((
    message: string,
    type: 'warning' | 'error' | 'info' = 'warning'
  ) => {
    showAlert(message, type);

    // Clear existing timer
    if (dismissTimer) clearTimeout(dismissTimer);

    // Set new timer for auto-dismiss
    const timer = setTimeout(() => {
      dismissAlert();
    }, autoDismissMs);

    setDismissTimer(timer);
  }, [showAlert, dismissAlert, autoDismissMs, dismissTimer]);

  /**
   * Detect anomaly via event listener
   */
  useEffect(() => {
    const handleAnomalyDetected = (event: Event) => {
      const customEvent = event as CustomEvent;
      const message = customEvent.detail?.message || 'Suspicious activity detected';
      showAlertWithAutoClose(message, 'warning');
    };

    window.addEventListener('zeroTrust:anomaly', handleAnomalyDetected);

    return () => {
      window.removeEventListener('zeroTrust:anomaly', handleAnomalyDetected);
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, [showAlertWithAutoClose, dismissTimer]);

  const reset = useCallback(() => {
    setAlert({
      isVisible: false,
      message: '',
      type: 'warning',
    });
    if (dismissTimer) clearTimeout(dismissTimer);
  }, [dismissTimer]);

  return {
    alert,
    showAlert,
    showAlertWithAutoClose,
    dismissAlert,
    reset,
  };
};

export type UseSuspiciousActivityAlertReturn = ReturnType<typeof useSuspiciousActivityAlert>;

export default useSuspiciousActivityAlert;
