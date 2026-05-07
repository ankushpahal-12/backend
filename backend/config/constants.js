/**
 * Application Constants
 * 
 * Centralized configuration for all magic numbers
 * Prevents hardcoded values scattered throughout codebase
 * Makes configuration easy to adjust without code changes
 */

// ════════════════════════════════════════════════════════════════════════════
// AUTHENTICATION CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

export const AUTH_CONSTANTS = {
    // Password validation
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 128,

    // Login security
    MAX_LOGIN_ATTEMPTS: 5,
    ACCOUNT_LOCK_DURATION_MS: 30 * 60 * 1000,  // 30 minutes
    BRUTE_FORCE_DETECTION_WINDOW_MS: 15 * 60 * 1000,  // 15 minutes
    BRUTE_FORCE_THRESHOLD: 10,  // Failed attempts to trigger alert

    // JWT tokens
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '7d',
    REFRESH_TOKEN_MAX_PER_USER: 10,

    // CSRF protection
    CSRF_TOKEN_EXPIRY_SECONDS: 3600,  // 1 hour

    // OTP (One-Time Password)
    OTP_LENGTH: 6,
    OTP_EXPIRY_MS: 10 * 60 * 1000,  // 10 minutes
    OTP_MAX_ATTEMPTS: 6,
    OTP_ATTEMPT_WINDOW_MS: 10 * 60 * 1000,  // 10 minutes
    OTP_RESEND_COOLDOWN_MS: 30 * 1000,  // 30 seconds

    // TOTP 2FA
    TOTP_WINDOW: 1,  // ±1 time window for code validation
    TOTP_TIME_STEP: 30,  // seconds per code

    // Session management
    MAX_ACTIVE_SESSIONS: 5,
    SESSION_TIMEOUT_MS: 30 * 60 * 1000,  // 30 minutes
    SESSION_WARNING_TIME_MS: 5 * 60 * 1000,  // 5 minutes (before timeout)

    // Device trust
    MAX_TRUSTED_DEVICES: 10,
    DEVICE_TRUST_SCORE_THRESHOLD: 70,  // Percentage to auto-trust
};

// ════════════════════════════════════════════════════════════════════════════
// RATE LIMITING CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

export const RATE_LIMIT_CONSTANTS = {
    // Login endpoint
    LOGIN_MAX_ATTEMPTS: 10,
    LOGIN_WINDOW_MS: 15 * 60 * 1000,  // 15 minutes

    // Registration endpoint
    REGISTER_MAX_ATTEMPTS: 5,
    REGISTER_WINDOW_MS: 60 * 60 * 1000,  // 1 hour

    // OTP verification
    OTP_VERIFY_MAX_ATTEMPTS: 6,
    OTP_VERIFY_WINDOW_MS: 10 * 60 * 1000,  // 10 minutes

    // Password reset
    PASSWORD_RESET_MAX_ATTEMPTS: 5,
    PASSWORD_RESET_WINDOW_MS: 60 * 60 * 1000,  // 1 hour

    // General API
    API_MAX_REQUESTS: 100,
    API_WINDOW_MS: 15 * 60 * 1000,  // 15 minutes

    // CSRF token endpoint
    CSRF_TOKEN_MAX_REQUESTS: 30,
    CSRF_TOKEN_WINDOW_MS: 60 * 1000,  // 1 minute

    // Email check (prevent enumeration)
    EMAIL_CHECK_MAX_ATTEMPTS: 5,
    EMAIL_CHECK_WINDOW_MS: 60 * 60 * 1000,  // 1 hour

    // Admin endpoints
    ADMIN_MAX_REQUESTS: 200,
    ADMIN_WINDOW_MS: 15 * 60 * 1000,  // 15 minutes
};

// ════════════════════════════════════════════════════════════════════════════
// PAGINATION CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

export const PAGINATION_CONSTANTS = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    MIN_LIMIT: 1,
    
    // Per resource
    USERS_PER_PAGE: 20,
    TRANSACTIONS_PER_PAGE: 50,
    LOGS_PER_PAGE: 100,
    DEVICES_PER_PAGE: 10,
};

export const API_CONSTANTS = PAGINATION_CONSTANTS;

// ════════════════════════════════════════════════════════════════════════════
// DATABASE CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

export const DATABASE_CONSTANTS = {
    // Connection pooling
    CONNECTION_POOL_SIZE: 10,
    CONNECTION_POOL_MIN: 5,
    CONNECTION_TIMEOUT_MS: 5000,

    // Query optimization
    BATCH_SIZE: 1000,
    INDEX_BUILD_TIMEOUT_MS: 60000,

    // Data cleanup
    LOGIN_ATTEMPT_RETENTION_DAYS: 30,
    EXPIRED_SESSION_CLEANUP_DAYS: 7,
    AUDIT_LOG_RETENTION_DAYS: 90,

    // Archive thresholds
    ARCHIVE_AFTER_DAYS: 180,
};

// ════════════════════════════════════════════════════════════════════════════
// VALIDATION CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

