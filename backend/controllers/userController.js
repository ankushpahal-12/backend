import User from '../models/User.js';
import AppError from '../utils/errorUtils.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { generateOTP } from '../utils/otpUtils.js';
import { sendOTP, sendSecurityAlert } from '../utils/emailService.js';
import { emitToUser } from '../socket.js';

export const getMe = async (req, res, next) => {
    // VULN-4 FIX: Return only safe, explicit fields — not the full req.user object
    // (which includes activeSessions, loginAttempts, lockUntil, etc.)
    const { _id, name, email, role, isVerified, createdAt, googleId, walletAddress, twoFactorEnabled } = req.user;
    res.status(200).json({
        status: 'success',
        data: {
            user: { _id, name, email, role, isVerified, createdAt, googleId, walletAddress, twoFactorEnabled }
        }
    });
};

export const updateMe = async (req, res, next) => {
    try {
        // 1) Create error if user POSTs password data
        if (req.body.password) {
            return next(new AppError('This route is not for password updates. Please use /update-password.', 400));
        }

        // 2) Only allow safe, explicit fields — never allow role, password, or verified-status changes here
        const filteredBody = {};
        if (req.body.name) filteredBody.name = req.body.name;

        // Email changes require a verified email-change flow (OTP to the new address).
        // Allowing unverified email changes here would let attackers hijack accounts.
        if (req.body.email) {
            return next(new AppError('Email changes must go through the secure email-change flow. Contact support.', 400));
        }

        // 3) Update user document
        const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });
    } catch (err) {
        next(err);
    }
};

export const getMySessions = async (req, res, next) => {
    try {
        let currentToken = req.cookies.jwt;

        // Support header-based JWT for current session detection
        if (!currentToken && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            currentToken = req.headers.authorization.split(' ')[1];
        }

        const hashedCurrentToken = currentToken
            ? crypto.createHash('sha256').update(currentToken).digest('hex')
            : null;

        const sessions = req.user.activeSessions.map(session => ({
            ...session.toObject(),
            isCurrent: session.token === hashedCurrentToken,
            token: undefined // SECURITY: never expose hashed session tokens to the client
        }));

        res.status(200).json({
            status: 'success',
            data: { sessions }
        });
    } catch (err) {
        next(err);
    }
};

export const terminateSession = async (req, res, next) => {
    try {
        const { sessionId } = req.params;

        req.user.activeSessions = req.user.activeSessions.filter(
            session => session.sessionId !== sessionId
        );

        await req.user.save({ validateBeforeSave: false });

        // Real-time notification to user's other sessions
        emitToUser(req.user._id, 'security_alert', {
            type: 'session_terminated',
            severity: 'info',
            message: 'A session was terminated from your account.',
            ts: new Date().toISOString(),
        });

        res.status(200).json({
            status: 'success',
            message: 'Session terminated successfully'
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to terminate node'
        });
    }
};

// --- Secure Account Purge Protocols ---

export const requestPurgeOtp = async (req, res, next) => {
    try {
        const otp = generateOTP();

        // SECURITY: bcrypt (12 rounds) for the purge OTP.
        // SHA-256 is too fast for 6-digit OTPs — brute-forceable in milliseconds.
        const hashedOtp = await bcrypt.hash(otp, 12);
        req.user.purgeOtp = hashedOtp;
        req.user.purgeOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await req.user.save({ validateBeforeSave: false });

        // Send account-deletion confirmation OTP via email.
        // If delivery fails: clear the OTP from DB and return 503 so the
        // user is never silently left without a code they can't receive.
        try {
            await sendOTP(req.user.email, otp, 'accountPurge');
        } catch (emailErr) {
            console.error('[PURGE] OTP email delivery failed:', emailErr.message);
            // Rollback — clear the OTP so it can't be used without delivery
            req.user.purgeOtp = undefined;
            req.user.purgeOtpExpires = undefined;
            await req.user.save({ validateBeforeSave: false });
            return next(new AppError('Failed to send confirmation code. Please try again shortly.', 503));
        }

        res.status(200).json({
            status: 'success',
            message: 'A confirmation code has been sent to your registered email address.'
        });
    } catch (err) {
        next(err);
    }
};

