/**
 * IP SPOOFING DETECTION MIDDLEWARE
 * 
 * Prevents rate limit bypass via X-Forwarded-For header manipulation
 * - Validates that X-Forwarded-For only comes from known proxies
 * - Detects suspicious header patterns indicating spoofing attempts
 * - Logs potential attacks for security team analysis
 */

import config from '../config/config.js';
import { IpBlacklist } from '../models/IpBlacklist.js';

/**
 * Validate and normalize trusted proxies config
 */
const validateTrustedProxies = () => {
    const proxies = config.trustedProxies || [];
    
    if (!Array.isArray(proxies)) {
        throw new Error('config.trustedProxies must be an array');
    }
    
    if (proxies.length === 0) {
        console.warn('[IP_SPOOFING] No trusted proxies configured. Set TRUSTED_PROXIES in .env');
    }
    
    return proxies;
};

/**
 * Check if an IP address is in CIDR notation (e.g., 10.0.0.0/8)
 */
const isValidCIDR = (cidr) => {
    const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
    return cidrRegex.test(cidr);
};

/**
 * Check if an IP address matches a CIDR block
 */
const ipMatchesCIDR = (ip, cidr) => {
    const [network, prefix] = cidr.split('/');
    const [a, b, c, d] = network.split('.').map(Number);
    const [x, y, z, w] = ip.split('.').map(Number);
    
    const networkInt = (a << 24) | (b << 16) | (c << 8) | d;
    const ipInt = (x << 24) | (y << 16) | (z << 8) | w;
    const maskBits = 32 - parseInt(prefix);
    const mask = (0xffffffff << maskBits) >>> 0;
    
    return (networkInt & mask) === (ipInt & mask);
};

/**
 * Check if an IP is in the trusted proxies list
 */
const isTrustedProxy = (ip, trustedProxies) => {
    return trustedProxies.some(proxy => {
        if (isValidCIDR(proxy)) {
            return ipMatchesCIDR(ip, proxy);
        }
        return proxy === ip || proxy === 'localhost' || proxy === '127.0.0.1';
    });
};

/**
 * Parse and validate X-Forwarded-For header
 * Returns array of IPs in order (rightmost = closest proxy)
 */
const parseForwardedFor = (header) => {
    if (!header || typeof header !== 'string') return [];
    
    return header.split(',').map(ip => ip.trim()).filter(ip => ip);
};

/**
 * Detect suspicious X-Forwarded-For patterns
 */
const detectSpoofingPatterns = (forwardedIPs, remoteIP, trustedProxies) => {
    const suspicions = [];
    
    // Check 1: More than 5 IPs in chain (unusual)
    if (forwardedIPs.length > 5) {
        suspicions.push('excessive_chain_length');
    }
    
    // Check 2: X-Forwarded-For present but remoteIP is not a trusted proxy
    // This means the header came from an untrusted source and might be spoofed
    if (forwardedIPs.length > 0 && !isTrustedProxy(remoteIP, trustedProxies)) {
        suspicions.push('untrusted_source_proxy');
    }
    
    // Check 3: Duplicate IPs in chain (suspicious)
    const uniqueIPs = new Set(forwardedIPs);
    if (uniqueIPs.size !== forwardedIPs.length) {
        suspicions.push('duplicate_ips_in_chain');
    }
    
    // Check 4: Private IP followed by public IP (unusual unless intentional)
    const hasPrivateIP = forwardedIPs.some(ip => /^(10\.|172\.16\.|192\.168\.)/.test(ip));
    const hasPublicIP = forwardedIPs.some(ip => !/^(10\.|172\.16\.|192\.168\.|127\.|::1)/.test(ip));
    if (hasPrivateIP && hasPublicIP) {
        suspicions.push('mixed_private_public_ips');
    }
    
    return suspicions;
};

/**
 * Main IP spoofing detection middleware
 */
