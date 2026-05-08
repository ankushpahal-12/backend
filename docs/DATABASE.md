# Database Schema & Documentation

## Overview

The platform uses MongoDB as its primary database, accessed through Mongoose ODM. The schema is designed for scalability, security, performance, and data integrity while supporting complex queries and relationships.

---

## Database Collections

### 1. Users Collection

**Model:** `User.js`

**Purpose:** Core user account information, credentials, and security settings

**Schema:**
```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  password: String (hashed with bcryptjs),
  firstName: String,
  lastName: String,
  role: String (enum: ['user', 'premium', 'admin', 'superadmin']),
  verified: Boolean,
  verificationDate: Date,
  
  // Authentication
  lastLogin: Date,
  lastLoginIP: String,
  failedLoginAttempts: Number,
  loginAttemptTimestamp: Date,
  
  // MFA
  mfaEnabled: Boolean,
  totpSecret: String (encrypted),
  backupCodes: [String (hashed)],
  mfaSetupDate: Date,
  
  // Security & Profile
  phoneNumber: String,
  profilePicture: String (URL),
  timezone: String,
  preferences: {
    emailNotifications: Boolean,
    pushNotifications: Boolean,
    darkMode: Boolean,
    language: String
  },
  
  // OAuth
  googleId: String (indexed),
  githubId: String (indexed),
  oauthProvider: String,
  oauthProfileData: Object,
  
  // Status & Account
  status: String (enum: ['active', 'inactive', 'suspended', 'deleted']),
  suspensionReason: String,
  suspendedUntil: Date,
  
  // GDPR & Privacy
  dataExportRequests: [ObjectId],
  deletionScheduledFor: Date,
  privacyPolicyAccepted: Boolean,
  privacyPolicyVersion: String,
  
  // Subscription
  subscription: {
    plan: String (enum: ['free', 'premium', 'enterprise']),
    status: String (enum: ['active', 'expired', 'cancelled']),
    startDate: Date,
    renewalDate: Date,
    cancelledDate: Date,
    cancellationReason: String
  },
  
  // Audit Fields
  createdAt: Date (indexed),
  updatedAt: Date,
  createdBy: ObjectId,
  lastUpdatedBy: ObjectId,
  
  // Metadata
  loginCount: Number,
  metadata: Object
}
```

**Indexes:**
```javascript
- email (unique, ascending)
- googleId (ascending)
- githubId (ascending)
- createdAt (descending)
- status (ascending)
- subscription.plan (ascending)
```

**Use Cases:**
- User authentication and authorization
- Profile management
- Subscription tracking
- MFA configuration

---

### 2. AuthSessions Collection

**Model:** `AuthSession.js`

**Purpose:** Track active user sessions with device information

