/**
 * API Key Rotation Service
 * Manages automatic key rotation for security
 */

const crypto = require('crypto');

class ApiKeyRotationService {
  constructor(ApiKeyModel) {
    this.ApiKeyModel = ApiKeyModel;
    this.rotationIntervalDays = process.env.API_KEY_ROTATION_DAYS || 90;
    this.warningDaysBeforeExpiry = process.env.API_KEY_WARNING_DAYS || 30;

    // Start auto-rotation check every day
    this.startAutoRotationCheck();
  }

  /**
   * Generate a random API key
   */
  async generateKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash an API key for storage
   */
  hashKey(key) {
    return crypto
      .createHash('sha256')
      .update(key)
      .digest('hex');
  }

  /**
   * Create a new API key for user
   */
  async createKey(userId, name = 'default') {
    const keyValue = await this.generateKey();
    const keyHash = this.hashKey(keyValue);

    const apiKey = new this.ApiKeyModel({
      userId,
      name,
      key: keyHash,
      lastUsed: null,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.rotationIntervalDays * 24 * 60 * 60 * 1000),
      revokedAt: null,
      rotations: 0,
    });

    await apiKey.save();

    console.log(`[API-KEY] Created new key for user ${userId}: ${name}`);

    // Return raw key only once
    return {
      key: keyValue,
      name,
      keyId: apiKey._id,
      expiresAt: apiKey.expiresAt,
      message: 'Store this key securely. It will not be shown again.',
    };
  }

  /**
   * Rotate an existing API key
   */
  async rotateKey(userId, keyId) {
    const oldKey = await this.ApiKeyModel.findById(keyId);

    if (!oldKey || oldKey.userId.toString() !== userId.toString()) {
      throw new Error('API key not found');
    }

    // Create new key
    const newKeyValue = await this.generateKey();
    const newKeyHash = this.hashKey(newKeyValue);

    const newKey = new this.ApiKeyModel({
      userId,
      name: `${oldKey.name} (rotated)`,
      key: newKeyHash,
      lastUsed: null,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.rotationIntervalDays * 24 * 60 * 60 * 1000),
      revokedAt: null,
      rotatedFrom: oldKey._id,
      rotations: oldKey.rotations + 1,
    });

    await newKey.save();

    // Mark old key as rotated (keep for grace period)
    oldKey.rotatedAt = new Date();
    oldKey.rotatedTo = newKey._id;
    oldKey.graceUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 day grace
    await oldKey.save();

    console.log(`[API-KEY] Rotated key for user ${userId}: ${keyId} -> ${newKey._id}`);

    return {
      newKey: newKeyValue,
      keyId: newKey._id,
      expiresAt: newKey.expiresAt,
      previousKey: oldKey._id,
      graceUntil: oldKey.graceUntil,
    };
  }

  /**
   * Revoke an API key
   */
  async revokeKey(userId, keyId) {
    const apiKey = await this.ApiKeyModel.findById(keyId);

    if (!apiKey || apiKey.userId.toString() !== userId.toString()) {
      throw new Error('API key not found');
    }

    apiKey.revokedAt = new Date();
    await apiKey.save();

    console.log(`[API-KEY] Revoked key for user ${userId}: ${keyId}`);

    return { success: true, revokedAt: apiKey.revokedAt };
  }

  /**
   * Verify an API key
   */
  async verifyKey(keyValue, userId) {
    const keyHash = this.hashKey(keyValue);

    const apiKey = await this.ApiKeyModel.findOne({
      userId,
      key: keyHash,
      revokedAt: null,
    });

    if (!apiKey) {
      return { valid: false, reason: 'Invalid key' };
    }

    // Check if key is expired
    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      return { valid: false, reason: 'Key expired' };
    }

    // Update last used
    apiKey.lastUsed = new Date();
    await apiKey.save();

    return { valid: true, keyId: apiKey._id };
  }

  /**
   * Get all keys for user
   */
  async getUserKeys(userId) {
    const keys = await this.ApiKeyModel.find({ userId }).select('-key');

    return keys.map((k) => ({
      id: k._id,
      name: k.name,
      createdAt: k.createdAt,
      expiresAt: k.expiresAt,
      lastUsed: k.lastUsed,
      isRevoked: !!k.revokedAt,
      isExpired: k.expiresAt && new Date() > k.expiresAt,
      rotations: k.rotations,
    }));
  }

  /**
   * Auto-rotate keys older than rotation interval
   */
  async autoRotateExpiredKeys() {
    const expiryDate = new Date(Date.now() - this.rotationIntervalDays * 24 * 60 * 60 * 1000);

    const expiredKeys = await this.ApiKeyModel.find({
      createdAt: { $lt: expiryDate },
      revokedAt: null,
      rotatedAt: null, // Not already rotated
    });

    console.log(`[API-KEY] Found ${expiredKeys.length} keys due for rotation`);

    for (const key of expiredKeys) {
      try {
        await this.rotateKey(key.userId, key._id);
      } catch (error) {
        console.error(`[API-KEY] Failed to auto-rotate key ${key._id}:`, error.message);
      }
    }
  }

  /**
   * Send rotation warnings
   */
  async sendRotationWarnings() {
    const warningDate = new Date(Date.now() + this.warningDaysBeforeExpiry * 24 * 60 * 60 * 1000);

    const expiringKeys = await this.ApiKeyModel.find({
      expiresAt: { $lt: warningDate, $gt: new Date() },
      revokedAt: null,
      notificationSent: { $ne: true },
    });

    console.log(`[API-KEY] Sending ${expiringKeys.length} rotation warnings`);

    for (const key of expiringKeys) {
      try {
        // TODO: Send email notification
        console.log(`[API-KEY] Warning sent for key ${key._id} expiring ${key.expiresAt}`);

        key.notificationSent = true;
        await key.save();
      } catch (error) {
        console.error(`[API-KEY] Failed to send warning for key ${key._id}:`, error.message);
      }
    }
  }

  /**
   * Clean up old revoked keys (older than 90 days)
   */
  async cleanupRevokedKeys() {
    const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const result = await this.ApiKeyModel.deleteMany({
      revokedAt: { $lt: cutoffDate },
    });

    console.log(`[API-KEY] Cleaned up ${result.deletedCount} old revoked keys`);
  }

  /**
   * Start automatic rotation check
   */
  startAutoRotationCheck() {
    // Run every 24 hours
    setInterval(() => {
      this.autoRotateExpiredKeys().catch((err) => {
        console.error('[API-KEY] Auto-rotation check failed:', err.message);
      });

      this.sendRotationWarnings().catch((err) => {
        console.error('[API-KEY] Rotation warning check failed:', err.message);
      });

      this.cleanupRevokedKeys().catch((err) => {
        console.error('[API-KEY] Cleanup failed:', err.message);
      });
    }, 24 * 60 * 60 * 1000);

    console.log('[API-KEY] Auto-rotation service started');
  }
}

module.exports = ApiKeyRotationService;
