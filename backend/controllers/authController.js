import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import config from '../config/config.js';
import AppError from '../utils/errorUtils.js';
import * as authService from '../services/authService.js';
import * as loginAttemptService from '../services/loginAttemptService.js';
import * as refreshTokenService from '../services/refreshTokenService.js';
import User from '../models/User.js';
import { hashDeviceToken } from '../utils/otpUtils.js';
import { markSessionComplete } from './sessionController.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Cookie helpers ────────────────────────────────────────────────────────────

const DEVICE_COOKIE_NAME = 'dt';
const DEVICE_COOKIE_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // 1 year

const shouldUseSecureCookie = (req) => (
    req.secure || req.headers['x-forwarded-proto'] === 'https' || config.env === 'production'
);

const sameSiteValue = String(config.cookieSameSite || (config.env === 'production' ? 'none' : 'lax'));

const buildBaseCookieOptions = (req) => {
    const base = {
        httpOnly: true,
        secure: shouldUseSecureCookie(req),
        sameSite: sameSiteValue.charAt(0).toUpperCase() + sameSiteValue.slice(1).toLowerCase(),
        path: '/',
    };

    if (config.cookieDomain) {
        base.domain = config.cookieDomain;
    }

    return base;
};

const getDeviceTokenCookieOptions = (req) => ({
    ...buildBaseCookieOptions(req),
    maxAge: DEVICE_COOKIE_MAX_AGE_MS,
});



const signToken = (id, sid) => {
    return jwt.sign({ id, sid }, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn,
    });
};

export const createSendToken = async (user, statusCode, req, res, apiKey = null) => {
    // 1) Clear any existing JWT cookie to prevent session fixation
    res.clearCookie('jwt', buildBaseCookieOptions(req));

    // 2) Generate a brand-new unique session ID (sid) for session rotation
    const sid = crypto.randomBytes(16).toString('hex');
    const token = signToken(user._id, sid);

    const cookieOptions = {
        ...buildBaseCookieOptions(req),
        expires: new Date(
            Date.now() + config.cookieExpiresIn * 60 * 60 * 1000
        ),
    };

    // 3) Issue the new secure token ONLY if consent is given
    const consent = req.cookies.cookieConsent;
    if (consent === 'accepted') {
        res.cookie('jwt', token, cookieOptions);
    }

    // 4) Save the fresh session to the user's active clusters (store hashed token)
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Ensure activeSessions exists
    if (!user.activeSessions) {
        user.activeSessions = [];
    }

    user.activeSessions.push({
        sessionId: sid,
        token: hashedToken,
        expiresAt,
        ip: req.ip,
        userAgent: req.headers['user-agent']
    });

    // Limit number of concurrent sessions
    if (user.activeSessions.length > 5) {
        user.activeSessions.shift();
    }

    // ════════════════════════════════════════════════════════════════════════════
    // REFRESH TOKEN GENERATION (NEW)
    // Issue a long-lived refresh token for token rotation
    // ════════════════════════════════════════════════════════════════════════════
    const rawRefreshToken = refreshTokenService.generateRefreshToken();
    const hashedRefreshToken = refreshTokenService.hashRefreshToken(rawRefreshToken);
    
    // Add refresh token to user
    if (!user.refreshTokens) {
        user.refreshTokens = [];
    }
    
    user.refreshTokens.push({
        token: hashedRefreshToken,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    
    // Enforce max 10 refresh tokens
    if (user.refreshTokens.length > 10) {
        user.refreshTokens = user.refreshTokens.slice(-10);
    }
    
    // Create JWT for refresh token
    const refreshTokenJWT = refreshTokenService.createRefreshTokenJWT(
        rawRefreshToken,
        user._id.toString()
    );

    await user.save({ validateBeforeSave: false });

    // Remove sensitive fields from output
    user.password = undefined;
    user.otp = undefined;
    user.apiKey = undefined;
    user.trustedDevices = undefined;
    user.activeSessions = undefined;
    user.refreshTokens = undefined;

    res.status(statusCode).json({
        status: 'success',
        // Token is ONLY delivered via the HttpOnly cookie above.
        // Never send it in the response body — any JS-readable storage is XSS-accessible.
        apiKey,
        // Refresh token is sent in body because it's a long-lived token for rotation
        // It's used by frontend to get new access tokens when current one expires
        refreshToken: refreshTokenJWT,
        data: {
            user,
        },
    });
};

// ─── Auth Controllers ──────────────────────────────────────────────────────────

export const register = async (req, res, next) => {
    try {
        const deviceInfo = {
            userAgent: req.headers['user-agent'],
            ip: req.ip
        };

        const { requestId } = req.body;
        const { email, apiKey, deviceToken } = await authService.registerUser(req.body, deviceInfo, requestId);

        // Mark the pre-auth session as completed
        await markSessionComplete(req.body.sid);

        // CRIT-3: Set device token cookie on registration so the device is trusted after verification
        // ONLY if user accepted cookies
        if (deviceToken && req.cookies.cookieConsent === 'accepted') {
            res.cookie(DEVICE_COOKIE_NAME, deviceToken, getDeviceTokenCookieOptions(req));
        }

        res.status(201).json({
            status: 'success',
            message: 'OTP sent to email. Please verify your account.',
            email,
            apiKey
        });
    } catch (err) {
        next(err);
    }
};

export const checkEmailAvailability = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return next(new AppError('Email is required', 400));
        }

        // ✅ SECURITY FIX: Always return 200 OK with ambiguous message
        // This prevents email enumeration attacks (cannot determine which emails are registered)
        // In production, always respond identically whether email exists or not
        const isRegistered = await authService.isEmailRegistered(email);
        
        // Log the actual result for admin/security team analysis (not exposed to client)
        if (isRegistered) {
            console.log(`[EMAIL_CHECK] Email already registered: ${email}`);
        } else {
            console.log(`[EMAIL_CHECK] Email available for registration: ${email}`);
        }

        // Always return same response to prevent enumeration
        res.status(200).json({
            status: 'success',
            message: 'If this email is registered, you will receive an email with further instructions. Check your spam folder.'
        });
    } catch (err) {
        next(err);
    }
};

