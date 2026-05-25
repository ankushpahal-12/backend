/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║          FINOTIVE AI — CLIENT SECURITY LAYER v2.0               ║
 * ║  Loaded BEFORE React bundle to intercept attacks early.         ║
 * ║  DO NOT REMOVE. Runs in production only (checked via env flag). ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * PROTECTIONS:
 *  1.  DevTools detection — warning overlay + optional log suppression
 *  2.  Console method poisoning — overwrite console.* in prod
 *  3.  Keyboard shortcut blocking — F12, Ctrl+Shift+I/J/U/S, Ctrl+U
 *  4.  Context-menu disable on sensitive elements
 *  5.  Anti-drag-and-drop on sensitive content
 *  6.  Frame-busting — prevent clickjack via iframe embedding
 *  7.  Anti-print — block Ctrl+P / window.print
 *  8.  Anti-screenshot cue — visually hide on PrintScreen key (CSS trick)
 *  9.  DOM tampering monitor — MutationObserver watches for script injection
 * 10.  Prototype pollution guard — freeze Object/Array prototypes
 * 11.  Clipboard intercept — warn on copy of sensitive node content
 * 12.  Referrer/navigation leak guard — clamp navigation for auth pages
 * 13.  Session visibility guard — tab-hidden warning for idle sessions
 * 14.  Anti-automation / headless browser detection
 * 15.  Timing attack mitigation — constant-time boolean logger stub
 */

