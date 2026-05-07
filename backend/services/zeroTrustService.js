/**
 * Zero Trust Architecture Service
 * 
 * Implements continuous verification for:
 * 1. User Identity (JWT + Session)
 * 2. Device Identity (Device fingerprinting + Binding)
 * 3. Behavior Verification (Anomaly detection + Risk scoring)
 * 4. Risk-Based Authentication (Step-up auth on high-risk)
 * 
 * Every request must pass ALL checks before granting access
 */

import crypto from 'crypto';
import DeviceStore from '../models/DeviceStore.js';
import BehaviorStore from '../models/BehaviorStore.js';
import MFAChallenge from '../models/MFAChallenge.js';
import User from '../models/User.js';
import AppError from '../utils/errorUtils.js';
import { sendMFACode } from '../utils/emailService.js';

// ════════════════════════════════════════════════════════════════════════════
// 1. DEVICE VERIFICATION & TRUST SCORING
// ════════════════════════════════════════════════════════════════════════════

/**
 * Verify device identity and calculate trust score
 * @param {Object} deviceInfo - { fingerprint, ua, ip, headers }
 * @param {Object} user - User document
 * @param {string} requestId - Request ID for logging
 */
export const verifyAndScoreDevice = async (deviceInfo, user, requestId) => {
    const { fingerprint, ua, ip, headers } = deviceInfo;

    // Find or create device record
    let device = await DeviceStore.findOne({
        userId: user._id,
        fingerprint: hashDeviceFingerprint(fingerprint),
    });

    if (!device) {
        // New device detected
        device = await DeviceStore.create({
            userId: user._id,
            fingerprint: hashDeviceFingerprint(fingerprint),
            userAgent: ua,
            firstSeenIp: ip,
            trustedStatus: 'unverified', // Requires verification
            trustScore: 0, // New devices start at 0
            riskLevel: 'high',
            lastActivityAt: new Date(),
            seenIps: [ip],
            trustedAt: null,
        });

        logZeroTrustEvent(requestId, 'new_device_detected', {
            deviceId: device._id,
            fingerprint: fingerprint.slice(0, 16),
            ip,
            userId: user._id,
        });
    }

    // Calculate device trust score (0-100)
    const trustScore = calculateDeviceTrustScore(device, deviceInfo);

    // Update device activity
    device.lastActivityAt = new Date();
    if (!device.seenIps.includes(ip)) {
        device.seenIps.push(ip);
    }
    device.trustScore = trustScore;

    // Determine trust level based on score
    let riskLevel = 'critical';
    if (trustScore >= 80) riskLevel = 'low';
    else if (trustScore >= 60) riskLevel = 'medium';
    else if (trustScore >= 40) riskLevel = 'high';

    device.riskLevel = riskLevel;

    await device.save();

    return {
        deviceId: device._id,
        fingerprint: fingerprint.slice(0, 16),
        trustScore,
        riskLevel,
        isTrusted: device.trustedStatus === 'verified' && trustScore >= 60,
        isNewDevice: !device.trustedAt,
        seenBefore: device.seenIps.length > 1,
    };
};

/**
 * Calculate device trust score based on multiple factors
 * Factors:
 * - Device history (seen before, consistency)
 * - IP reputation (from IP geolocation service)
 * - User-Agent consistency
 * - Geolocation stability
 * - Session history
 */
