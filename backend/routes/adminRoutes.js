import express from 'express';
import rateLimit from 'express-rate-limit';
import * as adminController from '../controllers/adminController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rate limiter for public OTP verification routes — prevents brute force on 6-digit OTPs
const publicOtpLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,                    // 5 attempts per window
    message: {
        status: 'error',
        message: 'Too many verification attempts. Please try again in 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ─── Public Routes (for email verification) ────────────────────────────────────
// These are accessible without authentication since user isn't logged in yet
router.post('/verify-email-otp', publicOtpLimit, adminController.verifyEmailOTP);
router.post('/set-password', publicOtpLimit, adminController.setPasswordAfterVerification);

// All other routes are protected and restricted to admin
router.use(protect);
router.use(restrictTo('admin'));

router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.get('/users/:id', adminController.getUser);
router.patch('/users/:id/password', adminController.updateUserPassword);
router.patch('/users/:id/role', adminController.updateUserRole);
router.patch('/users/:id/block', adminController.blockUser);
router.patch('/users/:id/unblock', adminController.unblockUser);
router.post('/users/:id/force-logout', adminController.forceLogoutUser);
router.delete('/users/:userId/sessions/:sessionId', adminController.terminateUserSession);
router.delete('/users/:id', adminController.deleteUser);
router.get('/stats', adminController.getSystemStats);

export default router;
