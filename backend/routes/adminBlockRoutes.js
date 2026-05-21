import express from 'express';
import {
  getBlockedUsers,
  unblockUser,
  blockUser,
  getBlockHistory,
  getBlockStatistics
} from '../controllers/adminBlockController.js';
import { protect as authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get blocked users for a test
router.get('/blocked-users/:testId', getBlockedUsers);

// Block/Unblock management
router.patch('/unblock-user/:attemptId', unblockUser);
router.patch('/block-user/:attemptId', blockUser);

// History and statistics
router.get('/block-history/:userId', getBlockHistory);
router.get('/block-statistics/:testId', getBlockStatistics);

export default router;
