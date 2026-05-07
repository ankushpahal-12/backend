/**
 * SECURITY INTEGRATION GUIDE FOR app.js
 * Copy these sections into your backend/app.js
 */

// ============================================================
// IMPORTS - Add these security imports (ES MODULES)
// ============================================================

// Security middleware
import { csrfTokenMiddleware, validateCSRFToken } from './middlewares/csrfMiddleware.js';
import { wafMiddleware } from './middlewares/wafMiddleware.js';
import { ddosDetectionMiddleware, graduatedRateLimiter } from './middlewares/ddosProtection.js';
import { apiVersionMiddleware } from './middlewares/apiVersionMiddleware.js';
import { preventReplayAttacks } from './middlewares/replayAttackMiddleware.js';

// Security utilities
import secretsManager from './config/secretsManager.js';
import fieldEncryption from './utils/fieldEncryption.js';
import { maskSensitiveData, createMaskedLogger } from './utils/logMasking.js';

// Security services
import ApiKeyRotationService from './services/apiKeyRotationService.js';
import SecurityMonitoringService from './services/securityMonitoringService.js';
import IncidentResponseService from './services/incidentResponseService.js';

// Models
import ApiKey from './models/ApiKey.js';
import IpBlacklist from './models/IpBlacklist.js';

// Controllers
import DataPrivacyController from './controllers/dataPrivacyController.js';
import initializeDataPrivacyRoutes from './routes/privacyRoutes.js';

// ============================================================
// SECURITY INITIALIZATION
// ============================================================

// Initialize security services
const apiKeyRotation = new ApiKeyRotationService(ApiKey);
const securityMonitoring = new SecurityMonitoringService(auditLog);
const incidentResponse = new IncidentResponseService(models, emailService, auditLog);

// Store security services in app.locals for use in middleware
app.locals.apiKeyRotation = apiKeyRotation;
app.locals.securityMonitoring = securityMonitoring;
app.locals.incidentResponse = incidentResponse;

// ============================================================
// MIDDLEWARE STACK - Add security middleware in order
// ============================================================

// 1. Logging
app.use(morgan('combined'));

// 2. WAF (Web Application Firewall) - Block malicious patterns
app.use(wafMiddleware);

// 3. DDoS Detection - Detect attack patterns
app.use(ddosDetectionMiddleware);

// 4. Rate Limiting - Graduated rate limiting
app.use(graduatedRateLimiter);

// 5. Body & Cookie Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// 6. Helmet Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'wasm-unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 63072000, // 2 years
    includeSubDomains: true,
    preload: true,
  },
}));

// 7. CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Signature', 'X-Timestamp', 'X-CSRF-Token', 'X-Device-Fingerprint', 'API-Version'],
}));

// 8. Data Sanitization
app.use(mongoSanitize());
app.use(xssClean());
app.use(hpp());

// 9. CSRF Token Middleware
app.use(csrfTokenMiddleware);

// 10. Signature Verification
app.use(signatureMiddleware);

// 11. API Versioning
app.use(apiVersionMiddleware);

// 12. Replay Attack Prevention
app.use(preventReplayAttacks);

// 13. Auth Middleware
app.use(authMiddleware);

// 14. CSRF Validation (for POST/PUT/DELETE)
app.use(validateCSRFToken);

// 15. Zero Trust Middleware (continuous verification)
app.use(zeroTrustMiddleware);

// 16. Auto-Logout Detection
app.use(autoLogoutMiddleware);

// 17. Input Validation
app.use(inputValidationMiddleware);

// 18. Error Handling
app.use(errorMiddleware);

// ============================================================
// ROUTES - Add security routes
// ============================================================

// Auth routes (public)
app.use('/api/auth', authRoutes);

// API Key management routes
app.get('/api/keys', async (req, res) => {
  try {
    const keys = await apiKeyRotation.getUserKeys(req.user.id);
    res.json({ keys });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/keys', async (req, res) => {
  try {
    const { name } = req.body;
    const key = await apiKeyRotation.createKey(req.user.id, name);
    res.json(key);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/keys/:keyId/rotate', async (req, res) => {
  try {
    const result = await apiKeyRotation.rotateKey(req.user.id, req.params.keyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/keys/:keyId', async (req, res) => {
  try {
    const result = await apiKeyRotation.revokeKey(req.user.id, req.params.keyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Security Monitoring routes (admin only)
app.get('/api/admin/security/alerts', async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const alerts = securityMonitoring.getActiveAlerts();
    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/security/incidents', async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const incidents = await incidentResponse.getIncidentHistory();
    res.json({ incidents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Data Privacy routes (GDPR/CCPA)
app.use('/api/privacy', initializeDataPrivacyRoutes(models, auditLog));

// User routes
app.use('/api/users', userRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Zero Trust routes
app.use('/api/devices', zeroTrustRoutes);

// Transaction routes
app.use('/api/transaction', transactionRoutes);

// Wallet routes
app.use('/api/wallet', walletRoutes);

// ============================================================
// HEALTH CHECK ENDPOINT
// ============================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV,
  });
});

// ============================================================
// SECURITY EVENT HANDLERS
// ============================================================

// Listen for security alerts
securityMonitoring.on('alert', (alert) => {
  console.warn('[ALERT]', alert.type, alert.details);
  
  // Emit to connected clients via WebSocket (if available)
  if (io) {
    io.emit('security:alert', alert);
  }
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use((err, req, res, next) => {
  console.error('[ERROR]', err);

  // Log to security monitoring
  if (err.code?.includes('ATTACK') || err.code?.includes('BREACH')) {
    securityMonitoring.raiseAlert('APPLICATION_ERROR', {
      code: err.code,
      message: err.message,
      path: req.path,
      severity: 'HIGH',
    });
  }

  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ============================================================
// 404 HANDLER
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    code: 'ENDPOINT_NOT_FOUND',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// SERVER STARTUP
// ============================================================

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`[SERVER] Server running on port ${PORT}`);
  console.log(`[SERVER] Environment: ${process.env.NODE_ENV}`);
  console.log('[SECURITY] All security middleware initialized');
});

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

process.on('SIGTERM', async () => {
  console.log('[SERVER] SIGTERM received, shutting down gracefully');

  // Close server
  server.close(async () => {
    console.log('[SERVER] Server closed');

    // Close database connections
    try {
      await mongoose.connection.close();
      console.log('[DATABASE] Connection closed');
    } catch (error) {
      console.error('[DATABASE] Error closing connection:', error);
    }

    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('[SERVER] Force shutdown after timeout');
    process.exit(1);
  }, 10 * 1000);
});

module.exports = app;
