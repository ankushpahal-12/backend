import mongoose from 'mongoose';

const authSessionSchema = new mongoose.Schema({
    sid: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    type: {
        type: String,
        enum: ['login', 'signup'],
        required: true,
    },
    ipAddress: {
        type: String,
        required: true,
    },
    userAgent: {
        type: String,
        default: 'unknown',
    },
    attempts: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'expired', 'blocked'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        index: { expires: 0 }, // MongoDB TTL index — auto-deletes expired docs
    },
});

const AuthSession = mongoose.model('AuthSession', authSessionSchema);

export default AuthSession;
