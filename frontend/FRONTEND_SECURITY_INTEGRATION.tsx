/**
 * FRONTEND SECURITY INTEGRATION
 * 
 * Complete implementation of security features for the web application.
 * This file provides:
 * - Type definitions for Zero Trust security events
 * - AppSecuritySetup component for React apps
 * - secureAPI object for secure API calls with CSRF protection
 */

import React, { useEffect } from 'react';
import { useCSRFToken } from './src/hooks/useCSRFToken';
import { useServiceWorker } from './src/hooks/useServiceWorker';
import { useAutoLogoutLogic } from './src/hooks/useAutoLogoutLogic';
import { useSessionTimeoutWarning } from './src/hooks/useSessionTimeoutWarning';
import { useSuspiciousActivityAlert } from './src/hooks/useSuspiciousActivityAlert';
import { SessionTimeoutWarning, SuspiciousActivityAlert } from './src/components/ZeroTrust/ErrorBoundary';
import { SecureStorage } from './src/utils/secureStorage';

import { APIResponse, APIClient } from './FRONTEND_SECURITY_INTEGRATION';

/**
 * Custom event detail types for Zero Trust security events
 */
interface ZeroTrustEventDetail {
  message?: string;
  severity?: 'info' | 'warning' | 'critical';
  timestamp?: number;
  [key: string]: unknown;
}

/**
 * Custom event map for window event listeners
 */
interface CustomWindowEventMap {
  'zeroTrust:anomaly': CustomEvent<ZeroTrustEventDetail>;
  'zeroTrust:mfaRequired': CustomEvent<ZeroTrustEventDetail>;
  'zeroTrust:error': CustomEvent<ZeroTrustEventDetail>;
  'sw:update': CustomEvent<{ version?: string }>;
}

/**
 * Extended Window interface with custom events
 */
declare global {
  interface Window {
    fetchWithCSRF: (url: string, options?: RequestInit) => Promise<Response>;
    
    /**
     * Add custom event listener with proper typing
     */
    addEventListener<K extends keyof CustomWindowEventMap>(
      type: K,
      listener: (this: Window, ev: CustomWindowEventMap[K]) => void,
      options?: boolean | AddEventListenerOptions
    ): void;
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ): void;

    /**
     * Remove custom event listener with proper typing
     */
    removeEventListener<K extends keyof CustomWindowEventMap>(
      type: K,
      listener: (this: Window, ev: CustomWindowEventMap[K]) => void,
      options?: boolean | EventListenerOptions
    ): void;
    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions
    ): void;

    /**
     * Dispatch custom event with proper typing
     */
    dispatchEvent<K extends keyof CustomWindowEventMap>(event: CustomWindowEventMap[K]): boolean;
    dispatchEvent(event: Event): boolean;
  }
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

interface APIResponse<T = Record<string, unknown>> {
  success?: boolean;
  data?: T;
  error?: string;
  code?: string;
  [key: string]: unknown;
}

interface APIClient {
  call<T = Record<string, unknown>>(url: string, options?: RequestInit): Promise<APIResponse<T>>;
  get<T = Record<string, unknown>>(url: string): Promise<APIResponse<T>>;
  post<T = Record<string, unknown>>(url: string, data: unknown): Promise<APIResponse<T>>;
  put<T = Record<string, unknown>>(url: string, data: unknown): Promise<APIResponse<T>>;
  delete<T = Record<string, unknown>>(url: string): Promise<APIResponse<T>>;
  patch<T = Record<string, unknown>>(url: string, data: unknown): Promise<APIResponse<T>>;
}

// ============================================================
// SECURE API HELPER
// ============================================================

/**
 * Secure API calls with CSRF token and error handling
 * 
 * Usage:
 * const users = await secureAPI.get<User[]>('/api/users');
 * const result = await secureAPI.post('/api/transactions', { amount: 100 });
 */
export const secureAPI: APIClient = {
  /**
   * Make a secure API call with CSRF token and error handling
   */
  async call<T = Record<string, unknown>>(url: string, options: RequestInit = {}): Promise<APIResponse<T>> {
    try {
      const response = await window.fetchWithCSRF(url, options);

      if (!response.ok) {
        const error = await response.json() as Record<string, unknown>;
        throw new Error((error.error as string) || 'API request failed');
      }

      return await response.json() as APIResponse<T>;
    } catch (error) {
      console.error('[API] Error:', error);
      throw error;
    }
  },

  /**
   * GET request
   */
  async get<T = Record<string, unknown>>(url: string): Promise<APIResponse<T>> {
    return this.call<T>(url, { method: 'GET' });
  },

  /**
   * POST request
   */
  async post<T = Record<string, unknown>>(url: string, data: unknown): Promise<APIResponse<T>> {
    return this.call<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
  },

  /**
   * PUT request
   */
  async put<T = Record<string, unknown>>(url: string, data: unknown): Promise<APIResponse<T>> {
    return this.call<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
  },

  /**
   * DELETE request
   */
  async delete<T = Record<string, unknown>>(url: string): Promise<APIResponse<T>> {
    return this.call<T>(url, { method: 'DELETE' });
  },

  /**
   * PATCH request
   */
  async patch<T = Record<string, unknown>>(url: string, data: unknown): Promise<APIResponse<T>> {
    return this.call<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
  },
};