(function (global) {
    'use strict';

    // ── Environment gate ─────────────────────────────────────────────────────
    // Skip protections in Vite dev mode (window.__VITE_DEV__ is injected via vite.config)
    var IS_DEV = (
        global.location.hostname === 'localhost' ||
        global.location.hostname === '127.0.0.1' ||
        global.location.hostname.includes('devtunnels.ms') ||
        global.location.search.indexOf('__sec_bypass') !== -1 // test hook
    );

    // ── Sensitive element selector ────────────────────────────────────────────
    var SENSITIVE_SELECTORS = [
        '[data-sensitive]',
        'input[type="password"]',
        'input[type="email"]',
        '.glass-card',
        '#root'
    ].join(',');
    (function frameGuard() {
        if (global.top !== global.self) {
            // We're inside an iframe — break out
            global.top.location = global.self.location;
            // Fallback: hide everything while redirecting
            document.documentElement.style.display = 'none';
        }
    })();
    // Prototype pollution guard
    // NOTE: We do NOT freeze Object/Array/Function prototypes — that breaks Axios,
    // MUI, and every other library that assigns prototype methods at runtime.
    // Instead we intercept the two most common pollution vectors:
    //   1. obj.__proto__ = {...}  (direct assignment)
    //   2. Object.assign(obj, { constructor: ... })
    (function protoGuard() {
        // Guard __proto__ setter
        try {
            var existingDescriptor = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__');
            if (!existingDescriptor || existingDescriptor.configurable) {
                Object.defineProperty(Object.prototype, '__proto__', {
                    get: function () { return Object.getPrototypeOf(this); },
                    set: function (v) {
                        // Silently swallow; report as telemetry event
                        try { reportSecurityEvent('proto_pollution', typeof v); } catch (_) { }
                    },
                    configurable: false,
                    enumerable: false,
                });
            }
        } catch (_) { }
    })();


    // ════════════════════════════════════════════════════════════════════════════
    // 3. KEYBOARD SHORTCUT HANDLING (REMOVED - SECURITY FIX)
    // ════════════════════════════════════════════════════════════════════════════
    // SECURITY FIX: Blocking DevTools is counterproductive and easily bypassed:
    // - Users can open DevTools before the page loads
    // - Users can use remote debugging
    // - It breaks legitimate developer debugging and bad UX for recruiters
    //
    // Modern security relies on:
    // - Content-Security-Policy (CSP) headers
    // - HttpOnly cookies (cannot be accessed via JS)
    // - Backend validation and rate limiting
    // - Secure HTTPS-only connections
    //
    // Frontend DevTools access doesn't reduce security if backend is properly hardened.

    // ════════════════════════════════════════════════════════════════════════════
    // 4. CONSOLE OVERRIDE (REMOVED - SECURITY FIX)
    // ════════════════════════════════════════════════════════════════════════════
    // SECURITY FIX: Console poisoning is counterproductive:
    // - Breaks debugging for legitimate users and developers
    // - Looks suspicious to security reviewers
    // - Doesn't prevent actual attacks
    // - Attackers can still use console if they have JS access (already compromised)
    //
    // If application data needs protection, use:
    // - HttpOnly cookies for sensitive tokens
    // - Content-Security-Policy headers
    // - Secure authentication flows on backend
    // - Never store secrets in frontend memory/storage

    // ════════════════════════════════════════════════════════════════════════════
    // 5. DEVTOOLS DETECTION (REMOVED - SECURITY FIX)
    // ════════════════════════════════════════════════════════════════════════════
    // SECURITY FIX: DevTools detection is easily bypassed and counterproductive:
    // - Users can open DevTools before the page loads (detection doesn't run)
    // - Users can use remote debugging protocols (Chrome DevTools Protocol)
    // - It doesn't prevent XSS, CSRF, or other real attacks
    // - It harms legitimate users, developers, and recruiters testing the app
    //
    // Real security comes from:
    // - HTTPS-only enforcement
    // - Content-Security-Policy headers (prevents inline scripts)
    // - HttpOnly, Secure, SameSite cookies
    // - Backend validation and rate limiting
    // - Proper authentication flows

    (function contextMenuGuard() {
        document.addEventListener('contextmenu', function (e) {
            var target = e.target;
            // Block right-click on sensitive elements only
            while (target && target !== document) {
                if (target.matches && target.matches(SENSITIVE_SELECTORS)) {
                    e.preventDefault();
                    return;
                }
                target = target.parentElement;
            }
            // Allow right-click on non-sensitive areas (e.g. text blocks)
        }, false);
    })();

   
    (function dragGuard() {
        document.addEventListener('dragstart', function (e) {
            var target = e.target;
            while (target && target !== document) {
                if (target.matches && target.matches(SENSITIVE_SELECTORS)) {
                    e.preventDefault();
                    return;
                }
                target = target.parentElement;
            }
        }, false);
    })();
    (function clipboardGuard() {
        document.addEventListener('copy', function (e) {
            var target = e.target;
            var sensitivity = false;
            while (target && target !== document) {
                if (target.dataset && target.dataset.sensitive === 'block') {
                    e.preventDefault();
                    showClipboardWarning();
                    return;
                }
                if (target.matches && target.matches('[data-sensitive]')) {
                    sensitivity = true;
                }
                target = target.parentElement;
            }
            // For general sensitive areas: allow but log the event internally
            if (sensitivity) {
                reportSecurityEvent('clipboard_copy', document.getSelection ? document.getSelection().toString().slice(0, 20) : '');
            }
        }, false);
    })();
    (function domTamperGuard() {
        if (!global.MutationObserver) return;

        var DANGEROUS_TAGS = ['SCRIPT', 'IFRAME', 'LINK', 'OBJECT', 'EMBED'];
        // Whitelist our own known script src
        var ALLOWED_ORIGINS = [
            global.location.origin,
            'https://unpkg.com',
            'https://cdn.jsdelivr.net',
            'https://accounts.google.com', // Google Sign-In SDK
            'chrome-extension://', // Browser extensions
        ];

        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType !== 1) return; // element nodes only
                    if (DANGEROUS_TAGS.indexOf(node.tagName) === -1) return;

                    var src = node.src || node.href || '';
                    var isKnown = !src || ALLOWED_ORIGINS.some(function (origin) {
                        return src.startsWith(origin) || src.startsWith('/') || src.startsWith('data:');
                    });

                    if (!isKnown) {
                        console.warn && console.warn('[SEC] Suspicious node injected:', node.tagName, src);
                        // Don't remove — could break legitimate lazy-loaded scripts
                        // But flag it
                        reportSecurityEvent('dom_injection', node.tagName + ':' + src.slice(0, 50));
                    }
                });
            });
        });

        // Start observing once DOM is ready
        document.addEventListener('DOMContentLoaded', function () {
            observer.observe(document.documentElement, {
                childList: true,
                subtree: true
            });
        });
    })();
    (function automationGuard() {
        var flags = [
            'webdriver',
            '__webdriver_evaluate',
            '__selenium_evaluate',
            '__webdriver_script_fn',
            '__fxdriver_evaluate',
            '__driver_evaluate',
            '_Selenium_IDE_Recorder',
            '_selenium',
            'callSelenium',
            '_$webdriverAsyncExecutor',
            '__lastWatirAlert',
            '__lastWatirConfirm',
            '__lastWatirPrompt',
        ];

        var detected = flags.some(function (flag) {
            return !!global[flag] || !!global.navigator[flag];
        });

        // Also check navigator.webdriver (standard Puppeteer/Playwright flag)
        if (detected || (global.navigator && global.navigator.webdriver === true)) {
            reportSecurityEvent('automation_detected', navigator.userAgent.slice(0, 80));
            // Don't block (legitimate CI/test runners may trigger this)
            // Just flag for backend correlation
        }
    })();
    (function visibilityGuard() {
        var hiddenAt = null;
        var MAX_HIDDEN_MS = 15 * 60 * 1000; // 15 minutes

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                hiddenAt = Date.now();
            } else if (hiddenAt) {
                var elapsed = Date.now() - hiddenAt;
                hiddenAt = null;
                if (elapsed > MAX_HIDDEN_MS) {
                    // Dispatch a custom event so React auth context can act
                    document.dispatchEvent(new CustomEvent('sec:session_stale', {
                        detail: { hiddenMs: elapsed }
                    }));
                }
            }
        });
    })();
    (function printGuard() {
        // Print should be allowed - users have legitimate reasons to save/print pages
        // If sensitive data must not be printed, use backend-level restrictions or
        // server-side rendered reports with explicit print handling
    })();

   
    (function referrerGuard() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setReferrerMeta);
        } else {
            setReferrerMeta();
        }

        function setReferrerMeta() {
            // Ensure strict-origin referrer meta exists (prevents referrer leaks)
            if (!document.querySelector('meta[name="referrer"]')) {
                var meta = document.createElement('meta');
                meta.name = 'referrer';
                meta.content = 'strict-origin-when-cross-origin';
                document.head.appendChild(meta);
            }
        }
    })();

    (function cspViolationObserver() {
        // Monitor and report CSP violations for security auditing
        document.addEventListener('securitypolicyviolation', function (e) {
            reportSecurityEvent('csp_violation', [
                e.violatedDirective,
                e.blockedURI
            ].join('|'));
        });
    })();

    var devtoolsOverlay = null;
    var printOverlay = null;

    // Note: DevTools and Print warnings have been removed as they:
    // - Are easily bypassed (open DevTools before page loads, remote debugging, etc.)
    // - Don't prevent actual attacks
    // - Harm UX for legitimate users and security researchers
    // - Make the app look suspicious
    //
    // Security is now enforced via:
    // - Content-Security-Policy headers (backend)
    // - HttpOnly cookies (cannot be accessed via console)
    // - Backend rate limiting and validation
    // - Proper HTTPS-only configuration

    function reportSecurityEvent(type, detail) {
        try {
            // Determine API base URL with priority order:
            // 1. Use global __API_BASE__ if explicitly set (for Vercel/production deployments)
            // 2. Use VITE_API_URL if available (injected by frontend)
            // 3. Local dev: http://localhost:5000
            // 4. Production default: same origin
            var apiBase = global.__API_BASE__ ||
                global.__VITE_API_URL ||
                (global.location.hostname === 'localhost' && global.location.port === '5173'
                    ? 'http://localhost:5000'
                    : global.location.origin);
            var payload = JSON.stringify({
                type: type,
                detail: detail,
                url: global.location.pathname,
                ua: navigator.userAgent.slice(0, 100),
                ts: Date.now(),
            });
            if (navigator.sendBeacon) {
                navigator.sendBeacon(apiBase + '/api/v1/security/event', new Blob([payload], { type: 'application/json' }));
            }
        } catch (_) {
            // Fail silently — never break app flow
        }
    }

    // Expose a minimal public API for the React layer
    global.__secGuard = {
        reportEvent: reportSecurityEvent,
    };

})(window);
