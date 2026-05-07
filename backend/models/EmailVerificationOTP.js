import mongoose from 'mongoose';

const EmailVerificationOTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    type: {
      type: String,
      enum: ['account_creation', 'email_verification'],
      default: 'account_creation',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: String,
      enum: ['admin', 'user'],
      default: null,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      index: { expireAfterSeconds: 0 }, // Auto-delete after expiry
    },
  },
  { timestamps: true }
);

export default mongoose.model('EmailVerificationOTP', EmailVerificationOTPSchema);
