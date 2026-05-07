/**
 * DATABASE INDEXES GUIDE
 * 
 * Fixes N+1 query problems and improves performance
 * Run these after modifying User.js schema
 */

import mongoose from 'mongoose';

/**
 * Recommended indexes for User model
 * 
 * These should be created via:
 * 1. Schema definition (index option)
 * 2. Manual index creation (via this file)
 * 3. Database admin panel
 */
export const USER_INDEXES = [
    // ─── Authentication & Email ─────────────────────────────────
    {
        index: { email: 1 },
        options: { unique: true, sparse: true, name: 'idx_email_unique' },
        reason: 'Fast lookups by email (login, register, password reset)',
    },
    
    {
        index: { googleId: 1 },
        options: { unique: true, sparse: true, name: 'idx_googleId_unique' },
        reason: 'Fast Google login lookups',
    },
    
    {
        index: { walletAddress: 1 },
        options: { unique: true, sparse: true, name: 'idx_walletAddress_unique' },
        reason: 'Fast Web3 authentication lookups',
    },
    
    // ─── Device Fingerprinting (FIX for N+1) ─────────────────────
    {
        index: { 'trustedDevices.deviceToken': 1 },
        options: { name: 'idx_trustedDevices_token' },
        reason: 'Fast device lookup in login flow - PREVENTS N+1',
    },
    
    {
        index: { 'activeSessions.sessionId': 1 },
        options: { name: 'idx_activeSessions_sessionId' },
        reason: 'Fast session validation - PREVENTS N+1',
    },
    
    // ─── Refresh Token Management ────────────────────────────────
    {
        index: { 'refreshTokens.token': 1 },
        options: { name: 'idx_refreshTokens_token' },
        reason: 'Fast refresh token validation',
    },
    
    // ─── OTP & Password Reset ────────────────────────────────────
    {
        index: { otpExpires: 1 },
        options: { expireAfterSeconds: 0, name: 'idx_otpExpires_ttl' },
        reason: 'Auto-delete expired OTPs (TTL index)',
    },
    
    {
        index: { passwordResetExpires: 1 },
        options: { expireAfterSeconds: 0, name: 'idx_passwordResetExpires_ttl' },
        reason: 'Auto-delete expired reset tokens (TTL index)',
    },
    
    // ─── Admin & Security ────────────────────────────────────────
    {
        index: { role: 1 },
        options: { name: 'idx_role' },
        reason: 'Fast admin filtering',
    },
    
    {
        index: { isVerified: 1 },
        options: { name: 'idx_isVerified' },
        reason: 'Fast filtering of verified users',
    },
    
    {
        index: { lockUntil: 1 },
        options: { expireAfterSeconds: 0, name: 'idx_lockUntil_ttl' },
        reason: 'Auto-unlock accounts (TTL index)',
    },
    
    // ─── Compound Indexes (Multi-field) ──────────────────────────
    {
        index: { email: 1, isVerified: 1 },
        options: { name: 'idx_email_verified' },
        reason: 'Fast lookup of verified users by email',
    },
    
    {
        index: { createdAt: -1 },
        options: { name: 'idx_createdAt_desc' },
        reason: 'Fast sorting for admin user list',
    },
    
    // ─── Login Attempts ─────────────────────────────────────────
    {
        index: { 'loginAttempts': 1 },
        options: { name: 'idx_loginAttempts' },
        reason: 'Track brute force attempts',
    },
];

/**
 * Create all recommended indexes
 */
export const createUserIndexes = async (UserModel) => {
    try {
        console.log('[INDEX_CREATION] Starting index creation...');
        
        for (const { index, options, reason } of USER_INDEXES) {
            try {
                await UserModel.collection.createIndex(index, options);
                console.log(`[INDEX_CREATED] ${options.name} - ${reason}`);
            } catch (err) {
                if (err.code === 85) {
                    // Index already exists with different spec
                    console.warn(`[INDEX_WARNING] ${options.name} - Index exists with different spec`);
                } else {
                    throw err;
                }
            }
        }
        
        console.log('[INDEX_CREATION] All indexes created successfully');
    } catch (err) {
        console.error('[INDEX_CREATION_ERROR]', err);
        throw err;
    }
};

/**
 * Drop all custom indexes (for cleanup/reset)
 */
export const dropUserIndexes = async (UserModel) => {
    try {
        console.log('[INDEX_DROP] Dropping all indexes...');
        await UserModel.collection.dropAllIndexes();
        console.log('[INDEX_DROP] All indexes dropped');
    } catch (err) {
        console.error('[INDEX_DROP_ERROR]', err);
    }
};

/**
 * List all existing indexes
 */
export const listUserIndexes = async (UserModel) => {
    try {
        const indexes = await UserModel.collection.getIndexes();
        console.log('[INDEXES_LIST]', JSON.stringify(indexes, null, 2));
        return indexes;
    } catch (err) {
        console.error('[INDEXES_LIST_ERROR]', err);
    }
};

/**
 * Analyze query performance before/after indexes
 * Use MongoDB explain() to see query execution plan
 */
export const explainQuery = async (query) => {
    try {
        const explanation = await query.explain('executionStats');
        console.log('[QUERY_EXPLANATION]', JSON.stringify(explanation, null, 2));
        return explanation;
    } catch (err) {
        console.error('[EXPLAIN_ERROR]', err);
    }
};

/**
 * Integration points:
 * 
 * 1. In db.js (database connection file):
 *    ──────────────────────────────────────
 *    import { createUserIndexes } from './indexes.js';
 *    
 *    mongoose.connection.once('open', async () => {
 *      await createUserIndexes(User);
 *    });
 * 
 * 2. Or in a separate initialization script:
 *    ──────────────────────────────────────
 *    node scripts/create-indexes.js
 * 
 * 3. Manual MongoDB command:
 *    ──────────────────────────────────────
 *    db.users.createIndex({ email: 1 }, { unique: true, sparse: true });
 *    db.users.createIndex({ "trustedDevices.deviceToken": 1 });
 *    db.users.createIndex({ "activeSessions.sessionId": 1 });
 */

export default {
    USER_INDEXES,
    createUserIndexes,
    dropUserIndexes,
    listUserIndexes,
    explainQuery,
};
