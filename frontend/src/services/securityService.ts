import api from '../utils/api';

export interface SecurityEvent {
    id: string;
    type: string;
    detail: string;
    url?: string;
    ip: string;
    ua?: string;
    ts: string;
}

export interface SecurityStats {
    total_events: number;
    critical_events: number;
    unique_ips: number;
    events_by_type: Record<string, number>;
}

/**
 * Fetch security logs (admin only)
 */
export const getSecurityLog = async () => {
    try {
        const response = await api.get('/api/security/log');
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch security logs', { cause: error });
    }
};

/**
 * Fetch security statistics (admin only)
 */
export const getSecurityStats = async () => {
    try {
        const response = await api.get('/api/security/stats');
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch security statistics', { cause: error });
    }
};

/**
 * Report a security event from client-side
 */
export const reportSecurityEvent = async (eventType: string, detail: string) => {
    try {
        await api.post('/api/security/event', {
            type: eventType,
            detail,
        });
    } catch (error) {
        console.error('Failed to report security event:', error);
    }
};

/**
 * Get risk level for event type
 */
export const getRiskLevel = (eventType: string): 'critical' | 'high' | 'medium' | 'low' => {
    const criticalEvents = ['signature_mismatch', 'automation_detected', 'session_hijack_attempt', 'dom_injection'];
    const highEvents = ['invalid_host_header', 'proxy_chain_detected', 'rate_limit_exceeded'];
    const mediumEvents = ['csp_violation'];

    if (criticalEvents.includes(eventType)) return 'critical';
    if (highEvents.includes(eventType)) return 'high';
    if (mediumEvents.includes(eventType)) return 'medium';
    return 'low';
};

/**
 * Get human-readable event description
 */
export const getEventDescription = (eventType: string): string => {
    const descriptions: Record<string, string> = {
        signature_mismatch: 'Invalid HMAC-SHA256 Signature',
        automation_detected: 'Reverse Engineering Tool Detected',
        dom_injection: 'Suspicious DOM Modification',
        csp_violation: 'Content Security Policy Violation',
        hmac_secret_fetch_error: 'HMAC Secret Fetch Error',
        long_inactivity: 'Long Inactivity Session',
        session_hijack_attempt: 'Session Hijacking Attempt',
        rate_limit_exceeded: 'Rate Limit Exceeded',
        invalid_host_header: 'Invalid Host Header',
        proxy_chain_detected: 'Proxy Chain Injection Detected',
    };
    return descriptions[eventType] || eventType;
};
