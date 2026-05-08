# Middleware Documentation

## Overview

Middleware functions execute in sequence for every HTTP request. They handle cross-cutting concerns including authentication, security, validation, logging, and error handling. Middleware order is critical for both security and performance.

---

## Middleware Execution Order

```
Request Entry (Nginx)
        |
        v
1. CORS Middleware
2. Morgan Logger
3. Body Parser (JSON, URL-encoded)
4. Cookie Parser
5. Helmet Security Headers
6. Express Rate Limit
7. Input Validation Middleware
8. Bot Detection Middleware
9. IP Spoofing Detection
10. IP Blacklist Enforcement
11. Reverse Proxy Validation
12. API Version Routing
13. HMAC Signature Verification
14. CSRF Token Validation
15. Authentication Middleware (JWT)
16. Zero Trust Middleware
17. Replay Attack Prevention
18. WAF (Web Application Firewall)
19. DDoS Protection
20. Auto-Logout Detection
21. CSP Nonce Injection
        |
        v
Route Handler / Controller
        |
        v
Error Middleware
        |
        v
Response Sent
```

---

## Core Middleware Components

### 1. CORS Middleware

**File:** Built-in with `cors` package

**Purpose:** Handle Cross-Origin Resource Sharing

**Configuration:**
```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',
    'X-Signature',
    'X-Timestamp',
    'X-Nonce'
  ]
};

app.use(cors(corsOptions));
```

**Behavior:**
- Preflight requests (OPTIONS) are handled automatically
- Credentials (cookies, auth headers) allowed
- Only requests from whitelisted frontend origin
- Custom headers allowed

---

### 2. Morgan Logger

**File:** Built-in with `morgan` package

**Purpose:** HTTP request logging for monitoring and debugging

**Configuration:**
```javascript
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms'));
```

**Logged Information:**
- Client IP address
- Request method (GET, POST, etc.)
- Request URL and query params
- HTTP status code
- Response size
- Response time
- User-Agent

**Output Example:**
```
192.168.1.100 - user123 [08/May/2026:10:30:45 +0000] "POST /api/v1/auth/login HTTP/1.1" 200 1234 "-" "Mozilla/5.0" 125 ms
```

---

### 3. Body Parser

**Files:** Built-in with `express`

**Purpose:** Parse request body from JSON or URL-encoded format

**Configuration:**
```javascript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

**Behavior:**
- Automatically detects Content-Type
- Parses JSON payloads
- Parses form-encoded payloads
- Populates `req.body` object
- Rejects invalid JSON with 400 error

---

### 4. Cookie Parser

**File:** `cookie-parser` package

**Purpose:** Parse HTTP cookies from requests

**Configuration:**
```javascript
app.use(cookieParser(process.env.COOKIE_SECRET));
```

**Behavior:**
- Parses all cookies from request
- Populates `req.cookies` with parsed values
- Supports signed cookies (with secret)
- Enables `res.cookie()` method

---

### 5. Helmet Security Headers

**File:** `helmet` package

**Purpose:** Set security-related HTTP headers

**Configuration:**
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'nonce-{nonce}'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.example.com']
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
```

**Headers Set:**
- `Content-Security-Policy` - CSP rules
- `Strict-Transport-Security` - HTTPS enforcement
- `X-Frame-Options` - Clickjacking prevention
- `X-Content-Type-Options` - MIME sniffing prevention
- `X-XSS-Protection` - XSS filter activation
- `Referrer-Policy` - Referrer information control

---

### 6. Rate Limiting

**File:** `express-rate-limit` package

**Purpose:** Prevent abuse by limiting request frequency

