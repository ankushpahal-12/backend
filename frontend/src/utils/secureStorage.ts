import CryptoJS from 'crypto-js';
import api from './api';

const STORAGE_PREFIX = '__data_';
// Use env key or generate a per-session random key (data won't survive page reload without env key)
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || (() => {
  console.warn('[SecureStorage] VITE_ENCRYPTION_KEY not set — using ephemeral key. Data will not persist across sessions.');
  return crypto.randomUUID?.() || Math.random().toString(36).substring(2);
})();

interface StoredData {
  value: unknown;
  version: string;
  timestamp: number;
  expiry?: number;
}

interface User {
  id: string;
  email: string;
  role?: string;
  [key: string]: unknown;
}

/**
 * SecureStorage - For NON-SENSITIVE data only
 * Provides obfuscation and expiry management
 * 
 * SECURITY LEVEL: Low (protection against casual inspection only)
 */
export class SecureStorage {
  /**
   * Store item with optional expiry
   * @param key - Storage key
   * @param value - Value to store
   * @param expiryMinutes - Optional expiry in minutes
   */
  static setItem(key: string, value: unknown, expiryMinutes?: number): void {
    try {
      const storageKey = STORAGE_PREFIX + key;

      const dataToStore: StoredData = {
        value,
        version: 'v1',
        timestamp: Date.now(),
        ...(expiryMinutes && { expiry: Date.now() + expiryMinutes * 60 * 1000 }),
      };

      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(dataToStore),
        ENCRYPTION_KEY
      ).toString();

      localStorage.setItem(storageKey, encrypted);
    } catch (error) {
      console.error(`[SecureStorage] Failed to store ${key}:`, error);
    }
  }

  /**
   * Retrieve and decrypt item (returns null if expired)
   */
  static getItem<T = unknown>(key: string): T | null {
    try {
      const storageKey = STORAGE_PREFIX + key;
      const encrypted = localStorage.getItem(storageKey);

      if (!encrypted) return null;

      const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY).toString(
        CryptoJS.enc.Utf8
      );

      if (!decrypted) {
        console.warn(`[SecureStorage] Failed to decrypt ${key}`);
        return null;
      }

      const data: StoredData = JSON.parse(decrypted);

      // Check expiry
      if (data.expiry && data.expiry < Date.now()) {
        localStorage.removeItem(storageKey);
        return null;
      }

      return data.value as T;
    } catch (error) {
      console.error(`[SecureStorage] Failed to retrieve ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove an item
   */
  static removeItem(key: string): void {
    const storageKey = STORAGE_PREFIX + key;
    localStorage.removeItem(storageKey);
  }

  /**
   * Clear all stored items
   */
  static clear(): void {
    const keysToRemove = Object.keys(localStorage)
      .filter((k) => k.startsWith(STORAGE_PREFIX))
      .map((k) => k.replace(STORAGE_PREFIX, ''));

    keysToRemove.forEach((key) => this.removeItem(key));
  }

  /**
   * Check if key exists and is not expired
   */
  static hasItem(key: string): boolean {
    return this.getItem(key) !== null;
  }

  /**
   * Get all stored keys
   */
  static getAllKeys(): string[] {
    return Object.keys(localStorage)
      .filter((k) => k.startsWith(STORAGE_PREFIX))
      .map((k) => k.replace(STORAGE_PREFIX, ''));
  }

  /**
   * Get total storage size in bytes
   */
  static getSize(): number {
    let totalSize = 0;
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        const item = localStorage.getItem(key);
        if (item) totalSize += item.length;
      }
    });
    return totalSize;
  }
}

/**
 * TokenStorage - For HTTP-only cookie-based authentication
 * This is the CORRECT way to handle auth tokens!
 * 
 * Backend handles setting HTTP-only cookies:
 * Set-Cookie: auth_token=xyz; HttpOnly; Secure; SameSite=Strict;
 * 
 * Frontend cannot read HTTP-only cookies via JavaScript
 * Frontend cannot delete HTTP-only cookies via JavaScript
 * BUT frontend can use credentials: 'include' to send them with requests
 */
export class TokenStorage {
  /**
   * Check if user is authenticated (backend validates via cookie)
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const response = await api.get('/auth/me');
      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Get current user info
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get('/auth/me');

      if (response.status !== 200) {
        return null;
      }

      return (response.data?.data?.user || response.data?.user || null) as User | null;
    } catch (error) {
      console.error('[TokenStorage] Error fetching current user:', error);
      return null;
    }
  }

  /**
   * Logout (backend clears HTTP-only cookies)
   */
  static async logout(): Promise<void> {
    try {
      await api.post('/auth/logout', {});
      // HTTP-only cookies are automatically cleared by backend
    } catch (error) {
      console.error('[TokenStorage] Logout error:', error);
    }
  }

  /**
   * Refresh authentication token
   */
  static async refreshToken(): Promise<boolean> {
    try {
      const response = await api.post('/auth/refresh', {});
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export default SecureStorage;