**Schema:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (indexed, ref: 'User'),
  token: String (JWT token, indexed),
  
  // Device Information
  device: {
    fingerprint: String,
    userAgent: String,
    os: String,
    browser: String,
    browserVersion: String,
    deviceType: String (enum: ['mobile', 'tablet', 'desktop'])
  },
  
  // Location & IP
  ipAddress: String (indexed),
  location: {
    country: String,
    region: String,
    city: String,
    latitude: Number,
    longitude: Number
  },
  
  // Session Metadata
  lastActivity: Date (indexed),
  createdAt: Date (indexed),
  expiresAt: Date (indexed),
  isActive: Boolean (indexed),
  
  // Security
  tokenHash: String,
  refreshTokenHash: String,
  securityFlags: [String],
  
  // Trust Information
  trustScore: Number (0-100),
  riskLevel: String (enum: ['low', 'medium', 'high', 'critical'])
}
```

**Indexes:**
```javascript
- userId + isActive (compound)
- token (unique, ascending)
- lastActivity (descending)
- expiresAt (ascending)
- createdAt (descending)
```

**TTL Index:**
```javascript
// Automatically delete expired sessions after expiresAt
db.authsessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
```

**Use Cases:**
- Session tracking and management
- Cross-device logout
- Activity monitoring
- Device fingerprinting

---

### 3. LoginAttempts Collection

**Model:** `LoginAttempt.js`

**Purpose:** Track failed login attempts for security analysis and brute-force prevention

**Schema:**
```javascript
{
  _id: ObjectId,
  email: String (indexed),
  ipAddress: String (indexed),
  
  // Attempt Details
  timestamp: Date (indexed, TTL),
  success: Boolean,
  reason: String (enum: [
    'invalid_password',
    'user_not_found',
    'mfa_required',
    'account_suspended',
    'rate_limited'
  ]),
  
  // Request Context
  userAgent: String,
  referer: String,
  attemptNumber: Number,
  
  // Metadata
  geoLocation: {
    country: String,
    region: String,
    city: String
  }
}
```

**Indexes:**
```javascript
- email + timestamp (compound)
- ipAddress + timestamp (compound)
- timestamp (descending)
```

**TTL Index:**
```javascript
// Auto-delete records older than 30 days
db.loginattempts.createIndex({ timestamp: 1 }, { expireAfterSeconds: 2592000 })
```

**Use Cases:**
- Brute force detection
- Security analysis
- Rate limiting enforcement
- Account lockout logic

---

### 4. MFAChallenges Collection

**Model:** `MFAChallenge.js`

**Purpose:** Store in-flight MFA challenges pending user verification

**Schema:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (indexed, ref: 'User'),
  
  // Challenge Details
  type: String (enum: ['totp', 'email_otp', 'backup_code']),
  status: String (enum: ['pending', 'verified', 'expired']),
  
  // Security
  attempts: Number,
  maxAttempts: Number (default: 5),
  verified: Boolean,
  verifiedAt: Date,
  
  // Context
  requestContext: {
    ipAddress: String,
    userAgent: String,
    trustScore: Number,
    deviceFingerprint: String
  },
  
  // Timing
  createdAt: Date (indexed),
  expiresAt: Date (indexed, TTL),
  
  // Token References
  sessionToken: String,
  refreshToken: String
}
```

**Indexes:**
```javascript
- userId + status (compound)
- createdAt (descending)
- expiresAt (ascending, TTL)
```

**TTL Index:**
```javascript
// Auto-delete expired challenges after 1 hour
db.mfachallenges.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
```

**Use Cases:**
- Temporary MFA challenge storage
- Challenge validation and tracking
- Attempt rate limiting

---

### 5. EmailVerificationOTP Collection

**Model:** `EmailVerificationOTP.js`

**Purpose:** Store temporary OTP codes for email verification

**Schema:**
```javascript
{
  _id: ObjectId,
  email: String (indexed),
  otp: String (hashed),
  
  // Status
  used: Boolean,
  usedAt: Date,
  attempts: Number,
  maxAttempts: Number (default: 5),
  
  // Timing
  createdAt: Date (indexed),
  expiresAt: Date (indexed, TTL),
  
  // Context
  requestContext: {
    ipAddress: String,
    userAgent: String
  }
}
```

**Indexes:**
```javascript
- email + used (compound)
- expiresAt (ascending, TTL)
```

**TTL Index:**
```javascript
// Auto-delete expired OTPs after 15 minutes
db.emailverificationotps.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
```

---

### 6. IPBlacklist Collection

**Model:** `IpBlacklist.js`

**Purpose:** Maintain list of blocked IP addresses

**Schema:**
```javascript
{
  _id: ObjectId,
  ipAddress: String (unique, indexed),
  
  // Block Details
  reason: String (enum: [
    'brute_force',
    'ddos',
    'malicious_activity',
    'abuse',
    'manual_block'
  ]),
  severity: String (enum: ['low', 'medium', 'high', 'critical']),
  
  // Timing
  addedAt: Date (indexed),
  expiresAt: Date (indexed, TTL),
  permanentBlock: Boolean,
  
  // Details
  blockedRequests: Number,
  firstBlockedRequest: Date,
  lastBlockedRequest: Date,
  
  // Administration
  blockedBy: ObjectId (ref: 'User'),
  notes: String
}
```

