/**
 * Zero Trust Middleware
 * 
 * Applied to sensitive endpoints to enforce:
 * 1. User verification (JWT + session)
 * 2. Device verification (fingerprint + trust score)
 * 3. Behavior analysis (anomaly detection)
 * 4. Risk assessment (decide if MFA needed)
 */

import AppError from '../utils/errorUtils.js';
import zeroTrustService from '../services/zeroTrustService.js';
import User from '../models/User.js';
import crypto from 'crypto';

const ZERO_TRUST_ENDPOINTS = [
    '/api/users',
    '/api/transaction',
    '/api/transfer',
    '/api/wallet',
    '/api/payment',
    '/api/admin',
];

/**
 * Zero Trust Verification Middleware
 * Must be applied AFTER authentication (after protect middleware)
 */
export const zeroTrustVerify = (req, res, next) => {
    // Attach requestId to request for tracking
    req.requestId = crypto.randomBytes(8).toString('hex');
    
    // For non-sensitive endpoints, just continue
    const isSensitiveEndpoint = ZERO_TRUST_ENDPOINTS.some(ep =>
        req.path.startsWith(ep)
    );
    
    if (!isSensitiveEndpoint) {
        return next();
    }
    
    // Mark this request for Zero Trust processing
    req.requiresZeroTrust = true;
    req.zeroTrustStartTime = Date.now();
    
    next();
};

/**
 * Zero Trust Decision Middleware
 * Makes the actual Zero Trust verification decision
 * Should be applied AFTER user is authenticated
 */
export const zeroTrustDecision = async (req, res, next) => {
    try {
        // Skip if not a sensitive endpoint
        if (!req.requiresZeroTrust) {
            return next();
        }
        
        // Ensure user is authenticated
        if (!req.user) {
            return next(new AppError('User not authenticated', 401));
        }
        
        // Get full user object
        const user = await User.findById(req.user._id);
        if (!user) {
            return next(new AppError('User not found', 404));
        }
        
        // Make Zero Trust decision
        const decision = await zeroTrustService.makeZeroTrustDecision(
            req,
            user,
            req.requestId
        );
        
        // Attach decision to request
        req.zeroTrustDecision = decision;
        
        // Log the decision
        console.log(`[ZERO_TRUST] Request ${req.requestId}:`, {
            endpoint: req.path,
            userId: user._id,
            riskLevel: decision.riskLevel,
            riskScore: decision.riskScore,
            requiresMFA: decision.requiresMFA,
            deviceVerified: decision.deviceVerified,
            allowed: decision.allowed,
        });
        
        // If MFA required, send MFA challenge response
        if (decision.mfaRequired) {
            return res.status(403).json({
                status: 'mfa_required',
                message: 'High-risk request detected. Multi-factor authentication required.',
                mfaChallengeId: decision.mfaChallengeId,
                riskLevel: decision.riskLevel,
            });
        }
        
        // If blocked, return error
        if (!decision.allowed) {
            return next(new AppError('Access denied due to security policy', 403));
        }
        
        // Allow request to continue
        next();
        
    } catch (error) {
        console.error(`[ZERO_TRUST] Error in decision middleware:`, error);
        // On error, default to deny access (fail-secure)
        next(new AppError('Security verification failed', 500));
    }
};

/**
 * MFA Verification Middleware
 * Verifies MFA challenges for high-risk requests
 */
export const verifyMFAChallenge = async (req, res, next) => {
    try {
        const { mfaChallengeId, mfaCode } = req.body;
        
        if (!mfaChallengeId || !mfaCode) {
            return next(new AppError('MFA challenge ID and code required', 400));
        }
        
        // Verify the MFA challenge
        const verification = await zeroTrustService.verifyMFAChallenge(
            mfaChallengeId,
            mfaCode,
            req.requestId
        );
        
        if (!verification.verified) {
            return next(new AppError('MFA verification failed', 401));
        }
        
        // Attach MFA verification to request
        req.mfaVerified = true;
        req.mfaVerifiedAt = new Date();
        
        // Mark this session as MFA-verified for the next 30 minutes
        if (req.session) {
            req.session.mfaVerifiedAt = Date.now();
            req.session.mfaVerifiedUntil = Date.now() + 30 * 60 * 1000;
        }
        
        next();
        
    } catch (error) {
        next(error);
    }
};

/**
 * MFA Cache Middleware
 * Allows re-using MFA verification for 30 minutes
 * Improves UX by not requiring MFA on every request
 */
export const checkMFACache = (req, res, next) => {
    if (!req.requiresZeroTrust) {
        return next();
    }
    
    // If session has recent MFA verification, skip MFA
    if (req.session && req.session.mfaVerifiedUntil && Date.now() < req.session.mfaVerifiedUntil) {
        req.mfaVerified = true;
        req.skipZeroTrust = true;
        return next();
    }
    
    next();
};

/**
 * Continuous Monitoring Middleware
 * Monitors ongoing behavior for session-level anomalies
 */
export const continuousMonitoring = async (req, res, next) => {
    if (!req.requiresZeroTrust || !req.user) {
        return next();
    }
    
    try {
        // Store behavior record for continuous monitoring
        const user = await User.findById(req.user._id);
        const behavior = await zeroTrustService.analyzeBehavior(user, req, req.requestId);
        
        // If behavior suddenly becomes suspicious (e.g., attack in progress)
        if (behavior.riskLevel === 'critical') {
            // Invalidate existing sessions
            await User.findByIdAndUpdate(req.user._id, {
                $set: { activeSessions: [] }
            });
            
            console.warn(`[ZERO_TRUST] Critical behavior detected, sessions invalidated:`, {
                userId: req.user._id,
                requestId: req.requestId,
            });
        }
        
        next();
        
    } catch (error) {
        // Don't block request on monitoring error
        console.error('[ZERO_TRUST] Monitoring error:', error);
        next();
    }
};

/**
 * Device Trust Update Middleware
 * Updates device trust scores after successful requests
 */
export const updateDeviceTrust = async (req, res, next) => {
    // Use response hook to update trust after successful response
    const originalJson = res.json;
    
    res.json = function(data) {
        // Update device trust if request was successful
        if (req.requiresZeroTrust && req.user && res.statusCode < 400) {
            zeroTrustService.verifyAndScoreDevice(
                {
                    fingerprint: req.body?.deviceFingerprint,
                    ua: req.headers['user-agent'],
                    ip: req.ip,
                    headers: req.headers,
                },
                { _id: req.user._id },
                req.requestId
            ).catch(err => {
                console.error('[ZERO_TRUST] Device trust update error:', err);
            });
        }
        
        return originalJson.call(this, data);
    };
    
    next();
};

/**
 * Risk Level Header Middleware
 * Adds risk information to response headers for debugging
 */
export const addRiskHeaders = (req, res, next) => {
    if (req.zeroTrustDecision) {
        res.setHeader('X-Risk-Level', req.zeroTrustDecision.riskLevel);
        res.setHeader('X-Risk-Score', req.zeroTrustDecision.riskScore);
        res.setHeader('X-Device-Verified', req.zeroTrustDecision.deviceVerified.toString());
    }
    next();
};

export default {
    zeroTrustVerify,
    zeroTrustDecision,
    verifyMFAChallenge,
    checkMFACache,
    continuousMonitoring,
    updateDeviceTrust,
    addRiskHeaders,
};