export const googleLogin = async (req, res, next) => {
    try {
        const { idToken } = req.body;
        if (!idToken) return next(new AppError('ID token is required', 400));

        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) return next(new AppError('Invalid Google token payload', 401));

        const { email, name, sub: googleId } = payload;

        // ✅ SECURITY FIX: Use atomic findOneAndUpdate to prevent race conditions
        // First, try to find existing user by googleId
        let user = await User.findOne({ googleId });

        if (!user) {
            // Try to find by email and link Google ID atomically
            try {
                user = await User.findOneAndUpdate(
                    { email, googleId: null },  // Find by email, ensure googleId not set
                    {
                        $set: {
                            googleId,
                            isVerified: true,
                            name: name || undefined,  // Update name only if not set
                        }
                    },
                    { 
                        new: true,  // Return updated document
                        upsert: false  // Don't create if doesn't exist
                    }
                );

                // If no user found by email, create new one atomically
                if (!user) {
                    try {
                        user = await User.create({
                            name,
                            email,
                            googleId,
                            password: crypto.randomBytes(16).toString('hex'),
                            isVerified: true,
                        });
                    } catch (createErr) {
                        // If duplicate key error (race condition from concurrent request),
                        // refetch the user (who just created by other request)
                        if (createErr.code === 11000) {
                            user = await User.findOne({ email });
                            if (!user || !user.googleId) {
                                return next(new AppError('Account creation failed. Please try again.', 500));
                            }
                        } else {
                            throw createErr;
                        }
                    }
                }
            } catch (err) {
                if (err.statusCode) return next(err);
                return next(new AppError('Failed to link Google account. Please try again.', 500));
            }
        }

        if (user.isLocked) {
            return next(new AppError('Account is temporarily locked. Please try again later.', 423));
        }

        await createSendToken(user, 200, req, res);
    } catch (err) {
        if (err.statusCode) return next(err);
        return next(new AppError('Invalid Google token. Please try again.', 401));
    }
};

