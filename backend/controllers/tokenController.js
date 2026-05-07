/**
 * Token Controller
 * Handles JWT access token and refresh token operations
 * Implements secure token rotation with compromise detection
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import User from '../models/User.js';
import AppError from '../utils/errorUtils.js';
import * as refreshTokenService from '../services/refreshTokenService.js';
import * as loginAttemptService from '../services/loginAttemptService.js';

/**
 * POST /api/v1/auth/refresh-token
 * 
 * Refresh access token using a valid refresh token
 * Implements token rotation: issues new refresh token, revokes old one
 * 
 * Security features:
 * - Validates refresh token signature
 * - Detects token reuse (compromise indicator)
 * - Tracks IP and User-Agent for anomaly detection
 * - Issues short-lived access token (15 min)
 * - Rotates long-lived refresh token (7 days)
 * 
 * Request body:
 * {
 *   "refreshToken": "jwt.containing.hashed.token"
 * }
 * 
 * Response:
 * {
 *   "status": "success",
 *   "accessToken": "jwt.token",
 *   "refreshToken": "new.jwt.token",
 *   "expiresIn": 900
 * }
 */
export const refreshAccessToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return next(new AppError('Refresh token is required', 400));
        }

        // ════════════════════════════════════════════════════════════════════════════
        // STEP 1: Verify JWT signature
        // ════════════════════════════════════════════════════════════════════════════
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, config.jwtRefreshSecret, {
                algorithms: ['HS256']
            });
        } catch (err) {
            return next(new AppError('Invalid or expired refresh token', 401));
        }

        const { userId, tokenHash } = decoded;

        if (!userId || !tokenHash) {
            return next(new AppError('Invalid refresh token payload', 401));
        }

        // ════════════════════════════════════════════════════════════════════════════
        // STEP 2: Find user and fetch refresh tokens
        // ════════════════════════════════════════════════════════════════════════════
        const user = await User.findById(userId).select('+refreshTokens');

        if (!user) {
            return next(new AppError('User not found', 401));
        }

        if (user.isLocked) {
            return next(new AppError('Account is locked. Please try again later.', 423));
        }

        // ════════════════════════════════════════════════════════════════════════════
        // STEP 3: Validate refresh token exists and is not revoked
        // ════════════════════════════════════════════════════════════════════════════
        if (!user.refreshTokens) {
            user.refreshTokens = [];
        }

        const tokenEntry = user.refreshTokens.find(
            (t) => t.token === tokenHash && !t.revokedAt && t.expiresAt > new Date()
        );

        if (!tokenEntry) {
            // Token not found or revoked/expired
            // This could indicate token reuse attack (same refresh token used twice)
            // Security measure: revoke all refresh tokens as precaution

            await loginAttemptService.logLoginAttempt({
                userId: userId,
                email: user.email,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                status: 'failed',
                failureReason: 'invalid-refresh-token',
            });

            // Check if this might be token reuse
            const suspiciousTokenReuse = user.refreshTokens.some(
                (t) => t.token === tokenHash && (t.revokedAt || t.expiresAt < new Date())
            );

            if (suspiciousTokenReuse) {
                console.warn(
                    `[SECURITY] Token reuse detected for user ${userId}. ` +
                    `IP: ${req.ip}, Old IP: ${tokenEntry?.ip}. Revoking all tokens.`
                );

                // Revoke all tokens as security measure
                await user.revokeAllRefreshTokens('TOKEN_REUSE_DETECTED');

                // Notify user of suspicious activity
                return next(new AppError(
                    'Suspicious activity detected. Please login again. All sessions have been terminated.',
                    401
                ));
            }

            return next(new AppError('Invalid or expired refresh token', 401));
        }

        // ════════════════════════════════════════════════════════════════════════════
        // STEP 4: Detect compromise (multiple IPs using same token)
        // ════════════════════════════════════════════════════════════════════════════
        const { isCompromised, uniqueIPs } = refreshTokenService.detectCompromise(user, req.ip);

        if (isCompromised) {
            console.warn(
                `[SECURITY] Possible token compromise for user ${userId}. ` +
                `Multiple IPs detected: ${uniqueIPs.join(', ')}`
            );

            // Revoke all tokens and force re-login
            await user.revokeAllRefreshTokens('COMPROMISE_DETECTED');

            return next(new AppError(
                'Security alert: Unusual activity detected on your account. ' +
                'All sessions have been logged out. Please login again.',
                401
            ));
        }

        // ════════════════════════════════════════════════════════════════════════════
        // STEP 5: Generate new tokens (rotation)
        // ════════════════════════════════════════════════════════════════════════════
        const newRawRefreshToken = refreshTokenService.generateRefreshToken();
        const newRefreshTokenHash = refreshTokenService.hashRefreshToken(newRawRefreshToken);

        // Generate new access token (short-lived: 15 min)
        const accessToken = refreshTokenService.generateAccessToken(
            user._id.toString(),
            user.activeSessions?.[0]?.sessionId || crypto.randomBytes(16).toString('hex')
        );

        // Create JWT for refresh token
        const newRefreshTokenJWT = refreshTokenService.createRefreshTokenJWT(
            newRawRefreshToken,
            user._id.toString()
        );

        // ════════════════════════════════════════════════════════════════════════════
        // STEP 6: Rotate tokens in database
        // ════════════════════════════════════════════════════════════════════════════

        // Mark old token as rotated
        tokenEntry.revokedAt = new Date();
        tokenEntry.revokeReason = 'ROTATED';
        tokenEntry.rotatedFrom = tokenHash;

        // Add new token
        user.refreshTokens.push({
            token: newRefreshTokenHash,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            issuedAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            rotatedFrom: tokenHash,
        });

        // Clean up: remove revoked tokens older than 30 days
        user.refreshTokens = user.refreshTokens.filter(
            (t) => !t.revokedAt || (new Date() - t.revokedAt) < (30 * 24 * 60 * 60 * 1000)
        );

        // Enforce max 10 active tokens
        if (user.refreshTokens.length > 10) {
            user.refreshTokens = user.refreshTokens.slice(-10);
        }

        await user.save({ validateBeforeSave: false });

        // ════════════════════════════════════════════════════════════════════════════
        // STEP 7: Log successful token refresh
        // ════════════════════════════════════════════════════════════════════════════
        await loginAttemptService.logLoginAttempt({
            userId: userId,
            email: user.email,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            status: 'success',
            failureReason: 'token-refresh',
        });

        // ════════════════════════════════════════════════════════════════════════════
        // STEP 8: Send response with new tokens
        // ════════════════════════════════════════════════════════════════════════════
        res.status(200).json({
            status: 'success',
            accessToken,
            refreshToken: newRefreshTokenJWT,
            expiresIn: 900, // 15 minutes
            tokenType: 'Bearer',
        });

    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/v1/auth/logout
 * 
 * Logout from current device (revoke current refresh token)
 * 
 * Request body: none (token is in Authorization header)
 * 
 * Response:
 * {
 *   "status": "success",
 *   "message": "Logged out successfully"
 * }
 */
