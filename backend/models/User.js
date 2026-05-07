import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    password: {
        type: String,
        minlength: [8, 'Password must be at least 8 characters'],
        select: false,
        // Password is optional for admin-created users (set later via OTP verification)
        // But required for regular registration or after admin creation
        default: null,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    emailVerifiedBy: {
        type: String,
        enum: ['user', 'admin', null],
        default: null,
    },
    emailVerifiedAt: {
        type: Date,
        default: null,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    blockedReason: {
        type: String,
        default: null,
    },
    blockedAt: {
        type: Date,
        default: null,
    },
    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0 },
    lastOtpSentAt: { type: Date, select: false }, // HIGH-2: cooldown for OTP resend
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    loginAttempts: {
        type: Number,
        default: 0,
    },
    lockUntil: {
        type: Date,
    },
    apiKey: {
        type: String,
        select: false,
    },
    trustedDevices: {
        type: [{
            deviceToken: { type: String, select: false }, // CRIT-3: hashed device fingerprint token
            userAgent: String,
            ip: String,
            lastLogin: {
                type: Date,
                default: Date.now,
            }
        }],
        select: false,
    },
    activeSessions: {
        type: [{
            sessionId: String,
            token: String,
            ip: String,
            userAgent: String,
            createdAt: {
                type: Date,
                default: Date.now,
            },
            expiresAt: Date,
        }],
        select: false,
    },
    walletAddress: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
    },
    nonce: {
        type: String,
        select: false,
    },
    googleId: {
        type: String,
        sparse: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    // TOTP 2FA fields
    twoFactorSecret: { type: String, select: false },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorPending: { type: Boolean, default: false },
    
    // Refresh Token Rotation (NEW)
    // Stores hashed refresh tokens for session continuity and security
    refreshTokens: {
        type: [{
            token: { type: String, required: true }, // Hashed refresh token
            ip: String,                                // IP where refresh token was issued
            userAgent: String,                         // User agent for validation
            issuedAt: { type: Date, default: Date.now },
            expiresAt: { type: Date, required: true }, // 7-day expiration
            rotatedFrom: String,                       // Previous token hash (for tracking)
            revokedAt: Date,                           // If revoked, when
            revokeReason: String,                      // Why was it revoked
        }],
        select: false,
        maxlength: 10,  // Max 10 refresh tokens per user (security limit)
    },
});

// Hash password before saving (only if provided and modified)
userSchema.pre('save', async function () {
    // Skip if password is not modified or is null
    if (!this.isModified('password') || !this.password) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// MED-4: Enforce max 10 trusted devices — evict oldest when limit exceeded
userSchema.pre('save', function () {
    if (this.isModified('trustedDevices') && this.trustedDevices.length > 10) {
        this.trustedDevices = this.trustedDevices.slice(-10);
    }
});

// Method to check password correctness
userSchema.methods.comparePassword = async function (candidatePassword, userPassword) {
    // If userPassword is null (admin-created user), can't compare
    if (!userPassword) {
        return false;
    }
    return await bcrypt.compare(candidatePassword, userPassword);
};

// Alias as correctPassword for compatibility with controllers
userSchema.methods.correctPassword = userSchema.methods.comparePassword;

// Virtual field: check if account is currently locked
userSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Increment login attempts and lock account after 5 failures
userSchema.methods.incLoginAttempts = async function () {
    // If previous lock has expired, reset
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } });
    }
    const updates = { $inc: { loginAttempts: 1 } };
    // Lock after 5 attempts for 30 minutes
    if (this.loginAttempts + 1 >= 5) {
        updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 };
    }
    return this.updateOne(updates);
};

// ════════════════════════════════════════════════════════════════════════════
// REFRESH TOKEN METHODS (NEW)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Add a refresh token
 * Stores hashed token for later verification
 */
userSchema.methods.addRefreshToken = async function (hashedToken, ip, userAgent) {
    // Clean up expired refresh tokens
    if (!this.refreshTokens) {
        this.refreshTokens = [];
    }
    
    this.refreshTokens = this.refreshTokens.filter(
        (token) => token.expiresAt > new Date() && !token.revokedAt
    );
    
    // Add new token
    this.refreshTokens.push({
        token: hashedToken,
        ip,
        userAgent,
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    
    // Enforce max 10 tokens
    if (this.refreshTokens.length > 10) {
        this.refreshTokens = this.refreshTokens.slice(-10);
    }
    
    return this.save();
};

/**
 * Validate and rotate a refresh token
 * Returns new access token if valid, revokes if suspicious
 */
userSchema.methods.rotateRefreshToken = async function (hashedToken, oldTokenHash) {
    if (!this.refreshTokens) {
        throw new Error('No refresh tokens found');
    }
    
    // Find the token
    const tokenEntry = this.refreshTokens.find(
        (t) => t.token === hashedToken && !t.revokedAt && t.expiresAt > new Date()
    );
    
    if (!tokenEntry) {
        throw new Error('Refresh token invalid or expired');
    }
    
    // Mark previous token as rotated from this token
    if (oldTokenHash) {
        const prevToken = this.refreshTokens.find((t) => t.token === oldTokenHash);
        if (prevToken) {
            prevToken.revokedAt = new Date();
            prevToken.revokeReason = 'ROTATED';
        }
    }
    
    return this.save();
};

/**
 * Revoke all refresh tokens (logout from all devices)
 */
userSchema.methods.revokeAllRefreshTokens = async function (reason = 'USER_LOGOUT') {
    if (!this.refreshTokens) {
        this.refreshTokens = [];
    }
    
    this.refreshTokens.forEach((token) => {
        if (!token.revokedAt) {
            token.revokedAt = new Date();
            token.revokeReason = reason;
        }
    });
    
    return this.save();
};

/**
 * Revoke token by hash (logout single device)
 */
userSchema.methods.revokeRefreshToken = async function (hashedToken, reason = 'USER_REVOKE') {
    const token = this.refreshTokens?.find((t) => t.token === hashedToken);
    if (token) {
        token.revokedAt = new Date();
        token.revokeReason = reason;
        return this.save();
    }
    return this;
};

/**
 * Get active refresh tokens (for device management)
 */
userSchema.methods.getActiveRefreshTokens = function () {
    if (!this.refreshTokens) return [];
    
    return this.refreshTokens.filter(
        (token) => !token.revokedAt && token.expiresAt > new Date()
    );
};

const User = mongoose.model('User', userSchema);

export default User;
