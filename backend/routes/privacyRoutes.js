/**
 * Data Privacy Routes
 * GDPR/CCPA compliance endpoints
 */

const express = require('express');
const router = express.Router();
const DataPrivacyController = require('../controllers/dataPrivacyController');
const { authMiddleware } = require('../middlewares/authMiddleware');

/**
 * Initialize data privacy controller
 */
function initializeDataPrivacyRoutes(models, auditLogger) {
  const dataPrivacyController = new DataPrivacyController(models, auditLogger);

  /**
   * GET /api/privacy/export
   * Export user's personal data (GDPR Article 20)
   * @requires Authentication
   */
  router.get('/export', authMiddleware, async (req, res, next) => {
    try {
      const exportData = await dataPrivacyController.exportUserData(req.user.id);

      // Send as JSON file download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="personal-data-${Date.now()}.json"`
      );
      res.send(JSON.stringify(exportData, null, 2));
    } catch (error) {
      next(error);
    }
  });

  /**
   * POST /api/privacy/delete
   * Delete user's personal data (GDPR Article 17 - Right to be forgotten)
   * @requires Authentication
   * @requires Password confirmation
   */
  router.post('/delete', authMiddleware, async (req, res, next) => {
    try {
      const { password, confirmation } = req.body;

      // Require explicit confirmation
      if (confirmation !== 'DELETE ALL MY DATA PERMANENTLY') {
        return res.status(400).json({
          error: 'Invalid deletion confirmation',
          code: 'INVALID_CONFIRMATION',
          required: 'DELETE ALL MY DATA PERMANENTLY',
          timestamp: new Date().toISOString(),
        });
      }

      const result = await dataPrivacyController.deleteUserData(req.user.id, password);

      res.json(result);
    } catch (error) {
      if (error.message === 'Invalid password') {
        return res.status(401).json({
          error: 'Invalid password',
          code: 'INVALID_PASSWORD',
          timestamp: new Date().toISOString(),
        });
      }
      next(error);
    }
  });

  /**
   * POST /api/privacy/restrict
   * Restrict processing of user data (GDPR Article 18)
   * @requires Authentication
   */
  router.post('/restrict', authMiddleware, async (req, res, next) => {
    try {
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          error: 'Reason for restriction required',
          code: 'MISSING_REASON',
          timestamp: new Date().toISOString(),
        });
      }

      const result = await dataPrivacyController.restrictProcessing(req.user.id, reason);

      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  /**
   * POST /api/privacy/withdraw-consent
   * Withdraw consent for specific processing (GDPR recital 32)
   * @requires Authentication
   */
  router.post('/withdraw-consent', authMiddleware, async (req, res, next) => {
    try {
      const { consentType } = req.body;

      const validTypes = ['marketing', 'analytics', 'profiling', 'thirdparty'];

      if (!validTypes.includes(consentType)) {
        return res.status(400).json({
          error: 'Invalid consent type',
          code: 'INVALID_CONSENT_TYPE',
          validTypes,
          timestamp: new Date().toISOString(),
        });
      }

      const result = await dataPrivacyController.withdrawConsent(
        req.user.id,
        consentType
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/privacy/portability
   * Get data in portable format (GDPR Article 20)
   * @requires Authentication
   */
  router.get('/portability', authMiddleware, async (req, res, next) => {
    try {
      const portableData = await dataPrivacyController.getDataForPortability(req.user.id);

      res.setHeader('Content-Type', 'application/ld+json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="portable-data-${Date.now()}.jsonld"`
      );
      res.send(JSON.stringify(portableData, null, 2));
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/privacy/consent-history
   * Get user's consent history
   * @requires Authentication
   */
  router.get('/consent-history', authMiddleware, async (req, res, next) => {
    try {
      const consentHistory = await dataPrivacyController.getConsentHistory(req.user.id);

      res.json({
        userId: req.user.id,
        consentHistory,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/privacy/compliance-report
   * Get compliance report (admin only)
   * @requires Authentication
   * @requires Admin role
   */
  router.get('/compliance-report', authMiddleware, async (req, res, next) => {
    try {
      // Check if admin
      if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
        return res.status(403).json({
          error: 'Forbidden',
          code: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString(),
        });
      }

      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          error: 'Start and end dates required',
          code: 'MISSING_DATES',
          timestamp: new Date().toISOString(),
        });
      }

      const report = await dataPrivacyController.getComplianceReport(
        new Date(startDate),
        new Date(endDate)
      );

      res.json(report);
    } catch (error) {
      next(error);
    }
  });

  /**
   * POST /api/privacy/data-breach-notification
   * Notify users of data breach (admin only)
   * @requires Authentication
   * @requires Admin role
   */
  router.post('/data-breach-notification', authMiddleware, async (req, res, next) => {
    try {
      // Check if admin
      if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
        return res.status(403).json({
          error: 'Forbidden',
          code: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString(),
        });
      }

      const { breachType, affectedUserIds, description, detectedAt } = req.body;

      // Log breach notification
      await auditLogger.log('DATA_BREACH_NOTIFICATION_SENT', {
        breachType,
        affectedCount: affectedUserIds.length,
        description,
        detectedAt,
        notifiedAt: new Date(),
        notifiedBy: req.user.id,
      });

      // TODO: Send notifications to affected users

      res.json({
        success: true,
        message: 'Breach notification queued',
        affectedCount: affectedUserIds.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = initializeDataPrivacyRoutes;
