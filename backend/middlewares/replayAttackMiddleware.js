/**
 * Replay Attack Prevention Middleware
 * Prevents duplicate request execution
 */

/**
 * In-memory store for tracking request signatures (in production, use Redis)
 */
const requestSignatureStore = new Map();

const REPLAY_WINDOW = 5 * 60 * 1000; // 5 minutes
const CLEANUP_INTERVAL = 60 * 1000; // Clean every minute

/**
 * Generate unique signature for tracking
 */
function generateSignatureKey(userId, signature) {
  return `${userId}:${signature}`;
}

/**
 * Middleware to prevent replay attacks
 */
function preventReplayAttacks(req, res, next) {
  // Only check state-changing requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const signature = req.get('X-Signature');
  const timestamp = parseInt(req.get('X-Timestamp'));
  const userId = req.user?.id;

  // Validate signature and timestamp exist
  if (!signature || !timestamp || !userId) {
    return res.status(400).json({
      error: 'Missing required signature headers',
      code: 'MISSING_SIGNATURE_HEADERS',
      required: ['X-Signature', 'X-Timestamp'],
      timestamp: new Date().toISOString(),
    });
  }

  // Check timestamp within acceptable window
  const now = Date.now();
  if (Math.abs(now - timestamp) > REPLAY_WINDOW) {
    console.warn(
      `[REPLAY-PROTECTION] Timestamp out of window from ${req.ip}: ${Math.abs(now - timestamp)}ms`
    );

    return res.status(401).json({
      error: 'Request timestamp outside acceptable window',
      code: 'TIMESTAMP_OUT_OF_WINDOW',
      acceptableWindow: REPLAY_WINDOW,
      timestamp: new Date().toISOString(),
    });
  }

  // Check if signature was already used
  const signatureKey = generateSignatureKey(userId, signature);
  const existingRequest = requestSignatureStore.get(signatureKey);

  if (existingRequest) {
    console.warn(
      `[REPLAY-PROTECTION] Duplicate request detected from ${req.ip}: ${req.method} ${req.path}`
    );

    return res.status(409).json({
      error: 'Duplicate request detected (replay attack prevention)',
      code: 'DUPLICATE_REQUEST',
      firstRequestTime: existingRequest.timestamp,
      timestamp: new Date().toISOString(),
    });
  }

  // Store signature with TTL = REPLAY_WINDOW
  requestSignatureStore.set(signatureKey, {
    timestamp: now,
    ip: req.ip,
    method: req.method,
    path: req.path,
    userId,
  });

  // Schedule cleanup
  setTimeout(() => {
    requestSignatureStore.delete(signatureKey);
  }, REPLAY_WINDOW);

  next();
}

/**
 * Cleanup old entries periodically
 */
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, value] of requestSignatureStore.entries()) {
    if (now - value.timestamp > REPLAY_WINDOW) {
      requestSignatureStore.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[REPLAY-PROTECTION] Cleaned ${cleaned} old entries`);
  }
}, CLEANUP_INTERVAL);

/**
 * Get statistics
 */
function getStats() {
  return {
    storedSignatures: requestSignatureStore.size,
    maxCapacity: Math.ceil(REPLAY_WINDOW / CLEANUP_INTERVAL) * 1000,
  };
}

/**
 * Clear all stored signatures (for testing)
 */
function clearStore() {
  requestSignatureStore.clear();
  console.log('[REPLAY-PROTECTION] Store cleared');
}

module.exports = {
  preventReplayAttacks,
  generateSignatureKey,
  getStats,
  clearStore,
};