export const verifyPurgeOtp = async (req, res, next) => {
    try {
        const { otp } = req.body;
        if (!otp) {
            return next(new AppError('OTP is required', 400));
        }
        // SECURITY: Use bcrypt comparison (consistent with all other OTPs in codebase)
        const isValid = await bcrypt.compare(otp, req.user.purgeOtp || '');
        if (!isValid || !req.user.purgeOtpExpires || req.user.purgeOtpExpires < Date.now()) {
            return next(new AppError('Invalid or expired neural code', 400));
        }

        req.user.isPurgeVerified = true;
        await req.user.save({ validateBeforeSave: false });

        res.status(200).json({
            status: 'success',
            message: 'Sequence verified. Authorization required.'
        });
    } catch (err) {
        next(err);
    }
};

export const purgeAccount = async (req, res, next) => {
    try {
        const { password } = req.body;
        if (!req.user.isPurgeVerified) {
            return next(new AppError('Verification sequence incomplete', 400));
        }

        const isPasswordCorrect = await req.user.correctPassword(password, req.user.password);
        if (!isPasswordCorrect) {
            return next(new AppError('Authorization sequence mismatch', 401));
        }

        // VULN-5 FIX: Delete user account after password verification
        await User.findByIdAndDelete(req.user.id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        next(err);
    }
};

export const deactivateAccount = async (req, res, next) => {
    try {
        const { password } = req.body;
        const isPasswordCorrect = await req.user.correctPassword(password, req.user.password);
        if (!isPasswordCorrect) {
            return next(new AppError('Authorization sequence mismatch', 401));
        }

        req.user.active = false;
        await req.user.save({ validateBeforeSave: false });

        // Notify all other sessions in real-time
        emitToUser(req.user._id, 'security_alert', {
            type: 'account_deactivated',
            severity: 'warning',
            message: 'Your account has been deactivated.',
            ts: new Date().toISOString(),
        });

        sendSecurityAlert(req.user.email, 'account_deactivated').catch(err =>
            console.error('Deactivation alert failed:', err)
        );

        res.status(200).json({
            status: 'success',
            message: 'Neural Core Suspended'
        });
    } catch (err) {
        next(err);
    }
};

// VULN-9 FIX: Implement the missing updatePassword controller.
// updateMe rejects password fields and tells users to use /update-password —
// but that route and controller were never implemented, causing 404s.
export const updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, password } = req.body;

        if (!currentPassword || !password) {
            return next(new AppError('Please provide current password and new password', 400));
        }

        // 1) Re-fetch user with password selected (protect middleware doesn't select it)
        const user = await User.findById(req.user.id).select('+password');

        // 2) Verify current password
        const isCorrect = await user.correctPassword(currentPassword, user.password);
        if (!isCorrect) {
            return next(new AppError('Current password is incorrect', 401));
        }

        // 3) Validate new password strength via PasswordSchema
        const { PasswordSchema } = await import('../utils/validationSchemas.js');
        try {
            PasswordSchema.parse(password);
        } catch {
            return next(new AppError('New password must be at least 8 characters and contain uppercase, lowercase, number, and special character', 400));
        }

        // 4) Update (Mongoose pre-save hook will hash the new password)
        user.password = password;
        // Clear all sessions to force re-login on every device after password change
        user.activeSessions = [];
        await user.save();

        // Real-time toast notification via Socket.io
        emitToUser(user._id, 'security_alert', {
            type: 'password_changed',
            severity: 'success',
            message: 'Your password was changed successfully. All other sessions have been signed out.',
            ts: new Date().toISOString(),
        });

        // Fire password-changed security alert email (non-blocking)
        sendSecurityAlert(user.email, 'password_changed').catch(err =>
            console.error('Password change alert failed:', err)
        );

        res.status(200).json({
            status: 'success',
            message: 'Password updated successfully. Please log in again.'
        });
    } catch (err) {
        next(err);
    }
};
