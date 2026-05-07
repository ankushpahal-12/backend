/**
 * LoginAttempt Model
 * 
 * Tracks login attempts for security monitoring and anomaly detection
 * - Records successful and failed attempts
 * - Stores IP, user agent, timestamp
 * - Auto-expires old records (30 days)
 */

import mongoose from 'mongoose';

const loginAttemptSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        sparse: true,  // Null for failed attempts (email not found)
    },
    email: {
        type: String,
        lowercase: true,
        required: true,
    },
    ipAddress: {
        type: String,
        required: true,
    },
    userAgent: {
        type: String,
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'locked', 'otp-required'],
        required: true,
    },
    failureReason: {
        type: String,
        enum: [
            'wrong-password',
            'user-not-found',
            'account-locked',
            'email-not-verified',
            'otp-required',
            'device-not-trusted',
            null
        ],
        default: null,
    },
    deviceFingerprint: {
        type: String,
    },
    timestamp: {
        type: Date,
        default: Date.now,
        expires: 30 * 24 * 60 * 60,  // Auto-delete after 30 days
    },
});

// Index for querying login attempts by IP
loginAttemptSchema.index({ ipAddress: 1, timestamp: -1 });

// Index for querying login attempts by email
loginAttemptSchema.index({ email: 1, timestamp: -1 });

// Index for querying login attempts by user
loginAttemptSchema.index({ userId: 1, timestamp: -1 });

const LoginAttempt = mongoose.model('LoginAttempt', loginAttemptSchema);

export default LoginAttempt;
