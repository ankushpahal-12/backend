/**
 * Zero Trust API Routes
 * Endpoints for device management, MFA verification, and risk assessment
 */

import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import zeroTrustController from '../controllers/zeroTrustController.js';
import { 
    verifyMFAChallenge as verifyMFAMiddleware,
    zeroTrustVerify,
    zeroTrustDecision
} from '../middlewares/zeroTrustMiddleware.js';

const router = express.Router();

// ════════════════════════════════════════════════════════════════════════════
// MFA VERIFICATION (Public endpoint, but requires valid challenge)
// ════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/auth/verify-mfa
 * Verify MFA code for high-risk requests
 * 
 * Body:
 * {
 *   mfaChallengeId: string,
 *   mfaCode: string (6 digits)
 * }
 */
router.post('/auth/verify-mfa', zeroTrustController.verifyMFA);

// ════════════════════════════════════════════════════════════════════════════
// DEVICE MANAGEMENT (Protected - authenticated users only)
// ════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/devices/trusted
 * List all trusted devices for current user
 */
router.get(
    '/devices/trusted',
    protect,
    zeroTrustVerify,
    zeroTrustDecision,
    zeroTrustController.listTrustedDevices
);

/**
 * GET /api/devices/trust-status
 * Get trust status of a specific device
 * 
 * Query: ?fingerprint=...
 */
router.get(
    '/devices/trust-status',
    protect,
    zeroTrustController.getDeviceTrustStatus
);

/**
 * POST /api/devices/trust
 * Mark a device as trusted (requires MFA)
 * 
 * Body:
 * {
 *   deviceFingerprint: string
 * }
 */
router.post(
    '/devices/trust',
    protect,
    zeroTrustVerify,
    zeroTrustDecision,
    zeroTrustController.trustDevice
);

/**
 * DELETE /api/devices/trust/:deviceId
 * Revoke trust from a device
 */
router.delete(
    '/devices/trust/:deviceId',
    protect,
    zeroTrustVerify,
    zeroTrustDecision,
    zeroTrustController.revokeDeviceTrust
);

// ════════════════════════════════════════════════════════════════════════════
// SECURITY MONITORING (Protected - authenticated users only)
// ════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/security/risk-summary
 * Get comprehensive security/risk summary for current user
 */
router.get(
    '/security/risk-summary',
    protect,
    zeroTrustVerify,
    zeroTrustDecision,
    zeroTrustController.getRiskSummary
);

/**
 * POST /api/security/anomaly
 * Report detected anomaly (frontend)
 * Rate-limited endpoint
 */
router.post('/security/anomaly', (req, res) => {
    const { type, details } = req.body;
    
    if (!type) {
        return res.status(400).json({ status: 'error', message: 'Anomaly type required' });
    }
    
    console.log(`[ZERO_TRUST] Frontend anomaly report: ${type}`, details);
    
    // Just acknowledge - we log and monitor
    res.status(204).end();
});

export default router;
