/**
 * Auto-Logout Middleware
 * Automatically invalidates sessions on suspicious activity
 * Triggers forced re-authentication for security
 */

import AuthSession from '../models/AuthSession.js';
import User from '../models/User.js';

/**
 * Track suspicious activity patterns
 * Invalidates session if critical behavior detected
 */
export const autoLogoutOnSuspiciousActivity = async (req, res, next) => {
    try {
        // Skip if no session
        if (!req.session || !req.user) {
            return next();
        }

        const userId = req.user.id;
        const sessionId = req.sessionID || req.cookies?.sessionId;

        // Get current session
        const session = await AuthSession.findOne({ userId, sessionId, isActive: true });
        if (!session) {
            return next();
        }

        // Check for suspicious patterns
        const suspiciousFlags = {
            multipleIPs: false,
            rapidRequests: false,
            unusualLocation: false,
            failedAttempts: false,
        };

        // Check 1: Multiple IPs in short time (5 min)
        const recentSessions = await AuthSession.find({
            userId,
            createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
            isActive: true,
        });
        const uniqueIPs = new Set(recentSessions.map(s => s.ipAddress));
        if (uniqueIPs.size > 2) {
            suspiciousFlags.multipleIPs = true;
        }

        // Check 2: Rapid requests (>50 in 1 minute)
        const rapidCount = await AuthSession.countDocuments({
            userId,
            createdAt: { $gte: new Date(Date.now() - 60 * 1000) },
        });
        if (rapidCount > 50) {
            suspiciousFlags.rapidRequests = true;
        }

        // Check 3: Failed login attempts (>5 in 15 min)
        const failedAttempts = await AuthSession.countDocuments({
            userId,
            createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) },
            status: 'failed',
        });
        if (failedAttempts > 5) {
            suspiciousFlags.failedAttempts = true;
        }

        // If multiple suspicious flags, invalidate session
        const suspiciousCount = Object.values(suspiciousFlags).filter(Boolean).length;
        if (suspiciousCount >= 2) {
            // Invalidate this session
            await AuthSession.updateOne(
                { _id: session._id },
                { isActive: false, invalidatedAt: new Date(), invalidationReason: 'suspicious_activity' }
            );

            // Invalidate all sessions for extra security
            await AuthSession.updateMany(
                { userId, isActive: true },
                { isActive: false, invalidatedAt: new Date(), invalidationReason: 'account_lockdown' }
            );

            // Add flag to user
            await User.updateOne(
                { _id: userId },
                {
                    $inc: { suspiciousActivityCount: 1 },
                    lastSuspiciousActivity: new Date(),
                }
            );

            return res.status(401).json({
                success: false,
                message: 'Your session has been invalidated due to suspicious activity. Please log in again.',
                reason: 'suspicious_activity',
                flags: suspiciousFlags,
                action: 'logout',
            });
        }

        next();
    } catch (error) {
        console.error('Auto-logout middleware error:', error);
        next();
    }
};

/**
 * Middleware to detect and respond to account lockout
 */
export const checkAccountLockout = async (req, res, next) => {
    try {
        if (!req.user) return next();

        const user = await User.findById(req.user.id);
        if (!user) return next();

        // Check if account is locked
        if (user.isLocked) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been locked due to suspicious activity. Please contact support.',
                reason: 'account_locked',
            });
        }

        // Check if too many suspicious activities
        if (user.suspiciousActivityCount >= 3) {
            await User.updateOne({ _id: user._id }, { isLocked: true });
            return res.status(403).json({
                success: false,
                message: 'Your account has been locked. Please contact support.',
                reason: 'account_locked',
            });
        }

        next();
    } catch (error) {
        console.error('Account lockout check error:', error);
        next();
    }
};

/**
 * Logout all sessions for user (account-wide logout)
 */
export const logoutAllSessions = async (userId) => {
    try {
        const result = await AuthSession.updateMany(
            { userId, isActive: true },
            {
                isActive: false,
                invalidatedAt: new Date(),
                invalidationReason: 'user_logout_all',
            }
        );
        return result;
    } catch (error) {
        console.error('Error logging out all sessions:', error);
        throw error;
    }
};

/**
 * Get active sessions for user
 */
export const getActiveSessions = async (userId) => {
    try {
        return await AuthSession.find({
            userId,
            isActive: true,
        }).select('deviceFingerprint ipAddress userAgent createdAt lastActivity deviceName');
    } catch (error) {
        console.error('Error fetching active sessions:', error);
        throw error;
    }
};

/**
 * Invalidate specific session
 */
export const invalidateSession = async (userId, sessionId) => {
    try {
        return await AuthSession.updateOne(
            { userId, sessionId },
            {
                isActive: false,
                invalidatedAt: new Date(),
                invalidationReason: 'user_revoked',
            }
        );
    } catch (error) {
        console.error('Error invalidating session:', error);
        throw error;
    }
};

export default {
    autoLogoutOnSuspiciousActivity,
    checkAccountLockout,
    logoutAllSessions,
    getActiveSessions,
    invalidateSession,
};
