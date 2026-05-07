import config from './config/config.js';
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import hpp from 'hpp';
import xssClean from 'xss-clean';


import cookieParser from 'cookie-parser';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import securityRoutes from './routes/securityRoutes.js';
import globalErrorHandler from './middlewares/errorMiddleware.js';
import { validateSignature, attachHMACSecret } from './middlewares/signatureMiddleware.js';
import {
    validateProxyHeaders,
    preventReverseEngineering,
    obfuscateResponseHeaders,
    blockProxyBypass,
    validateRequestFormat,
    hideStackTraces,
} from './middlewares/reverseProxyMiddleware.js';
import { ipBlacklistMiddleware } from './middlewares/ipBlacklistMiddleware.js';
import { ipSpoofingDetectionMiddleware } from './middlewares/ipSpoofingDetectionMiddleware.js';
import mongoSanitize from 'express-mongo-sanitize';
import AppError from './utils/errorUtils.js';
import { csrfTokenMiddleware, validateCSRFToken } from './middlewares/csrfMiddleware.js';

// Zero Trust imports
import { zeroTrustVerify, zeroTrustDecision, checkMFACache, verifyMFAChallenge, continuousMonitoring, updateDeviceTrust, addRiskHeaders } from './middlewares/zeroTrustMiddleware.js';
import zeroTrustRoutes from './routes/zeroTrustRoutes.js';

// Audit logging
import { auditLog } from './utils/auditLogger.js';



const app = express();

// ════════════════════════════════════════════════════════════════════════════
// PROXY CONFIGURATION
// ════════════════════════════════════════════════════════════════════════════
// Trust first proxy ONLY in production (behind a real load balancer/reverse proxy)
// In dev, this would allow IP spoofing via X-Forwarded-For header
if (config.env === 'production') {
    // Trust 1 proxy hop (Render's load balancer) so req.ip returns the real client IP.
    // Actual proxy chain security is enforced by validateProxyHeaders middleware below.
    app.set('trust proxy', 1);
} else {
    app.set('trust proxy', false);
}

// Disable X-Powered-By header (reveals tech stack)
app.disable('x-powered-by');

// Global Middleware
// ════════════════════════════════════════════════════════════════════════════
// 1. FIRST: Reverse proxy & reverse engineering protection (before helmet)
// ════════════════════════════════════════════════════════════════════════════
app.use(obfuscateResponseHeaders); // Hide implementation details
app.use(preventReverseEngineering); // Block reverse engineering tools
app.use(validateProxyHeaders); // Validate proxy headers (prevent spoofing)
app.use(blockProxyBypass); // Detect proxy bypass attempts
app.use(validateRequestFormat); // Validate request format
app.use(ipBlacklistMiddleware); // Instantly drop known malicious IPs
app.use(ipSpoofingDetectionMiddleware); // Detect X-Forwarded-For manipulation attempts

// ════════════════════════════════════════════════════════════════════════════
// 2. Helmet security headers
// ════════════════════════════════════════════════════════════════════════════
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            // Restrict where resources can be loaded from
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"], // No unsafe-inline or external scripts
            styleSrc: ["'self'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            
            // Prevent framing in iframes (clickjacking protection)
            frameAncestors: ["'none'"],
            
            // Restrict base URL (prevents base tag injection)
            baseUri: ["'self'"],
            
            // Form submission endpoints
            formAction: ["'self'"],
            
            // Prevent plugin embedding
            objectSrc: ["'none'"],
            
            // Only allow HTTPS in production
            upgradeInsecureRequests: config.env === 'production' ? [] : [],
            
            // Use wss:// and https:// in production; ws:// only in development
            connectSrc: [
                "'self'",
                ...config.allowedOrigins,
                config.viteApiUrl,
                // Password breach check (Have I Been Pwned)
                'https://api.pwnedpasswords.com',
                // WebFont CDN
                'https://fonts.gstatic.com',
                // Socket.io handshake
                ...(config.env === 'production' ? [] : ['ws://localhost:5000'])
            ],
        },
    },
    // Additional security headers
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
    },
}));

// Health check endpoints must be BEFORE CORS to allow load balancers and internal Docker healthchecks
// which do not send an Origin header.
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

