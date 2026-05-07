/**
 * API Key Model
 * Stores API keys for authentication
 */

const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      default: 'Default API Key',
    },
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      // This is hashed, not the raw key
    },
    lastUsed: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    rotatedAt: {
      type: Date,
      default: null,
    },
    rotatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ApiKey',
      default: null,
    },
    rotatedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ApiKey',
      default: null,
    },
    graceUntil: {
      type: Date,
      default: null,
      // Period where old key still works after rotation
    },
    rotations: {
      type: Number,
      default: 0,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
    metadata: {
      ipCreatedFrom: String,
      userAgent: String,
      environment: {
        type: String,
        enum: ['development', 'staging', 'production'],
        default: 'production',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for finding active keys
apiKeySchema.index({ userId: 1, revokedAt: 1, expiresAt: 1 });

// Index for finding expired keys
apiKeySchema.index({ expiresAt: 1, revokedAt: 1 });

module.exports = mongoose.model('ApiKey', apiKeySchema);
