import mongoose from 'mongoose';

/**
 * Behavior Store Model
 * Tracks user behavior patterns for anomaly detection
 */
const behaviorStoreSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        
        // Request details
        method: {
            type: String,
            enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            required: true,
        },
        path: {
            type: String,
            required: true,
            index: true,
        },
        
        // Request context
        ip: {
            type: String,
            required: true,
            index: true,
        },
        userAgent: String,
        
        // Risk scoring
        riskScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        anomalyFlags: [
            {
                type: String,
                enum: [
                    'new_endpoint_access',
                    'new_ip_address',
                    'unusual_time_of_access',
                    'high_request_frequency',
                    'rapid_action_sequence',
                    'unusual_payload_size',
                    'suspicious_pattern',
                ],
            },
        ],
        
        // Response details
        statusCode: {
            type: Number,
            index: true,
        },
        responseTime: Number, // milliseconds
        
        // Request tracking
        requestId: {
            type: String,
            index: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
            index: true,
        },
        
        // Additional metadata
        deviceFingerprint: String,
        sessionId: String,
        userId: mongoose.Schema.Types.ObjectId,
    },
    {
        timestamps: true,
        indexes: [
            { userId: 1, timestamp: -1 },
            { userId: 1, path: 1 },
            { requestId: 1 },
        ],
    }
);

// Auto-expire old behavior records (90 days)
behaviorStoreSchema.index(
    { createdAt: 1 },
    {
        expireAfterSeconds: 90 * 24 * 60 * 60,
    }
);

// Performance optimization: Index for recent behavior queries
behaviorStoreSchema.index(
    { userId: 1, timestamp: -1 },
    { background: true }
);

export default mongoose.model('BehaviorStore', behaviorStoreSchema);
