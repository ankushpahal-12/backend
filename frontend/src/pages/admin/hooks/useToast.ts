import { useCallback } from 'react';
import { toast, Id } from 'react-toastify';

interface UseToastReturn {
  loading: (message: string, title?: string) => Id;
  success: (message: string, title?: string, duration?: number) => void;
  error: (message: string, title?: string, duration?: number) => void;
  info: (message: string, title?: string, duration?: number) => void;
  update: (toastId: Id, options: { render: string; type: 'success' | 'error' | 'info' | 'warning' | 'loading' }) => void;
  dismiss: (toastId?: Id) => void;
}

export const useToast = (): UseToastReturn => {
  const loading = useCallback((message: string, title?: string) => {
    const content = title ? `${title}: ${message}` : message;
    return toast.loading(content, {
      position: 'top-right',
      autoClose: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }, []);

  const success = useCallback(
    (message: string, title?: string, duration: number = 3000) => {
      const content = title ? `${title}: ${message}` : message;
      toast.success(content, {
        position: 'top-right',
        autoClose: duration,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    },
    []
  );

  const error = useCallback(
    (message: string, title?: string, duration: number = 5000) => {
      const content = title ? `${title}: ${message}` : message;
      toast.error(content, {
        position: 'top-right',
        autoClose: duration,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    },
    []
  );

  const info = useCallback(
    (message: string, title?: string, duration: number = 4000) => {
      const content = title ? `${title}: ${message}` : message;
      toast.info(content, {
        position: 'top-right',
        autoClose: duration,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    },
    []
  );

  const update = useCallback(
    (toastId: Id, options: { render: string; type: 'success' | 'error' | 'info' | 'warning' | 'loading' }) => {
      toast.update(toastId, {
        render: options.render,
        type: options.type,
        isLoading: options.type === 'loading',
        position: 'top-right',
        autoClose: options.type === 'loading' ? false : 5000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    },
    []
  );

  const dismiss = useCallback((toastId?: Id) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }, []);

  return {
    loading,
    success,
    error,
    info,
    update,
    dismiss,
  };
};
