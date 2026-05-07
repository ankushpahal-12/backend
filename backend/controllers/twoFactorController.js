import AppError from '../utils/errorUtils.js';
import * as authService from '../services/authService.js';
import { createSendToken } from './authController.js';

// POST /auth/2fa/setup  (protected)
// Generates a TOTP secret, saves it as pending, returns otpauthUrl + base32
export const setup2FA = async (req, res, next) => {
    try {
        const { otpauthUrl, base32 } = await authService.generate2FASecret(req.user._id);
        res.status(200).json({
            status: 'success',
            data: { otpauthUrl, base32 },
        });
    } catch (err) {
        next(err);
    }
};

// POST /auth/2fa/confirm  (protected)
// Body: { token }  — verifies code and fully activates 2FA, sends email
export const confirm2FA = async (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) return next(new AppError('Authenticator code is required', 400));

        await authService.confirm2FAToken(req.user._id, token);
        res.status(200).json({
            status: 'success',
            message: 'Two-factor authentication has been enabled successfully.',
        });
    } catch (err) {
        next(err);
    }
};
export const disable2FA = async (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) return next(new AppError('Authenticator code is required', 400));

        await authService.disable2FA(req.user._id, token);
        res.status(200).json({
            status: 'success',
            message: 'Two-factor authentication has been disabled.',
        });
    } catch (err) {
        next(err);
    }
};

// POST /auth/2fa/verify-login  (public, rate-limited)
// Body: { email, token }  — called after password login when requireTOTP is true
export const verifyTOTPLogin = async (req, res, next) => {
    try {
        const { email, token } = req.body;
        if (!email || !token) return next(new AppError('Email and authenticator code are required', 400));

        const user = await authService.verifyTOTPLogin(email, token);
        createSendToken(user, 200, req, res);
    } catch (err) {
        next(err);
    }
};
