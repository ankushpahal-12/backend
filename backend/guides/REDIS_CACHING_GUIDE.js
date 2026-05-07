/**
 * REDIS CACHING LAYER GUIDE
 * 
 * Implements caching for:
 * - Admin stats (5-min TTL)
 * - User permissions
 * - Session tokens (blacklist on logout)
 * - Rate limit counters
 * - Device fingerprints
 */

/**
 * INSTALLATION
 * 
 * npm install redis ioredis
 * 
 * Docker setup:
 * docker run -d -p 6379:6379 redis:latest
 */

/**
 * CONFIGURATION
 */
export const redisConfig = {
    development: {
        host: 'localhost',
        port: 6379,
        db: 0,
        password: null,
    },
    production: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        db: process.env.REDIS_DB || 0,
        password: process.env.REDIS_PASSWORD,
        tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
    }
};

/**
 * REDIS CLIENT SETUP
 */

import redis from 'redis';

export const createRedisClient = async (config) => {
    const client = redis.createClient(config);
    
    client.on('error', (err) => console.log('Redis Client Error', err));
    client.on('connect', () => console.log('Redis Client Connected'));
    
    await client.connect();
    return client;
};

/**
 * CACHE KEY PATTERNS
 */

export const cacheKeys = {
    // Stats
    adminStats: 'stats:admin',
    userStats: (userId) => `stats:user:${userId}`,
    
    // Permissions
    userPermissions: (userId) => `perms:user:${userId}`,
    rolePermissions: (role) => `perms:role:${role}`,
    
    // Sessions
    sessionBlacklist: (sessionId) => `session:blacklist:${sessionId}`,
    userSessions: (userId) => `sessions:user:${userId}`,
    
    // Rate Limiting
    rateLimitCounter: (endpoint, clientIp) => `ratelimit:${endpoint}:${clientIp}`,
    
    // Device Fingerprints
    deviceFingerprint: (userId, fingerprint) => `device:${userId}:${fingerprint}`,
    
    // OTP Cache
    otpAttempts: (email) => `otp:attempts:${email}`,
    
    // API Keys
    apiKeyValidation: (apiKey) => `apikey:${apiKey}`,
};

/**
 * CACHING UTILITY FUNCTIONS
 */

export class CacheManager {
    constructor(redisClient) {
        this.client = redisClient;
        this.ttls = {
            short: 5 * 60,        // 5 minutes
            medium: 30 * 60,      // 30 minutes
            long: 24 * 60 * 60,   // 24 hours
            session: 7 * 24 * 60 * 60, // 7 days
        };
    }
    
    /**
     * Get value from cache
     */
    async get(key) {
        try {
            const value = await this.client.get(key);
            if (value) {
                return JSON.parse(value);
            }
            return null;
        } catch (err) {
            console.error('[CACHE_GET_ERROR]', err);
            return null;
        }
    }
    
    /**
     * Set value in cache with TTL
     */
    async set(key, value, ttl = this.ttls.short) {
        try {
            await this.client.setEx(key, ttl, JSON.stringify(value));
            return true;
        } catch (err) {
            console.error('[CACHE_SET_ERROR]', err);
            return false;
        }
    }
    
    /**
     * Delete cache key
     */
    async delete(key) {
        try {
            await this.client.del(key);
            return true;
        } catch (err) {
            console.error('[CACHE_DELETE_ERROR]', err);
            return false;
        }
    }
    
    /**
     * Clear all cache keys matching pattern
     */
    async clearPattern(pattern) {
        try {
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(keys);
            }
            return keys.length;
        } catch (err) {
            console.error('[CACHE_CLEAR_ERROR]', err);
            return 0;
        }
    }
    
    /**
     * Cache decorator for functions
     * Usage:
     * const result = await cache.memoize(
     *   () => expensiveFunction(),
     *   'cache:key',
     *   300  // TTL in seconds
     * );
     */
    async memoize(fn, key, ttl = this.ttls.short) {
        // Try cache first
        let result = await this.get(key);
        if (result) {
            return result;
        }
        
        // Compute and cache
        result = await fn();
        await this.set(key, result, ttl);
        return result;
    }
}

/**
 * USE CASES WITH CODE EXAMPLES
 */

// ─── 1. ADMIN STATS CACHING ─────────────────────────────────────

