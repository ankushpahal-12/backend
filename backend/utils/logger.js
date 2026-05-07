/**
 * STRUCTURED LOGGING UTILITY
 * 
 * Winston logger configuration
 * Prevents PII leakage, structured logging, multiple transports
 */

import winston from 'winston';
import fs from 'fs';
import path from 'path';
import config from '../config/config.js';

// Create logs directory if not exists
const logsDir = 'logs';
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

/**
 * Custom format that sanitizes PII
 */
const sanitizeFormat = winston.format((info) => {
    // Remove sensitive fields
    const sensitiveFields = ['email', 'password', 'token', 'refreshToken', 'otp', 'ip'];
    
    const sanitized = { ...info };
    if (sanitized.meta) {
        const meta = { ...sanitized.meta };
        sensitiveFields.forEach(field => {
            if (field in meta) {
                meta[field] = '[REDACTED]';
            }
        });
        sanitized.meta = meta;
    }
    
    return sanitized;
});

/**
 * Winston logger instance
 */
export const logger = winston.createLogger({
    level: config.env === 'production' ? 'info' : 'debug',
    
    format: winston.format.combine(
        sanitizeFormat(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    
    defaultMeta: { service: 'expense-tracker' },
    
    transports: [
        // ─── Error Log ─────────────────────────────────────────────
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 10,
        }),
        
        // ─── Combined Log ─────────────────────────────────────────
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 10,
        }),
        
        // ─── Security Audit Log ───────────────────────────────────
        new winston.transports.File({
            filename: path.join(logsDir, 'security.log'),
            level: 'warn',
            maxsize: 5242880, // 5MB
            maxFiles: 30, // Keep 30 files for audit trail
        }),
    ],
});

// ─── Console transport in development ──────────────────────────────────
if (config.env !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ level, message, timestamp, meta }) => {
                    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
                    return `${timestamp} [${level}] ${message}${metaStr}`;
                })
            ),
        })
    );
}

/**
 * Structured logging helpers (no PII)
 */

export const logAuthEvent = (status, reason, metadata = {}) => {
    logger.info(`[AUTH_EVENT] ${status}`, {
        meta: {
            status,
            reason,
            ...sanitizeMetadata(metadata),
        }
    });
};

export const logSecurityEvent = (type, severity, description, metadata = {}) => {
    logger.warn(`[SECURITY] ${type} - ${severity}`, {
        meta: {
            type,
            severity,
            description,
            ...sanitizeMetadata(metadata),
        }
    });
};

export const logDatabaseOperation = (operation, collection, result, duration) => {
    logger.debug(`[DB] ${operation} on ${collection}`, {
        meta: {
            operation,
            collection,
            result,
            duration_ms: duration,
        }
    });
};

export const logApiRequest = (method, path, statusCode, duration) => {
    logger.info(`[API] ${method} ${path} - ${statusCode}`, {
        meta: {
            method,
            path,
            statusCode,
            duration_ms: duration,
        }
    });
};

export const logApiError = (method, path, statusCode, error) => {
    logger.error(`[API_ERROR] ${method} ${path} - ${statusCode}`, {
        meta: {
            method,
            path,
            statusCode,
            error: error?.message,
            // Stack trace only in non-production
            ...(config.env !== 'production' && { stack: error?.stack }),
        }
    });
};

export const logValidationError = (field, reason) => {
    logger.warn(`[VALIDATION] ${field}`, {
        meta: {
            field,
            reason,
        }
    });
};

export const logRateLimitExceeded = (endpoint, attemptsRemaining) => {
    logger.warn(`[RATE_LIMIT] ${endpoint}`, {
        meta: {
            endpoint,
            attemptsRemaining,
        }
    });
};

export const logIpSpoofingAttempt = (indicators) => {
    logger.warn(`[SECURITY] IP Spoofing Attempt`, {
        meta: {
            indicators,
        }
    });
};

/**
 * Sanitize metadata by removing PII
 */
function sanitizeMetadata(metadata) {
    const sensitivePatterns = ['password', 'token', 'secret', 'key', 'email', 'phone'];
    const sanitized = { ...metadata };
    
    Object.keys(sanitized).forEach(key => {
        const hasMatch = sensitivePatterns.some(pattern => key.toLowerCase().includes(pattern));
        if (hasMatch) {
            sanitized[key] = '[REDACTED]';
        }
    });
    
    return sanitized;
}

/**
 * Middleware for request/response logging
 */
export const loggingMiddleware = (req, res, next) => {
    const startTime = Date.now();
    
    // Log original send function
    const originalSend = res.send;
    res.send = function(data) {
        const duration = Date.now() - startTime;
        
        logApiRequest(req.method, req.path, res.statusCode, duration);
        
        // Call original send
        return originalSend.call(this, data);
    };
    
    next();
};

/**
 * Error logging middleware
 */
export const errorLoggingMiddleware = (err, req, res, next) => {
    const duration = Date.now() - (req.startTime || Date.now());
    
    logApiError(req.method, req.path, res.statusCode || 500, err);
    
    next(err);
};

export default logger;