**Configuration:**
```javascript
const createLimiter = (windowMs, max) => 
  rateLimit({
    windowMs,
    max,
    message: 'Too many requests. Please try again later.',
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,
    keyGenerator: (req, res) => {
      // Use user ID if authenticated, else IP address
      return req.user?.id || req.ip;
    },
    skip: (req, res) => {
      // Skip rate limiting for health checks
      return req.path === '/api/health';
    },
    handler: (req, res) => {
      res.status(429).json({
        status: 429,
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests',
        retryAfter: req.rateLimit.resetTime
      });
    }
  });

// Apply different limits
app.post('/auth/login', createLimiter('15m', 5)); // 5 per 15 min
app.post('/auth/register', createLimiter('1h', 3)); // 3 per hour
app.get('/api/*', createLimiter('1m', 100)); // 100 per minute
```

**Behavior:**
- Tracks requests by user/IP
- Increments counter per window
- Returns 429 when limit exceeded
- Automatically resets after time window

---

### 7. Input Validation Middleware

**File:** `middlewares/inputValidationMiddleware.js`

**Purpose:** Validate request data against defined schemas

**Implementation:**
```javascript
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      res.status(400).json({
        status: 400,
        code: 'VALIDATION_ERROR',
        details: error.errors
      });
    }
  };
};

// Usage
app.post('/auth/register',
  validateRequest(registerSchema),
  authController.register
);
```

**Schema Validation (Zod):**
```javascript
const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string()
    .min(12, 'Min 12 characters')
    .regex(/[A-Z]/, 'Needs uppercase')
    .regex(/[0-9]/, 'Needs digit'),
  firstName: z.string().min(1),
  lastName: z.string().min(1)
});
```

---

### 8. Bot Detection Middleware

**File:** `middlewares/botDetectionMiddleware.js`

**Purpose:** Detect and block automated traffic (bots, scrapers)

**Detection Methods:**
```javascript
const botDetectionMiddleware = (req, res, next) => {
  const userAgent = req.get('user-agent') || '';
  
  // Check headless browser signatures
  if (/headless|phantom|docker|node/i.test(userAgent)) {
    logSecurityEvent('BOT_DETECTED', req);
    return res.status(403).json({
      code: 'BOT_DETECTED',
      message: 'Automated access detected'
    });
  }
  
  // Check for missing JavaScript execution signals
  if (!req.get('x-client-js-token')) {
    logSecurityEvent('NO_JS_EXECUTION', req);
    return res.status(403).json({
      code: 'BOT_DETECTED'
    });
  }
  
  // Check request timing patterns
  if (detectAnomalousPattern(req)) {
    logSecurityEvent('ANOMALOUS_PATTERN', req);
    return res.status(403).json({
      code: 'BOT_DETECTED'
    });
  }
  
  next();
};
```

**Blocked Patterns:**
- Headless browser User-Agents
- Missing JavaScript execution tokens
- Impossible request velocities
- Crawler identifiers

---

### 9. IP Spoofing Detection

**File:** `middlewares/ipSpoofingDetectionMiddleware.js`

**Purpose:** Detect and prevent IP address spoofing via X-Forwarded-For manipulation

**Implementation:**
```javascript
const ipSpoofingMiddleware = async (req, res, next) => {
  const clientIP = req.socket.remoteAddress;
  const forwardedIP = req.get('x-forwarded-for');
  
  if (forwardedIP && forwardedIP !== clientIP) {
    // Check if forwarded IP is from known proxy
    if (!isKnownProxy(forwardedIP)) {
      logSecurityEvent('IP_SPOOFING_DETECTED', req);
      await ipBlacklistService.addToBlacklist(clientIP, '1h');
      
      return res.status(403).json({
        code: 'IP_SPOOFING_DETECTED',
        message: 'Suspicious request pattern detected'
      });
    }
  }
  
  next();
};
```

---

### 10. IP Blacklist Enforcement

**File:** `middlewares/ipBlacklistMiddleware.js`

**Purpose:** Block requests from blacklisted IP addresses

