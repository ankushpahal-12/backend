# Security Architecture

## Overview

The platform implements a comprehensive, defense-in-depth security model. Security is not an afterthought but is embedded into every layer of the application stack, from database design through API response headers.

---

## Security Pillars

### 1. **Authentication**
Verify the identity of users and systems accessing the platform.

### 2. **Authorization**
Ensure authenticated users can only access resources they have permission to access.

### 3. **Data Protection**
Encrypt, validate, and secure all data at rest and in transit.

### 4. **Threat Detection**
Detect and prevent attacks including bots, brute force, IP spoofing, replay attacks, and behavioral anomalies.

### 5. **Audit & Compliance**
Log all security events for compliance, forensics, and incident response.

---

## Authentication System

### 1. **Email & Password Authentication**

**Password Requirements:**
- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Password Hashing:**
- Algorithm: bcryptjs with salt rounds 12
- Never stored in plaintext
- Salted and hashed before persistence

**Example Flow:**
```
1. User provides credentials
2. Input validation (format, length)
3. Database lookup by email
4. bcryptjs comparison with hash
5. Rate limit check
6. JWT token generation
7. Session creation
8. Audit log entry
```

### 2. **Multi-Factor Authentication (MFA)**

**TOTP (Time-based One-Time Password)**
- Standard: RFC 6238
- Provider: speakeasy.js
- QR Code Provisioning: qrcode.js
- Backup Codes: 10 single-use codes per setup

**Email OTP**
- 6-digit codes
- Valid for 15 minutes
- Single-use only
- Rate limited to 5 per hour per email

**Implementation:**
```javascript
// TOTP Setup
1. Generate secret
2. Create QR code
3. Display backup codes
4. Verify user can authenticate with generated code
5. Enable MFA on account

// TOTP Verification
1. User enters 6-digit code
2. Verify against current time window (±30 seconds)
3. Check against previously used codes (prevent replay)
4. Log authentication event
5. Generate new session
```

### 3. **OAuth 2.0 Social Login**

**Google OAuth**
- Standard: OAuth 2.0 Authorization Code Flow
- Library: google-auth-library
- Profile Synchronization: Email, Name, Picture
- Account Linking: Link Google account to existing email account

**Flow:**
```
1. Frontend redirects to Google consent screen
2. User grants permission
3. Backend receives authorization code
4. Exchange code for ID token
5. Verify and decode JWT
6. Extract user info
7. Create or link account
8. Generate session
9. Redirect to app
```

### 4. **Session Management**

**Session Tracking:**
- Per-device session storage in MongoDB
- Device fingerprinting (browser, OS, resolution)
- Session metadata (IP, User-Agent, location)
- Automatic expiry after 24 hours of inactivity
- Explicit logout termination

**Session Schema:**
```javascript
{
  userId: ObjectId,
  token: String (JWT),
  device: {
    fingerprint: String,
    userAgent: String,
    os: String,
    browser: String
  },
  ipAddress: String,
  location: { lat, lon },
  lastActivity: Date,
  createdAt: Date,
  expiresAt: Date,
  isActive: Boolean
}
```

---

## Authorization & Access Control

### Role-Based Access Control (RBAC)

**User Roles:**
- `user` - Standard user access
- `premium` - Paid tier features
- `admin` - Full system access
- `superadmin` - Infrastructure access

**Permission Matrix:**
| Action | User | Premium | Admin | SuperAdmin |
|--------|------|---------|-------|-----------|
| View Tests | Yes | Yes | Yes | Yes |
| Create Tests | No | Yes | Yes | Yes |
| Publish Tests | No | Yes | Yes | Yes |
| Manage Users | No | No | Yes | Yes |
| View Audit Logs | No | No | Yes | Yes |
| System Config | No | No | No | Yes |

### Zero Trust Security

Every sensitive operation requires dynamic trust evaluation:

**Trust Score Calculation:**
```
Trust Score = (Device Reputation × 0.3) + 
              (Behavioral Score × 0.3) + 
              (IP Reputation × 0.2) + 
              (Geographic Consistency × 0.2)

Range: 0-100
Threshold: 70 (triggers MFA if below)
```

**Components:**