**Indexes:**
```javascript
- ipAddress (unique, ascending)
- expiresAt (ascending, TTL)
- severity (ascending)
```

**TTL Index:**
```javascript
// Auto-delete expired blocks
db.ipblacklists.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
```

---

### 7. DeviceStore Collection

**Model:** `DeviceStore.js`

**Purpose:** Store device fingerprints and trust history

**Schema:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (indexed, ref: 'User'),
  fingerprint: String (indexed),
  
  // Device Details
  deviceName: String,
  os: String,
  browser: String,
  browserVersion: String,
  deviceType: String,
  
  // Trust Information
  trustLevel: String (enum: ['new', 'trusted', 'untrusted']),
  firstSeen: Date,
  lastSeen: Date (indexed),
  usageCount: Number,
  
  // Security
  riskIndicators: [String],
  lastVerifiedAt: Date,
  verificationRequired: Boolean,
  
  // Metadata
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
- userId + fingerprint (compound, unique)
- userId + lastSeen (compound)
- fingerprint (ascending)
```

---

### 8. BehaviorStore Collection

**Model:** `BehaviorStore.js`

**Purpose:** Store user behavioral patterns for anomaly detection

**Schema:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (unique, indexed, ref: 'User'),
  
  // Activity Patterns
  typicalAccessTimes: {
    // Hours of day when user typically accesses system
    monday: [Number],
    tuesday: [Number],
    // ... other days
  },
  typicalAccessFrequency: {
    requestsPerHour: Number,
    requestsPerDay: Number,
    activeHoursPerDay: Number
  },
  
  // Geographic Patterns
  typicalLocations: [
    {
      country: String,
      region: String,
      city: String,
      frequency: Number,
      lastSeen: Date
    }
  ],
  typicalIPs: [String],
  
  // Device Patterns
  knownDevices: [ObjectId],
  typicalDevices: [String],
  
  // Anomaly Scores
  currentAnomalyScore: Number (0-100),
  anomalyHistory: [
    {
      date: Date,
      score: Number,
      anomalies: [String]
    }
  ],
  
  // Baseline
  baselineLastUpdated: Date,
  sampleSize: Number,
  
  // Metadata
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
- userId (unique, ascending)
- updatedAt (descending)
```

---

### 9. AuditLogs Collection

**Model:** Custom (no Mongoose model)

**Purpose:** Immutable audit trail of all security events

**Schema:**
```javascript
{
  _id: ObjectId,
  
  // Event Classification
  eventType: String (indexed, enum: [
    'authentication',
    'authorization',
    'data_access',
    'data_modification',
    'security_event',
    'administrative',
    'error'
  ]),
  severity: String (enum: ['info', 'warning', 'error', 'critical']),
  
  // User Information
  userId: ObjectId (indexed, ref: 'User'),
  username: String,
  email: String (indexed),
  
  // Request Context
  requestId: String (unique, indexed),
  ipAddress: String (indexed),
  userAgent: String,
  endpoint: String (indexed),
  method: String,
  
  // Details
  action: String,
  resource: String,
  resourceId: ObjectId,
  changes: {
    before: Object,
    after: Object
  },
  result: String (enum: ['success', 'failure']),
  errorMessage: String,
  
  // Timestamps
  timestamp: Date (indexed, descending),
  duration: Number (milliseconds),
  
  // Status
  statusCode: Number,
  
  // Metadata
  source: String (enum: ['api', 'admin_panel', 'scheduler']),
  metadata: Object
}
```

**Indexes:**
```javascript
- eventType + timestamp (compound)
- userId + timestamp (compound)
- ipAddress + timestamp (compound)
- requestId (unique, ascending)
- timestamp (descending)
```

**Capped Collection:**
```javascript
// Keep only last 10M documents or 50GB of data
db.createCollection('auditlogs', {
  capped: true,
  size: 50000000000,
  max: 10000000
})
```

---

### 10. ApiKeys Collection

**Model:** `ApiKey.js`