**Implementation:**
```javascript
const ipBlacklistMiddleware = async (req, res, next) => {
  const clientIP = req.ip;
  
  const blacklistedEntry = await IpBlacklist.findOne({
    ipAddress: clientIP,
    expiresAt: { $gt: new Date() } // Not expired
  });
  
  if (blacklistedEntry) {
    logSecurityEvent('IP_BLACKLISTED', req, { entry: blacklistedEntry });
    return res.status(403).json({
      code: 'IP_BLACKLISTED',
      message: 'Your IP address has been blocked',
      blockReason: blacklistedEntry.reason,
      expiresAt: blacklistedEntry.expiresAt
    });
  }
  
  next();
};
```

---

### 11. Reverse Proxy Validation

**File:** `middlewares/reverseProxyMiddleware.js`

**Purpose:** Validate requests from reverse proxy and detect bypasses

**Implementation:**
```javascript
const reverseProxyMiddleware = (req, res, next) => {
  const validProxyHeader = req.get('x-forwarded-by');
  
  if (!validProxyHeader || !isValidProxy(validProxyHeader)) {
    logSecurityEvent('INVALID_PROXY', req);
    return res.status(403).json({
      code: 'PROXY_VALIDATION_FAILED'
    });
  }
  
  // Verify Nginx signature
  const signature = req.get('x-proxy-signature');
  if (!verifyProxySignature(req, signature)) {
    logSecurityEvent('PROXY_BYPASS_ATTEMPT', req);
    return res.status(403).json({
      code: 'PROXY_VALIDATION_FAILED'
    });
  }
  
  next();
};
```

---

### 12. HMAC Signature Verification

**File:** `middlewares/signatureMiddleware.js`

**Purpose:** Verify request integrity using HMAC signatures

**Implementation:**
```javascript
const signatureMiddleware = (req, res, next) => {
  const signature = req.get('x-signature');
  const timestamp = req.get('x-timestamp');
  const nonce = req.get('x-nonce');
  
  if (!signature || !timestamp || !nonce) {
    return res.status(400).json({
      code: 'MISSING_SIGNATURE'
    });
  }
  
  // Verify timestamp within 5-minute window
  const requestTime = parseInt(timestamp);
  if (Math.abs(Date.now() - requestTime) > 5 * 60 * 1000) {
    return res.status(401).json({
      code: 'TIMESTAMP_EXPIRED'
    });
  }
  
  // Verify nonce not used before
  if (await nonceStore.exists(nonce)) {
    return res.status(401).json({
      code: 'REPLAY_ATTACK_DETECTED'
    });
  }
  
  // Reconstruct and verify signature
  const payload = JSON.stringify(req.body);
  const expectedSig = HMAC_SHA256(
    `${payload}${timestamp}${nonce}${process.env.SECRET_KEY}`
  );
  
  if (!constantTimeEqual(signature, expectedSig)) {
    return res.status(403).json({
      code: 'SIGNATURE_MISMATCH'
    });
  }
  
  // Mark nonce as used
  await nonceStore.set(nonce, true, 3600);
  
  next();
};
```

---

### 13. CSRF Protection Middleware

**File:** `middlewares/csrfMiddleware.js`

**Purpose:** Generate and validate CSRF tokens

**Implementation:**
```javascript
const csrfMiddleware = (req, res, next) => {
  // Generate token for GET requests
  if (req.method === 'GET') {
    const token = generateRandomToken(32);
    req.session.csrfToken = token;
    res.setHeader('X-CSRF-Token', token);
    return next();
  }
  
  // Validate token for mutating requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const tokenFromHeader = req.get('x-csrf-token');
    const tokenFromBody = req.body._csrf;
    const token = tokenFromHeader || tokenFromBody;
    
    if (!token || token !== req.session.csrfToken) {
      return res.status(403).json({
        code: 'CSRF_VALIDATION_FAILED',
        message: 'CSRF token mismatch'
      });
    }
  }
  
  next();
};
```

---

### 14. Authentication Middleware

**File:** `middlewares/authMiddleware.js`

**Purpose:** Verify JWT token and hydrate user information

