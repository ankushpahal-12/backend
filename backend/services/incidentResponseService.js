/**
 * Incident Response Service
 * Automated response to security incidents
 */

class IncidentResponseService {
  constructor(models, emailService, auditLogger) {
    this.User = models.User;
    this.AuthSession = models.AuthSession;
    this.IpBlacklist = models.IpBlacklist;
    this.emailService = emailService;
    this.auditLogger = auditLogger;
  }

  /**
   * Handle compromised account
   */
  async handleCompromisedAccount(userId) {
    try {
      console.log(`[INCIDENT] Handling compromised account: ${userId}`);

      const user = await this.User.findById(userId);
      if (!user) throw new Error('User not found');

      // 1. Revoke all active sessions
      await this.AuthSession.updateMany(
        { userId, isActive: true },
        { isActive: false, revokedReason: 'ACCOUNT_COMPROMISE', revokedAt: new Date() }
      );

      // 2. Force password reset
      user.passwordResetToken = this.generateResetToken();
      user.passwordResetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
      user.passwordResetRequired = true;
      await user.save();

      // 3. Disable trusted devices
      // TODO: Update DeviceStore to disable all trusted devices

      // 4. Send security alert email
      await this.emailService.sendCompromiseAlert(user.email, {
        incident: 'Account Security Alert',
        action: 'All sessions have been revoked for security',
        resetLink: `${process.env.FRONTEND_URL}/reset-password/${user.passwordResetToken}`,
        supportEmail: process.env.SUPPORT_EMAIL,
        timestamp: new Date(),
      });

      // 5. Log incident
      await this.auditLogger.log('ACCOUNT_COMPROMISE_HANDLED', {
        userId,
        action: 'All sessions revoked, password reset forced',
        timestamp: new Date(),
      });

      return {
        success: true,
        message: 'Account secured',
        actions: ['Sessions revoked', 'Password reset forced', 'Notification sent'],
      };
    } catch (error) {
      console.error('[INCIDENT] Failed to handle account compromise:', error.message);
      throw error;
    }
  }

  /**
   * Handle mass failed login attempts (brute force)
   */
  async handleBruteForceAttempt(ip, endpoint, attemptCount) {
    try {
      console.log(`[INCIDENT] Handling brute force attempt from ${ip}: ${attemptCount} attempts`);

      // 1. Blacklist IP immediately
      const existingBlacklist = await this.IpBlacklist.findOne({ ip });

      if (!existingBlacklist) {
        await this.IpBlacklist.create({
          ip,
          reason: 'BRUTE_FORCE_DETECTED',
          endpoint,
          attemptCount,
          blockedAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          severity: attemptCount > 20 ? 'CRITICAL' : 'HIGH',
        });
      } else {
        existingBlacklist.attemptCount += attemptCount;
        existingBlacklist.lastAttempt = new Date();
        await existingBlacklist.save();
      }

      // 2. Alert admin
      await this.emailService.sendSecurityAlert(process.env.ADMIN_EMAIL, {
        incident: 'Brute Force Attack Detected',
        attackerIp: ip,
        targetEndpoint: endpoint,
        attemptCount,
        action: 'IP blocked automatically for 24 hours',
        dashboard: `${process.env.FRONTEND_URL}/admin/security`,
      });

      // 3. Log incident
      await this.auditLogger.log('BRUTE_FORCE_ATTACK_DETECTED', {
        ip,
        endpoint,
        attemptCount,
        action: 'IP blacklisted',
        timestamp: new Date(),
      });

      return {
        success: true,
        blocked: true,
        ip,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };
    } catch (error) {
      console.error('[INCIDENT] Failed to handle brute force attempt:', error.message);
      throw error;
    }
  }

  /**
   * Handle excessive WAF blocks
   */
  async handleExcessiveWAFBlocks(ip, blockType, blockCount) {
    try {
      console.log(`[INCIDENT] Excessive WAF blocks from ${ip}: ${blockType} x${blockCount}`);

      // 1. Temporary IP blacklist
      const duration =
        blockCount > 50 ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000; // 24h or 1h

      await this.IpBlacklist.create({
        ip,
        reason: 'EXCESSIVE_WAF_BLOCKS',
        blockType,
        blockCount,
        blockedAt: new Date(),
        expiresAt: new Date(Date.now() + duration),
        severity: blockCount > 50 ? 'CRITICAL' : 'HIGH',
      });

      // 2. Alert admin
      await this.emailService.sendSecurityAlert(process.env.ADMIN_EMAIL, {
        incident: 'Excessive WAF Blocks',
        ip,
        blockType,
        blockCount,
        action: `IP blocked for ${duration / (60 * 1000)} minutes`,
      });

      // 3. Log
      await this.auditLogger.log('EXCESSIVE_WAF_BLOCKS', {
        ip,
        blockType,
        blockCount,
        duration,
        timestamp: new Date(),
      });

      return { blocked: true, duration };
    } catch (error) {
      console.error('[INCIDENT] Failed to handle excessive WAF blocks:', error.message);
      throw error;
    }
  }

