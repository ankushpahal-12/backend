/**
 * DDoS Protection Middleware
 * Advanced rate limiting with adaptive responses
 */

const rateLimit = require('express-rate-limit');

// Store for tracking request patterns
const requestPatterns = new Map();

/**
 * Track request patterns for DDoS detection
 */
function trackRequestPattern(ip) {
  const now = Date.now();
  const windowSize = 1000; // 1 second

  if (!requestPatterns.has(ip)) {
    requestPatterns.set(ip, { count: 0, windowStart: now });
  }

  const pattern = requestPatterns.get(ip);

  if (now - pattern.windowStart > windowSize) {
    // New window
    pattern.count = 1;
    pattern.windowStart = now;
  } else {
    pattern.count++;
  }

  return pattern;
}

/**
 * Advanced DDoS detection middleware
 * Identifies suspicious traffic patterns
 */
function ddosDetectionMiddleware(req, res, next) {
  const ip = req.ip;
  const pattern = trackRequestPattern(ip);

  // Calculate requests per second
  const elapsedMs = Date.now() - pattern.windowStart;
  const rps = pattern.count / (Math.max(elapsedMs, 1) / 1000);

  // Flag suspicious patterns
  const suspiciousThresholds = {
    extreme: 500, // >500 req/sec = definitely DDoS
    high: 200, // >200 req/sec = likely DDoS
    medium: 100, // >100 req/sec = suspicious
  };

  if (rps > suspiciousThresholds.extreme) {
    req.suspiciousTraffic = {
      type: 'EXTREME_RPS',
      rps: Math.round(rps),
      action: 'IMMEDIATE_BLOCK',
    };
  } else if (rps > suspiciousThresholds.high) {
    req.suspiciousTraffic = {
      type: 'HIGH_RPS',
      rps: Math.round(rps),
      action: 'SEVERE_LIMIT',
    };
  } else if (rps > suspiciousThresholds.medium) {
    req.suspiciousTraffic = {
      type: 'MEDIUM_RPS',
      rps: Math.round(rps),
      action: 'LIMIT',
    };
  }

  next();
}

/**
 * Graduated rate limiter - stricter limits for suspicious traffic
 */
const graduatedRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: (req, res) => {
    // Immediate block for extreme DDoS
    if (req.suspiciousTraffic?.action === 'IMMEDIATE_BLOCK') {
      return 0;
    }

    // Severe limit for high RPS
    if (req.suspiciousTraffic?.action === 'SEVERE_LIMIT') {
      return 10;
    }

    // Standard limit for suspicious
    if (req.suspiciousTraffic?.action === 'LIMIT') {
      return 30;
    }

    // Higher limits for authenticated users
    if (req.user?.role === 'admin') {
      return 1000;
    }

    // Standard limit for regular users
    return 100;
  },
  keyGenerator: (req, res) => req.ip,
  skip: (req, res) => {
    // Don't rate limit health checks
    return req.path === '/health';
  },
  handler: (req, res) => {
    console.warn(
      `[RATE-LIMIT] Exceeded: ${req.ip} - ${req.suspiciousTraffic?.type || 'STANDARD'}`
    );

    const retryAfter =
      req.rateLimit.resetTime - Date.now();

    res.status(429).json({
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(retryAfter / 1000),
      timestamp: new Date().toISOString(),
    });
  },
});

/**
 * IP-based rate limiter
 * Blocks specific IPs that exceed thresholds
 */
function ipBasedRateLimiter(options = {}) {
  const { windowMs = 15 * 60 * 1000, maxRequests = 1000 } = options;
  const ipRequestCounts = new Map();

  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    if (!ipRequestCounts.has(ip)) {
      ipRequestCounts.set(ip, { count: 0, windowStart: now });
    }

    const ipData = ipRequestCounts.get(ip);

    // Check window
    if (now - ipData.windowStart > windowMs) {
      ipData.count = 0;
      ipData.windowStart = now;
    }

    ipData.count++;

    // Block if exceeded
    if (ipData.count > maxRequests) {
      return res.status(429).json({
        error: 'IP rate limit exceeded',
        code: 'IP_RATE_LIMIT_EXCEEDED',
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
}

/**
 * Geographic-based rate limiting
 * Stricter limits for certain regions
 */
function geographicRateLimiter(options = {}) {
  const { trustedCountries = ['US', 'GB', 'CA', 'AU'], strictLimit = 30 } = options;

  return (req, res, next) => {
    const userCountry = req.geoip?.country_code;

    // Apply stricter limits for non-trusted countries
    if (userCountry && !trustedCountries.includes(userCountry)) {
      const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: strictLimit,
        keyGenerator: (r) => r.ip,
      });

      return limiter(req, res, next);
    }

    next();
  };
}

/**
 * Cleanup old entries periodically
 */
setInterval(() => {
  const now = Date.now();
  const threshold = 5 * 60 * 1000; // 5 minutes

  for (const [ip, pattern] of requestPatterns.entries()) {
    if (now - pattern.windowStart > threshold) {
      requestPatterns.delete(ip);
    }
  }
}, 60 * 1000); // Clean every minute

module.exports = {
  ddosDetectionMiddleware,
  graduatedRateLimiter,
  ipBasedRateLimiter,
  geographicRateLimiter,
  trackRequestPattern,
};
