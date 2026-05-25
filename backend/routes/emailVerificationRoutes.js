import express from 'express';
import {
  sendOTP,
  verifyOTP,
  resendOTP,
  checkVerificationStatus,
  sendTestInvitations
} from '../controllers/emailVerificationController.js';
import { protect as authMiddleware } from '../middlewares/authMiddleware.js';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const router = express.Router();

// Rate limiting for OTP endpoints
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: { success: false, message: 'Too many OTP requests. Please try again later.' },
  trustProxy: true,
  keyGenerator: ipKeyGenerator,
});

// Public routes (no auth required for initial OTP request)
router.post('/send-otp', otpLimiter, sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', otpLimiter, resendOTP);
router.get('/status/:verificationId', checkVerificationStatus);

// Protected routes (auth required)
router.use(authMiddleware);

// Send test invitations (admin/test creator only)
router.post('/send-invitations', sendTestInvitations);

export default router;
