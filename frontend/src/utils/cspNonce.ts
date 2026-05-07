/**
 * CSP Nonce Utilities
 * 
 * Provides functions to retrieve and use CSP nonce for secure inline scripts/styles
 */

/**
 * Get nonce from current script tag
 * This is the most reliable way during page load
 */
export function getCSPNonceFromScript(): string | null {
  try {
    const script = document.currentScript;
    if (script && script.hasAttribute('nonce')) {
      return script.getAttribute('nonce');
    }
  } catch (err) {
    console.warn('Error getting nonce from script tag:', err);
  }
  return null;
}

/**
 * Get nonce from meta tag
 * Useful when CSP nonce is stored in meta tag during SSR
 */
export function getCSPNonceFromMeta(): string | null {
  try {
    const metaTag = document.querySelector('meta[name="csp-nonce"]');
    if (metaTag) {
      const nonce = metaTag.getAttribute('content');
      if (nonce) {
        return nonce;
      }
    }
  } catch (err) {
    console.warn('Error getting nonce from meta tag:', err);
  }
  return null;
}

/**
 * Get nonce from response header (if available)
 * Set via fetch interceptor or initial load header
 */
let cachedNonce: string | null = null;

export function setCSPNonce(nonce: string): void {
  cachedNonce = nonce;
}

export function getCSPNonceCached(): string | null {
  return cachedNonce;
}

/**
 * Try to get nonce from all sources
 * Priority: meta tag > cache > script tag
 */
export function getCSPNonce(): string | null {
  // Try meta tag first (SSR)
  let nonce = getCSPNonceFromMeta();
  if (nonce) {
    cachedNonce = nonce;
    return nonce;
  }

  // Try cached value
  nonce = getCSPNonceCached();
  if (nonce) {
    return nonce;
  }

  // Try script tag
  nonce = getCSPNonceFromScript();
  if (nonce) {
    cachedNonce = nonce;
    return nonce;
  }

  console.warn('[CSP] No nonce found from any source');
  return null;
}

/**
 * Create a style element with nonce
 */
export function createStyleElement(css: string): HTMLStyleElement {
  const style = document.createElement('style');
  const nonce = getCSPNonce();

  if (nonce) {
    style.setAttribute('nonce', nonce);
  }

  style.textContent = css;
  return style;
}

/**
 * Create a script element with nonce
 */
export function createScriptElement(code: string): HTMLScriptElement {
  const script = document.createElement('script');
  const nonce = getCSPNonce();

  if (nonce) {
    script.setAttribute('nonce', nonce);
  }

  script.textContent = code;
  return script;
}

/**
 * Inject inline styles with nonce
 */
export function injectStyles(css: string, id?: string): HTMLStyleElement {
  const style = createStyleElement(css);

  if (id) {
    style.id = id;
  }

  document.head.appendChild(style);
  return style;
}

/**
 * Inject inline script with nonce
 */
export function injectScript(code: string, id?: string): HTMLScriptElement {
  const script = createScriptElement(code);

  if (id) {
    script.id = id;
  }

  document.body.appendChild(script);
  return script;
}

/**
 * Hook for React to get CSP nonce
 * 
 * Usage:
 * ```tsx
 * import { useCSPNonce } from '../utils/cspNonce';
 * 
 * export function MyComponent() {
 *   const nonce = useCSPNonce();
 *   
 *   return (
 *     <style nonce={nonce}>
 *       .my-style { color: blue; }
 *     </style>
 *   );
 * }
 * ```
 */
export function useCSPNonce(): string | null {
  // In React, we need to use a ref and effect
  // But since this is a utility file, return the nonce directly
  return getCSPNonce();
}

/**
 * Fetch wrapper that extracts and caches nonce from response headers
 */
export async function fetchWithNonce(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const response = await fetch(url, options);

  // Extract nonce from response headers
  const nonce = response.headers.get('X-CSP-Nonce');
  if (nonce) {
    setCSPNonce(nonce);
  }

  return response;
}

/**
 * Validate nonce format (base64)
 */
export function isValidNonce(nonce: string): boolean {
  // Nonce should be base64 and around 16-32 characters
  return /^[A-Za-z0-9+/=]{16,32}$/.test(nonce);
}

/**
 * Example usage in a React component
 */
/*
import React, { useEffect, useState } from 'react';
import { getCSPNonce, injectStyles } from '../utils/cspNonce';

export function DynamicTheme() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const nonce = getCSPNonce();
    
    const css = `
      :root {
        --bg-color: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
        --text-color: ${theme === 'dark' ? '#ffffff' : '#000000'};
      }
    `;
    
    // This style will be injected with the CSP nonce
    injectStyles(css, 'dynamic-theme');
  }, [theme]);

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
}
*/

export default {
  getCSPNonce,
  getCSPNonceFromMeta,
  getCSPNonceFromScript,
  setCSPNonce,
  getCSPNonceCached,
  createStyleElement,
  createScriptElement,
  injectStyles,
  injectScript,
  useCSPNonce,
  fetchWithNonce,
  isValidNonce,
};
