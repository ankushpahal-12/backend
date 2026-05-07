import crypto from 'crypto';
import config from '../config/config.js';
import AppError from '../utils/errorUtils.js';

/**
 * Signature Middleware — Validates X-Body-Signature for sensitive endpoints
 * Uses HMAC-SHA256 to verify request body integrity
 */

// Use the validated config value — config.js throws in production if HMAC_SECRET isn't set
const HMAC_SECRET = config.hmacSecret;

// SECURITY: HMAC_SECRET must NEVER be sent to clients.
// attachHMACSecret has been removed — it was sending the raw secret in X-HMAC-Secret headers.
const SENSITIVE_PATHS = [
    '/api/auth/login',
    '/api/auth/signup',
    '/api/users/',
    '/api/transaction',
    '/api/transfer',
    '/api/wallet',
    '/api/admin',
    '/api/payment',
];

export function generateSignature(body, secret = HMAC_SECRET) {
    const payload = typeof body === 'string' ? body : JSON.stringify(body);
    return crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
}

/**
 * Verify request signature
 */
export function verifySignature(body, clientSignature, secret = HMAC_SECRET) {
    const expectedSignature = generateSignature(body, secret);
    // Use constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
        Buffer.from(clientSignature),
        Buffer.from(expectedSignature)
    );
}

/**
 * Middleware: Validate signatures on sensitive endpoints
 */
export const validateSignature = (req, res, next) => {
    // Skip validation in development or for GET requests
    if (config.env === 'development' || req.method === 'GET' || req.method === 'HEAD') {
        return next();
    }

    // Check if this is a sensitive endpoint
    const isSensitiveEndpoint = SENSITIVE_PATHS.some(path => req.path.startsWith(path));

    if (!isSensitiveEndpoint) {
        return next();
    }

    // Get the signature from headers
    const clientSignature = req.headers['x-body-signature'];
    if (!clientSignature) {
        return next(new AppError('Missing X-Body-Signature header on sensitive endpoint', 400));
    }

    try {
        // Get the raw body for verification
        const bodyPayload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

        // Verify the signature
        const isValid = verifySignature(bodyPayload, clientSignature, HMAC_SECRET);

        if (!isValid) {
            // SECURITY: Never log the expectedSignature — it reveals the HMAC secret via log files.
            logSecurityEvent(req, 'signature_mismatch', {
                path: req.path,
                ip: req.ip,
            });
            return next(new AppError('Invalid signature. Request body may have been tampered with.', 403));
        }

        // Attach verified flag to request
        req.signatureVerified = true;
        next();
    } catch (error) {
        // Timing attack detection or other crypto errors
        logSecurityEvent(req, 'signature_validation_error', { error: error.message });
        return next(new AppError('Signature validation failed', 400));
    }
};

/**
 * REMOVED: attachHMACSecret — sending the HMAC secret to clients is a critical security flaw.
 * The HMAC secret is a server-side secret and must NEVER be transmitted to any client.
 * The frontend must embed the shared secret at build time (via an env var) or use a
 * separate key-exchange mechanism. It must not be distributed via API responses.
 *
 * Keeping this export stub so existing imports don't break at startup — it is a no-op.
 */
export const attachHMACSecret = (_req, _res, next) => next();

/**
 * Helper: Log security events
 */
function logSecurityEvent(req, type, detail) {
    const event = {
        type,
        detail,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userId: req.user?._id || 'anonymous',
        timestamp: new Date().toISOString(),
    };

    // Log to console in development
    if (config.env === 'development') {
        console.warn('[SECURITY EVENT]', JSON.stringify(event, null, 2));
    }

    // TODO: Send to security monitoring service (e.g., Sentry, DataDog)
    // sendToMonitoringService(event);
}

export default validateSignature;
