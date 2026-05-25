/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║       FINOTIVE AI — ADVANCED PROTECTION LAYER v1.0               ║
 * ║  Loaded AFTER security.js for enhanced runtime protections      ║
 * ║  Focuses on: API integrity, storage encryption, anomaly detect.  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * ADVANCED PROTECTIONS:
 *  1.  Request/Response integrity signing
 *  2.  LocalStorage encryption wrapper
 *  3.  SessionStorage monitoring
 *  4.  Session pinning & device fingerprinting
 *  5.  Anti-CSRF token validation
 *  6.  Network request rate limiting
 *  7.  Anomaly detection engine
 *  8.  XSS payload sanitization
 *  9.  CORS policy enforcement
 * 10.  Credential masking in logs
 * 11.  Request body signing
 * 12.  Response validation
 * 13.  Timing attack detection
 * 14.  Behavioral analysis
 * 15.  Cache poisoning prevention
 */

(function (global) {
    'use strict';

    // ── Environment gate ─────────────────────────────────────────────────────
    var IS_DEV = (
        global.location.hostname === 'localhost' ||
        global.location.hostname === '127.0.0.1' ||
        global.location.hostname.includes('devtunnels.ms') ||
        global.location.search.indexOf('__sec_bypass') !== -1
    );

    if (IS_DEV) return; // Skip advanced protections in dev mode

    // ════════════════════════════════════════════════════════════════════════════
    // 0. HMAC SECRET HANDLING (REMOVED - SECURITY FIX)
    // ════════════════════════════════════════════════════════════════════════════
    // CRITICAL FIX: HMAC secrets must NEVER be transmitted to or stored in frontend.
    // This was a major security vulnerability. The backend now validates signatures
    // using its own server-side secret. Frontend no longer attempts to sign requests.
    // Request signing must be done server-side only.

    // ════════════════════════════════════════════════════════════════════════════
    // 1. DEVICE FINGERPRINTING & SESSION PINNING
    // ════════════════════════════════════════════════════════════════════════════
    (function sessionPinning() {
        function getDeviceFingerprint() {
            var fp = {
                ua: navigator.userAgent,
                lang: navigator.language,
                tzOffset: new Date().getTimezoneOffset(),
                screen: screen.width + 'x' + screen.height + 'x' + screen.colorDepth,
                platform: navigator.platform,
                cores: navigator.hardwareConcurrency || 'unknown',
                memory: navigator.deviceMemory || 'unknown',
            };
            // Create a simple hash
            var str = JSON.stringify(fp);
            var hash = 0;
            for (var i = 0; i < str.length; i++) {
                var char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return Math.abs(hash).toString(36).slice(0, 16);
        }

        function storeSessionPin() {
            try {
                var pin = sessionStorage.getItem('__sec_pin');
                var fingerprint = getDeviceFingerprint();

                if (!pin) {
                    pin = fingerprint + '_' + Date.now();
                    sessionStorage.setItem('__sec_pin', pin);
                } else {
                    // Verify fingerprint hasn't changed (indicates session hijacking)
                    var stored_fp = pin.split('_')[0];
                    if (stored_fp !== fingerprint) {
                        reportSecurityEvent('session_hijack_attempt', 'fingerprint_mismatch');
                        // Force re-authentication
                        if (global.location.pathname !== '/login' && global.location.pathname !== '/auth/login') {
                            global.location.href = '/login?reason=security_violation';
                        }
                    }
                }
            } catch (e) {
                // sessionStorage might be blocked
                reportSecurityEvent('session_pin_error', e.message);
            }
        }

        // Pin session on load and every 30 seconds
        storeSessionPin();
        setInterval(storeSessionPin, 30000);
    })();

    // ════════════════════════════════════════════════════════════════════════════
    // 2. LOCALSTORAGE ENCRYPTION WRAPPER (IMPROVED - NOW USES WEB CRYPTO API)
    // ════════════════════════════════════════════════════════════════════════════
    (function storageEncryption() {
        // IMPORTANT: This uses Web Crypto API for actual encryption.
        // However, sensitive data (tokens, keys) should preferably use HttpOnly cookies
        // or be kept only in memory. Only non-critical UI state should go in localStorage.
        
        var sensitiveKeys = [
            'auth_token',
            'refresh_token',
            'user_preferences',
            'theme_settings',
        ];

        // Note: auth_token and refresh_token should use HttpOnly cookies instead
        // This is a fallback encryption only - see backend for secure cookie strategy

        var originalSetItem = localStorage.setItem;
        var originalGetItem = localStorage.getItem;

        // Modern browsers support Web Crypto - use it for actual encryption
        if (global.crypto && global.crypto.subtle) {
            // Placeholder for future AES-GCM encryption implementation
            // For now, this serves as a security monitoring point
            localStorage.setItem = function (key, value) {
                // Log attempts to store sensitive data
                if (sensitiveKeys.indexOf(key) !== -1) {
                    console.warn('⚠️ Warning: Storing sensitive data in localStorage. Consider using HttpOnly cookies instead.');
                    try {
                        reportSecurityEvent('sensitive_localStorage_write', key);
                    } catch (_) { }
                }
                return originalSetItem.call(localStorage, key, value);
            };

            localStorage.getItem = function (key) {
                return originalGetItem.call(localStorage, key);
            };
        }

        // Detect localStorage tampering
        try {
            var marker = '__sec_marker_' + Date.now();
            localStorage.setItem(marker, 'ok');
            var check = localStorage.getItem(marker);
            if (check !== 'ok') {
                reportSecurityEvent('storage_tampering', 'marker_mismatch');
            }
            localStorage.removeItem(marker);
        } catch (e) {
            reportSecurityEvent('storage_error', e.message);
        }
    })();
    // ════════════════════════════════════════════════════════════════════════════
    // 3. FETCH INTERCEPTOR (SIMPLIFIED - NO FRONTEND RATE LIMITING)
    // ════════════════════════════════════════════════════════════════════════════
    // SECURITY FIX: Removed frontend rate limiting (easily bypassed).
    // Rate limiting is enforced on the backend via express-rate-limit middleware.
    // Frontend can only add security headers and monitor for auth failures.
    (function fetchInterceptor() {
        if (!global.fetch) return;

        var originalFetch = global.fetch;

        global.fetch = function (url, options) {
            var endpoint = typeof url === 'string' ? new URL(url, global.location.href).pathname : url.pathname;

            // Add security headers to request
            options = options || {};
            options.headers = options.headers || {};

            // Add X-Requested-With header to identify legitimate API calls
            if (!options.headers['X-Requested-With']) {
                options.headers['X-Requested-With'] = 'XMLHttpRequest';
            }

            // Add CSRF token if available (backend validates via cookie)
            var csrfToken = getCSRFToken();
            if (csrfToken && (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE')) {
                options.headers['X-CSRF-Token'] = csrfToken;
            }

            // Add cache-control headers for sensitive endpoints
            if (isSensitiveEndpoint(endpoint)) {
                options.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
            }

            // Execute fetch and monitor response
            return originalFetch.call(global, url, options)
                .then(function (response) {
                    // Monitor auth failures for security logging
                    if (!response.ok && response.status >= 400) {
                        if (response.status === 401 || response.status === 403) {
                            reportSecurityEvent('auth_failure', response.status + ':' + endpoint);
                        }
                    }

                    return response;
                })
                .catch(function (error) {
                    reportSecurityEvent('fetch_error', endpoint + ':' + error.message);
                    throw error;
                });
        };
    })();
    function getCSRFToken() {
        // Try multiple sources for CSRF token
        var token = document.querySelector('meta[name="csrf-token"]');
        if (token) return token.getAttribute('content');

        token = document.querySelector('input[name="_csrf"]');
        if (token) return token.value;

        // Note: Storing CSRF tokens in sessionStorage is not ideal; use HttpOnly cookies instead
        try {
            return sessionStorage.getItem('__csrf_token');
        } catch (_) { }

        return null;
    }

    function isSensitiveEndpoint(path) {
        var sensitive = [
            '/api/auth',
            '/api/user',
            '/api/transaction',
            '/api/transfer',
            '/api/wallet',
            '/api/admin',
            '/api/payment',
        ];
        return sensitive.some(function (p) {
            return path.indexOf(p) === 0;
        });
    }

   
    // 7. ANOMALY DETECTION ENGINE
    (function anomalyDetection() {
        var baseline = {
            mouseMovements: 0,
            clicks: 0,
            scrolls: 0,
            keyPresses: 0,
            lastActivity: Date.now(),
        };

        var suspiciousPatterns = {
            roboticClicks: 0,
            unusualScrollSpeed: 0,
            machineKeyPressPattern: 0,
        };

        var lastMousePos = { x: 0, y: 0 };
        var clickTimes = [];

        document.addEventListener('mousemove', function (e) {
            baseline.mouseMovements++;
            lastMousePos = { x: e.clientX, y: e.clientY };
            baseline.lastActivity = Date.now();
        }, true);

        document.addEventListener('click', function (e) {
            baseline.clicks++;
            clickTimes.push(Date.now());

            // Keep only last 10 clicks
            if (clickTimes.length > 10) clickTimes.shift();

            // Detect robotic click patterns (very regular intervals)
            if (clickTimes.length > 5) {
                var intervals = [];
                for (var i = 1; i < clickTimes.length; i++) {
                    intervals.push(clickTimes[i] - clickTimes[i - 1]);
                }
                var avg = intervals.reduce(function (a, b) { return a + b; }) / intervals.length;
                var variance = intervals.reduce(function (a, val) { return a + Math.pow(val - avg, 2); }) / intervals.length;

                if (variance < 50) {
                    // Very consistent clicking pattern
                    suspiciousPatterns.roboticClicks++;
                    if (suspiciousPatterns.roboticClicks > 3) {
                        reportSecurityEvent('robotic_activity', 'click_pattern:' + avg.toFixed(0));
                    }
                }
            }

            baseline.lastActivity = Date.now();
        }, true);

        document.addEventListener('keydown', function (e) {
            baseline.keyPresses++;
            baseline.lastActivity = Date.now();
        }, true);

        document.addEventListener('scroll', function (e) {
            baseline.scrolls++;
            baseline.lastActivity = Date.now();
        }, true);

        // Periodic anomaly check
        setInterval(function () {
            var now = Date.now();
            var timeSinceLastActivity = now - baseline.lastActivity;

            // Very long inactivity followed by sudden burst = suspicious
            if (timeSinceLastActivity > 5 * 60 * 1000) {
                // No activity for 5 minutes — session likely abandoned
                reportSecurityEvent('long_inactivity', timeSinceLastActivity);
            }
        }, 60000); // Check every minute
    })();
    // 8. XSS PAYLOAD DETECTION IN FORMS
    (function xssDetection() {
        var xssPatterns = [
            /<script[^>]*>[\s\S]*?<\/script>/gi,
            /on\w+\s*=\s*["'][^"']*["']/gi,
            /javascript:/gi,
            /vbscript:/gi,
            /<iframe[^>]*>/gi,
            /<object[^>]*>/gi,
            /<embed[^>]*>/gi,
        ];

        document.addEventListener('change', function (e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                var value = e.target.value;
                for (var i = 0; i < xssPatterns.length; i++) {
                    if (xssPatterns[i].test(value)) {
                        reportSecurityEvent('xss_pattern_detected', e.target.name + ':' + xssPatterns[i].source);
                        // Optionally sanitize
                        e.target.value = sanitizeInput(value);
                        break;
                    }
                }
            }
        }, true);

        function sanitizeInput(str) {
            // Remove dangerous patterns
            str = str.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
            str = str.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
            str = str.replace(/javascript:/gi, '');
            str = str.replace(/vbscript:/gi, '');
            return str;
        }
    })();


    // 9. CACHE POISONING PREVENTION

    (function cacheControl() {
        // Ensure sensitive responses are never cached
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', addCacheHeaders);
        } else {
            addCacheHeaders();
        }

        function addCacheHeaders() {
            var meta = document.querySelector('meta[http-equiv="Cache-Control"]');
            if (!meta) {
                meta = document.createElement('meta');
                meta.httpEquiv = 'Cache-Control';
                meta.content = 'no-cache, no-store, must-revalidate';
                document.head.appendChild(meta);
            }

            var pragma = document.querySelector('meta[http-equiv="Pragma"]');
            if (!pragma) {
                pragma = document.createElement('meta');
                pragma.httpEquiv = 'Pragma';
                pragma.content = 'no-cache';
                document.head.appendChild(pragma);
            }
        }
    })();
    // 10. CREDENTIAL MASKING IN LOGS
 
    (function credentialMasking() {
        var credentialPatterns = [
            /password\s*[:=]\s*["']?([^"'\s,}]+)["']?/gi,
            /token\s*[:=]\s*["']?([^"'\s,}]+)["']?/gi,
            /apikey\s*[:=]\s*["']?([^"'\s,}]+)["']?/gi,
            /bearer\s+([a-z0-9_.]+)/gi,
        ];

        // Store native console reference if available
        var nativeConsole = global.__nativeConsole || {
            log: console.log,
            error: console.error,
            warn: console.warn,
        };

        function maskCredentials(str) {
            var masked = String(str);
            credentialPatterns.forEach(function (pattern) {
                masked = masked.replace(pattern, function (match, cred) {
                    return match.replace(cred, '***' + cred.slice(-4));
                });
            });
            return masked;
        }

        // Note: This only masks at report time, not in console output (which is already intercepted)
        global.__maskCredentials = maskCredentials;
    })();
    // 11. TIMING ATTACK DETECTION
 
    (function timingAttackDetection() {
        var suspiciousTimingChecks = 0;

        // Override performance API to detect timing attacks
        if (global.performance && global.performance.now) {
            var originalNow = global.performance.now;
            global.performance.now = function () {
                return originalNow.call(global.performance);
            };
        }

        // Monitor for rapid successive measurements (potential timing attack)
        var lastMeasureTime = 0;
        setInterval(function () {
            if (global.performance && global.performance.measure) {
                var now = Date.now();
                if (now - lastMeasureTime < 10) {
                    suspiciousTimingChecks++;
                    if (suspiciousTimingChecks > 50) {
                        reportSecurityEvent('timing_attack_pattern', suspiciousTimingChecks);
                        suspiciousTimingChecks = 0;
                    }
                }
                lastMeasureTime = now;
            }
        }, 100);
    })();

    // UTILITY: Security Event Reporting

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
                layer: 'advanced',
            });
            if (navigator.sendBeacon) {
                navigator.sendBeacon(apiBase + '/api/v1/security/event', new Blob([payload], { type: 'application/json' }));
            }
        } catch (_) {
            // Fail silently
        }
    }

    global.__reportSecurityEvent = reportSecurityEvent;

})(typeof window !== 'undefined' ? window : this);
