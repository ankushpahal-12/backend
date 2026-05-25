import express from 'express';
import * as authController from '../controllers/authController.js';
import * as tokenController from '../controllers/tokenController.js';
import * as twoFactorController from '../controllers/twoFactorController.js';
import { initSession, validateSessionId } from '../controllers/sessionController.js';
import { protect } from '../middlewares/authMiddleware.js';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import detectBot from '../middlewares/botDetectionMiddleware.js';
import config from '../config/config.js';
import {
    validateSchema,
    registerSchema,
    loginSchema,
    verifyOTPSchema,
    resetPasswordSchema,
    adminLoginSchema
} from '../utils/validationSchemas.js';

const router = express.Router();

const buildLimiter = (windowMs, max, message) => rateLimit({
    windowMs,
    max,
    message: {
        status: 'error',
        message,
    },
    standardHeaders: true,
    legacyHeaders: false,
    trustProxy: true,
    keyGenerator: ipKeyGenerator,
    skip: (req) => req.method === 'OPTIONS', // Don't count CORS preflight requests
});

// General rate limit for most auth routes
const authLimit = rateLimit({
    windowMs: config.rateLimit.authWindowMs,
    max: config.rateLimit.authMax,
    message: {
        status: 'error',
        message: 'Too many authentication attempts from this IP, please try again in 15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
    trustProxy: true,
    keyGenerator: ipKeyGenerator,
    skip: (req) => req.method === 'OPTIONS', // Don't count CORS preflight requests
});

// Stricter rate limit for the actual login/register endpoints (prevent brute force)
const strictLimit = buildLimiter(
    config.rateLimit.strictAuthWindowMs,
    config.rateLimit.strictAuthMax,
    'Brute force protection: Too many login attempts. Try again in 1 hour.'
);

// Stricter rate limit for admin 2FA (3 attempts per 15 min)
const admin2FALimit = buildLimiter(
    config.rateLimit.authProfiles.adminOtpWindowMs,
    config.rateLimit.authProfiles.adminOtpMax,
    'Too many admin 2FA attempts. Please wait before trying again.'
);

// Very tight limit for check-email to prevent user enumeration
const checkEmailLimit = buildLimiter(
    config.rateLimit.authProfiles.emailCheckWindowMs,
    config.rateLimit.authProfiles.emailCheckMax,
    'Too many email check requests. Please wait before retrying.'
);

const loginLimit = buildLimiter(
    config.rateLimit.authProfiles.loginWindowMs,
    config.rateLimit.authProfiles.loginMax,
    'Too many login attempts. Please wait before trying again.'
);

const otpLimit = buildLimiter(
    config.rateLimit.authProfiles.otpWindowMs,
    config.rateLimit.authProfiles.otpMax,
    'Too many OTP attempts. Please wait before retrying.'
);

const resetLimit = buildLimiter(
    config.rateLimit.authProfiles.resetWindowMs,
    config.rateLimit.authProfiles.resetMax,
    'Too many password reset attempts. Please wait before retrying.'
);

const adminLoginLimit = buildLimiter(
    config.rateLimit.authProfiles.adminLoginWindowMs,
    config.rateLimit.authProfiles.adminLoginMax,
    'Too many admin login attempts. Please wait before retrying.'
);

// Pre-auth session initialization (lenient rate-limit — lightweight operation called frequently)
// Allow 100 requests per minute (1.67/sec) to accommodate navigation buttons and retries
// CORS preflight OPTIONS requests are automatically skipped by buildLimiter
const sessionInitLimit = buildLimiter(
    60 * 1000,  // 1 minute window
    100,        // 100 requests per minute
    'Too many session initialization requests. Please try again in a moment.'
);

router.post('/init-session', sessionInitLimit, initSession);

// Routes
router.post('/register', loginLimit, detectBot, validateSessionId, validateSchema(registerSchema), authController.register);
router.post('/check-email', checkEmailLimit, authController.checkEmailAvailability);
router.post('/login', loginLimit, detectBot, validateSessionId, validateSchema(loginSchema), authController.login);
router.post('/force-login', loginLimit, detectBot, validateSchema(loginSchema), authController.forceLogin);
router.post('/admin/login', adminLoginLimit, detectBot, validateSchema(adminLoginSchema), authController.adminLogin);
router.post('/admin/verify-2fa', admin2FALimit, authController.adminVerify2FA);
router.post('/verify-login-otp', otpLimit, validateSchema(verifyOTPSchema), authController.verifyLoginOTP);
router.post('/verify-email', otpLimit, validateSchema(verifyOTPSchema), authController.verifyEmail);
router.post('/verify-email-and-set-password', otpLimit, authController.verifyEmailAndSetPassword); // Public endpoint for user to verify email + set password
router.post('/resend-otp', otpLimit, authController.resendOTP);
router.post('/forgot-password', resetLimit, authController.forgotPassword);
router.post('/reset-password', resetLimit, validateSchema(resetPasswordSchema), authController.resetPassword);
router.post('/google', authLimit, authController.googleLogin);
router.get('/web3/nonce', authLimit, authController.getNonce);
router.post('/web3/verify', loginLimit, authController.verifyWeb3);

// ════════════════════════════════════════════════════════════════════════════
// REFRESH TOKEN ROUTE (NEW)
// Allows clients to get new access token using refresh token
// ════════════════════════════════════════════════════════════════════════════
const refreshLimit = buildLimiter(
    config.rateLimit.authProfiles.refreshWindowMs || (5 * 60 * 1000),
    config.rateLimit.authProfiles.refreshMax || 10,
    'Too many token refresh attempts. Please wait before retrying.'
);

router.post('/refresh', refreshLimit, tokenController.refreshAccessToken);
router.post('/logout', protect, tokenController.logout); // HIGH-3: Must be POST to prevent CSRF logout via img/link tags
router.post('/logout-all-devices', protect, tokenController.logoutAllDevices);
router.get('/active-sessions', protect, tokenController.getActiveSessions);

// ════════════════════════════════════════════════════════════════════════════
// SESSION VALIDATION ROUTE (NEW)
// Used by security wrappers to verify user session is still valid
// Returns 200 if authenticated, 401 if session expired
// ════════════════════════════════════════════════════════════════════════════
router.post('/validate-session', protect, (req, res) => {
	res.json({
		status: 'success',
		message: 'Session is valid',
		user: req.user,
	});
});

// ════════════════════════════════════════════════════════════════════════════
// RATE LIMIT CHECK ROUTE (NEW)
// Server-side rate limiting for admin pages
// Checks if user has exceeded access limits
// ════════════════════════════════════════════════════════════════════════════
router.post('/check-rate-limit', protect, authController.checkRateLimit);

// ════════════════════════════════════════════════════════════════════════════
// CLIENT IP ROUTE (NEW)
// Returns the client's IP address (server-side caching handled here)
// ════════════════════════════════════════════════════════════════════════════
router.get('/client-ip', protect, authController.getClientIP);

// ─── TOTP 2FA Routes ───────────────────────────────────────────────────────────
router.post('/2fa/setup', protect, twoFactorController.setup2FA);
router.post('/2fa/confirm', protect, twoFactorController.confirm2FA);
router.post('/2fa/disable', protect, twoFactorController.disable2FA);
router.post('/2fa/verify-login', otpLimit, twoFactorController.verifyTOTPLogin);

export default router;
