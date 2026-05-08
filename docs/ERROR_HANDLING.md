# Error Handling Architecture

## Overview

The platform implements a comprehensive, multi-layered error handling system that ensures consistent error responses, proper logging, and graceful degradation across all components. Every error is caught, logged, categorized, and returned to the client with appropriate HTTP status codes and security-conscious error messages.

---

## Error Categories

### 1. **Validation Errors** (HTTP 400)
Errors arising from invalid user input or schema violations.

**Sources:**
- Request body validation failures
- Missing required fields
- Invalid data types
- Format violations (email, URLs, etc.)
- Constraint violations (min/max length, patterns)

**Example:**
```json
{
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Invalid request data",
  "details": {
    "email": "Email format is invalid",
    "password": "Password must be at least 12 characters"
  }
}
```

**Handled By:** `inputValidationMiddleware.js`, `express-validator`

---

### 2. **Authentication Errors** (HTTP 401)
Errors related to user authentication and JWT token issues.

**Sources:**
- Missing authentication token
- Expired JWT token
- Invalid token signature
- Malformed token
- User not authenticated

**Error Codes:**
- `UNAUTHORIZED` - No token provided
- `TOKEN_EXPIRED` - JWT expired
- `INVALID_TOKEN` - Token signature invalid
- `SESSION_EXPIRED` - Session no longer valid

**Example:**
```json
{
  "status": 401,
  "code": "TOKEN_EXPIRED",
  "message": "Your session has expired. Please log in again.",
  "retry_after": 300
}
```

**Handled By:** `authMiddleware.js`, `jwt` Library

---

### 3. **Authorization Errors** (HTTP 403)
Errors arising from insufficient permissions or privilege violations.

**Sources:**
- User lacks required role
- Attempting to access restricted resource
- Insufficient subscription tier
- API key permissions mismatch
- CSRF token validation failure

**Error Codes:**
- `FORBIDDEN` - Access denied
- `INSUFFICIENT_PRIVILEGE` - Requires admin role
- `CSRF_VALIDATION_FAILED` - CSRF token mismatch
- `MFA_REQUIRED` - Multi-factor authentication required

**Example:**
```json
{
  "status": 403,
  "code": "INSUFFICIENT_PRIVILEGE",
  "message": "You do not have permission to perform this action",
  "required_role": "admin",
  "user_role": "user"
}
```

**Handled By:** `zeroTrustMiddleware.js`, Route Authorization Logic

---

### 4. **Resource Not Found Errors** (HTTP 404)
Errors when requested resources don't exist.

**Sources:**
- User ID doesn't exist
- Test not found
- Resource deleted
- Invalid route

**Error Codes:**
- `NOT_FOUND` - Resource not found
- `USER_NOT_FOUND` - User doesn't exist
- `TEST_NOT_FOUND` - Test doesn't exist

**Example:**
```json
{
  "status": 404,
  "code": "USER_NOT_FOUND",
  "message": "User with ID abc123 not found",
  "resource_id": "abc123"
}
```

---

### 5. **Conflict Errors** (HTTP 409)
Errors from conflicting data or business logic violations.