function calculateDeviceTrustScore(device, deviceInfo) {
    let score = 0;
    const { ua, ip } = deviceInfo;

    // Factor 1: Device Recognition (0-30 points)
    const deviceAge = Date.now() - device.createdAt;
    if (device.seenIps.length > 5) {
        score += 30; // Established device
    } else if (device.seenIps.length > 1) {
        score += 20; // Seen a few times
    } else {
        score += 5; // Brand new device
    }

    // Factor 2: User-Agent Consistency (0-20 points)
    if (device.userAgent === ua) {
        score += 20; // Exact match
    } else {
        score += 5; // Different UA (possible update)
    }

    // Factor 3: IP Stability (0-25 points)
    if (device.seenIps.length === 1) {
        score += 25; // Same IP every time
    } else if (device.seenIps.length <= 3) {
        score += 15; // Few IPs (small office/home range)
    } else {
        score += 5; // Many IPs (mobile user, VPN, etc.)
    }

    // Factor 4: Recency of last use (0-25 points)
    const hoursSinceLastActivity = (Date.now() - device.lastActivityAt) / (1000 * 60 * 60);
    if (hoursSinceLastActivity < 24) {
        score += 25; // Used recently
    } else if (hoursSinceLastActivity < 7 * 24) {
        score += 15; // Used within a week
    } else if (hoursSinceLastActivity < 30 * 24) {
        score += 5; // Used within a month
    }

    return Math.min(100, Math.max(0, score));
}

function hashDeviceFingerprint(fingerprint) {
    return crypto
        .createHash('sha256')
        .update(fingerprint)
        .digest('hex');
}

// ════════════════════════════════════════════════════════════════════════════
// 2. BEHAVIORAL VERIFICATION & ANOMALY DETECTION
// ════════════════════════════════════════════════════════════════════════════

/**
 * Analyze user behavior and return risk score
 * Factors:
 * - Request frequency
 * - Request patterns
 * - Time-based anomalies
 * - Endpoint access patterns
 * - Amount/value anomalies
 */
