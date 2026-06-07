
(function(global) {
    'use strict';

    const IS_DEV = (
        global.location.hostname === 'localhost' ||
        global.location.hostname === '127.0.0.1'
    );
    const DeviceFingerprinter = {
   
        generate: async function() {
            const components = {
                // Browser capabilities
                userAgent: navigator.userAgent,
                language: navigator.language,
                languages: navigator.languages ? navigator.languages.join(',') : '',
                
                // Screen/Display
                screen: {
                    width: screen.width,
                    height: screen.height,
                    colorDepth: screen.colorDepth,
                    pixelDepth: screen.pixelDepth,
                    devicePixelRatio: window.devicePixelRatio,
                },
                
                // Hardware
                cores: navigator.hardwareConcurrency || 'unknown',
                memory: navigator.deviceMemory || 'unknown',
                maxTouchPoints: navigator.maxTouchPoints || 0,
                vendor: navigator.vendor,
                platform: navigator.platform,
                
                // Canvas fingerprinting
                canvasHash: await this.canvasHash(),
                
                // WebGL capabilities
                webglHash: await this.webglHash(),
                
                // Timezone
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                timezoneOffset: new Date().getTimezoneOffset(),
                
                // Fonts
                fonts: this.detectFonts(),
                
                // Plugin detection
                plugins: this.getPlugins(),
                
                // Media capabilities
                audioContext: this.getAudioHash(),
            };
            
            // Hash all components into fingerprint
            return this.hashComponents(components);
        },
        // Canvas fingerprinting - detects subtle rendering differences
         
        canvasHash: async function() {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const text = 'Zero Trust Fingerprint ' + Date.now();
                
                // Draw with specific styling
                ctx.textBaseline = 'top';
                ctx.font = '14px Arial';
                ctx.textBaseline = 'alphabetic';
                ctx.fillStyle = '#f60';
                ctx.fillRect(125, 1, 62, 20);
                ctx.fillStyle = '#069';
                ctx.fillText(text, 2, 15);
                ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
                ctx.fillText(text, 4, 17);
                
                return canvas.toDataURL().slice(-50); // Last 50 chars
            } catch (e) {
                return 'canvas_error';
            }
        },

        webglHash: async function() {
            try {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                
                if (!gl) return 'no_webgl';
                
                const renderer = gl.getParameter(gl.RENDERER);
                const vendor = gl.getParameter(gl.VENDOR);
                
                return (vendor + '-' + renderer).slice(0, 50);
            } catch (e) {
                return 'webgl_error';
            }
        },

        /**
         * Detect installed fonts
         */
        detectFonts: function() {
            const baseFonts = ['monospace', 'sans-serif', 'serif'];
            const testFonts = [
                'Arial', 'Verdana', 'Times New Roman', 'Courier New',
                'Georgia', 'Palatino', 'Garamond', 'Comic Sans MS',
            ];
            
            const detected = [];
            
            testFonts.forEach(font => {
                for (let baseFont of baseFonts) {
                    if (this.fontExists(font, baseFont)) {
                        detected.push(font);
                        break;
                    }
                }
            });
            
            return detected.join(',');
        },

        /**
         * Check if specific font exists
         */
        fontExists: function(fontName, baseFonts = 'monospace') {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const testText = 'Mm Web Fingerprint';
            
            ctx.font = `72px ${baseFonts}`;
            const baseWidth = ctx.measureText(testText).width;
            
            ctx.font = `72px ${fontName}, ${baseFonts}`;
            const testWidth = ctx.measureText(testText).width;
            
            return baseWidth !== testWidth;
        },

        /**
         * Get browser plugins
         */
        getPlugins: function() {
            const plugins = [];
            
            if (navigator.plugins) {
                for (let i = 0; i < navigator.plugins.length; i++) {
                    plugins.push(navigator.plugins[i].name);
                }
            }
            
            return plugins.join(',');
        },

        /**
         * Audio context fingerprinting
         */
        getAudioHash: function() {
            try {
                const AudioContext = global.AudioContext || global.webkitAudioContext;
                if (!AudioContext) return 'no_audio';
                
                const ctx = new AudioContext();
                const oscillator = ctx.createOscillator();
                const analyser = ctx.createAnalyser();
                
                oscillator.connect(analyser);
                analyser.connect(ctx.destination);
                oscillator.start(0);
                oscillator.stop(0);
                
                // Get frequency data
                const data = new Uint8Array(12);
                analyser.getByteFrequencyData(data);
                
                return Array.from(data).join(',').slice(0, 30);
            } catch (e) {
                return 'audio_error';
            }
        },

        /**
         * Hash all components into single fingerprint
         */
        hashComponents: function(components) {
            const jsonStr = JSON.stringify(components);
            let hash = 0;
            
            for (let i = 0; i < jsonStr.length; i++) {
                const char = jsonStr.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            
            // Convert to hex
            return Math.abs(hash).toString(16).padStart(8, '0');
        },
    };

    // ════════════════════════════════════════════════════════════════════════════
    // 2. REQUEST INTERCEPTOR WITH DEVICE FINGERPRINT
    // ════════════════════════════════════════════════════════════════════════════

    const ZeroTrustInterceptor = {
        deviceFingerprint: null,
        mfaChallenges: new Map(),

        /**
         * Initialize the interceptor
         */
        async init() {
            // Generate device fingerprint once
            this.deviceFingerprint = await DeviceFingerprinter.generate();
            
            console.log('[ZERO_TRUST] Device fingerprint generated:', this.deviceFingerprint.slice(0, 8));
            
            // Intercept fetch requests
            this.interceptFetch();
            
            // Set up MFA challenge handler
            this.setupMFAHandler();
        },

        /**
         * Intercept fetch to add device fingerprint
         */
        interceptFetch() {
            const originalFetch = global.fetch;
            
            global.fetch = async function(url, options = {}) {
                const endpoint = typeof url === 'string' 
                    ? new URL(url, global.location.href).pathname 
                    : url.pathname;
                
                // Skip fingerprinting for non-sensitive endpoints
                const sensitiveEndpoints = [
                    '/api/auth',
                    '/api/users',
                    '/api/transaction',
                    '/api/transfer',
                    '/api/wallet',
                    '/api/admin',
                    '/api/payment',
                ];
                
                const isSensitive = sensitiveEndpoints.some(ep => endpoint.startsWith(ep));
                
                if (isSensitive && options.method && options.method !== 'GET') {
                    // Add device fingerprint to request body
                    options.headers = options.headers || {};
                    options.headers['X-Device-Fingerprint'] = ZeroTrustInterceptor.deviceFingerprint;
                    
                    if (options.body && typeof options.body === 'string') {
                        try {
                            const bodyObj = JSON.parse(options.body);
                            bodyObj.deviceFingerprint = ZeroTrustInterceptor.deviceFingerprint;
                            options.body = JSON.stringify(bodyObj);
                        } catch (_) {}
                    }
                }
                
                // Execute request
                const response = await originalFetch.call(this, url, options);
                
                // Handle MFA challenges
                if (response.status === 403 && isSensitive) {
                    const data = await response.clone().json().catch(() => ({}));
                    if (data.status === 'mfa_required') {
                        return await ZeroTrustInterceptor.handleMFAChallenge(data, url, options);
                    }
                }
                
                return response;
            };
        },

        /**
         * Handle MFA challenge
         */
        async handleMFAChallenge(challengeData, originalUrl, originalOptions) {
            const { mfaChallengeId } = challengeData;
            
            console.log('[ZERO_TRUST] MFA Challenge required:', challengeData.riskLevel);
            
            // Store challenge
            this.mfaChallenges.set(mfaChallengeId, {
                timestamp: Date.now(),
                expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
                riskLevel: challengeData.riskLevel,
            });
            
            // Dispatch custom event for UI to handle MFA
            global.dispatchEvent(new CustomEvent('zeroTrust:mfaRequired', {
                detail: {
                    mfaChallengeId,
                    riskLevel: challengeData.riskLevel,
                    message: challengeData.message,
                }
            }));
            
            // Create response that won't be processed
            return new Response(
                JSON.stringify({
                    status: 'mfa_required',
                    mfaChallengeId,
                    message: 'MFA verification required'
                }),
                { status: 403 }
            );
        },

        /**
         * Submit MFA code
         */
        async submitMFACode(mfaChallengeId, mfaCode, originalRequest) {
            try {
                const response = await globalThis.fetch('/api/auth/verify-mfa', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        mfaChallengeId,
                        mfaCode,
                    }),
                });
                
                if (response.ok) {
                    console.log('[ZERO_TRUST] MFA verified successfully');
                    this.mfaChallenges.delete(mfaChallengeId);
                    
                    // Dispatch success event
                    global.dispatchEvent(new CustomEvent('zeroTrust:mfaVerified', {
                        detail: { mfaChallengeId }
                    }));
                    
                    return true;
                } else {
                    console.error('[ZERO_TRUST] MFA verification failed');
                    return false;
                }
            } catch (error) {
                console.error('[ZERO_TRUST] MFA submission error:', error);
                return false;
            }
        },

        /**
         * Set up MFA UI handler
         */
        setupMFAHandler() {
            global.addEventListener('zeroTrust:mfaRequired', (event) => {
                const { mfaChallengeId, riskLevel, message } = event.detail;
                
                // Show MFA input dialog (can be customized)
                const code = prompt(
                    `🔐 Security Verification Required\n\n${message}\n\nEnter the 6-digit code sent to your email:`
                );
                
                if (code && code.length === 6) {
                    this.submitMFACode(mfaChallengeId, code);
                }
            });
        },
    };

    // ════════════════════════════════════════════════════════════════════════════
    // 3. CONTINUOUS BEHAVIOR MONITORING
    // ════════════════════════════════════════════════════════════════════════════

    const BehaviorMonitor = {
        requestLog: [],
        maxLogSize: 100,

        /**
         * Log request for behavior analysis
         */
        logRequest(method, endpoint, responseTime, statusCode) {
            this.requestLog.push({
                timestamp: Date.now(),
                method,
                endpoint,
                responseTime,
                statusCode,
            });
            
            // Keep log size bounded
            if (this.requestLog.length > this.maxLogSize) {
                this.requestLog.shift();
            }
            
            // Analyze for anomalies
            this.detectAnomalies();
        },

        /**
         * Detect behavioral anomalies
         */
        detectAnomalies() {
            const recentRequests = this.requestLog.filter(
                r => Date.now() - r.timestamp < 60 * 1000
            );
            
            // Check 1: Request frequency spike
            if (recentRequests.length > 30) {
                console.warn('[ZERO_TRUST] Unusual request frequency detected');
                this.reportAnomaly('high_request_frequency', {
                    count: recentRequests.length,
                    window: '60s',
                });
            }
            
            // Check 2: Rapid endpoint switching
            const endpoints = [...new Set(recentRequests.map(r => r.endpoint))];
            if (endpoints.length > 15) {
                console.warn('[ZERO_TRUST] Unusual endpoint pattern detected');
                this.reportAnomaly('unusual_endpoint_pattern', {
                    endpointCount: endpoints.length,
                });
            }
            
            // Check 3: High error rate
            const errors = recentRequests.filter(r => r.statusCode >= 400).length;
            if (errors / recentRequests.length > 0.5) {
                console.warn('[ZERO_TRUST] Unusual error rate detected');
                this.reportAnomaly('high_error_rate', {
                    errorPercentage: (errors / recentRequests.length * 100).toFixed(1),
                });
            }
        },

        /**
         * Report anomaly to backend
         */
        reportAnomaly(anomalyType, details) {
            try {
                navigator.sendBeacon('/api/security/anomaly', JSON.stringify({
                    type: anomalyType,
                    details,
                    timestamp: Date.now(),
                }));
            } catch (error) {
                console.error('[ZERO_TRUST] Anomaly report failed:', error);
            }
        },
    };

    // ════════════════════════════════════════════════════════════════════════════
    // 4. INITIALIZATION
    // ════════════════════════════════════════════════════════════════════════════

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            ZeroTrustInterceptor.init();
        });
    } else {
        ZeroTrustInterceptor.init();
    }

    // Expose public API
    global.__zeroTrust = {
        getFingerprint: () => ZeroTrustInterceptor.deviceFingerprint,
        submitMFA: (challengeId, code) => ZeroTrustInterceptor.submitMFACode(challengeId, code),
        logRequest: (method, endpoint, time, status) => BehaviorMonitor.logRequest(method, endpoint, time, status),
    };

})(typeof window !== 'undefined' ? window : global);
