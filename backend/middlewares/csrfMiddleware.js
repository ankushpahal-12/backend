/**
 * CSRF Protection Middleware
 * Prevents Cross-Site Request Forgery attacks
 */

import crypto from 'crypto';
import config from '../config/config.js';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_EXPIRY = 1000 * 60 * 60; // 1 hour
const CSRF_COOKIE_NAME = 'csrf_token';

const buildCookieOptions = (req) => {
  const sameSite = String(config.cookieSameSite || (config.env === 'production' ? 'none' : 'lax')).toLowerCase();

  const options = {
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https' || config.env === 'production',
    sameSite,
    path: '/',
    maxAge: CSRF_TOKEN_EXPIRY,
  };

  if (config.cookieDomain) {
    options.domain = config.cookieDomain;
  }

  return options;
};

/**
 * Generate a random CSRF token
 */
function generateCSRFToken() {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

function issueCSRFToken(req, res) {
  const token = generateCSRFToken();
  res.cookie(CSRF_COOKIE_NAME, token, buildCookieOptions(req));
  res.setHeader('X-CSRF-Token', token);
  return token;
}

/**
 * Middleware to generate CSRF token for GET requests
 * Token is stored in session and sent via X-CSRF-Token header
 */
function csrfTokenMiddleware(req, res, next) {
  // Generate token for GET requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const currentToken = req.cookies?.[CSRF_COOKIE_NAME];

    if (!currentToken) {
      req.csrfTokenValue = issueCSRFToken(req, res);
    } else {
      req.csrfTokenValue = currentToken;
      res.setHeader('X-CSRF-Token', currentToken);
    }
  }

  next();
}

/**
 * Middleware to validate CSRF token for state-changing requests
 * Validates token from header or body
 */
function validateCSRFToken(req, res, next) {
  // Skip CSRF validation for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for public endpoints (auth, registration)
  const requestPath = req.originalUrl.split('?')[0];
  const publicEndpoints = [
    '/api/health',
    '/api/v1/health',
    '/api/csrf-token',
    '/api/v1/csrf-token',
    '/api/auth/init-session',
    '/api/auth/register',
    '/api/auth/force-login',
    '/api/auth/login',
    '/api/auth/admin/login',
    '/api/auth/admin/verify-2fa',
    '/api/auth/verify-login-otp',
    '/api/auth/verify-email',
    '/api/auth/resend-otp',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/check-email',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/2fa/verify-login',
    '/api/auth/google',
    '/api/auth/web3/nonce',
    '/api/auth/web3/verify',
    '/api/devices/auth/verify-mfa',
    '/api/v1/auth/init-session',
    '/api/v1/auth/register',
    '/api/v1/auth/force-login',
    '/api/v1/auth/login',
    '/api/v1/auth/admin/login',
    '/api/v1/auth/admin/verify-2fa',
    '/api/v1/auth/verify-login-otp',
    '/api/v1/auth/verify-email',
    '/api/v1/auth/resend-otp',
    '/api/v1/auth/check-email',
    '/api/v1/auth/forgot-password',
    '/api/v1/auth/reset-password',
    '/api/v1/auth/2fa/verify-login',
    '/api/v1/auth/google',
    '/api/v1/auth/web3/nonce',
    '/api/v1/auth/web3/verify',
    '/api/v1/devices/auth/verify-mfa',
    '/api/v1/auth/verify-email-and-set-password',
    '/api/v1/admin/verify-email-otp',
    '/api/v1/admin/set-password',
    // Beacon-only telemetry endpoint: navigator.sendBeacon() cannot send custom
    // headers, so X-CSRF-Token can never be attached. This endpoint is a
    // write-only security event sink — already rate-limited (30 req/min/IP) —
    // and performs no privileged state changes, making CSRF exemption safe here.
    '/api/v1/security/event',
  ];

  if (publicEndpoints.some((endpoint) => requestPath.startsWith(endpoint))) {
    return next();
  }

  const tokenFromHeader =
    req.get('X-CSRF-Token') || req.get('x-csrf-token');
  const tokenFromBody = req.body?.csrfToken;
  const tokenFromCookie = req.cookies?.[CSRF_COOKIE_NAME];

  // Validate token exists
  if (!tokenFromHeader && !tokenFromBody) {
    console.warn(`[CSRF] Missing token from ${req.ip}: ${req.method} ${req.path}`);
    return res.status(403).json({
      error: 'CSRF token missing',
      code: 'CSRF_TOKEN_MISSING',
      timestamp: new Date().toISOString(),
    });
  }

  const token = tokenFromHeader || tokenFromBody;

  if (!tokenFromCookie) {
    console.warn(`[CSRF] Missing CSRF cookie from ${req.ip}: ${req.method} ${req.path}`);
    return res.status(403).json({
      error: 'CSRF token invalid',
      code: 'CSRF_TOKEN_INVALID',
      timestamp: new Date().toISOString(),
    });
  }

  // Timing-safe comparison to prevent token extraction via timing attacks
  const tokenBuf = Buffer.from(token);
  const cookieBuf = Buffer.from(tokenFromCookie);
  if (tokenBuf.length !== cookieBuf.length || !crypto.timingSafeEqual(tokenBuf, cookieBuf)) {
    console.warn(
      `[CSRF] Token mismatch from ${req.ip}: ${req.method} ${req.path}`
    );
    return res.status(403).json({
      error: 'CSRF token invalid',
      code: 'CSRF_TOKEN_INVALID',
      timestamp: new Date().toISOString(),
    });
  }

  next();
}

export {
  generateCSRFToken,
  csrfTokenMiddleware,
  validateCSRFToken,
};