**Sources:**
- Duplicate email registration
- Username already taken
- Test status conflict (can't edit published test)
- Session already exists
- Concurrent modification conflict

**Error Codes:**
- `DUPLICATE_EMAIL` - Email already registered
- `DUPLICATE_USERNAME` - Username taken
- `STATUS_CONFLICT` - Invalid state transition
- `CONCURRENT_MODIFICATION` - Resource modified by another request

**Example:**
```json
{
  "status": 409,
  "code": "DUPLICATE_EMAIL",
  "message": "An account with this email already exists",
  "existing_resource": {
    "id": "user123",
    "email": "user@example.com"
  }
}
```

---

### 6. **Rate Limit Errors** (HTTP 429)
Errors from exceeding rate limits or DDoS protection triggers.

**Sources:**
- Too many login attempts
- API rate limit exceeded
- Too many password reset requests
- DDoS detection threshold exceeded

**Error Codes:**
- `RATE_LIMIT_EXCEEDED` - Rate limit hit
- `TOO_MANY_LOGIN_ATTEMPTS` - Brute force detected
- `DDOS_DETECTED` - DDoS mitigation activated

**Example:**
```json
{
  "status": 429,
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again later.",
  "retry_after": 3600,
  "limit": 100,
  "window": "1 hour"
}
```

**Handled By:** `express-rate-limit`, `ddosProtection.js`

---

### 7. **Security Errors** (HTTP 403)
Errors from security middleware detecting threats.

**Sources:**
- IP spoofing detected
- Bot activity detected
- Blacklisted IP
- Replay attack detected
- WAF pattern match
- Signature verification failed
- Zero Trust score too low

**Error Codes:**
- `IP_SPOOFING_DETECTED` - X-Forwarded-For manipulation
- `BOT_DETECTED` - Automated access pattern
- `IP_BLACKLISTED` - IP address blocked
- `REPLAY_ATTACK_DETECTED` - Replay attempt
- `SIGNATURE_MISMATCH` - HMAC verification failed
- `LOW_TRUST_SCORE` - Behavioral anomaly detected

**Example:**
```json
{
  "status": 403,
  "code": "LOW_TRUST_SCORE",
  "message": "This request requires additional verification",
  "trust_score": 35,
  "minimum_required": 70,
  "mfa_required": true,
  "challenge_id": "challenge_abc123"
}
```

**Handled By:** Security Middleware Stack

---

### 8. **Server Errors** (HTTP 500)
Unexpected application errors and system failures.

**Sources:**
- Database connection failure
- Unhandled exceptions
- External service timeout
- File system errors
- Memory issues

**Error Codes:**
- `INTERNAL_SERVER_ERROR` - Generic server error
- `DATABASE_ERROR` - MongoDB operation failed
- `EMAIL_SERVICE_ERROR` - Email sending failed
- `EXTERNAL_SERVICE_ERROR` - Third-party service failed
- `CONFIGURATION_ERROR` - Invalid configuration

**Example:**
```json
{
  "status": 500,
  "code": "DATABASE_ERROR",
  "message": "An internal server error occurred",
  "request_id": "req_xyz789",
  "timestamp": "2026-05-08T10:30:00Z"
}
```

**Note:** Stack traces are never exposed to clients; request IDs allow server-side log correlation.

---

## Error Handling Pipeline

### Flow Diagram

```
Request Processing
       |
       v
Middleware Execution
       |
  _____|_____
 |           |
Error?      Continue
 |           |
 v           v
Catch Block  Controller
 |           |
 |       _____|_____
 |      |           |
 |    Error?      Response
 |      |           |
 |      v           |
 |   Catch Block     |
 |      |____________|
 |           |
 |___________|
         |
         v
Error Middleware (errorMiddleware.js)
         |
    _____|_____
   |           |
Categorize  Log Event
   |           |
   v           v
Format      Audit Trail
Response       |
   |           |
   v           v
Send to Client
```

---

## Core Error Handling Components

### 1. **Error Middleware** (`errorMiddleware.js`)

The global error handler that processes all errors thrown in the application.

**Responsibilities:**
- Catch all unhandled errors
- Error categorization and code assignment
- Stack trace logging (server-side only)
- Audit event creation
- Response formatting
- Status code determination
- Client-safe error message generation

**Key Features:**
- Prevents stack trace leakage to clients
- Distinguishes operational vs. programmer errors
- Logs full error context with request metadata
- Generates request IDs for correlation
- Implements exponential backoff retry guidance

**Example Usage:**
```javascript
// Error is thrown anywhere in the application
throw new Error('Database connection failed');

// Caught by Error Middleware
// - Logged with full context
// - Formatted for client
// - Returned with appropriate HTTP status
```

---

### 2. **Enhanced Error Handler** (`enhancedErrorHandler.js`)

Utility functions for creating standardized error objects with metadata.

**Error Object Structure:**
```javascript
{
  name: 'ValidationError',
  message: 'Invalid email format',
  code: 'VALIDATION_ERROR',
  status: 400,
  details: {},
  timestamp: new Date(),
  requestId: 'req_xyz',
  context: {
    userId: 'user123',
    endpoint: '/api/auth/login',
    method: 'POST'
  }
}
```

---

### 3. **Error Response Formatter** (`errorResponseFormatter.js`)

Formats errors into consistent JSON responses for API clients.

**Response Structure:**
```javascript
{
  status: 400,
  code: 'VALIDATION_ERROR',
  message: 'Validation failed',
  details: {
    field_errors: {},
    messages: []
  },
  request_id: 'req_xyz789',
  timestamp: '2026-05-08T10:30:00Z'
}
```

**Features:**
- Consistent response format across all endpoints
- Nested error details for multiple violations
- Request tracking via request IDs
- Secure client-friendly messages
- Timestamp for debugging

---

### 4. **Audit Logger** (`auditLogger.js`)

Logs security events and errors for compliance and debugging.

**Logged Events:**
- Authentication attempts (success/failure)
- Authorization denials
- Security policy violations
- Data access events
- Account modifications
- Error occurrences

**Log Entry Structure:**
```javascript
{
  timestamp: new Date(),
  event_type: 'AUTHENTICATION_FAILED',
  user_id: 'user123',
  ip_address: '192.168.1.100',
  endpoint: '/api/auth/login',
  status_code: 401,
  details: {
    reason: 'Invalid password',
    attempt_count: 3
  },
  request_id: 'req_xyz789'
}
```

---

## Specific Error Handling Scenarios

### Scenario 1: Failed Login Attempt

```
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "wrong_password"
}
     |
     v
Input Validation (PASS)
     |
     v
Rate Limit Check (PASS)
     |
     v
IP Blacklist Check (PASS)
     |
     v
authController.login()
     |
     v
Database Query (User Found)
     |
     v
Password Verification (FAIL)
     |
     v
loginAttemptService.recordFailedAttempt()
     |
     v
Audit Logging (Failed Login)
     |
     v
Error Response:
{
  "status": 401,
  "code": "INVALID_CREDENTIALS",
  "message": "Email or password is incorrect",
  "attempts_remaining": 4
}
```

### Scenario 2: MFA Challenge Required

```
POST /api/v1/auth/login (Low Trust Score)
     |
     v
Authentication SUCCESS
     |
     v
Zero Trust Middleware (Trust Score < 70)
     |
     v
MFA Challenge Required
     |
     v
zeroTrustService.createChallenge()
     |
     v
Response:
{
  "status": 403,
  "code": "MFA_REQUIRED",
  "message": "Additional verification required",
  "challenge_id": "challenge_abc123",
  "methods": ["totp", "otp_email"],
  "expires_in": 600
}
```

### Scenario 3: Zero Trust Threat Detection

```
Request with Suspicious Behavior
     |
     v
IP Spoofing Detection (TRIGGERED)
     |
     v
Error:
{
  "status": 403,
  "code": "IP_SPOOFING_DETECTED",
  "message": "Unusual request pattern detected",
  "block_duration": 3600
}
     |
     v
Audit Log Entry:
- Event: IP_SPOOFING_DETECTED
- User ID: user123
- IP Address: 192.168.1.100
- X-Forwarded-For: 10.0.0.1 (MISMATCH)
- Block Duration: 3600 seconds
```

---

## Error Recovery & Retry Strategies

### Client-Side Retry Logic

```javascript
// Exponential Backoff Retry
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 || error.status === 503) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }
};
```

### Idempotency for Safe Retries

```javascript
// POST requests should be idempotent
const createUser = async (userData) => {
  const idempotencyKey = generateKey(userData);
  const cached = cache.get(idempotencyKey);
  
  if (cached) return cached.result;
  
  const result = await db.users.create(userData);
  cache.set(idempotencyKey, { result }, 3600); // 1 hour
  return result;
};
```

---

## Error Monitoring & Alerts

### Error Tracking Metrics

- **Error Rate**: Errors per minute by endpoint
- **Error Types**: Distribution of error categories
- **Response Times**: P50, P95, P99 latencies
- **Success Rate**: Percentage of successful requests
- **Authentication Failures**: Failed login attempts
- **Security Events**: Detected threats and blocks

### Alert Triggers

- Error rate > 5% for any endpoint
- Database unavailability
- Memory/CPU > 90%
- Authentication failure spike
- Security threat detected
- External service timeout

---

## Best Practices

### For Developers

1. **Always Catch Errors**
   ```javascript
   try {
     const user = await User.findById(id);
   } catch (error) {
     throw new AppError('USER_NOT_FOUND', 404, 'User not found');
   }
   ```

2. **Include Context**
   ```javascript
   const error = new Error('Database operation failed');
   error.context = { userId, operation: 'findById' };
   throw error;
   ```

3. **Use Meaningful Error Codes**
   ```javascript
   // Good
   throw new Error('INVALID_EMAIL_FORMAT');
   
   // Bad
   throw new Error('error');
   ```

4. **Log Before Throwing**
   ```javascript
   logger.error('Operation failed', {
     context: { userId, action },
     error: err.message
   });
   throw err;
   ```

### For Clients

1. **Always Handle Error Responses**
   ```javascript
   try {
     const response = await api.post('/auth/login', credentials);
   } catch (error) {
     if (error.response?.status === 429) {
       // Handle rate limit
     } else if (error.response?.status === 401) {
       // Handle authentication error
     }
   }
   ```

2. **Implement Exponential Backoff**
   ```javascript
   const delay = Math.pow(2, retryCount) * 1000;
   ```

3. **Use Request IDs for Support**
   ```javascript
   console.error('Request failed', error.response?.data?.request_id);
   // Use request_id to find logs in audit trail
   ```

---

## Error Documentation Reference

See specific middleware documentation for detailed error handling:

- [Authentication Middleware](./MIDDLEWARE.md#authentication-middleware)
- [Zero Trust Middleware](./MIDDLEWARE.md#zero-trust-middleware)
- [Security Middleware](./MIDDLEWARE.md#security-middleware)
- [Input Validation](./MIDDLEWARE.md#input-validation-middleware)
- [Security & Incident Response](./SECURITY.md)
