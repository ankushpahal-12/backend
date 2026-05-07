import mongoose from 'mongoose';

/**
 * Device Store Model
 * Tracks devices, their trust scores, and behavioral patterns
 */
const deviceStoreSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        // Device identification
        fingerprint: {
            type: String,
            required: true,
            index: true,
        },
        userAgent: String,
        
        // Trust management
        trustedStatus: {
            type: String,
            enum: ['unverified', 'verified', 'compromised'],
            default: 'unverified',
        },
        trustScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        riskLevel: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'critical',
        },
        
        // IP tracking
        firstSeenIp: String,
        seenIps: [
            {
                type: String,
                index: true,
            },
        ],
        
        // Activity tracking
        lastActivityAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
        trustedAt: Date,
        compromisedAt: Date,
        
        // Device metadata
        platform: String, // 'Windows', 'macOS', 'iOS', 'Android'
        browser: String,
        os: String,
        
        // Additional flags
        isCompromised: {
            type: Boolean,
            default: false,
        },
        requiresMFA: {
            type: Boolean,
            default: true,
        },
        notes: String,
    },
    {
        timestamps: true,
        indexes: [
            { userId: 1, fingerprint: 1 },
            { userId: 1, createdAt: -1 },
        ],
    }
);

// Auto-expire old unverified devices (90 days)
deviceStoreSchema.index(
    { createdAt: 1 },
    {
        expireAfterSeconds: 90 * 24 * 60 * 60,
        partialFilterExpression: { trustedStatus: 'unverified' },
    }
);

export default mongoose.model('DeviceStore', deviceStoreSchema);