**Implementation:**
```javascript
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'No authentication token provided'
      });
    }
    
    // Verify JWT
    const payload = verifyJWT(token, process.env.JWT_SECRET);
    
    // Check token revocation
    if (await tokenRevocationService.isRevoked(token)) {
      return res.status(401).json({
        code: 'TOKEN_REVOKED'
      });
    }
    
    // Hydrate user
    req.user = await User.findById(payload.userId);
    if (!req.user) {
      return res.status(401).json({
        code: 'USER_NOT_FOUND'
      });
    }
    
    next();
  } catch (error) {
    res.status(401).json({
      code: 'INVALID_TOKEN',
      message: 'Token verification failed'
    });
  }
};
```

---

### 15. Zero Trust Middleware

**File:** `middlewares/zeroTrustMiddleware.js`

**Purpose:** Evaluate trust score and enforce MFA challenges for low-trust requests

**Implementation:**
```javascript
const zeroTrustMiddleware = async (req, res, next) => {
  if (!req.user) return next();
  
  // Calculate trust score
  const trustScore = await zeroTrustService.calculateTrustScore(req);
  
  // Store for logging
  req.trustScore = trustScore;
  
  // Block if trust score critically low
  if (trustScore < 20) {
    await incidentResponseService.logIncident('CRITICAL_TRUST_VIOLATION', {
      userId: req.user.id,
      ip: req.ip,
      trustScore
    });
    
    return res.status(403).json({
      code: 'CRITICAL_TRUST_VIOLATION',
      message: 'Your request could not be verified. Please log in again.'
    });
  }
  
  // Require MFA if trust score low
  if (trustScore < 70) {
    const challenge = await mfaChallengeService.create({
      userId: req.user.id,
      ipAddress: req.ip,
      requiredScore: 70,
      currentScore: trustScore
    });
    
    return res.status(403).json({
      code: 'MFA_REQUIRED',
      challengeId: challenge.id,
      message: 'Additional verification required',
      methods: ['totp', 'email_otp']
    });
  }
  
  next();
};
```

---

### 16. WAF (Web Application Firewall)

**File:** `middlewares/wafMiddleware.js`

**Purpose:** Pattern-based detection of common web attacks

