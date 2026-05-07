/**
 * IP Blacklist Middleware with Country-Based Filtering
 * Blocks IPs from countries outside India while allowing India IPs.
 * Dynamically blacklists IPs with suspicious patterns.
 * In production, backed by Redis or GeoIP database.
 */

// India-specific IP ranges (ISP providers commonly used in India)
const indiaIPRanges = [
    { start: '49.204.0.0', end: '49.204.255.255' },          // Airtel
    { start: '59.88.0.0', end: '59.88.255.255' },            // BSNL
    { start: '117.192.0.0', end: '117.255.255.255' },        // Various ISPs
    { start: '182.70.0.0', end: '182.71.255.255' },          // Airtel
    { start: '202.141.128.0', end: '202.141.159.255' },      // Vodafone
    { start: '103.192.0.0', end: '103.255.255.255' },        // TATA Communications
    { start: '61.12.0.0', end: '61.12.255.255' },            // VSNL
];

// Whitelist of trusted IPs (can include localhost, office IPs, etc.)
const whitelistedIPs = new Set([
    '127.0.0.1',
    '::1',
    'localhost',
]);

// Dynamically blacklisted IPs
const blacklistedIPs = new Set([]);

// Track suspicious activity per IP
const suspiciousActivityTracker = new Map();

const SUSPICIOUS_THRESHOLD = 5;  // Number of suspicious activities before blocking
const ACTIVITY_WINDOW = 15 * 60 * 1000;  // 15 minutes

/**
 * Convert IP string to number for range comparison
 */
const ipToNumber = (ip) => {
    const parts = ip.split('.');
    if (parts.length !== 4) return null;
    return parts.reduce((acc, part) => (acc << 8) + parseInt(part, 10), 0);
};

/**
 * Check if IP is within India ranges
 */
const isIndiaIP = (ip) => {
    const ipNum = ipToNumber(ip);
    if (!ipNum) return false;

    return indiaIPRanges.some(range => {
        const startNum = ipToNumber(range.start);
        const endNum = ipToNumber(range.end);
        return ipNum >= startNum && ipNum <= endNum;
    });
};

/**
 * Track suspicious activity for an IP
 */
const trackSuspiciousActivity = (ip, reason) => {
    const now = Date.now();
    
    if (!suspiciousActivityTracker.has(ip)) {
        suspiciousActivityTracker.set(ip, []);
    }

    const activities = suspiciousActivityTracker.get(ip);
    
    // Remove old activities outside the window
    const recentActivities = activities.filter(
        activity => now - activity.timestamp < ACTIVITY_WINDOW
    );
    
    recentActivities.push({ timestamp: now, reason });
    suspiciousActivityTracker.set(ip, recentActivities);

    // If threshold exceeded, add to blacklist
    if (recentActivities.length >= SUSPICIOUS_THRESHOLD) {
        console.warn(`[SECURITY] IP ${ip} blacklisted after ${SUSPICIOUS_THRESHOLD} suspicious activities`);
        addToBlacklist(ip);
        return true;  // IP was just blacklisted
    }

    if (recentActivities.length > 1) {
        console.warn(`[SECURITY] Suspicious activity on IP ${ip}: ${reason} (${recentActivities.length}/${SUSPICIOUS_THRESHOLD})`);
    }

    return false;
};

/**
 * Clear old activity records to prevent memory leak
 */
const cleanupActivityTracker = () => {
    const now = Date.now();
    
    for (const [ip, activities] of suspiciousActivityTracker.entries()) {
        const recentActivities = activities.filter(
            activity => now - activity.timestamp < ACTIVITY_WINDOW
        );
        
        if (recentActivities.length === 0) {
            suspiciousActivityTracker.delete(ip);
        } else {
            suspiciousActivityTracker.set(ip, recentActivities);
        }
    }
};

export const ipBlacklistMiddleware = (req, res, next) => {
    // Determine the true client IP, accounting for proxies
    const clientIP = req.ip || req.connection.remoteAddress;

    // Cleanup old records periodically
    if (Math.random() < 0.01) {
        cleanupActivityTracker();
    }

    // Check whitelist first
    if (whitelistedIPs.has(clientIP)) {
        return next();
    }

    // Check hardcoded blacklist
    if (blacklistedIPs.has(clientIP)) {
        console.warn(`[SECURITY] Blocked request from blacklisted IP: ${clientIP}`);
        return req.socket.destroy();
    }

    // Check if IP is from India
    if (!isIndiaIP(clientIP)) {
        console.warn(`[SECURITY] Blocked request from non-India IP: ${clientIP}`);
        trackSuspiciousActivity(clientIP, 'Non-India IP detected');
        return req.socket.destroy();
    }

    next();
};

/**
 * Report suspicious activity from an IP
 * Called by other security middlewares
 */
export const reportSuspiciousActivity = (ip, reason = 'Suspicious pattern detected') => {
    return trackSuspiciousActivity(ip, reason);
};

/**
 * Add IP to dynamic blacklist
 */
export const addToBlacklist = (ip) => {
    blacklistedIPs.add(ip);
    console.log(`[SECURITY] IP added to blacklist: ${ip}`);
};

/**
 * Remove IP from dynamic blacklist
 */
export const removeFromBlacklist = (ip) => {
    blacklistedIPs.delete(ip);
    console.log(`[SECURITY] IP removed from blacklist: ${ip}`);
};

/**
 * Get current blacklist
 */
export const getBlacklist = () => {
    return Array.from(blacklistedIPs);
};

/**
 * Get whitelist
 */
export const getWhitelist = () => {
    return Array.from(whitelistedIPs);
};

/**
 * Add IP to whitelist (trusted IPs)
 */
export const addToWhitelist = (ip) => {
    whitelistedIPs.add(ip);
    console.log(`[SECURITY] IP added to whitelist: ${ip}`);
};

/**
 * Remove IP from whitelist
 */
export const removeFromWhitelist = (ip) => {
    whitelistedIPs.delete(ip);
    console.log(`[SECURITY] IP removed from whitelist: ${ip}`);
};

/**
 * Get suspicious activity tracker stats
 */
export const getSuspiciousActivityStats = () => {
    const stats = {};
    for (const [ip, activities] of suspiciousActivityTracker.entries()) {
        stats[ip] = {
            count: activities.length,
            activities: activities.map(a => ({ ...a, timestamp: new Date(a.timestamp).toISOString() }))
        };
    }
    return stats;
};