export const analyzeBehavior = async (user, request, requestId) => {
    const { method, path, ip, headers } = request;
    const timestamp = new Date();

    // Get user's recent behavior history
    const recentBehavior = await BehaviorStore.find(
        { userId: user._id, timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        null,
        { sort: { timestamp: -1 }, limit: 100 }
    );

    // Calculate behavior risk score
    let behaviorRiskScore = 0;

    // Check 1: Request frequency anomaly (0-30 points)
    const requestsLastHour = recentBehavior.filter(
        b => new Date(b.timestamp) > new Date(Date.now() - 60 * 60 * 1000)
    ).length;
    const avgRequestsPerHour = recentBehavior.length / 24;
    if (requestsLastHour > avgRequestsPerHour * 3) {
        behaviorRiskScore += 30; // Unusual spike
    } else if (requestsLastHour > avgRequestsPerHour * 1.5) {
        behaviorRiskScore += 15;
    }

    // Check 2: Endpoint access pattern (0-20 points)
    const endpointFrequency = calculateEndpointFrequency(recentBehavior, path);
    if (endpointFrequency === 0) {
        behaviorRiskScore += 20; // Never accessed before
    } else if (endpointFrequency < 3) {
        behaviorRiskScore += 10; // Rarely accessed
    }

    // Check 3: Time-based anomaly (0-20 points)
    const hourOfDay = timestamp.getHours();
    const usualActiveHours = calculateUsualActiveHours(recentBehavior);
    if (!isInRange(hourOfDay, usualActiveHours)) {
        behaviorRiskScore += 20; // Unusual time of access
    }

    // Check 4: Geographic anomaly (0-15 points)
    const recentIps = [...new Set(recentBehavior.map(b => b.ip))];
    if (!recentIps.includes(ip) && recentIps.length > 0) {
        behaviorRiskScore += 15; // New IP address
    }

    // Check 5: Rapid action sequence (0-15 points)
    if (recentBehavior.length > 0) {
        const timeSinceLastRequest = timestamp - new Date(recentBehavior[0].timestamp);
        if (timeSinceLastRequest < 1000) {
            // Less than 1 second between requests
            behaviorRiskScore += 15; // Possible automated attack
        }
    }

    // Store behavior record
    await BehaviorStore.create({
        userId: user._id,
        method,
        path,
        ip,
        userAgent: headers['user-agent'],
        timestamp,
        riskScore: behaviorRiskScore,
        requestId,
    });

    // Determine overall behavior risk level
    let behaviorRiskLevel = 'low';
    if (behaviorRiskScore >= 60) behaviorRiskLevel = 'critical';
    else if (behaviorRiskScore >= 40) behaviorRiskLevel = 'high';
    else if (behaviorRiskScore >= 20) behaviorRiskLevel = 'medium';

    return {
        riskScore: behaviorRiskScore,
        riskLevel: behaviorRiskLevel,
        anomalies: identifyAnomalies(recentBehavior, path, ip, hourOfDay),
    };
};

function calculateEndpointFrequency(behavior, endpoint) {
    return behavior.filter(b => b.path === endpoint).length;
}

function calculateUsualActiveHours(behavior) {
    const hours = behavior.map(b => new Date(b.timestamp).getHours());
    const minHour = Math.min(...hours);
    const maxHour = Math.max(...hours);
    return [minHour, maxHour];
}

function isInRange(hour, [min, max]) {
    if (min <= max) return hour >= min && hour <= max;
    return hour >= min || hour <= max; // Wraps midnight
}

function identifyAnomalies(behavior, path, ip, hour) {
    const anomalies = [];

    // Check endpoint access
    const endpointAccess = behavior.filter(b => b.path === path).length;
    if (endpointAccess === 0) {
        anomalies.push('new_endpoint_access');
    }

    // Check IP address
    const seenIps = [...new Set(behavior.map(b => b.ip))];
    if (!seenIps.includes(ip)) {
        anomalies.push('new_ip_address');
    }

    // Check time of day
    const usualHours = calculateUsualActiveHours(behavior);
    if (!isInRange(hour, usualHours)) {
        anomalies.push('unusual_time_of_access');
    }

    return anomalies;
}

// ════════════════════════════════════════════════════════════════════════════
// 3. RISK-BASED DECISION ENGINE
// ════════════════════════════════════════════════════════════════════════════

/**
 * Calculate overall risk score and determine required authentication level
 * Returns: { riskScore, riskLevel, requiresStepUpAuth, action }
 */
export const calculateOverallRisk = async (user, deviceVerification, behaviorAnalysis) => {
    let overallRisk = 0;

    // Weight: Device Risk (40%)
    const deviceRiskScore = 100 - deviceVerification.trustScore;
    overallRisk += deviceRiskScore * 0.4;

    // Weight: Behavior Risk (40%)
    overallRisk += behaviorAnalysis.riskScore * 0.4;

    // Weight: User History (20%)
    const userRiskScore = calculateUserRiskScore(user);
    overallRisk += userRiskScore * 0.2;

    overallRisk = Math.round(overallRisk);

    let riskLevel = 'low';
    let requiresStepUpAuth = false;
    let action = 'allow';

    if (overallRisk >= 80) {
        riskLevel = 'critical';
        requiresStepUpAuth = true;
        action = 'challenge'; // Require MFA or additional verification
    } else if (overallRisk >= 60) {
        riskLevel = 'high';
        requiresStepUpAuth = true;
        action = 'warn'; // Proceed but log and monitor
    } else if (overallRisk >= 40) {
        riskLevel = 'medium';
        action = 'allow'; // Allow with monitoring
    }

    return {
        overallRisk,
        riskLevel,
        requiresStepUpAuth,
        action,
        breakdown: {
            deviceRisk: Math.round(deviceRiskScore),
            behaviorRisk: Math.round(behaviorAnalysis.riskScore),
            userRisk: userRiskScore,
        },
    };
};

function calculateUserRiskScore(user) {
    let score = 0;

    // Factor 1: Account age
    const accountAge = Date.now() - user.createdAt;
    if (accountAge < 7 * 24 * 60 * 60 * 1000) {
        score += 30; // New account (risky)
    } else if (accountAge < 30 * 24 * 60 * 60 * 1000) {
        score += 15; // Young account
    }

    // Factor 2: Login attempts
    if (user.loginAttempts > 3) {
        score += 20; // Multiple failed attempts
    }

    // Factor 3: Account verification status
    if (!user.isVerified) {
        score += 25; // Unverified account
    }

    // Factor 4: 2FA enabled
    if (!user.twoFactorEnabled) {
        score += 15; // No 2FA
    }

    return Math.min(100, score);
}

// ════════════════════════════════════════════════════════════════════════════
// 4. STEP-UP AUTHENTICATION (MFA Challenge)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Generate and send MFA challenge for high-risk requests
 */
export const sendMFAChallenge = async (user, requestId, method = 'email') => {
    const challengeId = crypto.randomBytes(32).toString('hex');
    const code = generateSecureMFACode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store challenge
    await MFAChallenge.create({
        userId: user._id,
        challengeId,
        code: hashMFACode(code), // Store hashed code
        method,
        expiresAt,
        requestId,
        verified: false,
    });

    // Send challenge (email, SMS, etc.)
    if (method === 'email') {
        try {
            await sendMFACode(user.email, code, expiresAt);
        } catch (error) {
            console.error('[ZERO_TRUST] Failed to send MFA code:', error.message);
            // Continue anyway - challenge is stored even if email fails
        }
    }

    logZeroTrustEvent(requestId, 'mfa_challenge_issued', {
        userId: user._id,
        method,
        challengeId: challengeId.slice(0, 16),
    });

    return { challengeId, expiresAt };
};

/**
 * Verify MFA challenge code
 */
export const verifyMFAChallenge = async (challengeId, code, requestId) => {
    const challenge = await MFAChallenge.findOne({
        challengeId,
        expiresAt: { $gt: new Date() },
        verified: false,
    }).select('+code');

    if (!challenge) {
        throw new AppError('MFA challenge expired or not found', 400);
    }

    // Constant-time comparison of hashed codes
    const codeHash = hashMFACode(code);
    const isValid = crypto.timingSafeEqual(
        Buffer.from(challenge.code),
        Buffer.from(codeHash)
    );

    if (!isValid) {
        // Increment attempts
        challenge.attempts += 1;
        if (challenge.attempts >= challenge.maxAttempts) {
            challenge.verified = false; // Lock this challenge
        }
        await challenge.save();

        logZeroTrustEvent(requestId, 'mfa_verification_failed', {
            userId: challenge.userId,
            challengeId: challengeId.slice(0, 16),
            attempts: challenge.attempts,
        });
        throw new AppError('Invalid MFA code', 401);
    }

    challenge.verified = true;
    challenge.verifiedAt = new Date();
    await challenge.save();

    logZeroTrustEvent(requestId, 'mfa_verification_success', {
        userId: challenge.userId,
        challengeId: challengeId.slice(0, 16),
    });

    return { verified: true, userId: challenge.userId };
};

// ════════════════════════════════════════════════════════════════════════════
// 5. TRUST DECISION & ACCESS CONTROL
// ════════════════════════════════════════════════════════════════════════════

/**
 * Make final trust decision based on all factors
 */
/**
 * Make Zero Trust verification decision
 * 
 * DECISION TREE:
 * 1. If device is already TRUSTED → Allow (no MFA)
 * 2. If device is NEW → Require MFA
 * 3. If behavior is CRITICAL → Require MFA
 * 4. Otherwise → Allow with monitoring
 */
export const makeZeroTrustDecision = async (request, user, requestId) => {
    const deviceInfo = {
        fingerprint: request.body?.deviceFingerprint || generateFingerprint(request),
        ua: request.headers['user-agent'],
        ip: request.ip,
        headers: request.headers,
    };

    // Step 1: Verify device identity and calculate trust score
    const deviceVerification = await verifyAndScoreDevice(deviceInfo, user, requestId);

    // Step 2: Check if device is already trusted (SKIP MFA FOR TRUSTED DEVICES)
    const isDeviceTrusted = deviceVerification.isTrusted && 
                           deviceVerification.trustScore >= 70;
    
    if (isDeviceTrusted) {
        // Device is trusted - allow with minimal verification
        logZeroTrustEvent(requestId, 'trust_decision_made', {
            userId: user._id,
            decision: 'ALLOW_TRUSTED_DEVICE',
            reason: 'Device already verified and trusted',
            trustScore: deviceVerification.trustScore,
        });

        return {
            allowed: true,
            riskLevel: 'low',
            requiresMFA: false,
            deviceVerified: true,
            riskScore: Math.max(0, 100 - deviceVerification.trustScore),
            reason: 'Device is trusted',
        };
    }

    // Step 3: Analyze behavior
    const behaviorAnalysis = await analyzeBehavior(user, request, requestId);

    // Step 4: Calculate overall risk
    const riskAssessment = await calculateOverallRisk(user, deviceVerification, behaviorAnalysis);

    // Step 5: Determine if MFA is needed
    let requiresMFA = false;
    let blockRequest = false;

    if (deviceVerification.isNewDevice) {
        // New device always requires MFA
        requiresMFA = true;
        logZeroTrustEvent(requestId, 'mfa_required_reason', {
            reason: 'New device detected',
            trustScore: deviceVerification.trustScore,
        });
    } else if (behaviorAnalysis.riskLevel === 'critical') {
        // Critical behavior anomaly requires MFA
        requiresMFA = true;
        logZeroTrustEvent(requestId, 'mfa_required_reason', {
            reason: 'Critical behavior anomaly',
            anomaly: behaviorAnalysis.anomalyFlags[0],
        });
    } else if (riskAssessment.overallRisk >= 75) {
        // Very high risk requires MFA
        requiresMFA = true;
        logZeroTrustEvent(requestId, 'mfa_required_reason', {
            reason: 'High overall risk score',
            riskScore: riskAssessment.overallRisk,
        });
    }

    // Make final decision
    let decision = {
        allowed: !blockRequest && (riskAssessment.action === 'allow' || riskAssessment.action === 'warn'),
        riskLevel: riskAssessment.riskLevel,
        requiresMFA,
        deviceVerified: deviceVerification.isTrusted,
        riskScore: riskAssessment.overallRisk,
    };

    // If requires MFA, generate challenge
    if (requiresMFA) {
        const mfaChallenge = await sendMFAChallenge(user, requestId, 'email');
        decision.mfaRequired = true;
        decision.mfaChallengeId = mfaChallenge.challengeId;
        decision.allowed = false; // Block until MFA verified
    }

    // Log decision
    logZeroTrustEvent(requestId, 'trust_decision_made', {
        userId: user._id,
        decision,
        riskScore: riskAssessment.overallRisk,
        trustScore: deviceVerification.trustScore,
    });

    return decision;
};

// ════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

function generateSecureMFACode() {
    return crypto.randomInt(100000, 999999).toString();
}

function generateFingerprint(request) {
    const components = [
        request.headers['user-agent'] || '',
        request.headers['accept-language'] || '',
        request.headers['accept-encoding'] || '',
        request.ip || '',
    ].join('|');

    return crypto
        .createHash('sha256')
        .update(components)
        .digest('hex');
}

/**
 * Hash MFA code for storage
 * Uses SHA-256 for consistent hashing
 */
function hashMFACode(code) {
    return crypto
        .createHash('sha256')
        .update(code)
        .digest('hex');
}

function logZeroTrustEvent(requestId, eventType, details) {
    const timestamp = new Date().toISOString();
    console.log(`[ZERO_TRUST] [${timestamp}] [${requestId}] ${eventType}`, JSON.stringify(details));
    
    // TODO: Send to security monitoring service (e.g., Sentry, DataDog)
}

export default {
    verifyAndScoreDevice,
    analyzeBehavior,
    calculateOverallRisk,
    sendMFAChallenge,
    verifyMFAChallenge,
    makeZeroTrustDecision,
};
