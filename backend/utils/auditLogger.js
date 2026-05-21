import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import * as UAParser from 'ua-parser-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUDIT_LOG_DIR = path.join(__dirname, '../logs');
const AUDIT_LOG_FILE = path.join(AUDIT_LOG_DIR, 'audit.log');

// Ensure log directory exists
await fs.mkdir(AUDIT_LOG_DIR, { recursive: true }).catch(err => {
    if (err.code !== 'EEXIST') console.error('Failed to create log directory:', err);
});

/**
 * Extract audit context from request
 * Supports both authenticated users and unauthenticated test attempt users
 */
export function extractAuditContext(req) {
    const userId = req.user?.id || req.testAttempt?.userId || 'unknown';
    const userEmail = req.user?.email || req.testAttempt?.email || 'unknown';
    
    // Parse user agent for device info
    const ua = req.headers['user-agent'] || '';
    const parser = new UAParser(ua);
    const uaResult = parser.getResult();

    const browser = `${uaResult.browser.name || 'Unknown'} ${uaResult.browser.version || ''}`.trim();
    const os = `${uaResult.os.name || 'Unknown'} ${uaResult.os.version || ''}`.trim();
    
    // Extract client IP
    const ip = (req.headers['x-forwarded-for']?.split(',')[0] || 
                req.connection?.remoteAddress || 
                req.socket?.remoteAddress || 
                '').trim() || 'unknown';
    
    // Calculate device fingerprint
    const deviceFingerprint = generateDeviceFingerprint(ua);
    
    // Risk assessment
    const riskLevel = assessRiskLevel(ua, ip);
    
    return {
        userId,
        userEmail,
        riskLevel,
        deviceFingerprint,
        browser,
        os,
        ip,
        userAgent: ua
    };
}

/**
 * Generate device fingerprint based on user agent
 */
function generateDeviceFingerprint(userAgent) {
    if (!userAgent) return 'unknown';
    return crypto.createHash('sha256').update(userAgent).digest('hex').substring(0, 16);
}

/**
 * Assess risk level based on request characteristics
 */
function assessRiskLevel(userAgent, ip) {
    let riskScore = 0;
    
    // Check for missing user agent (suspicious)
    if (!userAgent) riskScore += 20;
    
    // Check for bot/automation tools
    const botPatterns = /bot|crawler|spider|scraper|automation|selenium|puppeteer|playwright|headless|phantomjs|curl|wget|python|java(?!script)/i;
    if (botPatterns.test(userAgent)) {
        riskScore += 30;
    }
    
    // Check IP reputation (simple check - in production, use external service)
    if (isPrivateIP(ip)) riskScore += 5;
    
    // Determine risk level
    if (riskScore >= 50) return 'high';
    if (riskScore >= 20) return 'medium';
    return 'low';
}

/**
 * Check if IP is private/internal
 */
function isPrivateIP(ip) {
    if (ip === 'unknown' || !ip) return true;
    const privateRanges = [
        /^127\./, /^10\./, /^172\.(1[6-9]|2[0-9]|3[01])\./, /^192\.168\./, /^::1/, /^fc[0-9a-f]{2}:/i
    ];
    return privateRanges.some(range => range.test(ip));
}

/**
 * Log security and audit events
 * @param {Object} event - Event to log
 * @param {string} event.method - HTTP method
 * @param {string} event.path - Request path
 * @param {string} event.ip - Client IP
 * @param {string} event.userId - User ID
 * @param {number} event.statusCode - HTTP status code
 * @param {string} event.timestamp - ISO timestamp
 * @param {string} [event.riskLevel] - Risk level (low/medium/high/critical)
 * @param {string} [event.deviceFingerprint] - Device fingerprint
 * @param {string} [event.action] - Action performed (login, mfa_verify, device_trust, etc.)
 * @param {object} [event.details] - Additional details
 */
export async function auditLog(event) {
    try {
        const logEntry = {
            timestamp: event.timestamp || new Date().toISOString(),
            method: event.method,
            path: event.path,
            ip: event.ip,
            userId: event.userId || 'unknown',
            statusCode: event.statusCode,
            riskLevel: event.riskLevel || 'unknown',
            deviceFingerprint: event.deviceFingerprint ? event.deviceFingerprint.substring(0, 16) : 'unknown',
            action: event.action || 'request',
            details: event.details || {},
        };

        // Format for file logging
        const logLine = JSON.stringify(logEntry) + '\n';

        // Append to audit log file
        await fs.appendFile(AUDIT_LOG_FILE, logLine, 'utf8');

        // Also log critical events to console
        if (logEntry.statusCode >= 400 || logEntry.riskLevel === 'critical') {
            console.warn(`[AUDIT] ${logEntry.method} ${logEntry.path} - User: ${logEntry.userId} - Status: ${logEntry.statusCode} - Risk: ${logEntry.riskLevel}`);
        }
    } catch (error) {
        console.error('Failed to write audit log:', error);
    }
}

/**
 * Retrieve recent audit logs
 * @param {number} lines - Number of recent lines to retrieve
 * @returns {Promise<Array>} Array of parsed log entries
 */
export async function getRecentAuditLogs(lines = 100) {
    try {
        const content = await fs.readFile(AUDIT_LOG_FILE, 'utf8');
        const allLines = content.trim().split('\n').filter(line => line.length > 0);
        const recentLines = allLines.slice(-lines);
        return recentLines.map(line => {
            try {
                return JSON.parse(line);
            } catch {
                return null;
            }
        }).filter(Boolean);
    } catch (error) {
        console.error('Failed to read audit logs:', error);
        return [];
    }
}

/**
 * Get audit logs for a specific user
 * @param {string} userId - User ID to filter by
 * @param {number} days - Number of days to look back (default: 7)
 * @returns {Promise<Array>} Array of audit logs for the user
 */
export async function getUserAuditLogs(userId, days = 7) {
    try {
        const content = await fs.readFile(AUDIT_LOG_FILE, 'utf8');
        const allLines = content.trim().split('\n').filter(line => line.length > 0);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return allLines
            .map(line => {
                try {
                    return JSON.parse(line);
                } catch {
                    return null;
                }
            })
            .filter(entry => 
                entry && 
                entry.userId === userId && 
                new Date(entry.timestamp) > cutoffDate
            );
    } catch (error) {
        console.error('Failed to read user audit logs:', error);
        return [];
    }
}

/**
 * Get suspicious activities (failed logins, high-risk operations, etc.)
 * @param {number} minutes - Look back window in minutes
 * @returns {Promise<Array>} Array of suspicious activities
 */
export async function getSuspiciousActivities(minutes = 60) {
    try {
        const content = await fs.readFile(AUDIT_LOG_FILE, 'utf8');
        const allLines = content.trim().split('\n').filter(line => line.length > 0);
        const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);

        return allLines
            .map(line => {
                try {
                    return JSON.parse(line);
                } catch {
                    return null;
                }
            })
            .filter(entry => 
                entry && 
                new Date(entry.timestamp) > cutoffTime && 
                (entry.statusCode >= 400 || entry.riskLevel === 'critical' || entry.riskLevel === 'high')
            );
    } catch (error) {
        console.error('Failed to get suspicious activities:', error);
        return [];
    }
}

export default { auditLog, getRecentAuditLogs, getUserAuditLogs, getSuspiciousActivities };