export const verifyEmail = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const user = await authService.verifyUserEmail(email, otp);
        createSendToken(user, 200, req, res);
    } catch (err) {
        next(err);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password, force, requestId } = req.body;
        const deviceInfo = {
            userAgent: req.headers['user-agent'],
            ip: req.ip
        };

        // CRIT-3: Pass device token cookie to service for secure device matching
        // Fallback to _dtHint body field when cookie is unavailable (e.g. no cookie consent)
        const deviceTokenFromCookie = req.cookies[DEVICE_COOKIE_NAME] || req.body._dtHint || null;

        // ════════════════════════════════════════════════════════════════════════════
        // LOGIN ATTEMPT LOGGING (NEW)
        // Tracks login attempts for security monitoring and anomaly detection
        // ════════════════════════════════════════════════════════════════════════════
        
        let result;
        try {
            result = await authService.loginUser(email, password, deviceInfo, requestId, deviceTokenFromCookie);
            
            // Log successful login
            const user = result.user || {};
            await loginAttemptService.logLoginAttempt({
                userId: user._id?.toString(),
                email,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                status: 'success',
                deviceFingerprint: deviceTokenFromCookie?.substring(0, 32) || null,
            });
        } catch (err) {
            // Log failed login attempt
            let failureReason = 'wrong-password';
            if (err.message?.includes('not found')) {
                failureReason = 'user-not-found';
            } else if (err.message?.includes('locked')) {
                failureReason = 'account-locked';
            } else if (err.message?.includes('verified')) {
                failureReason = 'email-not-verified';
            }
            
            await loginAttemptService.logLoginAttempt({
                email,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                status: 'failed',
                failureReason,
                deviceFingerprint: deviceTokenFromCookie?.substring(0, 32) || null,
            });
            
            throw err;
        }

        if (result.requireOTP) {
            return res.status(200).json({
                status: 'success',
                ...result
            });
        }

        // Check if TOTP 2FA is enabled — return challenge instead of session
        if (result.user && result.user.twoFactorEnabled) {
            return res.status(200).json({
                status: 'success',
                requireTOTP: true,
                email: result.user.email,
                message: 'Please enter the code from your authenticator app.',
            });
        }

        // Check for concurrent session conflict (if not forced)
        if (!force && result.activeSessionsCount > 0) {
            return res.status(409).json({
                status: 'conflict',
                message: 'Active session already detected on another tab or browser.',
                activeSessionsCount: result.activeSessionsCount
            });
        }

        // Mark the pre-auth session as completed
        await markSessionComplete(req.body.sid);

        createSendToken(result.user, 200, req, res);
    } catch (err) {
        if (err.statusCode === 403 && err.email) {
            return res.status(403).json({
                status: 'fail',
                message: err.message,
                email: err.email
            });
        }
        next(err);
    }
};

