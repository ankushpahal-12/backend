import config from '../config/config.js';
import AppError from '../utils/errorUtils.js';

/**
 * Reverse Proxy & Reverse Engineering Prevention Middleware
 * 
 * PROTECTIONS:
 * 1. Validates reverse proxy headers
 * 2. Detects proxy injection attacks
 * 3. Prevents IP spoofing
 * 4. Blocks reverse engineering tools
 * 5. Prevents stack trace exposure
 * 6. Obfuscates response headers
 * 7. Prevents TRACE/OPTIONS abuse
 * 8. Validates Host header
 */

const isTrustedProxy = (remoteAddress = '') => {
    if (!remoteAddress) return false;

    // Normalize IPv6-mapped IPv4 addresses (e.g. ::ffff:10.0.0.1)
    const normalized = remoteAddress.replace('::ffff:', '');

    return config.trustedProxies.some((proxy) => {
        const target = proxy.trim();
        if (!target) return false;

        if (target.includes('*')) {
            return normalized.startsWith(target.replace('*', ''));
        }

        return normalized === target;
    });
};

/**
 * Middleware: Validate reverse proxy headers
 * Prevents proxy header injection and IP spoofing
 */
export const validateProxyHeaders = (req, res, next) => {
    if (config.env === 'development') return next();

    // 1. Validate Host header
    const host = req.get('host');
    if (!host || !config.allowedHosts.some((h) => host === h || host.endsWith(`.${h}`))) {
        console.warn('[SECURITY] Invalid Host header:', host);
        return next(new AppError('Invalid host header', 400));
    }

    // 2. Validate X-Forwarded-Proto (should be https in production)
    const proto = req.get('x-forwarded-proto');
    const isInternalHealthCheck = req.socket?.remoteAddress === '127.0.0.1' || req.socket?.remoteAddress === '::1';
    if (config.env === 'production' && !isInternalHealthCheck && proto !== 'https') {
        console.warn('[SECURITY] Non-HTTPS X-Forwarded-Proto:', proto);
        return next(new AppError('HTTPS required', 403));
    }

    // 3. Detect proxy chain attacks (multiple X-Forwarded-For headers)
    const xForwardedFor = req.get('x-forwarded-for');
    if (xForwardedFor) {
        const ips = xForwardedFor.split(',').map(ip => ip.trim());
        const remoteAddress = req.socket?.remoteAddress || '';

        // In production, validate the direct peer is a trusted proxy/LB FIRST
        // Cloud platforms like Render use multi-hop proxies (multiple IPs is expected)
        if (config.env === 'production' && !isTrustedProxy(remoteAddress)) {
            console.warn('[SECURITY] Untrusted proxy peer IP:', remoteAddress);
            return next(new AppError('Untrusted proxy', 403));
        }

        // Block only suspiciously excessive chains (>3 hops) even from trusted peers
        if (config.env === 'production' && ips.length > 3) {
            console.warn('[SECURITY] Excessive proxy chain detected:', xForwardedFor);
            return next(new AppError('Invalid proxy chain', 400));
        }

        // First forwarded address should look like a client IP
        const firstIp = ips[0];
        if (!firstIp || firstIp.length > 64) {
            console.warn('[SECURITY] Malformed X-Forwarded-For:', xForwardedFor);
            return next(new AppError('Invalid proxy header', 400));
        }
    }

    // 4. Detect suspicious proxy-related headers
    const suspiciousHeaders = [
        'x-original-url',
        'x-rewrite-url',
        'x-http-method-override', // HTTP method spoofing
        'x-forwarded-method', // Non-standard
    ];

    for (const header of suspiciousHeaders) {
        if (req.get(header)) {
            console.warn('[SECURITY] Suspicious header detected:', header);
            return next(new AppError('Suspicious header', 400));
        }
    }

    next();
};

/**
 * Middleware: Prevent reverse engineering attacks
 * Blocks common reverse engineering tools and techniques
 */
export const preventReverseEngineering = (req, res, next) => {
    if (config.env === 'development') return next();

    const ua = req.get('user-agent') || '';
    
    // Block common reverse engineering tools
    const blockedTools = [
        'burp',
        'fiddler',
        'charles',
        'zaproxy',
        'wireshark',
        'nmap',
        'nikto',
        'sqlmap',
        'masscan',
        'metasploit',
        'acunetix',
        'nessus',
        'qualys',
        'appscan',
        'nexpose',
        'nuclei',
        'postman/runtime', // Some versions used for attacks
    ];

    if (blockedTools.some(tool => ua.toLowerCase().includes(tool))) {
        console.warn('[SECURITY] Reverse engineering tool detected:', ua);
        // Don't reveal reason — just block silently
        return res.status(403).end();
    }

    // Block headless browsers often used for automated attacks
    const headlessBrowsers = [
        'headlesschrome',
        'phantomjs',
        'nightmare',
        'casperjs',
        'wkhtmltopdf',
        'puppeteer',
        'playwright',
        'automation',
    ];

    // These are typically legitimate but should be monitored
    if (headlessBrowsers.some(browser => ua.toLowerCase().includes(browser))) {
        // Log but allow (admins may use these for testing)
        console.warn('[SECURITY] Headless browser detected:', ua);
    }

    // Block TRACE method (used for header injection attacks)
    if (req.method === 'TRACE') {
        console.warn('[SECURITY] TRACE method attempted');
        return res.status(405).end();
    }

    // Let dedicated CORS middleware handle OPTIONS preflight requests
    if (req.method === 'OPTIONS') {
        return next();
    }

    // Block requests with suspicious payloads
    const suspiciousPatterns = [
        /\.\.\//,  // Path traversal
        /\/\/+/,   // Double slashes
        /%2e%2e/i, // URL encoded ../
        /;.*\?/,   // Parameter pollution
    ];

    const fullUrl = req.originalUrl;
    if (suspiciousPatterns.some(pattern => pattern.test(fullUrl))) {
        console.warn('[SECURITY] Suspicious URL pattern:', fullUrl);
        return next(new AppError('Invalid request', 400));
    }

    next();
};

