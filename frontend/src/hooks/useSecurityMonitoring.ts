import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import * as securityService from '../services/securityService';

interface SecurityEvent {
    id: string;
    type: string;
    detail: string;
    url?: string;
    ip: string;
    ua?: string;
    ts: string;
}

interface SecurityStats {
    total_events: number;
    critical_events: number;
    unique_ips: number;
    events_by_type: Record<string, number>;
}

interface UseSecurityMonitoringReturn {
    events: SecurityEvent[];
    stats: SecurityStats | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
    startMonitoring: () => void;
    stopMonitoring: () => void;
    isMonitoring: boolean;
}

/**
 * Hook for real-time security monitoring with auto-refresh capability
 * @param autoStart - Whether to start monitoring automatically
 * @param interval - Polling interval in milliseconds (default: 5000ms)
 * @returns Security monitoring state and controls
 */
export const useSecurityMonitoring = (
    autoStart = true,
    interval = 5000
): UseSecurityMonitoringReturn => {
    const [events, setEvents] = useState<SecurityEvent[]>([]);
    const [stats, setStats] = useState<SecurityStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [isMonitoring, setIsMonitoring] = useState(autoStart);
    const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch security data
    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [logsRes, statsRes] = await Promise.all([
                securityService.getSecurityLog(),
                securityService.getSecurityStats(),
            ]);

            setEvents(logsRes.data || []);
            setStats(statsRes.data || null);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to fetch security data');
            setError(error);
            console.error('Security monitoring error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Start monitoring
    const startMonitoring = useCallback(() => {
        if (isMonitoring) return; // Already monitoring

        setIsMonitoring(true);
        refresh(); // Fetch immediately

        intervalIdRef.current = setInterval(() => {
            refresh();
        }, interval);
    }, [isMonitoring, interval, refresh]);

    // Stop monitoring
    const stopMonitoring = useCallback(() => {
        setIsMonitoring(false);

        if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
        }
    }, []);

    // Auto-start monitoring
    useEffect(() => {
        if (autoStart) {
            startMonitoring();
        }

        return () => {
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
            }
        };
    }, [autoStart, startMonitoring]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
            }
        };
    }, []);

    return {
        events,
        stats,
        loading,
        error,
        refresh,
        startMonitoring,
        stopMonitoring,
        isMonitoring,
    };
};

/**
 * Hook to get critical events with automatic filtering
 * @returns Filtered critical events
 */
export const useCriticalSecurityEvents = (allEvents: SecurityEvent[]) => {
    return allEvents.filter(event => {
        const riskLevel = securityService.getRiskLevel(event.type);
        return riskLevel === 'critical' || riskLevel === 'high';
    });
};

/**
 * Hook to get event statistics by type
 * @returns Event counts by type
 */
export const useSecurityEventStats = (allEvents: SecurityEvent[]) => {
    return useMemo(() => {
        const counts: Record<string, number> = {};

        allEvents.forEach(event => {
            counts[event.type] = (counts[event.type] || 0) + 1;
        });

        return counts;
    }, [allEvents]);
};

/**
 * Hook to get top attacking IPs
 * @returns Top attacking IPs with counts
 */
export const useTopAttackingIPs = (allEvents: SecurityEvent[], limit = 10) => {
    const [topIPs, setTopIPs] = useState<Array<{ ip: string; count: number }>>([]);

    useEffect(() => {
        const ipCounts: Record<string, number> = {};

        allEvents.forEach(event => {
            ipCounts[event.ip] = (ipCounts[event.ip] || 0) + 1;
        });

        const sorted = Object.entries(ipCounts)
            .map(([ip, count]) => ({ ip, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);

        setTopIPs(sorted);
    }, [allEvents, limit]);

    return topIPs;
};
