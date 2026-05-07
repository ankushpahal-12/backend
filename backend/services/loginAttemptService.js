/**
 * Login Attempt Service
 * 
 * Tracks and analyzes login attempts for security monitoring
 * - Logs all login attempts
 * - Detects suspicious patterns (brute force, impossible travel)
 * - Generates security alerts
 */

import LoginAttempt from '../models/LoginAttempt.js';

/**
 * Log a login attempt
 */
export const logLoginAttempt = async ({
    userId,
    email,
    ipAddress,
    userAgent,
    status,
    failureReason,
    deviceFingerprint,
}) => {
    try {
        const attempt = await LoginAttempt.create({
            userId: userId || undefined,
            email,
            ipAddress,
            userAgent,
            status,
            failureReason,
            deviceFingerprint,
            timestamp: new Date(),
        });

        return attempt;
    } catch (err) {
        console.error('Failed to log login attempt:', err);
        // Don't throw - logging should not break authentication
    }
};

/**
 * Detect brute force attack
 * Returns true if more than 10 failed attempts in last 15 minutes
 */
export const detectBruteForce = async (email, ipAddress, minutes = 15) => {
    try {
        const timeWindow = new Date(Date.now() - minutes * 60 * 1000);

        // Count failed attempts from this IP
        const failedFromIP = await LoginAttempt.countDocuments({
            ipAddress,
            status: { $in: ['failed', 'locked'] },
            timestamp: { $gte: timeWindow },
        });

        // Count failed attempts for this email
        const failedForEmail = await LoginAttempt.countDocuments({
            email,
            status: { $in: ['failed', 'locked'] },
            timestamp: { $gte: timeWindow },
        });

        return {
            isAttack: failedFromIP > 10 || failedForEmail > 10,
            failedFromIP,
            failedForEmail,
        };
    } catch (err) {
        console.error('Error detecting brute force:', err);
        return { isAttack: false, failedFromIP: 0, failedForEmail: 0 };
    }
};

/**
 * Detect impossible travel
 * Returns true if user logged in from 2+ countries in < time span
 */
export const detectImpossibleTravel = async (userId, maxMinutes = 60) => {
    try {
        if (!userId) return { isImpossible: false };

        const recentAttempts = await LoginAttempt.find({
            userId,
            status: 'success',
            timestamp: { $gte: new Date(Date.now() - maxMinutes * 60 * 1000) },
        })
            .sort({ timestamp: -1 })
            .limit(2);

        if (recentAttempts.length < 2) {
            return { isImpossible: false };
        }

        // Simple check: different IPs in short time frame
        const uniqueIPs = new Set(recentAttempts.map((a) => a.ipAddress));

        return {
            isImpossible: uniqueIPs.size > 1,
            ips: Array.from(uniqueIPs),
        };
    } catch (err) {
        console.error('Error detecting impossible travel:', err);
        return { isImpossible: false };
    }
};

/**
 * Get login history for user
 */
export const getLoginHistory = async (userId, limit = 10) => {
    try {
        return await LoginAttempt.find({ userId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .select('-__v');
    } catch (err) {
        console.error('Error fetching login history:', err);
        return [];
    }
};

/**
 * Get suspicious IPs (multiple failed logins)
 */
export const getSuspiciousIPs = async (minutesBack = 60, threshold = 20) => {
    try {
        const timeWindow = new Date(Date.now() - minutesBack * 60 * 1000);

        const results = await LoginAttempt.aggregate([
            {
                $match: {
                    timestamp: { $gte: timeWindow },
                    status: { $in: ['failed', 'locked'] },
                },
            },
            {
                $group: {
                    _id: '$ipAddress',
                    count: { $sum: 1 },
                    emails: { $push: '$email' },
                    lastAttempt: { $max: '$timestamp' },
                },
            },
            {
                $match: { count: { $gte: threshold } },
            },
            {
                $sort: { count: -1 },
            },
        ]);

        return results;
    } catch (err) {
        console.error('Error fetching suspicious IPs:', err);
        return [];
    }
};

/**
 * Generate security report
 */
export const generateSecurityReport = async (hours = 24) => {
    try {
        const timeWindow = new Date(Date.now() - hours * 60 * 60 * 1000);

        const stats = await LoginAttempt.aggregate([
            {
                $match: { timestamp: { $gte: timeWindow } },
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const uniqueUsers = await LoginAttempt.distinct('userId', {
            timestamp: { $gte: timeWindow },
            status: 'success',
        });

        const uniqueIPs = await LoginAttempt.distinct('ipAddress', {
            timestamp: { $gte: timeWindow },
        });

        return {
            period: `Last ${hours} hours`,
            timeWindow: { start: timeWindow, end: new Date() },
            statistics: stats,
            uniqueUsers: uniqueUsers.length,
            uniqueIPs: uniqueIPs.length,
        };
    } catch (err) {
        console.error('Error generating security report:', err);
        return null;
    }
};

export default {
    logLoginAttempt,
    detectBruteForce,
    detectImpossibleTravel,
    getLoginHistory,
    getSuspiciousIPs,
    generateSecurityReport,
};