/**
 * Middleware: Obfuscate response headers
 * Hides server implementation details from attackers
 */
export const obfuscateResponseHeaders = (req, res, next) => {
    // Remove revealing headers
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');
    res.removeHeader('X-AspNet-Version');
    res.removeHeader('X-Runtime-Version');

    // Set generic server header
    res.setHeader('Server', 'Web Server');

    // Add security headers to prevent header-based attacks
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // Prevent source map leakage
    res.setHeader('X-SourceMap', ''); // Remove if present
    res.setHeader('SourceMap', ''); // Remove if present

    next();
};

/**
 * Middleware: Rate limit by IP (prevents brute force enumeration)
 */
export const rateLimitByIP = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const ipRequests = new Map();

    return (req, res, next) => {
        if (config.env === 'development') return next();

        const ip = req.ip;
        const now = Date.now();

        if (!ipRequests.has(ip)) {
            ipRequests.set(ip, []);
        }

        const requests = ipRequests.get(ip);
        const recentRequests = requests.filter(time => now - time < windowMs);

        if (recentRequests.length >= maxRequests) {
            console.warn('[SECURITY] Rate limit exceeded for IP:', ip);
            return res.status(429).json({
                status: 'fail',
                message: 'Too many requests, please try again later.'
            });
        }

        recentRequests.push(now);
        ipRequests.set(ip, recentRequests);

        next();
    };
};

/**
 * Middleware: Detect and block proxy bypass attempts
 */
export const blockProxyBypass = (req, res, next) => {
    if (config.env === 'development') return next();

    // Detect direct connection attempts (should go through proxy in production)
    const forwardedProto = req.get('x-forwarded-proto');
    const forwardedFor = req.get('x-forwarded-for');

    // If neither header present in production, likely direct connection
    if (!forwardedProto && !forwardedFor && config.env === 'production') {
        // Could be legitimate internal request, but log it
        console.warn('[SECURITY] Possible proxy bypass attempt from:', req.ip);
        // Don't block — could be internal service
    }

    // Detect HTTP to HTTPS downgrade attempts
    if (forwardedProto && forwardedProto !== 'https' && config.env === 'production') {
        console.warn('[SECURITY] HTTPS downgrade attempt detected');
        return next(new AppError('HTTPS required', 400));
    }

    next();
};

/**
 * Middleware: Validate request size and content type
 * Prevents payload-based reverse engineering
 */
export const validateRequestFormat = (req, res, next) => {
    // Socket upgrades and socket.io handshakes are not JSON API payloads.
    if (req.path?.startsWith('/socket.io') || req.get('upgrade')?.toLowerCase() === 'websocket') {
        return next();
    }

    // Validate JSON content-type only when a write request actually has a payload body.
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentLength = parseInt(req.get('content-length') || '0', 10);
        const hasChunkedBody = Boolean(req.get('transfer-encoding'));
        const hasBody = (Number.isFinite(contentLength) && contentLength > 0) || hasChunkedBody;

        if (hasBody) {
            const contentType = (req.get('content-type') || '').toLowerCase();
            const isJson = contentType.includes('application/json') || contentType.includes('+json');

            if (!contentType) {
                return next(new AppError('Content-Type header required', 400));
            }

            if (!isJson) {
                return next(new AppError('application/json Content-Type required', 400));
            }
        }
    }

    // Reject unusual content lengths
    const contentLength = parseInt(req.get('content-length'), 10);
    if (contentLength > 1024 * 1024) { // 1MB limit
        return next(new AppError('Payload too large', 413));
    }

    next();
};

/**
 * Middleware: Prevent stack trace exposure
 * Catches errors before they leak implementation details
 */
export const hideStackTraces = (err, req, res, next) => {
    if (config.env === 'development') {
        return next(err);
    }

    // In production, never expose stack traces
    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Internal server error';

    res.status(statusCode).json({
        status: 'error',
        message: message,
        // Don't include: err.stack, err.name, err.code
    });
};

export default {
    validateProxyHeaders,
    preventReverseEngineering,
    obfuscateResponseHeaders,
    rateLimitByIP,
    blockProxyBypass,
    validateRequestFormat,
    hideStackTraces,
};