  /**
   * Handle rate limit abuse
   */
  async handleRateLimitAbuse(ip, endpoint, violationCount) {
    try {
      console.log(
        `[INCIDENT] Rate limit abuse from ${ip} on ${endpoint}: ${violationCount} violations`
      );

      // Escalating response based on violation count
      let action = 'WARN';
      let duration = 0;

      if (violationCount >= 10) {
        action = 'BLOCK_24H';
        duration = 24 * 60 * 60 * 1000;
      } else if (violationCount >= 5) {
        action = 'BLOCK_1H';
        duration = 60 * 60 * 1000;
      } else if (violationCount >= 3) {
        action = 'BLOCK_15M';
        duration = 15 * 60 * 1000;
      }

      if (action !== 'WARN') {
        await this.IpBlacklist.create({
          ip,
          reason: 'RATE_LIMIT_ABUSE',
          endpoint,
          violationCount,
          blockedAt: new Date(),
          expiresAt: new Date(Date.now() + duration),
          severity: 'MEDIUM',
        });
      }

      await this.auditLogger.log('RATE_LIMIT_ABUSE', {
        ip,
        endpoint,
        violationCount,
        action,
        timestamp: new Date(),
      });

      return { action, duration };
    } catch (error) {
      console.error('[INCIDENT] Failed to handle rate limit abuse:', error.message);
      throw error;
    }
  }

  /**
   * Handle suspicious MFA activity
   */
  async handleSuspiciousMFAActivity(userId, ip) {
    try {
      console.log(`[INCIDENT] Suspicious MFA activity for user ${userId} from ${ip}`);

      const user = await this.User.findById(userId);
      if (!user) throw new Error('User not found');

      // 1. Revoke all sessions
      await this.AuthSession.updateMany(
        { userId },
        {
          isActive: false,
          revokedReason: 'SUSPICIOUS_MFA_ACTIVITY',
          revokedAt: new Date(),
        }
      );

      // 2. Send alert email
      await this.emailService.sendMFAAlert(user.email, {
        incident: 'Suspicious MFA Activity',
        ip,
        action: 'All sessions revoked. If this is not you, please contact support.',
      });

      // 3. Log
      await this.auditLogger.log('SUSPICIOUS_MFA_ACTIVITY', {
        userId,
        ip,
        action: 'Sessions revoked, user notified',
        timestamp: new Date(),
      });

      return { success: true, message: 'MFA activity verified and user notified' };
    } catch (error) {
      console.error('[INCIDENT] Failed to handle suspicious MFA activity:', error.message);
      throw error;
    }
  }

  /**
   * Handle data breach (critical incident)
   */
  async handleDataBreach(breachType, affectedUserCount) {
    try {
      console.log(
        `[INCIDENT] CRITICAL: Data breach detected - Type: ${breachType}, Users: ${affectedUserCount}`
      );

      // 1. Force password reset for all affected users
      // TODO: Implement based on breach type

      // 2. Invalidate all sessions
      await this.AuthSession.updateMany(
        {},
        {
          isActive: false,
          revokedReason: 'DATA_BREACH',
          revokedAt: new Date(),
        }
      );

      // 3. Send critical alert to all admins
      await this.emailService.sendBreachchAlert(process.env.ADMIN_EMAIL, {
        incident: 'CRITICAL: Data Breach Detected',
        type: breachType,
        affectedUsers: affectedUserCount,
        action: 'All sessions revoked. Incident response initiated.',
        escalation: 'Contact security team immediately',
      });

      // 4. Log with highest severity
      await this.auditLogger.log('DATA_BREACH_DETECTED', {
        breachType,
        affectedUserCount,
        severity: 'CRITICAL',
        timestamp: new Date(),
      });

      // 5. Generate incident report
      const report = {
        incidentId: `BREACH_${Date.now()}`,
        type: breachType,
        affectedUsers: affectedUserCount,
        detectedAt: new Date(),
        actionsTaken: [
          'All sessions invalidated',
          'Admins notified',
          'Incident logged',
        ],
        nextSteps: [
          'Initiate crisis management',
          'Contact legal/compliance',
          'Notify affected users',
          'Begin forensics investigation',
        ],
      };

      return report;
    } catch (error) {
      console.error('[INCIDENT] Failed to handle data breach:', error.message);
      throw error;
    }
  }

  /**
   * Generate password reset token
   */
  generateResetToken() {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Get incident history
   */
  async getIncidentHistory(limit = 50) {
    try {
      return await this.auditLogger.getRecentAuditLogs(limit).then((logs) =>
        logs
          .filter((log) =>
            [
              'ACCOUNT_COMPROMISE_HANDLED',
              'BRUTE_FORCE_ATTACK_DETECTED',
              'EXCESSIVE_WAF_BLOCKS',
              'DATA_BREACH_DETECTED',
              'SUSPICIOUS_MFA_ACTIVITY',
            ].includes(log.action)
          )
          .reverse()
      );
    } catch (error) {
      console.error('[INCIDENT] Failed to get incident history:', error.message);
      return [];
    }
  }
}

module.exports = IncidentResponseService;
