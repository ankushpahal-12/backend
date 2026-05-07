/**
 * Zero Trust API Controller
 * Handles MFA challenges, device verification, and trust decisions
 */

import AppError from '../utils/errorUtils.js';
import zeroTrustService from '../services/zeroTrustService.js';
import MFAChallenge from '../models/MFAChallenge.js';
import crypto from 'crypto';

/**
 * Verify MFA code for high-risk requests
 * POST /api/auth/verify-mfa
 */
export const verifyMFA = async (req, res, next) => {
    try {
        const { mfaChallengeId, mfaCode } = req.body;
        
        if (!mfaChallengeId || !mfaCode) {
            return next(new AppError('MFA challenge ID and code are required', 400));
        }
        
        // Verify MFA challenge
        const verification = await zeroTrustService.verifyMFAChallenge(
            mfaChallengeId,
            mfaCode,
            req.requestId
        );
        
        res.status(200).json({
            status: 'success',
            message: 'MFA verification successful',
            verified: verification.verified,
            userId: verification.userId,
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * Get device trust status
 * GET /api/devices/trust-status
 */
export const getDeviceTrustStatus = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new AppError('User not authenticated', 401));
        }
        
        const deviceFingerprint = req.query.fingerprint;
        if (!deviceFingerprint) {
            return next(new AppError('Device fingerprint required', 400));
        }
        
        const DeviceStore = require('../models/DeviceStore.js').default;
        
        const device = await DeviceStore.findOne({
            userId: req.user._id,
            fingerprint: hashFingerprint(deviceFingerprint),
        });
        
        if (!device) {
            return res.status(200).json({
                status: 'success',
                trusted: false,
                message: 'Device not recognized',
            });
        }
        
        res.status(200).json({
            status: 'success',
            trusted: device.trustedStatus === 'verified',
            trustScore: device.trustScore,
            riskLevel: device.riskLevel,
            lastSeen: device.lastActivityAt,
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * Mark device as trusted
 * POST /api/devices/trust
 */
export const trustDevice = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new AppError('User not authenticated', 401));
        }
        
        const { deviceFingerprint } = req.body;
        if (!deviceFingerprint) {
            return next(new AppError('Device fingerprint required', 400));
        }
        
        const DeviceStore = require('../models/DeviceStore.js').default;
        
        const device = await DeviceStore.findOneAndUpdate(
            {
                userId: req.user._id,
                fingerprint: hashFingerprint(deviceFingerprint),
            },
            {
                trustedStatus: 'verified',
                trustedAt: new Date(),
            },
            { new: true }
        );
        
        if (!device) {
            return next(new AppError('Device not found', 404));
        }
        
        res.status(200).json({
            status: 'success',
            message: 'Device marked as trusted',
            device: {
                id: device._id,
                trustScore: device.trustScore,
                trustedAt: device.trustedAt,
            },
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * Revoke device trust
 * DELETE /api/devices/trust/:deviceId
 */
export const revokeDeviceTrust = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new AppError('User not authenticated', 401));
        }
        
        const { deviceId } = req.params;
        
        const DeviceStore = require('../models/DeviceStore.js').default;
        
        const device = await DeviceStore.findOneAndUpdate(
            {
                _id: deviceId,
                userId: req.user._id,
            },
            {
                trustedStatus: 'compromised',
                compromisedAt: new Date(),
            },
            { new: true }
        );
        
        if (!device) {
            return next(new AppError('Device not found', 404));
        }
        
        res.status(200).json({
            status: 'success',
            message: 'Device trust revoked',
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * List all trusted devices
 * GET /api/devices/trusted
 */
export const listTrustedDevices = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new AppError('User not authenticated', 401));
        }
        
        const DeviceStore = require('../models/DeviceStore.js').default;
        
        const devices = await DeviceStore.find(
            { userId: req.user._id },
            {
                fingerprint: 1,
                userAgent: 1,
                trustScore: 1,
                trustedStatus: 1,
                lastActivityAt: 1,
                seenIps: 1,
            }
        ).sort({ lastActivityAt: -1 });
        
        res.status(200).json({
            status: 'success',
            count: devices.length,
            devices: devices.map(d => ({
                id: d._id,
                fingerprint: d.fingerprint.slice(0, 16),
                userAgent: d.userAgent.slice(0, 100),
                trustScore: d.trustScore,
                trusted: d.trustedStatus === 'verified',
                lastSeen: d.lastActivityAt,
                ips: d.seenIps.slice(0, 5), // Show last 5 IPs
            })),
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * Get security summary / risk dashboard
 * GET /api/security/risk-summary
 */
export const getRiskSummary = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new AppError('User not authenticated', 401));
        }
        
        const DeviceStore = require('../models/DeviceStore.js').default;
        const BehaviorStore = require('../models/BehaviorStore.js').default;
        
        // Get devices
        const devices = await DeviceStore.find({ userId: req.user._id });
        const trustedDevices = devices.filter(d => d.trustedStatus === 'verified').length;
        const compromisedDevices = devices.filter(d => d.trustedStatus === 'compromised').length;
        const avgTrustScore = devices.length > 0
            ? Math.round(devices.reduce((sum, d) => sum + d.trustScore, 0) / devices.length)
            : 0;
        
        // Get recent behavior
        const recentBehavior = await BehaviorStore.find(
            { userId: req.user._id },
            null,
            { sort: { timestamp: -1 }, limit: 100 }
        );
        
        const criticalAnomalies = recentBehavior.filter(b => b.riskScore >= 80).length;
        const highRiskRequests = recentBehavior.filter(b => b.riskScore >= 60).length;
        
        // Calculate summary risk
        let summaryRiskLevel = 'low';
        if (compromisedDevices > 0 || criticalAnomalies > 0) {
            summaryRiskLevel = 'critical';
        } else if (highRiskRequests > 5 || devices.some(d => d.trustScore < 40)) {
            summaryRiskLevel = 'high';
        } else if (highRiskRequests > 0 || devices.some(d => d.trustScore < 60)) {
            summaryRiskLevel = 'medium';
        }
        
        res.status(200).json({
            status: 'success',
            riskSummary: {
                overallRiskLevel: summaryRiskLevel,
                deviceMetrics: {
                    totalDevices: devices.length,
                    trustedDevices,
                    compromisedDevices,
                    averageTrustScore: avgTrustScore,
                },
                behaviorMetrics: {
                    recentRequests: recentBehavior.length,
                    criticalAnomalies,
                    highRiskRequests,
                },
                recommendations: this.generateRecommendations(
                    trustedDevices,
                    compromisedDevices,
                    criticalAnomalies,
                    avgTrustScore
                ),
            },
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * Generate security recommendations
 */
function generateRecommendations(trusted, compromised, anomalies, avgScore) {
    const recommendations = [];
    
    if (compromised > 0) {
        recommendations.push('⚠️ Revoke access from compromised devices immediately');
    }
    
    if (anomalies > 5) {
        recommendations.push('🔒 Review recent activity for signs of account compromise');
    }
    
    if (avgScore < 50) {
        recommendations.push('📱 Verify and trust your frequently used devices');
    }
    
    if (trusted === 0) {
        recommendations.push('✅ No trusted devices yet. Mark your devices as trusted to improve UX');
    }
    
    if (recommendations.length === 0) {
        recommendations.push('✅ Your account security is in good shape');
    }
    
    return recommendations;
}

function hashFingerprint(fingerprint) {
    return crypto
        .createHash('sha256')
        .update(fingerprint)
        .digest('hex');
}

export default {
    verifyMFA,
    getDeviceTrustStatus,
    trustDevice,
    revokeDeviceTrust,
    listTrustedDevices,
    getRiskSummary,
};
