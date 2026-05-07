/**
 * Bot detection middleware using the Honeypot technique.
 * It checks for a hidden field that humans shouldn't see but bots will likely fill.
 */
const detectBot = (req, res, next) => {
    // Bypass bot detection in development to allow testing via Postman/REST Client
    if (process.env.NODE_ENV === 'development') {
        return next();
    }

    const { _website_sync_token, metrics } = req.body;

    // 1. Honeypot check
    if (_website_sync_token) {
        console.warn(`[Security] Bot detected (Honeypot) from IP: ${req.ip}`);
        return res.status(400).json({
            status: 'error',
            message: 'Suspicious activity detected.'
        });
    }

    // 2. Behavioral Analysis
    if (metrics) {
        const { eventCount, inputVariance, runtimeFlag } = metrics;

        // Block automation flags
        if (runtimeFlag) {
            console.warn(`[Security] Bot detected (Runtime Flag) from IP: ${req.ip}`);
            return res.status(403).json({
                status: 'error',
                message: 'Automated access is not allowed.'
            });
        }

        // Check for human-like typing rhythm (bots often have perfect intervals, variance ~ 0)
        // Only check if they actually typed something (intervals recorded)
        if (inputVariance !== undefined && inputVariance < 50) {
            console.warn(`[Security] Bot detected (Input Variance) from IP: ${req.ip} - Variance: ${inputVariance}`);
            return res.status(403).json({
                status: 'error',
                message: 'Behavioral analysis failed. Please try again.'
            });
        }

        // Check for mouse activity (on non-mobile devices)
        const userAgent = req.headers['user-agent'] || '';
        const isMobile = /Mobile|Android|iPhone/i.test(userAgent);
        if (!isMobile && eventCount === 0) {
            console.warn(`[Security] Bot detected (No Interaction) from IP: ${req.ip}`);
            // We might be more lenient here as power users exist, 
            // but for Login/Register, it's a strong signal.
            return res.status(403).json({
                status: 'error',
                message: 'Behavioral analysis failed. Please use a mouse or touch device.'
            });
        }
    } else {
        // Metrics are required on all protected routes — reject requests without them.
        // Legitimate browsers always send metrics; missing = automated/scripted request.
        console.warn(`[Security] Blocked request missing interaction metrics from IP: ${req.ip}`);
        return res.status(403).json({
            status: 'error',
            message: 'Behavioral analysis failed. Please use a supported browser.'
        });
    }

    next();
};

export default detectBot;