export const logout = async (req, res, next) => {
    try {
        const user = req.user;
        const { refreshToken } = req.body;

        if (!user || !user._id) {
            return next(new AppError('User not authenticated', 401));
        }

        // If refresh token provided, revoke only that token
        if (refreshToken) {
            try {
                const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
                await user.revokeRefreshToken(decoded.tokenHash, 'USER_LOGOUT_SINGLE');
            } catch (err) {
                // Token invalid, continue with general logout
            }
        } else {
            // No specific token → revoke all tokens (logout all devices)
            await user.revokeAllRefreshTokens('USER_LOGOUT_ALL');
        }

        // Clear JWT cookie
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
            sameSite: 'Strict',
            path: '/',
        });

        res.status(200).json({
            status: 'success',
            message: refreshToken ? 'Logged out from this device' : 'Logged out from all devices'
        });

    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/v1/auth/logout-all-devices
 * 
 * Force logout from all devices (revoke all refresh tokens)
 * Useful when changing password or for security
 * 
 * Response:
 * {
 *   "status": "success",
 *   "message": "Logged out from all devices"
 * }
 */
export const logoutAllDevices = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user || !user._id) {
            return next(new AppError('User not authenticated', 401));
        }

        await user.revokeAllRefreshTokens('USER_LOGOUT_ALL_DEVICES');

        // Clear JWT cookie
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
            sameSite: 'Strict',
            path: '/',
        });

        res.status(200).json({
            status: 'success',
            message: 'Logged out from all devices. Please login again.'
        });

    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/v1/auth/active-sessions
 * 
 * Get list of all active refresh tokens (devices with active sessions)
 * 
 * Response:
 * {
 *   "status": "success",
 *   "sessions": [
 *     {
 *       "tokenHash": "...",
 *       "ip": "1.2.3.4",
 *       "userAgent": "...",
 *       "issuedAt": "2026-04-27T...",
 *       "expiresAt": "2026-05-04T...",
 *       "isCurrent": true
 *     }
 *   ]
 * }
 */
export const getActiveSessions = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user || !user._id) {
            return next(new AppError('User not authenticated', 401));
        }

        // Fetch user with refresh tokens
        const fullUser = await User.findById(user._id).select('+refreshTokens');

        if (!fullUser || !fullUser.refreshTokens) {
            return res.status(200).json({
                status: 'success',
                sessions: []
            });
        }

        const currentIP = req.ip;
        const currentUA = req.headers['user-agent'];

        // Filter active (non-revoked) tokens
        const sessions = fullUser.refreshTokens
            .filter((t) => !t.revokedAt && t.expiresAt > new Date())
            .map((t) => ({
                tokenHash: t.token.substring(0, 16) + '...', // Redact full hash
                ip: t.ip,
                userAgent: t.userAgent,
                issuedAt: t.issuedAt,
                expiresAt: t.expiresAt,
                isCurrent: t.ip === currentIP && t.userAgent === currentUA,
            }));

        res.status(200).json({
            status: 'success',
            count: sessions.length,
            sessions,
        });

    } catch (err) {
        next(err);
    }
};

export default {
    refreshAccessToken,
    logout,
    logoutAllDevices,
    getActiveSessions,
};