export const VALIDATION_CONSTANTS = {
    // Email
    EMAIL_MAX_LENGTH: 254,  // RFC 5321
    EMAIL_MIN_LENGTH: 3,

    // User profile
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 100,
    BIO_MAX_LENGTH: 500,

    // Wallet address (Ethereum)
    WALLET_ADDRESS_LENGTH: 42,

    // File uploads
    MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,  // 10 MB
    ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],

    // Transactions
    MIN_TRANSACTION_AMOUNT: 0.01,
    MAX_TRANSACTION_AMOUNT: 1000000,
    TRANSACTION_DESCRIPTION_MAX_LENGTH: 255,
};

// ════════════════════════════════════════════════════════════════════════════
// SECURITY CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

export const SECURITY_CONSTANTS = {
    // Bcrypt
    BCRYPT_SALT_ROUNDS: 12,

    // JWT
    JWT_ALGORITHM: 'HS256',
    JWT_ALLOWED_ALGORITHMS: ['HS256'],

    // CORS
    CORS_MAX_AGE: 86400,  // 24 hours

    // Cookies
    COOKIE_SECURE: process.env.NODE_ENV === 'production',
    COOKIE_HTTP_ONLY: true,
    COOKIE_SAME_SITE: 'strict',
    COOKIE_MAX_AGE_MS: 24 * 60 * 60 * 1000,  // 24 hours

    // Request signing
    SIGNATURE_ALGORITHM: 'sha256',
    SIGNATURE_VALID_FOR_SECONDS: 300,  // 5 minutes

    // IP spoofing prevention
    MAX_PROXY_DEPTH: 1,  // Only trust direct proxy

    // Anomaly detection
    MAX_IPS_PER_USER_24H: 5,
    IMPOSSIBLE_TRAVEL_TIME_MINUTES: 60,
};

// ════════════════════════════════════════════════════════════════════════════
// LOGGING CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

export const LOGGING_CONSTANTS = {
    // Log levels
    LEVEL_ERROR: 'error',
    LEVEL_WARN: 'warn',
    LEVEL_INFO: 'info',
    LEVEL_DEBUG: 'debug',

    // Log retention
    LOG_RETENTION_DAYS: 30,
    AUDIT_LOG_RETENTION_DAYS: 90,

    // Sensitive fields to mask
    MASKED_FIELDS: [
        'password',
        'otp',
        'refreshToken',
        'accessToken',
        'twoFactorSecret',
        'creditCard',
        'ssn',
    ],
};

// ════════════════════════════════════════════════════════════════════════════
// ERROR CODES
// ════════════════════════════════════════════════════════════════════════════

export const ERROR_CODES = {
    // Authentication
    INVALID_CREDENTIALS: 'AUTH_001',
    ACCOUNT_LOCKED: 'AUTH_002',
    EMAIL_NOT_VERIFIED: 'AUTH_003',
    INVALID_OTP: 'AUTH_004',
    INVALID_REFRESH_TOKEN: 'AUTH_005',
    SESSION_EXPIRED: 'AUTH_006',
    TOKEN_REVOKED: 'AUTH_007',

    // Authorization
    UNAUTHORIZED: 'AUTHZ_001',
    FORBIDDEN: 'AUTHZ_002',
    PERMISSION_DENIED: 'AUTHZ_003',

    // Validation
    INVALID_INPUT: 'VAL_001',
    MISSING_FIELD: 'VAL_002',
    INVALID_FORMAT: 'VAL_003',
    DUPLICATE_ENTRY: 'VAL_004',

    // Rate limiting
    RATE_LIMIT_EXCEEDED: 'RATE_001',
    TOO_MANY_REQUESTS: 'RATE_002',

    // Server errors
    DATABASE_ERROR: 'DB_001',
    INTERNAL_ERROR: 'ERR_001',
    SERVICE_UNAVAILABLE: 'SVC_001',

    // CSRF
    CSRF_TOKEN_MISSING: 'CSRF_001',
    CSRF_TOKEN_INVALID: 'CSRF_002',
    CSRF_TOKEN_EXPIRED: 'CSRF_003',
};

// ════════════════════════════════════════════════════════════════════════════
// HTTP STATUS CODES
// ════════════════════════════════════════════════════════════════════════════

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,

    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,

    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
};

// ════════════════════════════════════════════════════════════════════════════
// FEATURE FLAGS
// ════════════════════════════════════════════════════════════════════════════

export const FEATURE_FLAGS = {
    ENABLE_2FA: true,
    ENABLE_OAUTH: true,
    ENABLE_WEB3: process.env.ENABLE_WEB3 !== 'false',
    ENABLE_API_DOCS: process.env.NODE_ENV === 'development',
    ENABLE_METRICS: true,
    ENABLE_AUDIT_LOG: true,
    ENABLE_ANOMALY_DETECTION: true,
};

// ════════════════════════════════════════════════════════════════════════════
// EXPORT DEFAULTS
// ════════════════════════════════════════════════════════════════════════════

export const CONSTANTS = {
    AUTH: AUTH_CONSTANTS,
    RATE_LIMIT: RATE_LIMIT_CONSTANTS,
    PAGINATION: PAGINATION_CONSTANTS,
    DATABASE: DATABASE_CONSTANTS,
    VALIDATION: VALIDATION_CONSTANTS,
    SECURITY: SECURITY_CONSTANTS,
    LOGGING: LOGGING_CONSTANTS,
    ERROR_CODES,
    HTTP_STATUS,
    FEATURE_FLAGS,
};

export default CONSTANTS;
