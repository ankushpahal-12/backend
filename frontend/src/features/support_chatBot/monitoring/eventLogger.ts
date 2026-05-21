/**
 * eventLogger.ts
 * Tracks user interaction timeline: clicks and navigation events.
 * Debounces click events to avoid flooding on rapid clicks.
 */

import { appendLog } from './sessionStorage';

let initialized = false;
let lastClickTime = 0;
const CLICK_DEBOUNCE_MS = 300;

const getElementDescription = (el: Element | null): string => {
  if (!el) return 'unknown';
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : '';
  const text = el.textContent?.trim().slice(0, 40) || '';
  const label = el.getAttribute('aria-label') || '';
  return `${tag}${id}${label ? `[${label}]` : text ? `("${text}")` : ''}`;
};

export const initEventLogger = (): void => {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  // Click tracking
  document.addEventListener(
    'click',
    (event) => {
      const now = Date.now();
      if (now - lastClickTime < CLICK_DEBOUNCE_MS) return;
      lastClickTime = now;

      const target = event.target as Element;
      appendLog({
        type: 'user_event',
        message: `User clicked: ${getElementDescription(target)}`,
        timestamp: new Date().toISOString(),
        meta: {
          tag: target?.tagName?.toLowerCase(),
          path: window.location.pathname,
        },
      });
    },
    { passive: true }
  );

  // Navigation tracking
  const logNavigation = () => {
    appendLog({
      type: 'navigation',
      message: `Navigated to: ${window.location.pathname}${window.location.search}`,
      timestamp: new Date().toISOString(),
      meta: { href: window.location.href },
    });
  };

  window.addEventListener('popstate', logNavigation);

  // Patch pushState / replaceState for SPA navigation
  const originalPushState = history.pushState.bind(history);
  const originalReplaceState = history.replaceState.bind(history);

  history.pushState = (...args) => {
    originalPushState(...args);
    logNavigation();
  };

  history.replaceState = (...args) => {
    originalReplaceState(...args);
    logNavigation();
  };
};