**Implementation:**
```javascript
const wafMiddleware = (req, res, next) => {
  const patterns = [
    // SQL Injection
    { regex: /(\bunion\b.*\bselect\b|\bselect\b.*\bfrom\b)/i, 
      code: 'SQL_INJECTION' },
    // XSS
    { regex: /<script[^>]*>.*?<\/script>/i, 
      code: 'XSS_ATTEMPT' },
    // Command Injection
    { regex: /[;&|`$(){}[\]<>]/, 
      code: 'COMMAND_INJECTION' },
    // Path Traversal
    { regex: /\.\.\// | /\.\.\\/,
      code: 'PATH_TRAVERSAL' }
  ];
  
  const bodyStr = JSON.stringify(req.body);
  
  for (const pattern of patterns) {
    if (pattern.regex.test(bodyStr)) {
      logSecurityEvent('WAF_MATCH', req, { code: pattern.code });
      return res.status(403).json({
        code: 'WAF_BLOCKED',
        message: `Potentially malicious pattern detected: ${pattern.code}`
      });
    }
  }
  
  next();
};
```

---

### 17. DDoS Protection

**File:** `middlewares/ddosProtection.js`

**Purpose:** Detect and mitigate DDoS attacks

**Implementation:**
```javascript
const ddosProtectionMiddleware = (req, res, next) => {
  const clientIP = req.ip;
  const now = Date.now();
  
  // Track request patterns
  const requestKey = `ddos:${clientIP}`;
  const requests = cache.get(requestKey) || [];
  
  // Add current request
  requests.push(now);
  
  // Remove old requests (outside 1-minute window)
  const recentRequests = requests.filter(t => now - t < 60000);
  cache.set(requestKey, recentRequests, 60);
  
  // Check for DDoS pattern (>1000 requests/minute)
  if (recentRequests.length > 1000) {
    logSecurityEvent('DDOS_DETECTED', req);
    await ipBlacklistService.addToBlacklist(clientIP, '1h');
    
    return res.status(503).json({
      code: 'SERVICE_UNAVAILABLE',
      message: 'Too many requests detected'
    });
  }
  
  next();
};
```

---

### 18. Auto-Logout Detection

**File:** `middlewares/autoLogoutMiddleware.js`

**Purpose:** Detect and force logout idle sessions

**Implementation:**
```javascript
const autoLogoutMiddleware = async (req, res, next) => {
  if (!req.user) return next();
  
  const session = await AuthSession.findOne({
    userId: req.user.id,
    token: req.token
  });
  
  if (!session) {
    return res.status(401).json({
      code: 'SESSION_EXPIRED'
    });
  }
  
  // Check inactivity timeout (24 hours)
  const maxInactivity = 24 * 60 * 60 * 1000;
  if (Date.now() - session.lastActivity > maxInactivity) {
    await session.deleteOne();
    
    return res.status(401).json({
      code: 'SESSION_EXPIRED',
      message: 'Your session has expired due to inactivity'
    });
  }
  
  // Update last activity
  session.lastActivity = new Date();
  await session.save();
  
  next();
};
```

---

### 19. CSP Nonce Injection

**File:** `middlewares/cspNonceMiddleware.js`

**Purpose:** Generate and inject CSP nonce for inline scripts

**Implementation:**
```javascript
const cspNonceMiddleware = (req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;
  
  // Update CSP header with nonce
  const currentCSP = res.get('content-security-policy');
  const updatedCSP = currentCSP.replace(
    /'nonce-{nonce}'/,
    `'nonce-${nonce}'`
  );
  
  res.set('content-security-policy', updatedCSP);
  
  next();
};
```

---

### 20. Error Middleware

**File:** `middlewares/errorMiddleware.js`

**Purpose:** Global error handler for all unhandled errors

**Implementation:**
```javascript
const errorMiddleware = (error, req, res, next) => {
  const requestId = req.id || generateRequestId();
  
  // Log error with full context
  logger.error('Unhandled error', {
    requestId,
    error: error.message,
    stack: error.stack,
    userId: req.user?.id,
    endpoint: req.path,
    method: req.method,
    ip: req.ip
  });
  
  // Categorize error
  const errorResponse = categorizeError(error);
  
  // Never expose stack trace to client
  const clientResponse = {
    status: errorResponse.status,
    code: errorResponse.code,
    message: errorResponse.message,
    requestId
  };
  
  res.status(errorResponse.status).json(clientResponse);
};
```

---

## Custom Middleware Examples

### Authorization Check

```javascript
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        code: 'INSUFFICIENT_PRIVILEGE',
        required: roles,
        actual: req.user.role
      });
    }
    next();
  };
};

// Usage
app.delete('/admin/users/:id', requireRole(['admin', 'superadmin']), ...);
```

### Request Logging

```javascript
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      userId: req.user?.id
    });
  });
  
  next();
};
```

---

## Troubleshooting Middleware Issues

**Problem:** CORS errors in browser console
```
Solution: Check corsOptions.origin matches frontend URL
         Verify credentials: true is set for authenticated requests
```

**Problem:** CSRF token validation failures
```
Solution: Ensure CSRF token is sent in X-CSRF-Token header
         Check session cookie is being set
         Verify form includes _csrf in POST body
```

**Problem:** Rate limiting too aggressive
```
Solution: Adjust windowMs and max parameters
         Check keyGenerator for proper user identification
         Verify skip conditions exclude health checks
```

---

## See Also

- [Security Architecture](./SECURITY.md)
- [Error Handling](./ERROR_HANDLING.md)
- [System Architecture](./SYSTEM_ARCHITECTURE.md)