1. **Device Reputation**
   - Known device flag
   - Historical usage patterns
   - Trust level from previous logins
   - Device fingerprint consistency

2. **Behavioral Score**
   - Typical access time of day
   - Typical access frequency
   - Request patterns (anomaly detection)
   - Failed attempt history

3. **IP Reputation**
   - Known IP address flag
   - Geolocation consistency
   - Proxy/VPN detection
   - IP blocklist status

4. **Geographic Consistency**
   - Distance from last known location
   - Travel speed between logins
   - Historical location patterns
   - Impossible travel detection

**Challenge Triggers:**
```javascript
if (trustScore < 70) {
  // Require MFA verification
  challengeUser('totp', 'email_otp', or 'both');
}

if (trustScore < 40) {
  // Require password re-entry + MFA
  requirePasswordReEntry();
  challengeUser('totp', 'email_otp', and 'both');
}

if (trustScore < 20) {
  // Block request, force password reset
  blockRequest();
  sendPasswordResetEmail();
}
```

---

## Data Protection

### Encryption in Transit

- **Protocol**: HTTPS/TLS 1.3+
- **Certificate**: Let's Encrypt (automatic renewal)
- **HSTS**: Strict-Transport-Security header (1 year, includeSubDomains)
- **WebSocket**: Secure WebSocket (WSS)
- **Nginx**: TLS termination at proxy

### Encryption at Rest

- **Database**: MongoDB with encryption at application level
- **Sensitive Fields**: Email, Phone, Payment Info encrypted with AES-256
- **Keys**: Stored in secure secrets manager
- **Tokens**: JWT signed with HS256/RS256

### API Request Signing

**HMAC-SHA256 Signature Verification:**
```javascript
// Request payload
const payload = JSON.stringify(body);
const timestamp = Date.now();
const nonce = generateRandomNonce();

// Create signature
const signature = HMAC-SHA256(
  `${payload}${timestamp}${nonce}${secretKey}`
);

// Send request with signature
headers['X-Signature'] = signature;
headers['X-Timestamp'] = timestamp;
headers['X-Nonce'] = nonce;
```

**Server Verification:**
```javascript
1. Extract signature, timestamp, nonce from headers
2. Verify timestamp is within 5-minute window
3. Check nonce hasn't been used before
4. Reconstruct signature from payload
5. Constant-time comparison with provided signature
6. If valid, proceed; if invalid, return 403
```

---

## Threat Detection & Prevention

### 1. **Brute Force Protection**

**Failed Login Tracking:**
- Track failed attempts per email/IP
- 5 failed attempts = temporary lockout
- 15 minutes lockout duration
- 10 failed attempts = email verification required
- Exponential backoff for repeated failures

**Implementation:**
```javascript
// On login failure
loginAttempt = await LoginAttempt.create({
  email,
  ipAddress,
  timestamp: new Date(),
  reason: 'invalid_password'
});

const failedCount = await LoginAttempt.countRecent(email, '15m');
if (failedCount >= 5) {
  throw new Error('Account temporarily locked');
}
```

### 2. **Bot Detection**

**Detection Methods:**
- User-Agent analysis (headless browser detection)
- Request timing patterns (human vs. automated)
- Mouse movement tracking (frontend-side)
- Challenge response completion
- Rate pattern analysis

**Detection Triggers:**
- Rapid repeated requests
- Missing/suspicious User-Agent
- Impossible request patterns
- Missing JavaScript execution signals

**Response:**
```javascript
if (botDetected) {
  // Option 1: Block request
  return 403;
  
  // Option 2: CAPTCHA challenge
  return challengeWithCaptcha();
  
  // Option 3: Rate limit aggressively
  limiter.setWindow(1, 'request/minute');
}
```

### 3. **IP Spoofing Detection**

**Detection Method:**
- Compare X-Forwarded-For with socket IP
- Validate proxy chain consistency
- Check for known proxy services
- Geographic consistency check

**Implementation:**
```javascript
const clientIP = socket.remoteAddress;
const forwardedIP = req.headers['x-forwarded-for'];

// Flag suspicious patterns
if (forwardedIP && forwardedIP !== socket.remoteAddress) {
  // Verify via geolocation service
  const spoofingLikelihood = await geoService.check(
    clientIP,
    forwardedIP
  );
  
  if (spoofingLikelihood > 0.8) {
    throw new Error('IP_SPOOFING_DETECTED');
  }
}
```

