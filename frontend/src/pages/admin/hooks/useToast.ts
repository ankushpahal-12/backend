import { useState, useCallback } from 'react';
import { ToastNotification, NotificationType } from '../components/ui/Toast';

interface UseToastReturn {
  toasts: ToastNotification[];
  addToast: (message: string, type?: NotificationType, title?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  processing: (message: string, title?: string) => void;
}

export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const generateId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const addToast = useCallback(
    (message: string, type: NotificationType = 'info', title?: string, duration?: number) => {
      const id = generateId();
      const newToast: ToastNotification = {
        id,
        message,
        type,
        title,
        duration: type === 'processing' ? 0 : duration,
      };

      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    [generateId]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback(
    (message: string, title?: string) => {
      addToast(message, 'success', title || 'Success', 3000);
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, title?: string) => {
      addToast(message, 'error', title || 'Error', 5000);
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, title?: string) => {
      addToast(message, 'info', title || 'Info', 4000);
    },
    [addToast]
  );

  const processing = useCallback(
    (message: string, title?: string) => {
      return addToast(message, 'processing', title || 'Processing', 0);
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    info,
    processing,
  };
};
