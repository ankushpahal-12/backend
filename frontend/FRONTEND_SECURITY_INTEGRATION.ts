/**
 * FRONTEND SECURITY INTEGRATION - TYPE DEFINITIONS
 * 
 * ⚠️ IMPORTANT: Use FRONTEND_SECURITY_INTEGRATION.tsx for the actual implementation!
 * 
 * This .ts file contains only type definitions.
 * The working component is in FRONTEND_SECURITY_INTEGRATION.tsx
 * 
 * To use in your app, import from the .tsx file:
 * 
 *   import { AppSecuritySetup, secureAPI } from './FRONTEND_SECURITY_INTEGRATION';
 *   
 *   // Then wrap your app:
 *   <AppSecuritySetup>
 *     <YourApp />
 *   </AppSecuritySetup>
 *   
 *   // And use secure API calls:
 *   const users = await secureAPI.get('/api/users');
 */

// Type definitions only


// ============================================================
// TYPE DECLARATIONS
// ============================================================

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
// APP SECURITY SETUP COMPONENT
// ============================================================

/**
 * See FRONTEND_SECURITY_INTEGRATION.tsx for the component implementation
 * 
 * Usage pattern:
 *   <AppSecuritySetup>
 *     <YourApp />
 *   </AppSecuritySetup>
 */


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

/**
 * See FRONTEND_SECURITY_INTEGRATION.tsx for the secureAPI implementation
 * 
 * Usage:
 *   const users = await secureAPI.get('/api/users');
 *   const result = await secureAPI.post('/api/transactions', { amount: 100 });
 */

// ============================================================
// SECURE STORAGE USAGE
// ============================================================

/**
 * Usage examples:
 * 
 * // Store encrypted data
 * SecureStorage.setItem('authToken', { token: 'xyz', expiresAt: 123 });
 * 
 * // Retrieve encrypted data
 * const auth = SecureStorage.getItem('authToken');
 * 
 * // Check if key exists
 * if (SecureStorage.hasItem('authToken')) {
 *   // ...
 * }
 * 
 * // Remove item
 * SecureStorage.removeItem('authToken');
 * 
 * // Clear all encrypted items
 * SecureStorage.clear();
 */

// ============================================================
// SECURE API CALLS USAGE
// ============================================================

/**
 * Usage examples:
 * 
 * // GET
 * const users = await secureAPI.get('/api/users');
 * 
 * // POST
 * const result = await secureAPI.post('/api/transactions', {
 *   amount: 100,
 *   recipient: 'user@example.com'
 * });
 * 
 * // PUT
 * const updated = await secureAPI.put('/api/users/profile', {
 *   name: 'John Doe'
 * });
 * 
 * // DELETE
 * await secureAPI.delete('/api/keys/:keyId');
 */

// ============================================================
// EXPORTS
// ============================================================

// Type exports only - implementation is in FRONTEND_SECURITY_INTEGRATION.tsx
export type { 
  ZeroTrustEventDetail, 
  CustomWindowEventMap, 
  APIResponse, 
  APIClient 
};