export const forceLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const deviceInfo = {
            userAgent: req.headers['user-agent'],
            ip: req.ip
        };

        // CRIT-3: Pass device token cookie
        // Fallback to _dtHint body field when cookie is unavailable
        const deviceTokenFromCookie = req.cookies[DEVICE_COOKIE_NAME] || req.body._dtHint || null;

        // 1) Verify credentials first
        const result = await authService.loginUser(email, password, deviceInfo, null, deviceTokenFromCookie);

        // HIGH-5: If new device requires OTP, do NOT bypass — return the challenge
        if (result.requireOTP) {
            return res.status(200).json({
                status: 'success',
                ...result
            });
        }

        // 2) Force logout all previous sessions
        const user = await authService.forceUserLogin(email);

        // 3) Broadcast forced logout signal via Socket.io
        import('../socket.js').then(({ getIO }) => {
            const io = getIO();
            io.to(user._id.toString()).emit('forced_logout', {
                message: 'Session started on another browser/tab.'
            });
        }).catch(err => console.error('Socket broadcast failed:', err));

        // 4) Issue new session
        createSendToken(user, 200, req, res);
    } catch (err) {
        next(err);
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        await authService.processForgotPassword(req.body.email);
        res.status(200).json({ status: 'success', message: 'Password reset OTP sent to email' });
    } catch (err) {
        next(err);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, password, logoutAll } = req.body;
        const user = await authService.processResetPassword(email, otp, password);

        if (logoutAll) {
            user.activeSessions = [];
            await user.save({ validateBeforeSave: false });

            import('../socket.js').then(({ getIO }) => {
                const io = getIO();
                io.to(user._id.toString()).emit('forced_logout', {
                    message: 'Password reset completed. All devices logged out for security.'
                });
            }).catch(err => console.error('Socket broadcast failed:', err));

            return res.status(200).json({
                status: 'success',
                message: 'Password reset and all sessions terminated.'
            });
        }

        createSendToken(user, 200, req, res);
    } catch (err) {
        next(err);
    }
};