**Purpose:** Manage API keys for external service integrations

**Schema:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (indexed, ref: 'User'),
  
  // Key Information
  name: String,
  keyHash: String (unique, hashed),
  keyPrefix: String (first 8 chars for preview),
  
  // Permissions
  permissions: [String],
  scopes: [String],
  
  // Usage
  rateLimit: {
    requestsPerHour: Number,
    requestsPerDay: Number
  },
  currentUsage: {
    requestsThisHour: Number,
    requestsToday: Number,
    lastUsed: Date
  },
  
  // Security
  lastRotationDate: Date,
  status: String (enum: ['active', 'revoked', 'expired']),
  expiresAt: Date (indexed),
  
  // Metadata
  createdAt: Date,
  updatedAt: Date,
  revokedAt: Date,
  revokedBy: ObjectId
}
```

**Indexes:**
```javascript
- userId + status (compound)
- keyHash (unique, ascending)
- expiresAt (ascending)
```

---

## Query Patterns & Performance

### Common Query Examples

**Find active user session:**
```javascript
AuthSession.findOne({
  userId: userId,
  isActive: true,
  expiresAt: { $gt: new Date() }
}).lean()
```

**Get user audit logs for last 30 days:**
```javascript
AuditLogs.find({
  userId: userId,
  timestamp: { $gte: new Date(Date.now() - 30*24*60*60*1000) }
})
.sort({ timestamp: -1 })
.limit(100)
.lean()
```

**Check for recent failed login attempts:**
```javascript
LoginAttempt.countDocuments({
  email: userEmail,
  timestamp: { $gte: new Date(Date.now() - 15*60*1000) }
})
```

**Find users by subscription plan:**
```javascript
User.find({
  'subscription.plan': 'premium',
  'subscription.status': 'active'
})
.select('_id email firstName lastName')
.lean()
```

---

## Indexing Strategy

**Index Guidelines:**
1. **Cardinality**: High-cardinality fields first in compound indexes
2. **Selectivity**: Most selective fields first
3. **Equality before Range**: Equality conditions before range in sort order
4. **Compound Limits**: Limit compound indexes to 3-4 fields max
5. **Monthly Review**: Review index usage and hit rates monthly

**Current Indexes:**
- 45+ indexes across all collections
- Total index size: ~500MB
- Average query execution time: <50ms

---

## Data Retention Policies

**Automatic Deletion (TTL):**
- AuthSessions: 24 hours after expiration
- MFAChallenges: 1 hour after expiration
- EmailVerificationOTP: 15 minutes after expiration
- IPBlacklist: Based on block duration (typically 1-7 days)
- LoginAttempts: 30 days

**Manual Archival:**
- AuditLogs: Moved to archive collection after 1 year
- User Deletion: Soft delete (mark as deleted, retain data for 30 days)

**GDPR Compliance:**
- Data Export: User can export all personal data
- Data Deletion: Can be scheduled for future date
- Retention Override: Important events retained per legal requirements

---

## Backup & Recovery

**Backup Strategy:**
- Incremental backups every 6 hours
- Full backups daily at 2 AM UTC
- Point-in-time recovery: Last 30 days
- Geographic redundancy: 3 regions

**Recovery Procedures:**
```bash
# List available backups
mongodump --oplog --gzip

# Restore from backup
mongorestore --archive=backup.archive --gzip

# Point-in-time recovery
mongorestore --archive=backup.archive --oplogReplay
```

---

## Monitoring & Maintenance

**Monitoring Metrics:**
- Collection sizes and growth rate
- Index usage statistics
- Query performance (slow query log)
- Replication lag
- Disk usage

**Maintenance Tasks:**
```javascript
// Rebuild indexes (monthly)
db.users.reIndex()

// Analyze query performance
db.users.find({...}).explain("executionStats")

// Compact collection (quarterly)
db.runCommand({ compact: 'users' })
```

---

## See Also

- [System Architecture](./SYSTEM_ARCHITECTURE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Error Handling](./ERROR_HANDLING.md)
