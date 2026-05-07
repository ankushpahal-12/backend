/**
 * useZeroTrust Hook
 * Provides access to Zero Trust functionality from React components
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import api from '../utils/api';

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// Exported type definitions
export interface MFAChallengeDialogProps {
    isOpen: boolean;
    challengeId: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    onSubmit?: (code: string) => void;
    onCancel?: () => void;
}

export interface MFAChallengeDetail {
    mfaChallengeId: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    message?: string;
}

export interface RiskSummary {
    overallRiskLevel: string;
    deviceMetrics: {
        totalDevices: number;
        trustedDevices: number;
        compromisedDevices: number;
        averageTrustScore: number;
    };
    behaviorMetrics: {
        recentRequests: number;
        criticalAnomalies: number;
        highRiskRequests: number;
    };
    recommendations: string[];
}

export interface Device {
    id: string;
    fingerprint: string;
    userAgent: string;
    trustScore: number;
    ips: string[];
    lastSeen: string;
}

interface ZeroTrustClient {
    getFingerprint(): string;
    __zeroTrust?: ZeroTrustClient;
}

/**
 * Hook for Zero Trust operations
 * @returns {Object} Zero Trust operations and state
 */
export const useZeroTrust = () => {
    const [deviceFingerprint, setDeviceFingerprint] = useState<string | null>(null);
    const [trustStatus, setTrustStatus] = useState<'pending' | 'trusted' | 'untrusted'>('pending');
    const [riskLevel, setRiskLevel] = useState<RiskLevel>('low');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Dashboard state
    const [riskSummary, setRiskSummary] = useState<RiskSummary | null>(null);
    const [trustedDevices, setTrustedDevices] = useState<Device[]>([]);
    const [dashboardLoading, setDashboardLoading] = useState(false);
    const [dashboardError, setDashboardError] = useState<string | null>(null);
    
    const isMountedRef = useRef(true);
    const fingerprintRef = useRef<string | null>(null);

    // Get device fingerprint
    useEffect(() => {
        const getFingerprint = async () => {
            // Wait for zero-trust-client.js to load
            const windowWithZeroTrust = window as Window & { __zeroTrust?: ZeroTrustClient };
            if (typeof window !== 'undefined' && windowWithZeroTrust.__zeroTrust) {
                const fingerprint = windowWithZeroTrust.__zeroTrust.getFingerprint();
                if (isMountedRef.current) {
                    setDeviceFingerprint(fingerprint);
                }
            } else {
                // Try again in 1 second
                const timer = setTimeout(getFingerprint, 1000);
                return () => clearTimeout(timer);
            }
        };

        getFingerprint();

        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Check device trust status
    const checkTrustStatus = useCallback(async () => {
        const fingerprint = fingerprintRef.current || deviceFingerprint;
        if (!fingerprint) return;

        setLoading(true);
        setError(null);

        try {
            const response = await api.get(`/devices/trust-status?fingerprint=${encodeURIComponent(fingerprint)}`);
            const data = response.data;

            if (isMountedRef.current) {
                if (data.trusted) {
                    setTrustStatus('trusted');
                    setRiskLevel('low');
                } else {
                    setTrustStatus('untrusted');
                    setRiskLevel(data.riskLevel || 'medium');
                }
            }
        } catch (err) {
            if (isMountedRef.current) {
                setError(err instanceof Error ? err.message : 'Failed to check trust status');
                setTrustStatus('untrusted');
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, [deviceFingerprint]);

    // Trust current device
    const trustDevice = useCallback(async () => {
        const fingerprint = fingerprintRef.current || deviceFingerprint;
        if (!fingerprint) return false;

        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/devices/trust', { deviceFingerprint: fingerprint });
            if (response.status < 200 || response.status >= 300) {
                throw new Error('Failed to trust device');
            }

            if (isMountedRef.current) {
                setTrustStatus('trusted');
                setRiskLevel('low');
            }
            return true;
        } catch (err) {
            if (isMountedRef.current) {
                setError(err instanceof Error ? err.message : 'Failed to trust device');
            }
            return false;
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, [deviceFingerprint]);

    // Get trusted devices
    const getTrustedDevices = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get('/devices/trusted');
            if (response.status === 200) {
                return response.data.devices;
            } else {
                throw new Error('Failed to fetch devices');
            }
        } catch (err) {
            if (isMountedRef.current) {
                setError(err instanceof Error ? err.message : 'Failed to fetch devices');
            }
            return [];
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, []);

    // Revoke device trust
    const revokeDeviceTrust = useCallback(async (deviceId: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.delete(`/devices/trust/${deviceId}`);

            if (response.status === 200 || response.status === 204) {
                return true;
            } else {
                throw new Error('Failed to revoke device');
            }
        } catch (err) {
            if (isMountedRef.current) {
                setError(err instanceof Error ? err.message : 'Failed to revoke device');
            }
            return false;
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, []);

    // Get risk summary
    const getRiskSummary = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get('/security/risk-summary');
            if (response.status !== 200) {
                throw new Error('Failed to fetch risk summary');
            }
            const data = response.data;
            
            // Update risk level from summary
            if (isMountedRef.current && data.riskSummary?.overallRiskLevel) {
                setRiskLevel(data.riskSummary.overallRiskLevel as RiskLevel);
            }
            
            return data.riskSummary;
        } catch (err) {
            if (isMountedRef.current) {
                setError(err instanceof Error ? err.message : 'Failed to fetch risk summary');
            }
            return null;
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, []);

    // Verify MFA code
    const verifyMFA = useCallback(async (challengeId: string, code: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/devices/auth/verify-mfa', {
                mfaChallengeId: challengeId,
                mfaCode: code,
            });

            if (response.status >= 200 && response.status < 300) {
                return true;
            } else {
                throw new Error('Failed to verify MFA');
            }
        } catch (err) {
            if (isMountedRef.current) {
                setError(err instanceof Error ? err.message : 'Failed to verify MFA');
            }
            return false;
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, []);

    // Subscribe to MFA challenges
    const onMFARequired = useCallback((callback: (data: Record<string, unknown>) => void) => {
        const handler = (event: Event) => {
            callback((event as CustomEvent).detail);
        };

        window.addEventListener('zeroTrust:mfaRequired', handler);

        return () => {
            window.removeEventListener('zeroTrust:mfaRequired', handler);
        };
    }, []);

    // Subscribe to anomalies
    const onAnomalyDetected = useCallback((callback: (data: Record<string, unknown>) => void) => {
        const handler = (event: Event) => {
            callback((event as CustomEvent<Record<string, unknown>>).detail);
        };

        window.addEventListener('zeroTrust:anomaly', handler);

        return () => {
            window.removeEventListener('zeroTrust:anomaly', handler);
        };
    }, []);

    // Fetch risk summary for dashboard
    const fetchRiskSummary = useCallback(async () => {
        setDashboardLoading(true);
        setDashboardError(null);

        try {
            const response = await api.get('/security/risk-summary');
            if (response.status !== 200) {
                throw new Error('Failed to fetch risk summary');
            }
            const data = response.data;
            
            if (isMountedRef.current) {
                setRiskSummary(data.riskSummary);
                // Update overall risk level
                if (data.riskSummary?.overallRiskLevel) {
                    setRiskLevel(data.riskSummary.overallRiskLevel as RiskLevel);
                }
            }
        } catch (err) {
            if (isMountedRef.current) {
                setDashboardError(err instanceof Error ? err.message : 'Failed to fetch risk summary');
            }
        } finally {
            if (isMountedRef.current) {
                setDashboardLoading(false);
            }
        }
    }, []);

    // Fetch trusted devices for device management
    const fetchTrustedDevices = useCallback(async () => {
        setDashboardLoading(true);
        setDashboardError(null);

        try {
            const response = await api.get('/devices/trusted');
            if (response.status !== 200) {
                throw new Error('Failed to fetch devices');
            }
            const data = response.data;
            
            if (isMountedRef.current) {
                setTrustedDevices(data.devices || []);
            }
        } catch (err) {
            if (isMountedRef.current) {
                setDashboardError(err instanceof Error ? err.message : 'Failed to fetch devices');
            }
        } finally {
            if (isMountedRef.current) {
                setDashboardLoading(false);
            }
        }
    }, []);

    // Revoke a trusted device
    const revokeDevice = useCallback(async (deviceId: string) => {
        setDashboardLoading(true);
        setDashboardError(null);

        try {
            const response = await api.delete(`/devices/trust/${deviceId}`);

            if (!(response.status === 200 || response.status === 204)) {
                throw new Error('Failed to revoke device');
            }

            if (isMountedRef.current) {
                setTrustedDevices(prev => prev.filter(d => d.id !== deviceId));
            }
            return true;
        } catch (err) {
            if (isMountedRef.current) {
                setDashboardError(err instanceof Error ? err.message : 'Failed to revoke device');
            }
            return false;
        } finally {
            if (isMountedRef.current) {
                setDashboardLoading(false);
            }
        }
    }, []);

    // Helper: Get risk color class
    const getRiskColorClass = useCallback((level: string): string => {
        switch (level) {
            case 'critical': return 'bg-red-100 text-red-900 border-red-300';
            case 'high': return 'bg-orange-100 text-orange-900 border-orange-300';
            case 'medium': return 'bg-yellow-100 text-yellow-900 border-yellow-300';
            default: return 'bg-green-100 text-green-900 border-green-300';
        }
    }, []);

    // Helper: Get trust badge color class
    const getTrustBadgeColorClass = useCallback((score: number): string => {
        if (score >= 80) return 'bg-green-100 text-green-800';
        if (score >= 60) return 'bg-blue-100 text-blue-800';
        if (score >= 40) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    }, []);

    return {
        // State
        deviceFingerprint,
        trustStatus,
        riskLevel,
        loading,
        error,
        
        // Dashboard state
        riskSummary,
        trustedDevices,
        dashboardLoading,
        dashboardError,

        // Methods
        checkTrustStatus,
        trustDevice,
        getTrustedDevices,
        revokeDeviceTrust,
        getRiskSummary,
        verifyMFA,
        onMFARequired,
        onAnomalyDetected,
        
        // Dashboard methods
        fetchRiskSummary,
        fetchTrustedDevices,
        revokeDevice,
        getRiskColorClass,
        getTrustBadgeColorClass,
    };
};

export default useZeroTrust;
