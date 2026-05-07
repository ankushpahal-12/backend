
import express from 'express';
import rateLimit from 'express-rate-limit';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

const MAX_LOG = 500;
const securityLog = [];

// Rate-limit the public security event endpoint to prevent log-flooding attacks.
// Without this, any actor on the internet can fill the ring buffer with fake events.
const secEventLimit = rateLimit({
    windowMs: 60 * 1000,   // 1 minute
    max: 30,               // 30 events per IP per minute is generous for legitimate use
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'error', message: 'Too many security events from this IP' },
});

// POST /api/security/event
router.post('/event', secEventLimit, (req, res) => {
    const { type, detail, url, ua, ts } = req.body || {};

    if (!type || typeof type !== 'string') {
        return res.status(400).json({ status: 'fail', message: 'Missing event type' });
    }

    const entry = {
        type: String(type).slice(0, 64),
        detail: String(detail || '').slice(0, 256),
        url: String(url || '').slice(0, 256),
        ua: String(ua || '').slice(0, 200),
        // SECURITY: Ignore client-supplied timestamp — always use server time.
        // Accepting client ts allows backdating/forward-dating injected events.
        ts: new Date(),
        ip: req.ip,
        id: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };

    // Ring buffer
    if (securityLog.length >= MAX_LOG) securityLog.shift();
    securityLog.push(entry);

    // Flag high-severity events
    const HIGH_SEVERITY = ['automation_detected', 'dom_injection', 'csp_violation'];
    if (HIGH_SEVERITY.includes(entry.type)) {
        console.warn(`[SECURITY HIGH] ${entry.type} | ${entry.detail} | IP: ${entry.ip} | UA: ${entry.ua.slice(0, 60)}`);
    } else {
        console.info(`[SECURITY] ${entry.type} | ${entry.detail} | ${entry.ip}`);
    }

    // sendBeacon expects 204 or a small response
    res.status(204).end();
});

// GET /api/security/log (admin-only)
// Returns last 100 security events
// Protected: Requires authentication AND admin role
router.get('/log', protect, restrictTo('admin'), (req, res) => {
    res.status(200).json({
        status: 'success',
        count: securityLog.length,
        data: securityLog.slice(-100), // last 100 events
        timestamp: new Date().toISOString(),
        message: 'Security log accessed by admin user',
    });
});

// GET /api/security/stats (admin-only)
// Returns aggregated security statistics
router.get('/stats', protect, restrictTo('admin'), (req, res) => {
    const stats = {
        total_events: securityLog.length,
        events_by_type: {},
        unique_ips: new Set(),
        critical_events: 0,
    };

    const HIGH_SEVERITY = ['automation_detected', 'dom_injection', 'csp_violation', 'signature_mismatch'];

    securityLog.forEach(event => {
        // Count by type
        stats.events_by_type[event.type] = (stats.events_by_type[event.type] || 0) + 1;
        
        // Track unique IPs
        stats.unique_ips.add(event.ip);
        
        // Count critical events
        if (HIGH_SEVERITY.includes(event.type)) {
            stats.critical_events++;
        }
    });

    res.status(200).json({
        status: 'success',
        data: {
            ...stats,
            unique_ips: stats.unique_ips.size,
        },
        timestamp: new Date().toISOString(),
    });
});

// ════════════════════════════════════════════════════════════════════════════
// AUDIT LOG ENDPOINT (NEW)
// Used by frontend security wrappers to log security events
// ════════════════════════════════════════════════════════════════════════════
const auditLogLimit = rateLimit({
    windowMs: 60 * 1000,   // 1 minute
    max: 100,              // 100 audit log entries per IP per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'error', message: 'Too many audit log entries' },
});

router.post('/audit-log', auditLogLimit, (req, res) => {
    try {
        const { eventType, details, timestamp, pageUrl, userAgent, userId, ipAddress } = req.body || {};

        // Validate required fields
        if (!eventType || typeof eventType !== 'string') {
            return res.status(400).json({ 
                status: 'fail', 
                message: 'Missing or invalid event type' 
            });
        }

        const auditEntry = {
            eventType: String(eventType).slice(0, 64),
            userId: userId || 'anonymous',
            ipAddress: ipAddress || req.ip || 'unknown',
            pageUrl: String(pageUrl || '').slice(0, 256),
            userAgent: String(userAgent || '').slice(0, 200),
            details: details || {},
            serverTimestamp: new Date(),
            clientTimestamp: timestamp || new Date(),
            id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        };

        // Add to ring buffer
        if (securityLog.length >= MAX_LOG) securityLog.shift();
        securityLog.push(auditEntry);

        // Log high-severity events
        const HIGH_SEVERITY = ['UNAUTHORIZED_ACCESS_ATTEMPT', 'SESSION_EXPIRED', 'DEVICE_MISMATCH', 'SUSPICIOUS_ACTIVITY_DETECTED'];
        if (HIGH_SEVERITY.includes(eventType)) {
            console.warn(`[AUDIT] ${eventType} | User: ${userId} | IP: ${auditEntry.ipAddress} | Page: ${pageUrl}`);
        } else {
            console.info(`[AUDIT] ${eventType} | User: ${userId} | Page: ${pageUrl}`);
        }

        res.status(200).json({
            status: 'success',
            message: 'Audit log entry recorded',
            id: auditEntry.id,
        });
    } catch (error) {
        console.error('[AUDIT] Error recording audit log:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to record audit log entry',
        });
    }
});

export default router;
