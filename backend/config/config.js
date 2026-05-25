import dotenv from 'dotenv';
dotenv.config();

const env = process.env.NODE_ENV || 'development';
const allowedEnvironments = ['development', 'test', 'production'];

if (!allowedEnvironments.includes(env)) {
    throw new Error(`NODE_ENV must be one of: ${allowedEnvironments.join(', ')}`);
}

const parseCsv = (value, fallback = []) => {
    if (!value) return fallback;
    return value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);
};

const isValidUrl = (value) => {
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
};

const containsLocalhost = (value) => /localhost|127\.0\.0\.1|::1/i.test(value);

const getSanitizedCookieDomain = (val) => {
    if (!val || typeof val !== 'string') return undefined;
    const clean = val.trim();
    const isValid = /^[a-zA-Z0-9.-]+$/.test(clean) && clean.length > 0 && clean !== 'localhost';
    return isValid ? clean : undefined;
};

const config = {
    env,
    port: process.env.PORT || 5000,
    mongodbUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    cookieExpiresIn: Number(process.env.COOKIE_EXPIRES_IN || 24), // in hours
    hmacSecret: process.env.HMAC_SECRET || 'default-hmac-secret-change-in-production-immediately',
    email: {
        host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
        port: process.env.EMAIL_PORT || 2525,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        secure: process.env.EMAIL_SECURE === 'true',
        from: process.env.EMAIL_FROM || 'no-reply@aifinance.com',
        securityFrom: process.env.EMAIL_SECURITY_FROM || 'security@aifinance.com'
    },
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    viteApiUrl: process.env.VITE_API_URL || 'http://localhost:5000',
    allowedOrigins: parseCsv(process.env.ALLOWED_ORIGINS, ['http://localhost:5173', 'http://localhost:3000']),
    allowedHosts: parseCsv(process.env.ALLOWED_HOSTS, ['localhost:5000', 'localhost:5173', 'localhost']),
    trustedProxies: parseCsv(process.env.TRUSTED_PROXIES, ['127.0.0.1', 'localhost', '::1', '10.*', '172.*', '100.*']),
    cookieDomain: getSanitizedCookieDomain(process.env.COOKIE_DOMAIN),
    cookieSameSite: process.env.COOKIE_SAMESITE || (env === 'production' ? 'none' : 'lax'),
    signature: {
        mode: process.env.SIGNATURE_MODE || (env === 'production' ? 'monitor' : 'off'),
    },
    cors: {
        methods: parseCsv(process.env.CORS_METHODS, ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']),
        allowedHeaders: parseCsv(process.env.CORS_ALLOWED_HEADERS, [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'X-CSRF-Token',
            'X-Body-Signature',
            'x-session-id'
        ]),
        exposedHeaders: parseCsv(process.env.CORS_EXPOSED_HEADERS, ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset']),
        maxAge: Number(process.env.CORS_MAX_AGE || 86400)
    },
    rateLimit: {
        apiMax: Number(process.env.RATE_LIMIT_API_MAX || 100),
        apiWindowMs: Number(process.env.RATE_LIMIT_API_WINDOW_MS || (15 * 60 * 1000)),
        authMax: Number(process.env.RATE_LIMIT_AUTH_MAX || 15),
        authWindowMs: Number(process.env.RATE_LIMIT_AUTH_WINDOW_MS || (15 * 60 * 1000)),
        strictAuthMax: Number(process.env.RATE_LIMIT_STRICT_AUTH_MAX || 5),
        strictAuthWindowMs: Number(process.env.RATE_LIMIT_STRICT_AUTH_WINDOW_MS || (60 * 60 * 1000)),
        authProfiles: {
            loginMax: Number(process.env.RATE_LIMIT_LOGIN_MAX || 5),
            loginWindowMs: Number(process.env.RATE_LIMIT_LOGIN_WINDOW_MS || (15 * 60 * 1000)),
            otpMax: Number(process.env.RATE_LIMIT_OTP_MAX || 6),
            otpWindowMs: Number(process.env.RATE_LIMIT_OTP_WINDOW_MS || (10 * 60 * 1000)),
            resetMax: Number(process.env.RATE_LIMIT_RESET_MAX || 4),
            resetWindowMs: Number(process.env.RATE_LIMIT_RESET_WINDOW_MS || (30 * 60 * 1000)),
            adminLoginMax: Number(process.env.RATE_LIMIT_ADMIN_LOGIN_MAX || 4),
            adminLoginWindowMs: Number(process.env.RATE_LIMIT_ADMIN_LOGIN_WINDOW_MS || (15 * 60 * 1000)),
            adminOtpMax: Number(process.env.RATE_LIMIT_ADMIN_OTP_MAX || 3),
            adminOtpWindowMs: Number(process.env.RATE_LIMIT_ADMIN_OTP_WINDOW_MS || (15 * 60 * 1000)),
            emailCheckMax: Number(process.env.RATE_LIMIT_EMAIL_CHECK_MAX || 5),
            emailCheckWindowMs: Number(process.env.RATE_LIMIT_EMAIL_CHECK_WINDOW_MS || (10 * 60 * 1000))
        }
    }
};

// Validations
if (!config.mongodbUri) {
    throw new Error('MONGODB_URI must be defined in the .env file!');
}
if (!config.jwtSecret || config.jwtSecret === 'fallback-secret-key-change-it') {
    throw new Error('A strong JWT_SECRET must be defined in the .env file!');
}
if (!config.jwtRefreshSecret || config.jwtRefreshSecret === 'fallback-refresh-secret-key-change-it') {
    throw new Error('A strong JWT_REFRESH_SECRET must be defined in the .env file!');
}

if (!Number.isFinite(config.cookieExpiresIn) || config.cookieExpiresIn <= 0) {
    throw new Error('COOKIE_EXPIRES_IN must be a positive number (hours).');
}

if (!['none', 'lax', 'strict'].includes(String(config.cookieSameSite).toLowerCase())) {
    throw new Error('COOKIE_SAMESITE must be one of: none, lax, strict');
}

if (!['off', 'monitor', 'enforce'].includes(String(config.signature.mode).toLowerCase())) {
    throw new Error('SIGNATURE_MODE must be one of: off, monitor, enforce');
}

if (!config.cors.methods.length) {
    throw new Error('CORS_METHODS must contain at least one method');
}

if (!config.cors.allowedHeaders.length) {
    throw new Error('CORS_ALLOWED_HEADERS must contain at least one header');
}

if (!Number.isFinite(config.cors.maxAge) || config.cors.maxAge < 0) {
    throw new Error('CORS_MAX_AGE must be a non-negative number (seconds)');
}

if (config.cookieDomain && containsLocalhost(config.cookieDomain) && config.env === 'production') {
    throw new Error('COOKIE_DOMAIN cannot be localhost in production');
}

for (const origin of config.allowedOrigins) {
    if (!isValidUrl(origin)) {
        throw new Error(`Invalid origin in ALLOWED_ORIGINS: ${origin}`);
    }
}

if (config.allowedHosts.some((host) => host.includes('http://') || host.includes('https://'))) {
    throw new Error('ALLOWED_HOSTS entries must be hostnames (optionally with port), not full URLs');
}

if (config.env === 'production') {
    if (!config.email.user || !config.email.pass) {
        throw new Error('Email credentials must be defined in production!');
    }
    if (!process.env.INTERNAL_SERVICE_SECRET) {
        throw new Error('INTERNAL_SERVICE_SECRET must be defined in production!');
    }
    if (config.hmacSecret === 'default-hmac-secret-change-in-production-immediately') {
        throw new Error('HMAC_SECRET must be explicitly set in production!');
    }
    if (!config.allowedOrigins.length) {
        throw new Error('ALLOWED_ORIGINS must contain at least one origin in production!');
    }
    if (!config.allowedHosts.length) {
        throw new Error('ALLOWED_HOSTS must contain at least one host in production!');
    }
    if (config.allowedOrigins.some(containsLocalhost)) {
        throw new Error('ALLOWED_ORIGINS cannot include localhost in production. Use real domains only.');
    }
    if (config.allowedHosts.some(containsLocalhost)) {
        throw new Error('ALLOWED_HOSTS cannot include localhost in production. Use real domains only.');
    }
    if (String(config.cookieSameSite).toLowerCase() === 'none' && !config.cookieDomain) {
        throw new Error('COOKIE_DOMAIN is required in production when COOKIE_SAMESITE=none');
    }
}

export default config;
