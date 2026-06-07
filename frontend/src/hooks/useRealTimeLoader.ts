import { useState, useEffect, useCallback } from 'react';
import socketService from '../services/socketService';

export interface RealTimeLoaderState {
  isVisible: boolean;
  message: string;
  progress: number;
  status: 'loading' | 'processing' | 'submitting' | 'success' | 'error';
  subMessage?: string;
}

export const useRealTimeLoader = (loaderKey: string = 'default', autoConnect: boolean = false) => {
  const [loaderState, setLoaderState] = useState<RealTimeLoaderState>({
    isVisible: false,
    message: 'Processing...',
    progress: 0,
    status: 'loading',
  });

  const showLoader = useCallback((
    message: string = 'Processing...',
    initialProgress: number = 0,
    status: RealTimeLoaderState['status'] = 'loading',
    subMessage?: string
  ) => {
    setLoaderState({
      isVisible: true,
      message,
      progress: initialProgress,
      status,
      subMessage,
    });
  }, []);

  const hideLoader = useCallback(() => {
    setLoaderState(prev => ({
      ...prev,
      isVisible: false,
    }));
  }, []);

  const updateProgress = useCallback((progress: number, message?: string, status?: RealTimeLoaderState['status']) => {
    setLoaderState(prev => ({
      ...prev,
      progress: Math.min(progress, 100),
      message: message || prev.message,
      status: status || prev.status,
    }));
  }, []);

  const updateStatus = useCallback((status: RealTimeLoaderState['status'], message?: string) => {
    setLoaderState(prev => ({
      ...prev,
      status,
      message: message || prev.message,
      progress: status === 'success' ? 100 : prev.progress,
    }));
  }, []);

  useEffect(() => {
    if (autoConnect) {
      socketService.connect().catch(err => {
        console.error('Failed to connect socket:', err);
      });
    }

    // Listen for real-time loader updates from backend
    const handleLoaderUpdate = (data: any) => {
      if (data.loaderKey === loaderKey) {
        setLoaderState(prev => ({
          ...prev,
          message: data.message || prev.message,
          progress: data.progress !== undefined ? data.progress : prev.progress,
          status: data.status || prev.status,
          subMessage: data.subMessage || prev.subMessage,
        }));
      }
    };

    socketService.onLoaderUpdate(handleLoaderUpdate);

    return () => {
      socketService.offLoaderUpdate();
    };
  }, [loaderKey, autoConnect]);

  return {
    ...loaderState,
    showLoader,
    hideLoader,
    updateProgress,
    updateStatus,
  };
};
