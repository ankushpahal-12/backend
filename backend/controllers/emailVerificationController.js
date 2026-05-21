import jwt from 'jsonwebtoken';
import EmailVerification from '../models/EmailVerification.js';
import Test from '../models/Test.js';
import { sendOTPEmail, sendTestInvitationEmail } from '../services/emailService.js';

/**
 * Generate OTP (6 digits)
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP for email verification
 * POST /api/v1/email-verification/send-otp
 */
export const sendOTP = async (req, res) => {
  try {
    const { email, testToken } = req.body;

    if (!email || !testToken) {
      return res.status(400).json({
        success: false,
        message: 'Email and test token are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Decode JWT token to get testId
    let testId;
    try {
      const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
      testId = decoded.testId;
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired test token'
      });
    }

    // Find test by testId
    const test = await Test.findOne({ testId });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Check if email is assigned to this private test (normalize to lowercase)
    if (test.accessControl?.visibility === 'private') {
      const emailAssigned = test.assignedEmails?.some(a => a.email.toLowerCase() === email.toLowerCase());
      if (!emailAssigned) {
        return res.status(403).json({
          success: false,
          message: 'This email is not assigned to this test'
        });
      }
    }

    // Check for existing pending verification (not expired)
    const existing = await EmailVerification.findOne({
      email,
      testId: test._id,
      verified: false,
      expiresAt: { $gt: new Date() }
    });

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let verification;
    if (existing) {
      // Update existing verification
      existing.otp = otp;
      existing.expiresAt = expiresAt;
      existing.attemptCount = 0;
      verification = await existing.save();
    } else {
      // Create new verification
      verification = await EmailVerification.create({
        email,
        testId: test._id,
        otp,
        expiresAt,
        userId: req.user?.id || null
      });
    }

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, test.title);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again later.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        verificationId: verification._id,
        email: verification.email,
        expiresIn: 600 // 10 minutes in seconds
      }
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending OTP',
      error: error.message
    });
  }
};

/**
 * Verify OTP
 * POST /api/v1/email-verification/verify-otp
 */
export const verifyOTP = async (req, res) => {
  try {
    const { verificationId, otp } = req.body;

    if (!verificationId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Verification ID and OTP are required'
      });
    }

    // Find verification record
    const verification = await EmailVerification.findById(verificationId);

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification request not found'
      });
    }

    // Check if expired
    if (new Date() > verification.expiresAt) {
      return res.status(401).json({
        success: false,
        message: 'OTP has expired',
        expired: true
      });
    }

    // Check attempt count
    if (verification.attemptCount >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (verification.otp !== otp.toString()) {
      verification.attemptCount += 1;
      await verification.save();

      return res.status(401).json({
        success: false,
        message: 'Invalid OTP',
        attemptsRemaining: 5 - verification.attemptCount
      });
    }

    // Mark as verified
    verification.verified = true;
    verification.verifiedAt = new Date();
    await verification.save();

    // Update assignedEmails in test document
    const test = await Test.findById(verification.testId);
    if (test && test.assignedEmails) {
      const emailIndex = test.assignedEmails.findIndex(a => a.email === verification.email);
      if (emailIndex !== -1) {
        test.assignedEmails[emailIndex].emailVerified = true;
        test.assignedEmails[emailIndex].verifiedAt = new Date();
        await test.save();
      }
    }

    // Generate token for starting test
    const testToken = `verified-${verification._id}-${Date.now()}`;

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        email: verification.email,
        testId: verification.testId,
        verificationToken: testToken,
        canStartTest: true
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message
    });
  }
};

/**
 * Resend OTP
 * POST /api/v1/email-verification/resend-otp
 */
export const resendOTP = async (req, res) => {
  try {
    const { verificationId } = req.body;

    if (!verificationId) {
      return res.status(400).json({
        success: false,
        message: 'Verification ID is required'
      });
    }

    // Find verification record
    const verification = await EmailVerification.findById(verificationId);

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification request not found'
      });
    }

    if (verification.verified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    verification.otp = otp;
    verification.expiresAt = expiresAt;
    verification.attemptCount = 0;
    await verification.save();

    // Send OTP email
    const test = await Test.findById(verification.testId);
    const emailSent = await sendOTPEmail(verification.email, otp, test.title);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again later.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'New OTP sent successfully',
      data: {
        verificationId: verification._id,
        email: verification.email,
        expiresIn: 600 // 10 minutes in seconds
      }
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resending OTP',
      error: error.message
    });
  }
};

/**
 * Check verification status
 * GET /api/v1/email-verification/status/:verificationId
 */
export const checkVerificationStatus = async (req, res) => {
  try {
    const { verificationId } = req.params;

    const verification = await EmailVerification.findById(verificationId);

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        verified: verification.verified,
        email: verification.email,
        attemptsRemaining: 5 - verification.attemptCount,
        expiresAt: verification.expiresAt,
        isExpired: new Date() > verification.expiresAt
      }
    });
  } catch (error) {
    console.error('Check verification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking verification status',
      error: error.message
    });
  }
};

/**
 * Send test invitation email to multiple recipients
 * POST /api/v1/email-verification/send-invitations
 * Admin only
 */
export const sendTestInvitations = async (req, res) => {
  try {
    const { testId, emails, shareLink } = req.body;

    // Verify user is admin or test creator
    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    if (test.createdBy.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'Only test creator or admin can send invitations'
      });
    }

    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one email is required'
      });
    }

    const results = {
      sent: [],
      failed: []
    };

    for (const email of emails) {
      try {
        const emailSent = await sendTestInvitationEmail(email, test, shareLink);
        if (emailSent) {
          results.sent.push(email);
        } else {
          results.failed.push({ email, reason: 'Email service error' });
        }
      } catch (err) {
        results.failed.push({ email, reason: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Invitations sent to ${results.sent.length} recipients`,
      data: results
    });
  } catch (error) {
    console.error('Send invitations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending invitations',
      error: error.message
    });
  }
};

export default {
  sendOTP,
  verifyOTP,
  resendOTP,
  checkVerificationStatus,
  sendTestInvitations
};