export const getAdminStatsExample = async (cache, User) => {
    const cacheKey = cacheKeys.adminStats;
    
    // Try cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
        return cached;
    }
    
    // Compute if not cached
    const stats = {
        totalUsers: await User.countDocuments(),
        verifiedUsers: await User.countDocuments({ isVerified: true }),
        activeUsers24h: await User.countDocuments({ lastLogin: { $gt: Date.now() - 24*60*60*1000 } }),
        timestamp: new Date(),
    };
    
    // Cache for 5 minutes
    await cache.set(cacheKey, stats, cache.ttls.short);
    return stats;
};

// ─── 2. RATE LIMIT COUNTER CACHING ──────────────────────────────

export const checkRateLimitExample = async (cache, endpoint, clientIp, limit = 5, windowSec = 60) => {
    const key = cacheKeys.rateLimitCounter(endpoint, clientIp);
    
    let count = await cache.get(key);
    if (!count) {
        count = 0;
    }
    
    count++;
    
    if (count > limit) {
        return { allowed: false, remaining: 0 };
    }
    
    // Set counter with TTL (window)
    await cache.set(key, count, windowSec);
    
    return { allowed: true, remaining: limit - count };
};

// ─── 3. SESSION BLACKLIST CACHING ───────────────────────────────

export const logoutSessionExample = async (cache, sessionId, expiresAt) => {
    const key = cacheKeys.sessionBlacklist(sessionId);
    const ttl = Math.ceil((expiresAt - Date.now()) / 1000);
    
    // Add to blacklist with TTL = session TTL
    await cache.set(key, { revokedAt: new Date() }, ttl);
};

export const isSessionBlacklistedExample = async (cache, sessionId) => {
    const key = cacheKeys.sessionBlacklist(sessionId);
    const blacklisted = await cache.get(key);
    return !!blacklisted;
};

// ─── 4. USER PERMISSIONS CACHING ────────────────────────────────

export const getUserPermissionsExample = async (cache, userId) => {
    const cacheKey = cacheKeys.userPermissions(userId);
    
    return await cache.memoize(
        async () => {
            // Compute permissions from database
            const user = await User.findById(userId);
            return {
                role: user.role,
                permissions: getRolePermissions(user.role),
            };
        },
        cacheKey,
        cache.ttls.long  // 24 hours
    );
};

// ─── 5. DEVICE FINGERPRINT CACHING ──────────────────────────────

export const validateDeviceExample = async (cache, userId, deviceFingerprint) => {
    const cacheKey = cacheKeys.deviceFingerprint(userId, deviceFingerprint);
    
    // Check if device already verified (cached)
    const cached = await cache.get(cacheKey);
    if (cached) {
        return true; // Device already verified
    }
    
    // Verify device (slow operation)
    const isVerified = await verifyDeviceWithDatabase(userId, deviceFingerprint);
    
    // Cache verification for 24 hours
    if (isVerified) {
        await cache.set(cacheKey, { verified: true }, cache.ttls.long);
    }
    
    return isVerified;
};

/**
 * MIDDLEWARE INTEGRATION
 */

export const cacheMiddleware = (redisClient) => {
    const cache = new CacheManager(redisClient);
    
    return (req, res, next) => {
        req.cache = cache;
        next();
    };
};

/**
 * REDIS COMMANDS FOR MONITORING
 */

export const redisMonitoringCommands = [
    // View all keys
    { command: "KEYS *", description: "List all keys" },
    
    // Memory usage
    { command: "INFO MEMORY", description: "Memory stats" },
    { command: "MEMORY USAGE key_name", description: "Size of specific key" },
    
    // Key expiration
    { command: "TTL key_name", description: "Time to live in seconds" },
    { command: "PTTL key_name", description: "Time to live in milliseconds" },
    
    // Monitoring
    { command: "MONITOR", description: "Monitor real-time commands" },
    { command: "DBSIZE", description: "Number of keys in database" },
    
    // Cleanup
    { command: "FLUSHDB", description: "Delete all keys in current DB" },
    { command: "FLUSHALL", description: "Delete all keys in all DBs" },
];

/**
 * PRODUCTION CHECKLIST
 * 
 * - [ ] Redis authentication enabled (password set)
 * - [ ] Redis persistence enabled (RDB or AOF)
 * - [ ] Replication/clustering configured
 * - [ ] Monitor memory usage (set maxmemory policy)
 * - [ ] Enable TLS for production connections
 * - [ ] Set up Redis monitoring/alerting
 * - [ ] Configure backup strategy
 * - [ ] Test failover scenarios
 * - [ ] Set TTL policies for each cache type
 * - [ ] Document cache invalidation strategy
 */

export default {
    redisConfig,
    createRedisClient,
    cacheKeys,
    CacheManager,
    cacheMiddleware,
};
