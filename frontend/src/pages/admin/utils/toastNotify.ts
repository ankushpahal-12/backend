/**
 * Toast notification utility using react-toastify
 */

import { toast } from 'react-toastify';

export type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'loading';

// Define ToastOptions type based on react-toastify
type ToastOptions = {
  position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
  autoClose?: number | false;
  hideProgressBar?: boolean;
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
  progress?: number;
  theme?: 'light' | 'dark' | 'colored';
};

const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const toastNotify = {
  success: (message: string, title?: string, options?: ToastOptions) => {
    return toast.success(title ? `${title}: ${message}` : message, {
      ...defaultOptions,
      autoClose: 3000,
      ...options,
    });
  },

  error: (message: string, title?: string, options?: ToastOptions) => {
    return toast.error(title ? `${title}: ${message}` : message, {
      ...defaultOptions,
      autoClose: 5000,
      ...options,
    });
  },

  info: (message: string, title?: string, options?: ToastOptions) => {
    return toast.info(title ? `${title}: ${message}` : message, {
      ...defaultOptions,
      autoClose: 4000,
      ...options,
    });
  },

  warning: (message: string, title?: string, options?: ToastOptions) => {
    return toast.warning(title ? `${title}: ${message}` : message, {
      ...defaultOptions,
      autoClose: 4000,
      ...options,
    });
  },

  loading: (message: string, title?: string, options?: ToastOptions) => {
    return toast.loading(title ? `${title}: ${message}` : message, {
      ...defaultOptions,
      autoClose: false,
      ...options,
    });
  },

  // Update an existing toast
  update: (toastId: string | number, options: ToastOptions & { render?: string; type?: NotificationType }) => {
    toast.update(toastId, {
      ...defaultOptions,
      ...options,
    });
  },

  // Dismiss a toast
  dismiss: (toastId?: string | number) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },

  // Promise-based toast
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      pending: string;
      success: string;
      error: string;
    },
    options?: ToastOptions
  ) => {
    return toast.promise(promise, {
      pending: messages.pending,
      success: messages.success,
      error: messages.error,
    }, {
      ...defaultOptions,
      ...options,
    });
  },
};
