import mongoose from 'mongoose';

/**
 * MFA Challenge Model
 * Stores MFA challenges for high-risk requests
 */
const mfaChallengeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        
        challengeId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        
        code: {
            type: String,
            required: true,
            select: false, // Don't return by default
        },
        
        method: {
            type: String,
            enum: ['email', 'sms', 'authenticator'],
            default: 'email',
        },
        
        // Challenge state
        verified: {
            type: Boolean,
            default: false,
            index: true,
        },
        
        verifiedAt: Date,
        
        expiresAt: {
            type: Date,
            required: true,
        },
        
        // Tracking
        requestId: String,
        attempts: {
            type: Number,
            default: 0,
        },
        maxAttempts: {
            type: Number,
            default: 5,
        },
        
        ipAddress: String,
        userAgent: String,
    },
    {
        timestamps: true,
    }
);

// Auto-delete expired challenges
mfaChallengeSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

// Index for quick lookups
mfaChallengeSchema.index(
    { userId: 1, verified: 1, expiresAt: 1 }
);

export default mongoose.model('MFAChallenge', mfaChallengeSchema);
