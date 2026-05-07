/**
 * Refresh Token Service
 * 
 * Handles refresh token generation, validation, and rotation
 * Implements secure token rotation with compromise detection
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';

/**
 * Generate a secure refresh token
 * @returns {string} - Raw refresh token (send to client)
 */
export const generateRefreshToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash a refresh token for storage
 * @param {string} token - Raw token
 * @returns {string} - Hashed token
 */
export const hashRefreshToken = (token) => {
    return crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
};

/**
 * Generate JWT access token
 * @param {string} userId - User ID
 * @param {string} sessionId - Session ID (for session validation)
 * @returns {string} - JWT token
 */
export const generateAccessToken = (userId, sessionId) => {
    return jwt.sign(
        { id: userId, sessionId },
        config.jwtSecret,
        { expiresIn: '15m', algorithm: 'HS256' }
    );
};

/**
 * Verify and decode refresh token JWT
 * @param {string} token - Refresh token JWT
 * @returns {object} - Decoded payload
 */
export const verifyRefreshTokenJWT = (token) => {
    try {
        return jwt.verify(token, config.jwtRefreshSecret, { algorithms: ['HS256'] });
    } catch (err) {
        throw new Error(`Invalid refresh token: ${err.message}`);
    }
};

/**
 * Create refresh token JWT
 * @param {string} token - Raw refresh token hash
 * @param {string} userId - User ID
 * @returns {string} - JWT containing token hash
 */
export const createRefreshTokenJWT = (token, userId) => {
    const hashedToken = hashRefreshToken(token);
    
    return jwt.sign(
        {
            userId,
            tokenHash: hashedToken,
        },
        config.jwtRefreshSecret,
        { expiresIn: '7d', algorithm: 'HS256' }
    );
};

/**
 * Rotate refresh token
 * Issues new token and revokes old one
 */
export const rotateRefreshToken = async (user, oldToken, newTokenHash, ip, userAgent) => {
    const oldTokenHash = hashRefreshToken(oldToken);
    
    // Verify old token exists and is not revoked
    const oldTokenEntry = user.refreshTokens?.find(
        (t) => t.token === oldTokenHash && !t.revokedAt
    );
    
    if (!oldTokenEntry) {
        // Suspicious activity: token not found or already revoked
        // Revoke all tokens as a safety measure
        await user.revokeAllRefreshTokens('SUSPICIOUS_TOKEN_ROTATION');
        throw new Error('Invalid refresh token');
    }
    
    // Add new token (replaces old in metadata)
    await user.addRefreshToken(newTokenHash, ip, userAgent);
    
    // Revoke old token
    await user.revokeRefreshToken(oldTokenHash, 'ROTATED');
    
    return {
        accessToken: generateAccessToken(user._id.toString(), user.activeSessions?.[0]?.sessionId),
        refreshToken: createRefreshTokenJWT(newTokenHash, user._id.toString()),
        expiresIn: 900, // 15 minutes
    };
};

/**
 * Compromise detection
 * If multiple refresh attempts with different IPs, revoke all tokens
 */
export const detectCompromise = (user, currentIP) => {
    const activeTokens = user.getActiveRefreshTokens?.() || [];
    const uniqueIPs = new Set(activeTokens.map((t) => t.ip));
    
    // If more than 3 different IPs in last 24 hours, suspicious
    const recentTokens = activeTokens.filter(
        (t) => new Date() - t.issuedAt < 24 * 60 * 60 * 1000
    );
    const recentIPs = new Set(recentTokens.map((t) => t.ip));
    
    if (recentIPs.size > 3) {
        return {
            isCompromised: true,
            message: 'Multiple simultaneous sessions detected',
            uniqueIPs: Array.from(recentIPs),
        };
    }
    
    return { isCompromised: false };
};

export default {
    generateRefreshToken,
    hashRefreshToken,
    generateAccessToken,
    verifyRefreshTokenJWT,
    createRefreshTokenJWT,
    rotateRefreshToken,
    detectCompromise,
};