### 4. **Replay Attack Prevention**

**Double-Submit Cookie Pattern:**
```javascript
// Server generates nonce
const nonce = generateRandomNonce();
res.cookie('nonce', nonce, { httpOnly: true });
res.setHeader('X-Nonce', nonce);

// Client includes nonce in request
headers['X-Nonce'] = getCookieValue('nonce');

// Server verifies
if (request.headers['x-nonce'] !== request.cookies.nonce) {
  throw new Error('REPLAY_ATTACK_DETECTED');
}
```

**Timestamp Window Validation:**
```javascript
const maxAge = 5 * 60 * 1000; // 5 minutes
const requestTime = parseInt(headers['x-timestamp']);
const currentTime = Date.now();

if (Math.abs(currentTime - requestTime) > maxAge) {
  throw new Error('Request expired or from future');
}
```

### 5. **Web Application Firewall (WAF)**

**Pattern Matching:**
- SQL Injection patterns
- XSS payload detection
- Command injection attempts
- Path traversal attempts
- Protocol violations

**Example Rules:**
```javascript
const wafRules = [
  { pattern: /(\bUNION\b.*\bSELECT\b|\bSELECT\b.*\bFROM\b)/i, 
    name: 'SQL_INJECTION' },
  { pattern: /<script[^>]*>.*?<\/script>/i, 
    name: 'XSS_ATTEMPT' },
  { pattern: /\.\.\/|\.\.\\/, 
    name: 'PATH_TRAVERSAL' }
];

wafRules.forEach(rule => {
  if (rule.pattern.test(requestBody)) {
    throw new Error(`WAF_MATCH: ${rule.name}`);
  }
});
```

### 6. **DDoS Protection**

**Rate Limiting Strategy:**
- Global rate limit: 1000 requests/minute
- Per-IP rate limit: 100 requests/minute
- Per-user rate limit: 300 requests/minute
- Per-endpoint rate limit: Dynamic based on resource cost
- Sliding window algorithm

**Escalating Response:**
```
Stage 1: Rate limit headers warning
Stage 2: Introduce request delay (100ms)
Stage 3: Increase delay (500ms)
Stage 4: Require CAPTCHA
Stage 5: Temporary IP block (1 hour)
```

---

## Content Security & Input Validation

### Input Validation

**Schema-based Validation (Zod):**
```javascript
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(12, 'Password too short')
    .regex(/[A-Z]/, 'Needs uppercase')
    .regex(/[0-9]/, 'Needs digit')
});

const result = loginSchema.safeParse(data);
if (!result.success) {
  throw new ValidationError(result.error.errors);
}
```

**Sanitization:**
- HTML entity encoding (express-mongo-sanitize)
- XSS prevention (xss-clean)
- Parameter pollution prevention (hpp)
- NoSQL injection prevention (data type validation)

### Content Security Policy (CSP)

**CSP Header:**
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{generated_nonce}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self'
```

**Nonce Injection:**
```javascript
// Generate unique nonce per request
const nonce = crypto.randomBytes(16).toString('base64');

// Inject into CSP header
res.setHeader('Content-Security-Policy', 
  `script-src 'nonce-${nonce}'`
);

// Pass to frontend
res.locals.nonce = nonce;
```

### CSRF Protection

**Double-Submit Token Pattern:**
```javascript
// Server generates token
const csrfToken = generateRandomToken();
req.session.csrfToken = csrfToken;
res.setHeader('X-CSRF-Token', csrfToken);

// Client includes token in mutations
fetch('/api/update', {
  method: 'POST',
  headers: { 'X-CSRF-Token': csrfToken }
});