const corsOptions = {
    origin: (origin, callback) => {
        // Explicitly block null origins (sent by sandboxed iframes or file:// redirects)
        if (!origin || origin === 'null') {
            // Allow tools like Postman and VS Code REST Client to work in development
            if (config.env === 'development') {
                return callback(null, true);
            }
            return callback(new Error('CORS blocked: null or missing origin. Use a browser or provide an Origin header.'));
        }
        if (config.allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: config.cors.methods,
    allowedHeaders: config.cors.allowedHeaders,
    exposedHeaders: config.cors.exposedHeaders,
    maxAge: config.cors.maxAge,
    credentials: true,
    optionsSuccessStatus: 204,
    preflightContinue: false,
};
app.use(cors(corsOptions));
app.options('{/*path}', cors(corsOptions));
app.use(cookieParser());
app.use(csrfTokenMiddleware);

// Logging - use 'dev' in development, 'combined' in production
if (config.env === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Global Rate Limiting
const limiter = rateLimit({
    max: config.rateLimit.apiMax,
    windowMs: config.rateLimit.apiWindowMs,
    message: 'Too many requests from this IP, please try again in 15 minutes!',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// MFA-Specific Rate Limiting (stricter)
const mfaLimiter = rateLimit({
    max: 5, // Only 5 attempts
    windowMs: 15 * 60 * 1000, // Per 15 minutes
    message: 'Too many MFA attempts. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Login Rate Limiting (stricter)
const loginLimiter = rateLimit({
    max: 10,
    windowMs: 15 * 60 * 1000,
    message: 'Too many login attempts. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// CSRF Token Endpoint Rate Limiting (lenient - users may refresh tokens frequently, security wrappers may retry)
// ✅ Increased from 30 to 150 per minute to allow caching misses and security wrapper retries
const csrfLimiter = rateLimit({
    max: 150,  // 150 requests per window (2.5 per second, very reasonable for CSRF token fetches)
    windowMs: 60 * 1000,  // Per minute
    message: 'Too many CSRF token requests. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => ipKeyGenerator(req.ip),
    skip: (req) => {
        // ✅ Check if token is already in meta tag from initial page load
        // This can help reduce unnecessary requests if frontend is caching properly
        return false; // For now, don't skip any requests
    }
});

app.use(express.json({ limit: '10kb' })); // Body parser to prevent large payload attacks
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// EXPRESS 5 COMPATIBILITY PATCH FOR LEGACY SECURITY MIDDLEWARES
// Express 5 makes req.query a read-only getter. xss-clean, hpp, and mongoSanitize will crash because they try to mutate or reassign it.
// This converts req.query back into a standard, writable object so they work perfectly.
app.use((req, res, next) => {
    if (req.query) {
        Object.defineProperty(req, 'query', {
            value: { ...req.query },
            configurable: true,
            writable: true,
            enumerable: true
        });
    }
    next();
});

app.use('/api/v1', validateCSRFToken);

app.use(mongoSanitize()); // Prevent NoSQL Injection

app.use(xssClean());
app.use(hpp());
app.use((req, res, next) => {
    // Redundant but defensive: ensure critical security headers are set
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), serial=()');

    // Prevent reverse proxies and CDNs from caching sensitive API responses
    if (req.path.startsWith('/api')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.setHeader('Pragma', 'no-cache');
    }

    // Remove any trace of server version
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');

    next();
});

// Audit Logging Middleware
app.use((req, res, next) => {
    // Capture response after it's sent
    const originalJson = res.json;
    res.json = function(data) {
        auditLog({
            method: req.method,
            path: req.path,
            ip: req.ip,
            userId: req.user?.id || 'unknown',
            statusCode: res.statusCode,
            timestamp: new Date().toISOString(),
        }).catch(err => console.error('Audit log error:', err));
        return originalJson.call(this, data);
    };
    next();
});

app.use('/api', validateSignature);
app.use('/api', attachHMACSecret);

// Zero Trust Middleware Pipeline (before routes)
// Mark sensitive endpoints for Zero Trust verification
app.use('/api/users', zeroTrustVerify, addRiskHeaders);
app.use('/api/transaction', zeroTrustVerify, addRiskHeaders);
app.use('/api/transfer', zeroTrustVerify, addRiskHeaders);
app.use('/api/wallet', zeroTrustVerify, addRiskHeaders);
app.use('/api/payment', zeroTrustVerify, addRiskHeaders);

// Apply Zero Trust decision logic to sensitive endpoints
app.post('/api/auth/login', loginLimiter, zeroTrustDecision, checkMFACache);
app.post('/api/auth/verify-mfa', mfaLimiter, verifyMFAChallenge);
app.put('/api/users/:id', zeroTrustDecision, updateDeviceTrust);
app.delete('/api/users/:id', zeroTrustDecision, updateDeviceTrust);

// Continuous anomaly monitoring on all requests
app.use('/api', continuousMonitoring);

// ════════════════════════════════════════════════════════════════════════════
// ✅ CSRF Token Endpoint (Rate Limited) - VERSIONED
// ════════════════════════════════════════════════════════════════════════════
// Provides CSRF token for frontend state-changing requests
// Rate-limited to prevent token generation attacks
app.get('/api/v1/csrf-token', csrfLimiter, (req, res) => {
    try {
        const csrfToken = req.csrfTokenValue || req.cookies?.csrf_token;
        
        res.status(200).json({
            status: 'success',
            csrfToken,
            expiresIn: 3600,  // 1 hour
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to generate CSRF token',
        });
    }
});

// Legacy CSRF endpoint (backwards compatibility)
app.get('/api/csrf-token', csrfLimiter, (req, res) => {
    res.status(301).json({
        status: 'deprecated',
        message: 'Use /api/v1/csrf-token instead'
    });
});

// ════════════════════════════════════════════════════════════════════════════
// API VERSIONING - Routes under /api/v1/
// ════════════════════════════════════════════════════════════════════════════
// All routes are now versioned for forward compatibility and deprecation strategy
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/security', securityRoutes);
app.use('/api/v1/devices', zeroTrustRoutes);

// Legacy routes for backwards compatibility (redirects to v1)
app.use('/api/auth', (req, res) => {
    res.status(301).json({
        status: 'deprecated',
        message: 'Use /api/v1/auth instead',
        newLocation: '/api/v1/auth' + req.url
    });
});
app.use('/api/users', (req, res) => {
    res.status(301).json({
        status: 'deprecated',
        message: 'Use /api/v1/users instead',
        newLocation: '/api/v1/users' + req.url
    });
});
app.use('/api/admin', (req, res) => {
    res.status(301).json({
        status: 'deprecated',
        message: 'Use /api/v1/admin instead',
        newLocation: '/api/v1/admin' + req.url
    });
});

// 404 handler
app.use((req, res, next) => {
    // Don't echo the full URL back — aids attacker reconnaissance
    next(new AppError('The requested resource was not found.', 404));
});


app.use(hideStackTraces);

// Global error handler
app.use(globalErrorHandler);

export default app;
