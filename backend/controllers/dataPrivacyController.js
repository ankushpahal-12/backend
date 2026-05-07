/**
 * Data Privacy Controller
 * Handles GDPR/CCPA data export and deletion requests
 */

const mongoose = require('mongoose');

class DataPrivacyController {
  constructor(models, auditLogger) {
    this.User = models.User;
    this.Transaction = models.Transaction;
    this.Wallet = models.Wallet;
    this.AuthSession = models.AuthSession;
    this.DeviceStore = models.DeviceStore;
    this.BehaviorStore = models.BehaviorStore;
    this.auditLogger = auditLogger;
  }

  /**
   * Export user data (GDPR Article 20)
   */
  async exportUserData(userId) {
    try {
      console.log(`[GDPR] Exporting data for user ${userId}`);

      const user = await this.User.findById(userId);
      if (!user) throw new Error('User not found');

      // Retrieve all user data
      const transactions = await this.Transaction.find({ userId });
      const wallets = await this.Wallet.find({ userId });
      const sessions = await this.AuthSession.find({ userId });
      const devices = await this.DeviceStore.find({ userId });
      const behaviors = await this.BehaviorStore.find({ userId });

      // Compile export
      const exportData = {
        exportMetadata: {
          exportDate: new Date().toISOString(),
          exportedBy: userId,
          format: 'JSON',
          version: '1.0',
        },
        user: {
          ...user.toObject(),
          // Don't include sensitive hashes
          password: undefined,
          passwordResetToken: undefined,
        },
        account: {
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          loginCount: sessions.length,
          mfaEnabled: user.mfaEnabled,
          trustedDevicesCount: devices.filter((d) => d.trusted).length,
        },
        transactions: transactions.map((t) => t.toObject()),
        wallets: wallets.map((w) => w.toObject()),
        sessions: sessions.map((s) => ({
          id: s._id,
          createdAt: s.createdAt,
          expiresAt: s.expiresAt,
          ip: s.ip,
          deviceFingerprint: s.deviceFingerprint,
        })),
        devices: devices.map((d) => ({
          id: d._id,
          name: d.deviceName,
          trusted: d.trusted,
          lastSeen: d.lastSeen,
          createdAt: d.createdAt,
        })),
        behaviors: behaviors.map((b) => b.toObject()),
      };

      // Log export request
      await this.auditLogger.log('DATA_EXPORT_REQUEST', {
        userId,
        recordCount: {
          transactions: transactions.length,
          wallets: wallets.length,
          sessions: sessions.length,
          devices: devices.length,
        },
        timestamp: new Date(),
      });

      return exportData;
    } catch (error) {
      console.error('[GDPR] Data export failed:', error.message);
      throw error;
    }
  }

