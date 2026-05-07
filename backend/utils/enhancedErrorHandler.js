/**
 * Enhanced Error Handler Middleware
 * Provides comprehensive error handling with proper logging and user-friendly messages
 */

import { auditLog } from '../utils/auditLogger.js';

export class AppError extends Error {
    constructor(message, statusCode, errorCode = null, details = {}) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        this.timestamp = new Date().toISOString();
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Format error response based on environment
 */
const formatErrorResponse = (error, env) => {
    const response = {
        success: false,
        message: error.message || 'An error occurred',
        errorCode: error.errorCode || 'INTERNAL_ERROR',
        timestamp: error.timestamp || new Date().toISOString(),
    };

    // Add details in development only
    if (env === 'development') {
        response.details = error.details || {};
        response.stack = error.stack;
    } else {
        // Generic message for production
        if (error.statusCode >= 500) {
            response.message = 'An internal server error occurred. Please try again later.';
        }
    }

    return response;
};

/**
 * Global Error Handler Middleware
 */
export const enhancedErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    // Log error with context
    const errorContext = {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userId: req.user?.id || 'unknown',
        statusCode: err.statusCode,
        errorMessage: err.message,
        errorCode: err.errorCode,
        userAgent: req.get('user-agent'),
        timestamp: new Date().toISOString(),
    };

    console.error(`[ERROR] ${err.statusCode} - ${err.message}`, errorContext);

    // Audit log critical errors
    if (err.statusCode >= 400) {
        auditLog({
            ...errorContext,
            action: 'error',
            details: {
                errorMessage: err.message,
                errorCode: err.errorCode,
                statusCode: err.statusCode,
            },
        }).catch(auditErr => console.error('Failed to log error audit:', auditErr));
    }

    // Send error response
    res.status(err.statusCode).json(
        formatErrorResponse(err, process.env.NODE_ENV)
    );
};

/**
 * Async Error Handler Wrapper
 * Wraps async route handlers to catch errors
 */
export const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

/**
 * Specific Error Handlers
 */

// Validation Error
export const handleValidationError = (error) => {
    const message = `Invalid input: ${error.details?.map(d => d.message).join(', ') || error.message}`;
    return new AppError(message, 400, 'VALIDATION_ERROR', { fields: error.details });
};

// Cast Error (Invalid ObjectId)
export const handleCastError = (error) => {
    const message = `Invalid ${error.path}: ${error.value}`;
    return new AppError(message, 400, 'CAST_ERROR');
};

// Duplicate Field Error
export const handleDuplicateFieldError = (error) => {
    const field = Object.keys(error.keyPattern)[0];
    const value = error.keyValue[field];
    const message = `${field} "${value}" already exists. Please use a different value.`;
    return new AppError(message, 400, 'DUPLICATE_FIELD', { field, value });
};

// JWT Error
export const handleJWTError = () => {
    return new AppError('Invalid token. Please log in again.', 401, 'JWT_ERROR');
};

// JWT Expired Error
export const handleJWTExpiredError = () => {
    return new AppError('Your session has expired. Please log in again.', 401, 'JWT_EXPIRED');
};

// MFA Error
export const handleMFAError = (message = 'MFA verification failed') => {
    return new AppError(message, 401, 'MFA_ERROR');
};

// Rate Limit Error
export const handleRateLimitError = (message = 'Too many requests') => {
    return new AppError(message, 429, 'RATE_LIMIT');
};

// Unauthorized Error
export const handleUnauthorizedError = (message = 'You are not authorized to access this resource') => {
    return new AppError(message, 403, 'UNAUTHORIZED');
};

// Not Found Error
export const handleNotFoundError = (resource = 'Resource') => {
    return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
};

// Zero Trust Verification Error
export const handleZeroTrustError = (message = 'Zero Trust verification failed', details = {}) => {
    return new AppError(message, 403, 'ZERO_TRUST_FAILED', details);
};

// Device Verification Error
export const handleDeviceVerificationError = (message = 'Device verification failed') => {
    return new AppError(message, 403, 'DEVICE_VERIFICATION_FAILED');
};

// Behavior Anomaly Error
export const handleBehaviorAnomalyError = (riskLevel) => {
    return new AppError(
        'Unusual activity detected. MFA verification required.',
        403,
        'BEHAVIOR_ANOMALY',
        { riskLevel }
    );
};

export default {
    AppError,
    enhancedErrorHandler,
    catchAsync,
    handleValidationError,
    handleCastError,
    handleDuplicateFieldError,
    handleJWTError,
    handleJWTExpiredError,
    handleMFAError,
    handleRateLimitError,
    handleUnauthorizedError,
    handleNotFoundError,
    handleZeroTrustError,
    handleDeviceVerificationError,
    handleBehaviorAnomalyError,
};
