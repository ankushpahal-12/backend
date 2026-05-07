/**
 * IP Blacklist Model
 * Stores blocked IP addresses
 */

import mongoose from 'mongoose';

const ipBlacklistSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    reason: {
      type: String,
      enum: [
        'BRUTE_FORCE_DETECTED',
        'EXCESSIVE_WAF_BLOCKS',
        'RATE_LIMIT_ABUSE',
        'MALICIOUS_TRAFFIC',
        'MANUAL_BLOCK',
        'GEO_RESTRICTION',
      ],
      required: true,
    },
    endpoint: String,
    blockType: String,
    attemptCount: {
      type: Number,
      default: 0,
    },
    blockCount: {
      type: Number,
      default: 0,
    },
    violationCount: {
      type: Number,
      default: 0,
    },
    blockedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      // TTL index will auto-delete after this time
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    isPermanent: {
      type: Boolean,
      default: false,
    },
    notes: String,
    metadata: {
      userAgent: String,
      country: String,
      city: String,
      isp: String,
      threat_level: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create TTL index - automatically remove after expiresAt
ipBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound indexes for queries
ipBlacklistSchema.index({ reason: 1, blockedAt: -1 });
ipBlacklistSchema.index({ severity: 1, blockedAt: -1 });

const IpBlacklist = mongoose.models.IpBlacklist || mongoose.model('IpBlacklist', ipBlacklistSchema);

export { IpBlacklist };
export default IpBlacklist;