// ============================================================
// APP SECURITY SETUP COMPONENT
// ============================================================

/**
 * AppSecuritySetup Component
 * 
 * Integrates all security features into your React application.
 * Wrap your main app with this component:
 * 
 * Usage in main.tsx or App.tsx:
 * 
 *   ReactDOM.createRoot(document.getElementById('root')!).render(
 *     <AppSecuritySetup>
 *       <App />
 *     </AppSecuritySetup>
 *   );
 */
export const AppSecuritySetup: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  // 1. Initialize Service Worker
  useServiceWorker();

  // 2. Initialize CSRF Token
  const { csrfToken, fetchWithCSRF, refreshToken } = useCSRFToken();

  // 3. Initialize Auto-Logout
  const {
    isLoggedOut,
    sessionExpiring,
    timeRemaining,
    extendSession,
  } = useAutoLogoutLogic({
    timeoutMinutes: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '15'),
    warningMinutesBefore: 1,
    onSessionTimeout: () => {
      SecureStorage.clear();
      window.location.href = '/login';
    },
  });

  // 4. Initialize Session Warning Dialog
  const { isVisible: warningVisible, handleContinue, handleLogout } = useSessionTimeoutWarning({
    isSessionExpiring: sessionExpiring,
    onContinue: extendSession,
    onLogout: () => {
      SecureStorage.clear();
      window.location.href = '/login';
    },
  });

  // 5. Initialize Suspicious Activity Alert
  const { alert, dismissAlert, showAlert } = useSuspiciousActivityAlert({
    autoDismissMs: 5000,
  });

  // 6. Expose fetchWithCSRF globally for API calls
  useEffect(() => {
    window.fetchWithCSRF = fetchWithCSRF;
  }, [fetchWithCSRF]);

  // 7. Listen for security events
  useEffect(() => {
    const handleAnomalyDetected = (event: CustomEvent<ZeroTrustEventDetail>) => {
      showAlert(
        event.detail?.message || 'Suspicious activity detected',
        event.detail?.severity === 'critical' ? 'error' : 'warning'
      );
    };

    const handleMFARequired = (event: CustomEvent<ZeroTrustEventDetail>) => {
      showAlert('MFA verification required', 'info');
    };

    const handleZeroTrustError = (event: CustomEvent<ZeroTrustEventDetail>) => {
      showAlert(
        event.detail?.message || 'Security verification failed',
        'error'
      );
    };

    // Cast to proper event listeners for custom events
    const anomalyListener = handleAnomalyDetected as EventListener;
    const mfaListener = handleMFARequired as EventListener;
    const errorListener = handleZeroTrustError as EventListener;

    window.addEventListener('zeroTrust:anomaly', anomalyListener);
    window.addEventListener('zeroTrust:mfaRequired', mfaListener);
    window.addEventListener('zeroTrust:error', errorListener);

    return () => {
      window.removeEventListener('zeroTrust:anomaly', anomalyListener);
      window.removeEventListener('zeroTrust:mfaRequired', mfaListener);
      window.removeEventListener('zeroTrust:error', errorListener);
    };
  }, [showAlert]);

  // Show session expired message if logged out
  if (isLoggedOut) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Session Expired</h1>
          <p className="text-gray-600 mb-6">Your session has been ended for security reasons.</p>
          <a href="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Return to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main content */}
      {children}

      {/* Session Timeout Warning Dialog */}
      <SessionTimeoutWarning
        isVisible={warningVisible}
        timeRemaining={timeRemaining}
        onContinue={handleContinue}
        onLogout={handleLogout}
      />

      {/* Suspicious Activity Alert */}
      <SuspiciousActivityAlert
        isVisible={alert.isVisible}
        message={alert.message}
        type={alert.type}
        onDismiss={dismissAlert}
      />
    </>
  );
};

export type { 
  ZeroTrustEventDetail, 
  CustomWindowEventMap, 
  APIResponse, 
  APIClient 
};
