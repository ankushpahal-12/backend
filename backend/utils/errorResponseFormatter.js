/**
 * ERROR RESPONSE FORMATTER
 * Standardizes all error responses across the application
 * Ensures consistent format, no information leakage, and proper logging
 */

import { ERROR_CODES } from '../config/constants.js';

/**
 * Standard error response object
 */
export const formatErrorResponse = (statusCode, code, message, details = {}) => {
    return {
        status: 'fail',
        statusCode,
        error: {
            code,
            message,
            ...(Object.keys(details).length > 0 && { details }),
            timestamp: new Date().toISOString(),
        }
    };
};

/**
 * Standardized success response for consistency
 */
export const formatSuccessResponse = (data = {}, message = 'Success', statusCode = 200) => {
    return {
        status: 'success',
        statusCode,
        message,
        data: data,
        timestamp: new Date().toISOString(),
    };
};

/**
 * Handle validation errors (Zod or other validators)
 * Logs full details but returns sanitized response to client
 */
export const formatValidationError = (errors = []) => {
    // Log full validation errors for debugging
    console.error('[VALIDATION_ERROR]', JSON.stringify(errors));
    
    // Return sanitized response to client
    return formatErrorResponse(
        400,
        ERROR_CODES.INVALID_INPUT,
        'Input validation failed',
        {
            fieldCount: errors.length,
            firstError: errors[0]?.path?.join('.') || 'unknown'
        }
    );
};

/**
 * Handle authentication errors
 * CRITICAL: Never reveal whether email exists or password is wrong
 */
export const formatAuthError = (reason = 'generic') => {
    // Log the actual reason for debugging
    console.warn(`[AUTH_ERROR] ${reason}`);
    
    // Always return same message to prevent enumeration
    return formatErrorResponse(
        401,
        ERROR_CODES.INVALID_CREDENTIALS,
        'Incorrect email or password'
    );
};

/**
 * Handle account locked errors
 */
export const formatAccountLockedError = (minutesRemaining) => {
    return formatErrorResponse(
        423,
        ERROR_CODES.ACCOUNT_LOCKED,
        `Account temporarily locked. Try again in ${minutesRemaining} minute(s)`
    );
};

/**
 * Handle OTP errors
 */
export const formatOTPError = (reason = 'invalid') => {
    // Log reason for security monitoring
    console.warn(`[OTP_ERROR] ${reason}`);
    
    if (reason === 'expired') {
        return formatErrorResponse(
            400,
            ERROR_CODES.OTP_EXPIRED,
            'OTP has expired. Please request a new one'
        );
    }
    
    if (reason === 'max_attempts') {
        return formatErrorResponse(
            429,
            ERROR_CODES.OTP_MAX_ATTEMPTS,
            'Too many invalid attempts. Please request a new OTP'
        );
    }
    
    // Generic invalid OTP message
    return formatErrorResponse(
        400,
        ERROR_CODES.OTP_INVALID,
        'Invalid OTP. Please try again'
    );
};

/**
 * Handle email verification errors
 */
export const formatEmailNotVerifiedError = () => {
    return formatErrorResponse(
        403,
        ERROR_CODES.EMAIL_NOT_VERIFIED,
        'Please verify your email first'
    );
};

/**
 * Handle permission errors
 */
export const formatForbiddenError = (resource = 'resource') => {
    return formatErrorResponse(
        403,
        ERROR_CODES.FORBIDDEN,
        `You do not have permission to access this ${resource}`
    );
};

/**
 * Handle not found errors
 * Returns 404 without revealing what was being searched for
 */
export const formatNotFoundError = () => {
    return formatErrorResponse(
        404,
        'NOT_FOUND',
        'Resource not found'
    );
};

/**
 * Handle duplicate email/conflict errors
 */
export const formatConflictError = (field = 'email') => {
    console.warn(`[CONFLICT_ERROR] Duplicate ${field}`);
    
    return formatErrorResponse(
        409,
        'CONFLICT',
        `This ${field} is already registered. Please use a different one`
    );
};

/**
 * Handle rate limit errors
 */
export const formatRateLimitError = (secondsRemaining = null) => {
    const message = secondsRemaining
        ? `Too many requests. Please try again in ${secondsRemaining} seconds`
        : 'Too many requests. Please try again later';
    
    return formatErrorResponse(
        429,
        'RATE_LIMITED',
        message
    );
};

/**
 * Handle server errors (log full details, return generic message to client)
 */
export const formatServerError = (error, context = '') => {
    // Log full error details for debugging
    console.error(`[SERVER_ERROR] ${context}`, {
        message: error?.message,
        stack: error?.stack,
        code: error?.code,
    });
    
    // Return generic message to client
    return formatErrorResponse(
        500,
        ERROR_CODES.INTERNAL_ERROR,
        'An unexpected error occurred. Please try again later'
    );
};

/**
 * Send error response (middleware-compatible)
 */
export const sendErrorResponse = (res, statusCode, code, message, details = {}) => {
    return res.status(statusCode).json(formatErrorResponse(statusCode, code, message, details));
};

/**
 * Send success response (middleware-compatible)
 */
export const sendSuccessResponse = (res, data = {}, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json(formatSuccessResponse(data, message, statusCode));
};

export default {
    formatErrorResponse,
    formatSuccessResponse,
    formatValidationError,
    formatAuthError,
    formatAccountLockedError,
    formatOTPError,
    formatEmailNotVerifiedError,
    formatForbiddenError,
    formatNotFoundError,
    formatConflictError,
    formatRateLimitError,
    formatServerError,
    sendErrorResponse,
    sendSuccessResponse,
};
