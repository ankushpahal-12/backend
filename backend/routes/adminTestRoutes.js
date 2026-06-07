import express from 'express';
import {
  getAdminTests,
  createTest,
  updateTest,
  deleteTest,
  getTestDetailsAdmin,
  updateTestAttemptToggle,
  deleteTestAttempt,
  generateShareToken,
  revokeShareLinks,
  forceSubmitAttemptAdmin,
  grantRetakeForAttempt
} from '../controllers/adminTestController.js';
import { protect as authMiddleware } from '../middlewares/authMiddleware.js';
import { body } from 'express-validator';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const router = express.Router();

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, 
  message: { success: false, message: 'Too many requests, please try again later.' },
  keyGenerator: ipKeyGenerator,
  skip: (req) => req.method === 'OPTIONS', // Don't count CORS preflight requests
});

const mediumLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
  keyGenerator: ipKeyGenerator,
  skip: (req) => req.method === 'OPTIONS', // Don't count CORS preflight requests
});

router.use(authMiddleware);

// Get all tests for admin dashboard
router.get('/', mediumLimiter, getAdminTests);

// Create test
router.post(
  '/',
  strictLimiter,
  [
    body('title').trim().notEmpty().withMessage('Test title is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('durationMinutes').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
    body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
  ],
  createTest
);

// Get specific test details and attempts
router.get('/:testId', mediumLimiter, getTestDetailsAdmin);

// Update test
router.put(
  '/:testId',
  strictLimiter,
  [
    body('title').optional().trim(),
    body('durationMinutes').optional().isInt({ min: 1 }),
  ],
  updateTest
);

// Delete test
router.delete('/:testId', strictLimiter, deleteTest);

// Share Management
router.get('/:testId/share', generateShareToken);
router.post('/:testId/revoke-share', revokeShareLinks);

// Attempt Management
router.put('/attempts/:attemptId/toggle', updateTestAttemptToggle);
router.post('/attempts/:attemptId/force-submit', forceSubmitAttemptAdmin);
router.post('/attempts/:attemptId/grant-retake', grantRetakeForAttempt);
router.delete('/attempts/:attemptId', deleteTestAttempt);

export default router;
