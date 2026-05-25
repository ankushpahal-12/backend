import express from 'express';
import {
  getPreviewTest,
  startAttempt,
  autoSaveAnswer,
  submitAttempt
} from '../controllers/attemptController.js';
import { getTestResults, getUserTestHistory, getTestById, getAvailableTests } from '../controllers/testController.js'; 
// Note: We might need to keep some endpoints in testController temporarily for backward compatibility 
// or migrate them to candidate logic. For now, we'll keep results/history there but use the new attempt routes.

import { protect as authMiddleware, protectAttempt } from '../middlewares/authMiddleware.js';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const router = express.Router();

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, 
  message: { success: false, message: 'Too many requests, please try again later.' },
  trustProxy: true,
  keyGenerator: ipKeyGenerator,
  skip: (req) => req.method === 'OPTIONS', // Don't count CORS preflight requests
});

const mediumLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: { success: false, message: 'Too many requests, please try again later.' },
  trustProxy: true,
  keyGenerator: ipKeyGenerator,
  skip: (req) => req.method === 'OPTIONS', // Don't count CORS preflight requests
});

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, 
  message: { success: false, message: 'Too many requests, please try again later.' },
  trustProxy: true,
  keyGenerator: ipKeyGenerator,
  skip: (req) => req.method === 'OPTIONS', // Don't count CORS preflight requests
});

// Public routes (No authentication required)
// Share Token / Attempt Flow — must be BEFORE authMiddleware
router.get('/preview/:token', publicLimiter, getPreviewTest);
router.post('/start/:token', strictLimiter, startAttempt); // Allow both authenticated and unauthenticated users

// Authenticated attempt endpoints - use protectAttempt to allow both authenticated and share token users
router.post('/:attemptId/save-answer', protectAttempt, autoSaveAnswer);
router.post('/:attemptId/submit', protectAttempt, submitAttempt);

// Candidate routes (Authenticated) — all routes AFTER this require authentication
router.use(authMiddleware);

// Specific named GET routes MUST come before the wildcard /:testId
router.get('/available', getAvailableTests);
router.get('/history', getUserTestHistory);
router.get('/results/:attemptId', getTestResults);

// Wildcard MUST be last — catches /:testId only after all specific routes fail
router.get('/:testId', mediumLimiter, getTestById);

export default router;
