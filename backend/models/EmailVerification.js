import mongoose from 'mongoose';

const emailVerificationSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    lowercase: true,
    index: true 
  },
  
  // OTP for email verification (6 digits)
  otp: { 
    type: String, 
    required: true 
  },
  
  // Optional: Verification link token
  token: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  
  // Test ID that this email is being verified for
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  
  // User attempting verification (optional, may not exist yet)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Verification status
  verified: { 
    type: Boolean, 
    default: false 
  },
  
  verifiedAt: { 
    type: Date, 
    default: null 
  },
  
  // Attempt tracking
  attemptCount: { 
    type: Number, 
    default: 0,
    max: 5 
  },
  
  // Expiry time for OTP (default 10 minutes)
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    index: { expires: 0 } // MongoDB TTL index
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Compound index for email + test
emailVerificationSchema.index({ email: 1, testId: 1 });

export default mongoose.model('EmailVerification', emailVerificationSchema);
