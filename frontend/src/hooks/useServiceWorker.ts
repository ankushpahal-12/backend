/**
 * Service Worker Registration Hook
 * Registers and manages service worker with security checks
 */

import { useEffect } from 'react';

export const useServiceWorker = () => {
  useEffect(() => {
    // Only register in production or on localhost
    if (
      process.env.NODE_ENV === 'production' ||
      window.location.hostname === 'localhost'
    ) {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      if (!('serviceWorker' in navigator)) {
        console.warn('[SW] Service workers not supported');
        return;
      }

      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });

      console.log('[SW] Service worker registered:', registration);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            // New version available
            console.log('[SW] New version available');
            notifyNewVersion(newWorker);
          }
        });
      });

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // Every hour

      return registration;
    } catch (error) {
      console.error('[SW] Registration failed:', error);
    }
  };

  const notifyNewVersion = (newWorker) => {
    // Show update notification to user
    const event = new CustomEvent('sw:update', { detail: { newWorker } });
    window.dispatchEvent(event);
  };

  const unregisterServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();

      for (const registration of registrations) {
        const unregistered = await registration.unregister();
        console.log('[SW] Unregistered:', unregistered);
      }
    }
  };

  const clearCache = async () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
      console.log('[SW] Cache clear requested');
    }
  };

  const getCacheSize = async () => {
    return new Promise((resolve) => {
      const channel = new MessageChannel();

      navigator.serviceWorker.controller?.postMessage(
        { type: 'GET_CACHE_SIZE' },
        [channel.port2]
      );

      channel.port1.onmessage = (event) => {
        resolve(event.data.size);
      };
    });
  };

  const skipWaiting = async () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      console.log('[SW] Skip waiting requested');
    }
  };

  return {
    registerServiceWorker,
    unregisterServiceWorker,
    clearCache,
    getCacheSize,
    skipWaiting,
  };
};

export default useServiceWorker;
