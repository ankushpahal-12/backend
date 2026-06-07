import express from 'express';
import {
  getAvailableTests,
  getTestById,
  createTest,
  updateTest,
  startTestAttempt,
  saveAnswer,
  submitTest,
  getTestResults,
  getUserTestHistory,
  deleteTest,
  getTestDetailsAdmin,
  deleteTestAttempt,
  generateShareToken,
  getSharedTest,
  forceSubmitAttemptAdmin
} from '../controllers/testController.js';
import { protect as authMiddleware } from '../middlewares/authMiddleware.js';
import { body } from 'express-validator';

import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const router = express.Router();

// Rate Limiters
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 requests per 15 mins for mutations
  message: { success: false, message: 'Too many requests, please try again later.' },
  keyGenerator: ipKeyGenerator,
});

const mediumLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 requests per 15 mins for standard lookups
  message: { success: false, message: 'Too many requests, please try again later.' },
  keyGenerator: ipKeyGenerator,
});

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 requests per 15 mins for public sharing
  message: { success: false, message: 'Too many requests, please try again later.' },
  keyGenerator: ipKeyGenerator,
});

// Public / Share routes
router.get('/share/:token', publicLimiter, getSharedTest);

// Standard routes
router.get('/available', authMiddleware, getAvailableTests);
router.get('/history', authMiddleware, getUserTestHistory);

// Test details and attempt
router.get('/:testId', authMiddleware, mediumLimiter, getTestById);
router.post('/:testId/start', authMiddleware, strictLimiter, startTestAttempt);

// During test - save answers and submit
router.post('/:attemptId/save-answer', authMiddleware, saveAnswer);
router.post('/:attemptId/submit', authMiddleware, submitTest);

// Get results
router.get('/results/:attemptId', authMiddleware, getTestResults);

// Admin routes
router.post(
  '/create',
  authMiddleware,
  strictLimiter,
  [
    body('title').trim().notEmpty().withMessage('Test title is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('durationMinutes').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
    body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
  ],
  createTest
);

router.put(
  '/:testId',
  authMiddleware,
  strictLimiter,
  [
    body('title').optional().trim(),
    body('durationMinutes').optional().isInt({ min: 1 }),
  ],
  updateTest
);

router.delete('/:testId', authMiddleware, strictLimiter, deleteTest);

router.get('/:testId/admin-details', authMiddleware, mediumLimiter, getTestDetailsAdmin);
router.get('/:testId/share', authMiddleware, generateShareToken);
router.put('/attempts/:attemptId/toggle', authMiddleware, updateTestAttemptToggle);
router.post('/attempts/:attemptId/force-submit', authMiddleware, forceSubmitAttemptAdmin);
router.delete('/attempts/:attemptId', authMiddleware, deleteTestAttempt);

export default router;