export const resendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;
        
        // ════════════════════════════════════════════════════════════════════════════
        // EMAIL ENUMERATION PREVENTION
        // Always return same message regardless of whether email exists
        // This prevents attackers from enumerating registered emails
        // ════════════════════════════════════════════════════════════════════════════
        
        if (!email) {
            return res.status(200).json({
                status: 'success',
                message: 'If an account exists with this email, an OTP will be sent shortly.'
            });
        }
        
        try {
            await authService.resendUserOTP(email);
        } catch (err) {
            // Log the error internally but always return same response to frontend
            console.warn(`OTP resend failed for ${email}:`, err.message);
        }
        
        // Always return success message - don't leak if email exists
        res.status(200).json({
            status: 'success',
            message: 'If an account exists with this email, an OTP will be sent shortly.',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
};

export const adminLogin = async (req, res, next) => {
    try {
        const { email, password, requestId } = req.body;
        const deviceInfo = {
            userAgent: req.headers['user-agent'],
            ip: req.ip
        };

        const result = await authService.adminLoginRequest(email, password, deviceInfo, requestId);
        res.status(200).json({
            status: 'success',
            ...result
        });
    } catch (err) {
        next(err);
    }
};

export const adminVerify2FA = async (req, res, next) => {
    try {
        const { email, otp, requestId } = req.body;

        const user = await authService.verifyAdmin2FA(email, otp, requestId);
        createSendToken(user, 200, req, res);
    } catch (err) {
        next(err);
    }
};

export const verifyLoginOTP = async (req, res, next) => {
    try {
        const { email, otp, trustDevice } = req.body;
        const deviceInfo = {
            userAgent: req.headers['user-agent'],
            ip: req.ip
        };

        const { user, plainDeviceToken } = await authService.verifyLoginOTP(email, otp, deviceInfo, trustDevice);

        // CRIT-3: Set device token cookie if the user chose to trust this device
        // ONLY if user accepted cookies
        if (plainDeviceToken && req.cookies.cookieConsent === 'accepted') {
            res.cookie(DEVICE_COOKIE_NAME, plainDeviceToken, getDeviceTokenCookieOptions(req));
        }

        createSendToken(user, 200, req, res);
    } catch (err) {
        next(err);
    }
};

export const logout = async (req, res) => {
    try {
        let token = req.cookies.jwt;

        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token && req.user) {
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
            req.user.activeSessions = req.user.activeSessions.filter(s => s.token !== hashedToken);
            await req.user.save({ validateBeforeSave: false });
        }

        res.cookie('jwt', 'loggedout', {
            ...buildBaseCookieOptions(req),
            expires: new Date(Date.now() + 10 * 1000),
        });
        res.status(200).json({ status: 'success' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Logout failed' });
    }
};

export const getNonce = async (req, res, next) => {
    try {
        const { address } = req.query;
        if (!address) {
            return next(new AppError('Wallet address is required', 400));
        }
        const nonce = await authService.getWeb3Nonce(address);
        res.status(200).json({ status: 'success', nonce });
    } catch (err) {
        next(err);
    }
};

export const verifyWeb3 = async (req, res, next) => {
    try {
        const { address, signature } = req.body;
        if (!address || !signature) {
            return next(new AppError('Wallet address and signature are required', 400));
        }
        const user = await authService.verifyWeb3Signature(address, signature);
        createSendToken(user, 200, req, res);
    } catch (err) {
        next(err);
    }
};

// ════════════════════════════════════════════════════════════════════════════
// USER EMAIL VERIFICATION AND PASSWORD SETUP (NEW)
// Public endpoint for users to verify email and set password (after admin creates user)
// User receives email link with OTP, verifies, and sets password
// ════════════════════════════════════════════════════════════════════════════
export const verifyEmailAndSetPassword = async (req, res, next) => {
    try {
        const { email, otp, password } = req.body;

        if (!email || !otp || !password) {
            return next(new AppError('Email, OTP, and password are required', 400));
        }

        const result = await authService.verifyEmailAndSetPassword(email, otp, password);

        // Send notification that email was verified by user
        try {
            const { sendSecurityAlert } = await import('../utils/emailService.js');
            await sendSecurityAlert(email, 'email_verified');
        } catch (emailErr) {
            console.error('Notification email failed:', emailErr);
            // Don't fail the request - email verification succeeded
        }

        res.status(200).json({
            status: 'success',
            message: 'Email verified and password set successfully. You can now log in.',
            data: {
                userId: result.userId,
                email: result.email,
            }
        });
    } catch (err) {
        next(err);
    }
};

// ════════════════════════════════════════════════════════════════════════════
// REFRESH TOKEN ENDPOINT (NEW)
// Issues new access token without requiring full re-authentication
// ════════════════════════════════════════════════════════════════════════════
export const refreshAccessToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return next(new AppError('Refresh token is required', 401));
        }
        
        // Import refresh token service
        const refreshTokenService = await import('../services/refreshTokenService.js');
        
        // Verify refresh token JWT
        let payload;
        try {
            payload = refreshTokenService.verifyRefreshTokenJWT(refreshToken);
        } catch (err) {
            return next(new AppError('Invalid or expired refresh token', 401));
        }
        
        // Find user
        const user = await User.findById(payload.userId).select('+refreshTokens');
        if (!user) {
            return next(new AppError('User not found', 401));
        }
        
        // Detect compromise (multiple IPs in short time)
        const compromise = refreshTokenService.detectCompromise(user, req.ip);
        if (compromise.isCompromised) {
            // Revoke all tokens for security
            await user.revokeAllRefreshTokens('COMPROMISE_DETECTED');
            return next(new AppError(
                'Suspicious activity detected. Please log in again.',
                401
            ));
        }
        
        // Generate new tokens
        const newRefreshTokenRaw = refreshTokenService.generateRefreshToken();
        const newRefreshTokenHash = refreshTokenService.hashRefreshToken(newRefreshTokenRaw);
        
        // Rotate old token
        await refreshTokenService.rotateRefreshToken(
            user,
            refreshToken,
            newRefreshTokenHash,
            req.ip,
            req.headers['user-agent']
        );
        
        // Generate new JWT access token
        const newAccessToken = refreshTokenService.generateAccessToken(
            user._id.toString(),
            user.activeSessions?.[0]?.sessionId
        );
        
        // Create new refresh token JWT
        const newRefreshTokenJWT = refreshTokenService.createRefreshTokenJWT(
            newRefreshTokenRaw,
            user._id.toString()
        );
        
        // Return tokens
        res.status(200).json({
            status: 'success',
            accessToken: newAccessToken,
            refreshToken: newRefreshTokenJWT,
            expiresIn: 900, // 15 minutes
            tokenType: 'Bearer',
        });
        
    } catch (err) {
        next(err);
    }
};

