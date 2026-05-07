/**
 * Input Validation Middleware
 * Validates all inputs according to security requirements
 */

import { handleValidationError } from '../utils/enhancedErrorHandler.js';

/**
 * Validate MFA code format (must be 6 digits)
 */
export const validateMFACode = (req, res, next) => {
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'MFA code is required',
            errorCode: 'INVALID_MFA_CODE',
        });
    }

    const codeRegex = /^[0-9]{6}$/;
    if (!codeRegex.test(code)) {
        return res.status(400).json({
            success: false,
            message: 'MFA code must be exactly 6 digits',
            errorCode: 'INVALID_MFA_CODE',
        });
    }

    next();
};

/**
 * Validate challenge ID format
 */
export const validateChallengeId = (req, res, next) => {
    const { challengeId } = req.body;

    if (!challengeId || typeof challengeId !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Challenge ID is required',
            errorCode: 'INVALID_CHALLENGE_ID',
        });
    }

    // Should be UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(challengeId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid challenge ID format',
            errorCode: 'INVALID_CHALLENGE_ID',
        });
    }

    next();
};

/**
 * Validate device fingerprint format
 */
export const validateDeviceFingerprint = (req, res, next) => {
    const fingerprint = req.headers['x-device-fingerprint'];

    if (!fingerprint || typeof fingerprint !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Device fingerprint is required',
            errorCode: 'INVALID_FINGERPRINT',
        });
    }

    // Should be SHA-256 hex (64 characters)
    const sha256Regex = /^[a-f0-9]{64}$/i;
    if (!sha256Regex.test(fingerprint)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid device fingerprint format',
            errorCode: 'INVALID_FINGERPRINT',
        });
    }

    next();
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate email input
 */
export const validateEmailInput = (req, res, next) => {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid email address',
            errorCode: 'INVALID_EMAIL',
        });
    }

    // Sanitize email
    req.body.email = email.toLowerCase().trim();
    next();
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password) => {
    const strength = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        numbers: /[0-9]/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    return Object.values(strength).filter(Boolean).length >= 4;
};

/**
 * Validate password input
 */
export const validatePasswordInput = (req, res, next) => {
    const { password } = req.body;

    if (!password || typeof password !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Password is required',
            errorCode: 'INVALID_PASSWORD',
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 8 characters long',
            errorCode: 'WEAK_PASSWORD',
        });
    }

    if (!validatePasswordStrength(password)) {
        return res.status(400).json({
            success: false,
            message: 'Password must contain uppercase, lowercase, numbers, and special characters',
            errorCode: 'WEAK_PASSWORD',
        });
    }

    next();
};

/**
 * Validate user input (sanitize and validate)
 */
export const validateUserInput = (req, res, next) => {
    const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'address'];
    const invalidFields = Object.keys(req.body).filter(key => !allowedFields.includes(key));

    if (invalidFields.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Invalid fields: ${invalidFields.join(', ')}`,
            errorCode: 'INVALID_INPUT',
        });
    }

    // Sanitize strings
    Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
            req.body[key] = req.body[key]
                .trim()
                .replace(/[<>\"']/g, '') // Remove potential XSS characters
                .substring(0, 255); // Max length
        }
    });

    next();
};

/**
 * Validate transaction amount
 */
export const validateTransactionAmount = (req, res, next) => {
    const { amount } = req.body;

    if (!amount || typeof amount !== 'number') {
        return res.status(400).json({
            success: false,
            message: 'Valid amount is required',
            errorCode: 'INVALID_AMOUNT',
        });
    }

    if (amount <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Amount must be greater than 0',
            errorCode: 'INVALID_AMOUNT',
        });
    }

    if (amount > 1000000) {
        return res.status(400).json({
            success: false,
            message: 'Amount exceeds maximum limit',
            errorCode: 'AMOUNT_EXCEEDED',
        });
    }

    next();
};

/**
 * Validate ObjectId format
 */
export const validateObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Validate request signature (HMAC)
 */
export const validateRequestSignature = (req, res, next) => {
    const signature = req.get('x-signature');
    const timestamp = req.get('x-timestamp');

    if (!signature || !timestamp) {
        return res.status(400).json({
            success: false,
            message: 'Missing signature headers',
            errorCode: 'MISSING_SIGNATURE',
        });
    }

    // Check timestamp is not too old (prevent replay attacks)
    const requestTime = parseInt(timestamp);
    const currentTime = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    if (Math.abs(currentTime - requestTime) > maxAge) {
        return res.status(400).json({
            success: false,
            message: 'Request timestamp is too old',
            errorCode: 'TIMESTAMP_EXPIRED',
        });
    }

    next();
};

/**
 * Comprehensive input validation middleware chain
 */
export const createValidationChain = (...validators) => {
    return (req, res, next) => {
        const errors = [];

        const executeValidators = async (index) => {
            if (index >= validators.length) {
                if (errors.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Validation failed',
                        errors,
                        errorCode: 'VALIDATION_ERROR',
                    });
                }
                return next();
            }

            try {
                await validators[index](req, res, () => executeValidators(index + 1));
            } catch (error) {
                errors.push(error.message);
                executeValidators(index + 1);
            }
        };

        executeValidators(0);
    };
};

export default {
    validateMFACode,
    validateChallengeId,
    validateDeviceFingerprint,
    validateEmail,
    validateEmailInput,
    validatePasswordStrength,
    validatePasswordInput,
    validateUserInput,
    validateTransactionAmount,
    validateObjectId,
    validateRequestSignature,
    createValidationChain,
};