// Server validates
if (req.body._csrf !== req.session.csrfToken) {
  throw new Error('CSRF validation failed');
}
```

---

## Audit & Logging

### Audit Trail

**Logged Events:**
- Authentication (login, logout, MFA setup)
- Authorization (permission denied, role change)
- Data Access (queries on sensitive data)
- Data Modification (create, update, delete)
- Security Events (threats detected, blocks)
- Administrative Actions (user management)
- Error Events (system errors)

**Audit Log Schema:**
```javascript
{
  timestamp: Date,
  eventType: String,
  userId: ObjectId,
  ipAddress: String,
  endpoint: String,
  method: String,
  statusCode: Number,
  details: {
    action: String,
    resource: String,
    changes: Object,
    result: String
  },
  requestId: String
}
```

### Monitoring & Alerts

**Metrics:**
- Failed login attempts (spike detection)
- Failed authorization attempts
- Rate limit violations
- Security middleware triggers
- Zero Trust challenge rates
- Error rates by endpoint

**Alert Conditions:**
- 10+ failed logins from single IP
- 20+ failed logins for single user
- Sudden spike in 403 responses
- DDoS detection triggered
- Database connection failure
- External service timeout

---

## Secrets Management

**Environment Variables:**
- JWT_SECRET - For token signing
- DB_URI - MongoDB connection string
- GOOGLE_CLIENT_ID/SECRET - OAuth credentials
- EMAIL_SERVICE_KEY - Nodemailer credentials
- ENCRYPTION_KEY - AES encryption key

**Storage:**
- `.env` file for development (never committed)
- `.env.example` with placeholder values
- Environment variables in production
- Secrets manager for sensitive data
- Rotating credentials annually

---

## Compliance & Standards

**Standards Implemented:**
- OAuth 2.0 (RFC 6749)
- OpenID Connect (OIDC)
- TOTP (RFC 6238)
- JWT (RFC 7519)
- HMAC-SHA256
- CORS (RFC 7231)
- HTTPS/TLS 1.3

**Compliance:**
- GDPR - Data export, deletion, privacy controls
- OWASP Top 10 - All vulnerabilities addressed
- CWE Top 25 - Prevention implemented
- Password Security - NIST guidelines followed

---

## Incident Response

### Incident Classification

1. **Critical** - Active data breach, authentication bypass
2. **High** - Unpatched vulnerability, suspicious activity spike
3. **Medium** - Policy violation, attempted attack
4. **Low** - Non-malicious error, informational event

### Response Procedures

**On Detection:**
```
1. Alert security team
2. Log incident with severity
3. Isolate affected component (if necessary)
4. Preserve evidence/logs
5. Notify affected users
6. Implement temporary mitigation
7. Root cause analysis
8. Permanent fix deployment
9. Post-incident review
```

### Breach Notification

**Timeline:**
- Immediate: Internal alert
- 1 hour: Impact assessment
- 4 hours: Notification to affected users
- 24 hours: Public disclosure (if required)
- 72 hours: Regulatory notification (if required)

---

## Security Best Practices for Developers

1. **Never Log Sensitive Data**
   ```javascript
   // BAD
   console.log('User password:', password);
   
   // GOOD
   logger.debug('Login attempt', { email, ip });
   ```

2. **Validate on Both Client and Server**
   ```javascript
   // Frontend validation is UX; server validation is security
   const validated = schema.parse(userInput);
   ```

3. **Use Prepared Statements**
   ```javascript
   // Mongoose prevents injection automatically
   User.findOne({ email: userEmail });
   ```

4. **Implement Rate Limiting**
   ```javascript
   router.post('/sensitive', rateLimiter(), handler);
   ```

5. **Always Hash Passwords**
   ```javascript
   const hash = await bcryptjs.hash(password, 12);
   ```

---

## Security Testing

### Automated Security Testing

Run before deployment:
```bash
npm run test:security
```

Includes:
- OWASP Zap scanning
- Dependency vulnerability checks
- Code pattern analysis
- SSL/TLS validation

### Manual Testing Checklist

- [ ] Authentication flow with invalid inputs
- [ ] Authorization boundary testing
- [ ] Session fixation attempts
- [ ] CSRF token validation
- [ ] SQL injection attempts
- [ ] XSS payload testing
- [ ] API rate limit enforcement
- [ ] Zero Trust challenge triggering

---

## References

- [Error Handling Guide](./ERROR_HANDLING.md)
- [Middleware Documentation](./MIDDLEWARE.md)
- [System Architecture](./SYSTEM_ARCHITECTURE.md)
- [Backend Security Integration Guide](../backend/APP_SECURITY_INTEGRATION.js)
