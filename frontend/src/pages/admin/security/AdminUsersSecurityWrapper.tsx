
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Box, CircularProgress, Alert } from '@mui/material';
import api, { initializeCSRFToken } from '../../../utils/api';

interface AdminUsersSecurityWrapperProps {
    children: React.ReactNode;
}

interface SecurityCheckResult {
    valid: boolean;
    reason?: string;
    sessionValid?: boolean;
    tokenValid?: boolean;
    rateLimitOk?: boolean;
    csrfTokenValid?: boolean;
}

const AdminUsersSecurityWrapper: React.FC<AdminUsersSecurityWrapperProps> = ({ children }) => {
    const { user, isAuthenticated, logout } = useAuth();
    const location = useLocation();
    const [securityStatus, setSecurityStatus] = useState<SecurityCheckResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBlocked, setIsBlocked] = useState(false);

    const isCheckingRef = React.useRef(false);
    const lastCheckTimeRef = React.useRef<number>(0);
    const CHECK_INTERVAL_MS = 5000; // Only run check every 5 seconds max

    useEffect(() => {
        const performSecurityCheck = async () => {
            
            if (isCheckingRef.current) {
                console.log('[SecurityWrapper] Check already in progress, skipping...');
                return;
            }

            
            const now = Date.now();
            if (now - lastCheckTimeRef.current < CHECK_INTERVAL_MS) {
                console.log('[SecurityWrapper] Check too recent, skipping...');
                return;
            }

            try {
                isCheckingRef.current = true;
                lastCheckTimeRef.current = now;
                setIsLoading(true);

                
                if (!isAuthenticated || user?.role !== 'admin') {
                    console.warn('[SecurityWrapper] Unauthorized: Not authenticated or not admin');
                    setSecurityStatus({
                        valid: false,
                        reason: 'Unauthorized access attempt: Not an admin user',
                    });
                    await logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', {
                        reason: 'Non-admin user attempted to access admin users page',
                        userId: user?._id,
                        role: user?.role,
                    }).catch(() => {}); 
                    logout();
                    return;
                }

                
                try {
                    const sessionResponse = await Promise.race([
                        api.post('/auth/validate-session', {}),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('Timeout')), 3000)
                        ),
                    ]);
                    
                    if ((sessionResponse as any).status !== 200) {
                        throw new Error('Session validation returned non-200');
                    }
                    console.log('[SecurityWrapper] Session validation passed');
                } catch (error) {
                    console.error('[SecurityWrapper] Session validation failed:', error);
                    setSecurityStatus({
                        valid: false,
                        reason: 'Session expired. Please login again.',
                        sessionValid: false,
                    });
                    await logSecurityEvent('SESSION_EXPIRED', {
                        userId: user?._id,
                        timestamp: new Date(),
                        error: String(error),
                    }).catch(() => {}); // Ignore audit log errors
                    logout();
                    return;
                }

                // 3. Check rate limiting via API (server-side protection)
                try {
                    const rateLimitResponse = await Promise.race([
                        api.post('/auth/check-rate-limit', { 
                            page: 'admin_users',
                            userId: user?._id 
                        }),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('Timeout')), 3000)
                        ),
                    ]);
                    
                    const rateLimitData = (rateLimitResponse as any).data;
                    if (!rateLimitData.allowed) {
                        console.warn('[SecurityWrapper] Rate limit exceeded');
                        setSecurityStatus({
                            valid: false,
                            reason: 'Rate limit exceeded. Too many access attempts.',
                            rateLimitOk: false,
                        });
                        await logSecurityEvent('RATE_LIMIT_EXCEEDED', {
                            userId: user?._id,
                            accessCount: rateLimitData.accessCount,
                            timeWindow: '1 minute',
                        }).catch(() => {}); // Ignore audit log errors
                        setIsBlocked(true);
                        return;
                    }
                } catch (error) {
                    console.error('[SecurityWrapper] Rate limit check failed:', error);
                    setSecurityStatus({
                        valid: false,
                        reason: 'Security check error. Please try again.',
                        rateLimitOk: false,
                    });
                    return;
                }

                // 4. Verify CSRF token exists (initialize if missing)
                let csrfToken = sessionStorage.getItem('csrf-token');
                if (!csrfToken) {
                    console.log('[SecurityWrapper] CSRF token missing, attempting to initialize...');
                    try {
                        await initializeCSRFToken();
                        csrfToken = sessionStorage.getItem('csrf-token');
                    } catch (error) {
                        console.error('[SecurityWrapper] Failed to initialize CSRF token:', error);
                    }
                }

                if (!csrfToken) {
                    console.warn('[SecurityWrapper] CSRF token missing');
                    setSecurityStatus({
                        valid: false,
                        reason: 'CSRF protection error. Please refresh the page.',
                        csrfTokenValid: false,
                    });
                    return;
                }

                // 5. Device fingerprinting (optional - don't fail on error)
                try {
                    const deviceFingerprint = await getDeviceFingerprint();
                    const storedDeviceFingerprint = sessionStorage.getItem('device_fingerprint');

                    if (storedDeviceFingerprint && storedDeviceFingerprint !== deviceFingerprint) {
                        console.warn('[SecurityWrapper] Device mismatch detected');
                        await logSecurityEvent('DEVICE_MISMATCH', {
                            userId: user?._id,
                            storedFingerprint: storedDeviceFingerprint?.substring(0, 10),
                            currentFingerprint: deviceFingerprint?.substring(0, 10),
                        }).catch(() => {}); // Ignore audit log errors
                        logout();
                        return;
                    } else {
                        sessionStorage.setItem('device_fingerprint', deviceFingerprint);
                    }
                } catch (error) {
                    console.warn('[SecurityWrapper] Device fingerprinting failed (non-critical):', error);
                    // Don't fail on device fingerprinting errors
                }

                // 6. Log successful access
                await logSecurityEvent('ADMIN_USERS_PAGE_ACCESS', {
                    userId: user?._id,
                    timestamp: new Date(),
                    ipAddress: await getClientIP(),
                }).catch(() => {}); // Ignore audit log errors

                console.log('[SecurityWrapper] All checks passed ✓');
                // All security checks passed
                setSecurityStatus({ valid: true });
            } catch (error) {
                console.error('[SecurityWrapper] Unexpected error during security check:', error);
                // Don't logout on unexpected errors - just show error state
                setSecurityStatus({
                    valid: false,
                    reason: 'Security check error. Please try again.',
                });
            } finally {
                isCheckingRef.current = false;
                setIsLoading(false);
            }
        };

        // ✅ Only run check when authentication state changes, not on every re-render
        if (isAuthenticated) {
            performSecurityCheck();
        }
    }, [isAuthenticated]);

    // Helper: Get client IP address (cached in localStorage)
    const getClientIP = async (): Promise<string> => {
        try {
            // Fetch IP from backend endpoint (backend handles caching)
            const response = await Promise.race([
                api.get('/auth/client-ip'),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout')), 3000)
                ),
            ]);
            const data = (response as any).data;
            return data.ip || 'unknown';
        } catch (error) {
            console.warn('[SecurityWrapper] Failed to get client IP:', error);
            return 'unknown';
        }
    };

    // Helper: Generate device fingerprint
    const getDeviceFingerprint = async (): Promise<string> => {
        const navProps = navigator as Record<string, any>;
        const components = [
            navigator.userAgent,
            navigator.language,
            navigator.hardwareConcurrency || 'unknown',
            navProps.deviceMemory || 'unknown',
            new Date().getTimezoneOffset(),
            window.innerWidth + 'x' + window.innerHeight,
        ];

        const fingerprint = components.join('|');
        const encoder = new TextEncoder();
        const data = encoder.encode(fingerprint);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    };

    // Helper: Log security events
    const logSecurityEvent = async (
        eventType: string,
        details: Record<string, any>
    ): Promise<void> => {
        try {
            await api.post('/security/audit-log', {
                eventType,
                details,
                timestamp: new Date(),
                pageUrl: location.pathname,
                userAgent: navigator.userAgent,
                userId: user?._id, // Pass userId at top level
                ipAddress: details.ipAddress, // Pass ipAddress at top level
            });
        } catch (error) {
            console.error('Failed to log security event:', error);
        }
    };

    // Show loading state
    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    bgcolor: '#f5f7fb',
                }}
            >
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress />
                    <Box sx={{ mt: 2, color: '#64748b' }}>
                        Performing security checks...
                    </Box>
                </Box>
            </Box>
        );
    }

    // Security check failed
    if (!securityStatus?.valid) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fb', p: 3 }}>
                <Box sx={{ maxWidth: 600, mx: 'auto', mt: 10 }}>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {securityStatus?.reason || 'Access denied. Security check failed.'}
                    </Alert>
                    {isBlocked && (
                        <Alert severity="warning">
                            Your access has been temporarily restricted due to suspicious activity. Please
                            try again in a few moments or contact support if the issue persists.
                        </Alert>
                    )}
                </Box>
            </Box>
        );
    }

    // Security check passed, render children
    return <>{children}</>;
};

export default AdminUsersSecurityWrapper;
