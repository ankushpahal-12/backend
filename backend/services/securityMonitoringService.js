/**
 * Security Monitoring Service
 * Real-time security event monitoring and alerting
 */

const EventEmitter = require('events');

class SecurityMonitoringService extends EventEmitter {
  constructor(auditLogger) {
    super();
    this.auditLogger = auditLogger;
    this.alerts = [];
    this.alertHistory = [];
    this.maxAlerts = 1000; // Keep last 1000 alerts

    // Alert thresholds
    this.thresholds = {
      failedLoginAttempts: 5,
      mfaFailures: 3,
      unusualActivity: 2,
      sqlInjectionAttempts: 1,
      xssAttempts: 1,
      wafBlocks: 5,
      rateLimitExceeded: 10,
    };
  }

  /**
   * Monitor failed login attempts
   */
  async monitorFailedLogins(userId, ip) {
    try {
      // Get failed attempts in last 15 minutes
      const recentLogs = await this.auditLogger.getUserAuditLogs(
        userId,
        15 / (24 * 60)
      );

      const failedAttempts = recentLogs.filter(
        (log) => log.action === 'LOGIN_FAILED'
      ).length;

      if (failedAttempts >= this.thresholds.failedLoginAttempts) {
        this.raiseAlert('HIGH_FAILED_LOGIN_ATTEMPTS', {
          userId,
          ip,
          attempts: failedAttempts,
          severity: 'CRITICAL',
          recommendation: 'Lock account or require MFA verification',
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('[MONITORING] Failed login monitoring error:', error.message);
      return false;
    }
  }

  /**
   * Monitor MFA failures
   */
  async monitorMFAFailures(userId) {
    try {
      const recentLogs = await this.auditLogger.getUserAuditLogs(
        userId,
        15 / (24 * 60)
      );

      const mfaFailures = recentLogs.filter(
        (log) => log.action === 'MFA_VERIFICATION_FAILED'
      ).length;

      if (mfaFailures >= this.thresholds.mfaFailures) {
        this.raiseAlert('HIGH_MFA_FAILURES', {
          userId,
          attempts: mfaFailures,
          severity: 'HIGH',
          recommendation: 'Force password reset and re-authentication',
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('[MONITORING] MFA failure monitoring error:', error.message);
      return false;
    }
  }

  /**
   * Monitor security headers in responses
   */
  monitorSecurityHeaders(response) {
    const requiredHeaders = [
      'Strict-Transport-Security',
      'X-Content-Type-Options',
      'X-Frame-Options',
      'Content-Security-Policy',
      'X-XSS-Protection',
    ];

    const missingHeaders = requiredHeaders.filter(
      (h) => !response.headers || !response.headers[h.toLowerCase()]
    );

    if (missingHeaders.length > 0) {
      this.raiseAlert('MISSING_SECURITY_HEADERS', {
        missingHeaders,
        severity: 'MEDIUM',
        recommendation: 'Add missing security headers to all responses',
      });

      return false;
    }

    return true;
  }

  /**
   * Monitor certificate expiration
   */
  monitorSSLCertificateExpiry(certExpiry) {
    const daysUntilExpiry = Math.ceil((certExpiry - Date.now()) / (24 * 60 * 60 * 1000));

    if (daysUntilExpiry < 30) {
      this.raiseAlert('SSL_CERTIFICATE_EXPIRING_SOON', {
        expiresIn: daysUntilExpiry,
        severity: daysUntilExpiry < 7 ? 'CRITICAL' : 'HIGH',
        recommendation: 'Renew SSL certificate immediately',
      });

      return false;
    }

    return true;
  }

  /**
   * Monitor for unusual activity patterns
   */
  monitorUnusualActivity(userActivity) {
    const { loginCountToday, loginCountYesterday, averageDaily, ip } = userActivity;

    // Spike detection
    if (loginCountToday > averageDaily * 3) {
      this.raiseAlert('UNUSUAL_LOGIN_SPIKE', {
        ...userActivity,
        severity: 'MEDIUM',
        recommendation: 'Verify account activity or force re-authentication',
      });

      return true;
    }

    return false;
  }

  /**
   * Track WAF blocks
   */
  trackWAFBlock(threatType, ip, path) {
    const key = `waf_${ip}`;

    if (!this.wafBlockCounts) {
      this.wafBlockCounts = new Map();
    }

    if (!this.wafBlockCounts.has(key)) {
      this.wafBlockCounts.set(key, { count: 0, lastReset: Date.now() });
    }

    const data = this.wafBlockCounts.get(key);

    // Reset counter every hour
    if (Date.now() - data.lastReset > 60 * 60 * 1000) {
      data.count = 0;
      data.lastReset = Date.now();
    }

    data.count++;

    if (data.count >= this.thresholds.wafBlocks) {
      this.raiseAlert('EXCESSIVE_WAF_BLOCKS', {
        ip,
        threatType,
        blockCount: data.count,
        severity: 'CRITICAL',
        recommendation: 'Consider IP blacklisting',
      });
    }

    return data.count;
  }

  /**
   * Raise an alert
   */
  raiseAlert(alertType, details) {
    const alert = {
      id: `${alertType}_${Date.now()}`,
      type: alertType,
      details,
      timestamp: new Date(),
      resolved: false,
      acknowledgedBy: null,
      acknowledgedAt: null,
    };

    this.alerts.push(alert);
    this.alertHistory.push(alert);

    // Trim history
    if (this.alertHistory.length > this.maxAlerts) {
      this.alertHistory.shift();
    }

    // Emit event
    this.emit('alert', alert);

    console.warn(`[ALERT] ${alertType}:`, details);

    // Log to audit system
    if (this.auditLogger) {
      this.auditLogger.log('SECURITY_ALERT', {
        alertType,
        details,
        timestamp: new Date(),
      });
    }

    return alert.id;
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId, acknowledgedBy) {
    const alert = this.alerts.find((a) => a.id === alertId);

    if (alert) {
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date();
      console.log(`[ALERT] Acknowledged ${alertId} by ${acknowledgedBy}`);
    }

    return alert;
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId) {
    const alert = this.alerts.find((a) => a.id === alertId);

    if (alert) {
      alert.resolved = true;
      console.log(`[ALERT] Resolved ${alertId}`);
    }

    return alert;
  }

  /**
   * Get active alerts
   */
  getActiveAlerts() {
    return this.alerts.filter((a) => !a.resolved);
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity = 'CRITICAL') {
    return this.alerts.filter((a) => a.details.severity === severity);
  }

  /**
   * Clear old alerts
   */
  clearOldAlerts(olderThanDays = 30) {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

    const initialCount = this.alerts.length;
    this.alerts = this.alerts.filter((a) => a.timestamp > cutoffDate);

    const removed = initialCount - this.alerts.length;
    console.log(`[MONITORING] Cleared ${removed} old alerts`);

    return removed;
  }
}

module.exports = SecurityMonitoringService;
