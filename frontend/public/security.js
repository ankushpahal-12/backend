

(function (global) {
    'use strict';

    var IS_DEV = (
        global.location.hostname === 'localhost' ||
        global.location.hostname === '127.0.0.1' ||
        global.location.hostname.includes('devtunnels.ms') ||
        global.location.search.indexOf('__sec_bypass') !== -1 
    );

    var SENSITIVE_SELECTORS = [
        '[data-sensitive]',
        'input[type="password"]',
        'input[type="email"]',
        '.glass-card',
        '#root'
    ].join(',');
    (function frameGuard() {
        if (global.top !== global.self) {
          
            global.top.location = global.self.location;
          
            document.documentElement.style.display = 'none';
        }
    })();

    (function protoGuard() {
    
        try {
            var existingDescriptor = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__');
            if (!existingDescriptor || existingDescriptor.configurable) {
                Object.defineProperty(Object.prototype, '__proto__', {
                    get: function () { return Object.getPrototypeOf(this); },
                    set: function (v) {
                        
                        try { reportSecurityEvent('proto_pollution', typeof v); } catch (_) { }
                    },
                    configurable: false,
                    enumerable: false,
                });
            }
        } catch (_) { }
    })();

    (function contextMenuGuard() {
        document.addEventListener('contextmenu', function (e) {
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

        
        if (detected || (global.navigator && global.navigator.webdriver === true)) {
            reportSecurityEvent('automation_detected', navigator.userAgent.slice(0, 80));
            
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
                    document.dispatchEvent(new CustomEvent('sec:session_stale', {
                        detail: { hiddenMs: elapsed }
                    }));
                }
            }
        });
    })();
    (function printGuard() {
        
    })();

   
    (function referrerGuard() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setReferrerMeta);
        } else {
            setReferrerMeta();
        }

        function setReferrerMeta() {
           
            if (!document.querySelector('meta[name="referrer"]')) {
                var meta = document.createElement('meta');
                meta.name = 'referrer';
                meta.content = 'strict-origin-when-cross-origin';
                document.head.appendChild(meta);
            }
        }
    })();

    (function cspViolationObserver() {

        document.addEventListener('securitypolicyviolation', function (e) {
            reportSecurityEvent('csp_violation', [
                e.violatedDirective,
                e.blockedURI
            ].join('|'));
        });
    })();

    var devtoolsOverlay = null;
    var printOverlay = null;

   

    function reportSecurityEvent(type, detail) {
        try {
         
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
        }
    }

    global.__secGuard = {
        reportEvent: reportSecurityEvent,
    };

})(window);