  /**
   * Delete user data (GDPR Article 17 - Right to be forgotten)
   */
  async deleteUserData(userId, password) {
    try {
      console.log(`[GDPR] Processing deletion request for user ${userId}`);

      const user = await this.User.findById(userId);
      if (!user) throw new Error('User not found');

      // Verify password
      const isPasswordValid = await user.matchPassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }

      // Get counts before deletion
      const counts = {
        transactions: await this.Transaction.countDocuments({ userId }),
        wallets: await this.Wallet.countDocuments({ userId }),
        sessions: await this.AuthSession.countDocuments({ userId }),
        devices: await this.DeviceStore.countDocuments({ userId }),
        behaviors: await this.BehaviorStore.countDocuments({ userId }),
      };

      // Delete all user data (cascading)
      await Promise.all([
        this.Transaction.deleteMany({ userId }),
        this.Wallet.deleteMany({ userId }),
        this.AuthSession.deleteMany({ userId }),
        this.DeviceStore.deleteMany({ userId }),
        this.BehaviorStore.deleteMany({ userId }),
        this.User.findByIdAndDelete(userId),
      ]);

      // Log deletion for compliance
      await this.auditLogger.log('USER_DATA_DELETED', {
        userId,
        reason: 'GDPR_RIGHT_TO_BE_FORGOTTEN',
        recordsDeleted: counts,
        deletedAt: new Date(),
        compliance: {
          gdprArticle: 17,
          ccpaSection: '1798.100',
        },
      });

      console.log(`[GDPR] User ${userId} data completely deleted`, counts);

      return {
        success: true,
        message: 'All user data has been permanently deleted',
        recordsDeleted: counts,
        deletedAt: new Date(),
      };
    } catch (error) {
      console.error('[GDPR] Data deletion failed:', error.message);
      throw error;
    }
  }

  /**
   * Restrict processing (GDPR Article 18)
   */
  async restrictProcessing(userId, reason) {
    try {
      console.log(`[GDPR] Restricting processing for user ${userId}: ${reason}`);

      const user = await this.User.findById(userId);
      if (!user) throw new Error('User not found');

      // Mark user data as restricted
      user.dataRestricted = true;
      user.dataRestrictionReason = reason;
      user.dataRestrictionDate = new Date();
      await user.save();

      // Log restriction
      await this.auditLogger.log('DATA_PROCESSING_RESTRICTED', {
        userId,
        reason,
        restrictedAt: new Date(),
      });

      return { success: true, restricted: true, reason };
    } catch (error) {
      console.error('[GDPR] Processing restriction failed:', error.message);
      throw error;
    }
  }

  /**
   * Withdraw consent (GDPR recital 32)
   */
  async withdrawConsent(userId, consentType) {
    try {
      console.log(`[GDPR] Withdrawing ${consentType} consent for user ${userId}`);

      const user = await this.User.findById(userId);
      if (!user) throw new Error('User not found');

      // Update consent preferences
      const consents = {
        'marketing': 'marketingConsent',
        'analytics': 'analyticsConsent',
        'profiling': 'profilingConsent',
        'thirdparty': 'thirdPartyConsent',
      };

      if (consents[consentType]) {
        user[consents[consentType]] = false;
        await user.save();
      }

      // Log withdrawal
      await this.auditLogger.log('CONSENT_WITHDRAWN', {
        userId,
        consentType,
        withdrawnAt: new Date(),
      });

      return { success: true, consentType, withdrawn: true };
    } catch (error) {
      console.error('[GDPR] Consent withdrawal failed:', error.message);
      throw error;
    }
  }

  /**
   * Data portability (GDPR Article 20)
   * Format data for transfer to another service
   */
  async getDataForPortability(userId) {
    try {
      const exportData = await this.exportUserData(userId);

      // Format for common standards (JSON, CSV)
      const portableData = {
        format: 'JSON-LD',
        '@context': 'https://www.w3.org/ns/activitystreams',
        type: 'Person',
        data: exportData,
      };

      await this.auditLogger.log('DATA_PORTABILITY_REQUEST', {
        userId,
        format: 'JSON-LD',
        requestedAt: new Date(),
      });

      return portableData;
    } catch (error) {
      console.error('[GDPR] Data portability failed:', error.message);
      throw error;
    }
  }

  /**
   * Get user's consent history
   */
  async getConsentHistory(userId) {
    try {
      const user = await this.User.findById(userId);
      if (!user) throw new Error('User not found');

      return {
        marketingConsent: {
          given: user.marketingConsent,
          timestamp: user.marketingConsentDate,
        },
        analyticsConsent: {
          given: user.analyticsConsent,
          timestamp: user.analyticsConsentDate,
        },
        profilingConsent: {
          given: user.profilingConsent,
          timestamp: user.profilingConsentDate,
        },
      };
    } catch (error) {
      console.error('[GDPR] Failed to get consent history:', error.message);
      throw error;
    }
  }

  /**
   * Audit data deletions (compliance)
   */
  async getComplianceReport(startDate, endDate) {
    try {
      const logs = await this.auditLogger
        .find({
          action: 'USER_DATA_DELETED',
          timestamp: { $gte: startDate, $lte: endDate },
        })
        .select('userId timestamp recordsDeleted');

      return {
        reportPeriod: { startDate, endDate },
        totalDeletions: logs.length,
        recordsDeleted: logs.reduce(
          (sum, log) => sum + Object.values(log.recordsDeleted).reduce((a, b) => a + b, 0),
          0
        ),
        details: logs,
      };
    } catch (error) {
      console.error('[GDPR] Failed to generate compliance report:', error.message);
      throw error;
    }
  }
}

module.exports = DataPrivacyController;