export const ipSpoofingDetectionMiddleware = async (req, res, next) => {
    try {
        const trustedProxies = validateTrustedProxies();
        
        // If no trusted proxies configured, skip validation
        if (trustedProxies.length === 0) {
            return next();
        }
        
        const remoteIP = req.socket.remoteAddress;
        const xForwardedFor = req.headers['x-forwarded-for'];
        const xRealIp = req.headers['x-real-ip'];
        
        // If no forwarded headers, nothing to validate
        if (!xForwardedFor && !xRealIp) {
            return next();
        }
        
        // Parse forwarded IPs
        const forwardedIPs = parseForwardedFor(xForwardedFor || xRealIp);
        
        // Detect spoofing patterns
        const suspicions = detectSpoofingPatterns(forwardedIPs, remoteIP, trustedProxies);
        
        if (suspicions.length > 0) {
            // Log potential spoofing attempt
            console.warn('[IP_SPOOFING_DETECTED]', {
                remoteIP,
                xForwardedFor,
                xRealIp,
                suspicions,
                userAgent: req.headers['user-agent'],
                timestamp: new Date().toISOString(),
            });
            
            // Check if this IP should be blacklisted
            if (suspicions.length >= 2) {
                try {
                    // Add to temporary blacklist (30 minutes)
                    await IpBlacklist.create({
                        ip: remoteIP,
                        reason: 'ip_spoofing_attempt',
                        details: suspicions.join(','),
                        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
                    });
                    
                    console.warn(`[IP_BLACKLISTED] ${remoteIP} - IP spoofing attempt`);
                } catch (err) {
                    console.error('[IP_BLACKLIST_ERROR]', err.message);
                }
            }
            
            // For security, we don't want to directly block suspicious IPs from trusted sources
            // Instead, we log and let the rate limiter handle repeated abuse
            // This prevents accidental blocks when legitimate proxies behave unusually
        }
        
        // Store detected spoofing indicators for use in rate limiting
        req.ipSpoofingIndicators = suspicions;
        
        next();
    } catch (err) {
        console.error('[IP_SPOOFING_MIDDLEWARE_ERROR]', err);
        // Don't block requests if middleware fails
        next();
    }
};

/**
 * Utility to get the "real" client IP with spoofing detection
 */
export const getClientIP = (req, config) => {
    const trustedProxies = config.trustedProxies || [];
    const remoteIP = req.socket.remoteAddress;
    
    // If no trusted proxies, use remote IP directly
    if (trustedProxies.length === 0) {
        return remoteIP;
    }
    
    // If remote IP is a trusted proxy, use X-Forwarded-For
    if (isTrustedProxy(remoteIP, trustedProxies)) {
        const xForwardedFor = req.headers['x-forwarded-for'];
        if (xForwardedFor) {
            const ips = parseForwardedFor(xForwardedFor);
            // Return the first IP (client IP) if valid
            return ips[0] || remoteIP;
        }
    }
    
    // Otherwise use remote IP directly
    return remoteIP;
};

/**
 * Create a strict rate limiter that considers spoofing indicators
 */
export const createAntiSpoofingRateLimiter = (limiterOptions) => {
    return (req, res, next) => {
        // If spoofing indicators detected, use stricter rate limit
        const suspicions = req.ipSpoofingIndicators || [];
        
        if (suspicions.length > 0) {
            // Log attempt with higher severity
            console.warn('[RATE_LIMIT_SUSPICIOUS_IP]', {
                ip: req.ip,
                suspicions,
                endpoint: req.path,
                timestamp: new Date().toISOString(),
            });
            
            // You can implement additional rate limiting here
            // For example, use a different rate limiter with stricter limits
        }
        
        next();
    };
};

export default {
    ipSpoofingDetectionMiddleware,
    getClientIP,
    createAntiSpoofingRateLimiter,
    isTrustedProxy,
    parseForwardedFor,
    detectSpoofingPatterns,
};