// ════════════════════════════════════════════════════════════════════════════
// CHECK RATE LIMIT ENDPOINT (NEW)
// Server-side rate limiting for admin pages
// Prevents excessive access attempts from authenticated users
// ════════════════════════════════════════════════════════════════════════════
export const checkRateLimit = async (req, res, next) => {
    try {
        const { page } = req.body;
        const userId = req.user._id;
        const currentTime = Date.now();
        
        // Use a combination of userId and page as the cache key
        const cacheKey = `rate_limit:${userId}:${page}`;
        
        // Redis cache for rate limiting (if available)
        // For now, using in-memory store with simplified logic
        // In production, this should use Redis for distributed caching
        if (!global.rateLimitStore) {
            global.rateLimitStore = {};
        }
        
        const rateLimitData = global.rateLimitStore[cacheKey];
        
        if (rateLimitData) {
            const timeSinceLastReset = currentTime - rateLimitData.windowStart;
            
            // Allow max 30 requests per minute
            if (timeSinceLastReset < 60000 && rateLimitData.count > 30) {
                return res.status(429).json({
                    status: 'error',
                    allowed: false,
                    message: 'Rate limit exceeded',
                    accessCount: rateLimitData.count,
                    resetIn: 60000 - timeSinceLastReset,
                });
            } else if (timeSinceLastReset > 60000) {
                // Reset the window
                global.rateLimitStore[cacheKey] = {
                    count: 1,
                    windowStart: currentTime,
                };
            } else {
                // Increment count within window
                global.rateLimitStore[cacheKey].count++;
            }
        } else {
            // First request in this window
            global.rateLimitStore[cacheKey] = {
                count: 1,
                windowStart: currentTime,
            };
        }
        
        res.status(200).json({
            status: 'success',
            allowed: true,
            message: 'Rate limit check passed',
            accessCount: global.rateLimitStore[cacheKey].count,
        });
    } catch (err) {
        next(err);
    }
};

// ════════════════════════════════════════════════════════════════════════════
// GET CLIENT IP ENDPOINT (NEW)
// Returns the client's IP address
// Server-side caching to avoid repeated external API calls
// ════════════════════════════════════════════════════════════════════════════
export const getClientIP = async (req, res, next) => {
    try {
        const userId = req.user._id;
        
        // Use in-memory cache for IP addresses (in production, use Redis)
        if (!global.ipCache) {
            global.ipCache = {};
        }
        
        const cacheKey = `ip:${userId}`;
        const cacheExpiry = 3600000; // 1 hour
        const cachedData = global.ipCache[cacheKey];
        
        // Return cached IP if available and not expired
        if (cachedData && Date.now() - cachedData.timestamp < cacheExpiry) {
            return res.status(200).json({
                status: 'success',
                ip: cachedData.ip,
                cached: true,
                source: 'server-cache',
            });
        }
        
        // Get IP from request headers
        // In production, also verify this matches the request.ip
        const clientIP = req.ip || 
                         req.headers['x-forwarded-for']?.split(',')[0].trim() ||
                         req.connection.remoteAddress ||
                         'unknown';
        
        // Cache the IP
        global.ipCache[cacheKey] = {
            ip: clientIP,
            timestamp: Date.now(),
        };
        
        res.status(200).json({
            status: 'success',
            ip: clientIP,
            cached: false,
            source: 'request-headers',
        });
    } catch (err) {
        next(err);
    }
};
