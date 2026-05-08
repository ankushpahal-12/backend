# System Architecture

## Overview

The Online Assessment and Test Management Platform follows a modern, layered architecture pattern with clear separation of concerns. The system is designed for scalability, security, and maintainability.

---

## Architecture Diagram

```
                          CLIENT LAYER
                         (Port 3000)
                              |
                              |
                         Nginx Proxy
                    (Reverse Proxy & Load Balancer)
                    - TLS/SSL Termination
                    - WebSocket Upgrade
                    - Request Routing
                              |
                 _____________|_____________
                |                           |
         HTTP/REST API                 WebSocket Channel
         (Port 8000)                   (Real-time Events)
                |                           |
        ________|_________          ________|________
       |                  |        |                 |
   Express.js        Socket.IO    Socket.IO      Logging
   HTTP Server       Real-time    Handler        Middleware
                     Events                           |
       |                                          Event
  _____|_________                                 Emission
 |               |
API Routes      Controllers
- /api/auth     - authController
- /api/admin    - adminController
- /api/users    - userController
- /api/tests    - testController
- /api/sessions - sessionController
- /api/tokens   - tokenController
- /api/2fa      - twoFactorController
- /api/privacy  - dataPrivacyController
- /api/trust    - zeroTrustController

            |
    ________|_______
   |                |
Middlewares      Logging
- Auth             Middleware
- CSRF             - Morgan (HTTP)
- Zero Trust       - Audit Logger
- IP Blacklist     - Security
- Bot Detection    - Events
- WAF
- DDoS Protection
- Rate Limiting
- Input Validation
- CSP Nonce
- Signature
- Replay Attack
- IP Spoofing
- Auto Logout
- Reverse Proxy
- API Version
- Error Handler
- CORS

            |
    ________|________
   |                 |
Database         External Services
MongoDB          - Email Service
- Users          - OAuth Providers
- Sessions       - Web3 Providers
- Tests          - Payment Gateways
- Responses
- Audit Logs
- IP Blacklist
- Device Stores
- Behavior Stores
```

---

## Layered Architecture

### 1. **Presentation Layer (Frontend)**
- React 18+ with TypeScript
- Vite Build Tool
- Tailwind CSS Styling
- Socket.IO Client for Real-time Updates
- Axios for HTTP Requests

**Key Responsibilities:**
- User Interface Rendering
- Form Handling and Validation
- Client-side State Management
- Real-time Event Handling
- User Session Management

---

### 2. **API Gateway & Reverse Proxy Layer (Nginx)**
- Single Entry Point for All Traffic
- TLS/SSL Termination
- WebSocket Upgrade Handling
- Request Routing to Backend Services
- Load Balancing
- Response Compression
- Static Asset Serving

**Key Responsibilities:**
- Traffic Routing and Distribution
- Protocol Upgrades (HTTP → WebSocket)
- Security Headers Injection
- Request Rate Limiting
- IP Whitelisting/Blocking

---

### 3. **Application Layer (Express.js Backend)**

#### 3.1 Entry Points
- **HTTP/REST API** (Port 8000)
  - Request Handlers
  - Response Formatting
  - Status Code Management

- **WebSocket Real-time Channel** (Port 8000)
  - Bidirectional Communication
  - Event Emission
  - Session Synchronization

#### 3.2 Global Middleware Stack
Executed in sequential order for every request:

```
Request Entry
    |
    v
CORS Middleware
    |
    v
Logging Middleware (Morgan)
    |
    v
Request Parsing (JSON, URL-encoded)
    |
    v
Cookie Parser
    |
    v
Helmet Security Headers
    |
    v
Rate Limiting (express-rate-limit)
    |
    v
Input Validation Middleware
    |
    v
Bot Detection Middleware
    |
    v
IP Spoofing Detection Middleware
    |
    v
IP Blacklist Enforcement
    |
    v
Reverse Proxy Validation
    |
    v
API Version Routing
    |
    v
HMAC Signature Verification
    |
    v
CSRF Token Validation
    |
    v
Authentication Middleware (JWT)
    |
    v
Zero Trust Middleware (Trust Score)
    |
    v
Replay Attack Prevention
    |
    v
Web Application Firewall (WAF)
    |
    v
DDoS Protection
    |
    v
Auto Logout Check
    |
    v
CSP Nonce Injection
    |
    v
Route Handlers / Controllers
    |
    v
Error Middleware (Global Error Handler)
    |
    v
Response Sent
```

#### 3.3 Controllers & Business Logic

**Authentication Controller** (`authController.js`)
- User Registration Flow
- Email Verification (OTP)
- Login with Credentials
- Google OAuth 2.0 Integration
- Password Reset Workflow
- Token Generation

**User Controller** (`userController.js`)
- Profile Retrieval
- Profile Updates
- Preferences Management
- Subscription Information
- Account Settings

**Admin Controller** (`adminController.js`)
- User Management Operations
- Test Management Workflows
- Subscription Administration
- System Configuration
- Audit Trail Queries

**Token Controller** (`tokenController.js`)
- Token Refresh Operations
- Token Rotation
- Token Revocation
- Expiry Validation

**Session Controller** (`sessionController.js`)
- Active Session Listing
- Session Termination
- Device Management
- Cross-device Logout

**Two-Factor Controller** (`twoFactorController.js`)
- TOTP Secret Generation
- QR Code Provisioning
- TOTP Verification
- Backup Codes Management
- OTP Validation

**Data Privacy Controller** (`dataPrivacyController.js`)
- GDPR Data Export
- Account Deletion
- Data Retention Policies
- Privacy Compliance

**Zero Trust Controller** (`zeroTrustController.js`)
- Trust Score Computation
- Device Fingerprinting
- Behavioral Analysis
- Risk Assessment
- Challenge Issuance

#### 3.4 Routes & Endpoints

**Authentication Routes** (`/api/v1/auth`)
- POST `/register` - User Registration
- POST `/login` - Authentication
- POST `/verify-email` - Email Verification
- POST `/refresh` - Token Refresh
- POST `/logout` - Session Termination
- POST `/forgot-password` - Password Reset Initiation
- POST `/reset-password` - Password Reset Completion
- POST `/oauth/google` - Google OAuth Handler

**User Routes** (`/api/v1/users`)
- GET `/profile` - Current User Profile
- PUT `/profile` - Update Profile
- GET `/subscriptions` - User Subscriptions
- GET `/preferences` - User Preferences
- PUT `/preferences` - Update Preferences

**Admin Routes** (`/api/v1/admin`)
- GET `/users` - List All Users
- GET `/users/:id` - User Details
- PUT `/users/:id` - Update User
- DELETE `/users/:id` - Deactivate User
- GET `/tests` - List Tests
- POST `/tests` - Create Test
- GET `/audit-logs` - Audit Trail

**Session Routes** (`/api/v1/sessions`)
- GET `/active` - Active Sessions List
- DELETE `/:id` - Terminate Session
- GET `/devices` - Device Management

**Token Routes** (`/api/v1/tokens`)
- POST `/refresh` - Refresh JWT Token
- POST `/revoke` - Revoke Token

**Security Routes** (`/api/v1/security`)
- POST `/2fa/setup` - TOTP Setup
- POST `/2fa/verify` - Verify TOTP
- GET `/trust-score` - Current Trust Score
- POST `/mfa-challenge` - Challenge Response

---

### 4. **Database Layer**

**MongoDB Collections:**

- **users** - User Accounts & Credentials
- **authSessions** - Active Session Tracking
- **loginAttempts** - Failed Login Records
- **apiKeys** - API Key Management
- **ipBlacklist** - Blocked IP Addresses
- **deviceStore** - Device Fingerprints
- **behaviorStore** - Behavioral Patterns
- **mfaChallenges** - MFA Challenge State
- **emailVerificationOTPs** - Verification Codes
- **auditLogs** - Security Audit Trail
- **tests** - Test/Assessment Content
- **questions** - Test Questions
- **submissions** - User Test Responses
- **subscriptions** - User Subscriptions

---

### 5. **Security Layer**

**Authentication & Authorization:**
- JWT Token-based Authentication
- OAuth 2.0 Social Login
- Multi-Factor Authentication (TOTP + OTP)
- Zero Trust Architecture
- Role-based Access Control (RBAC)

**Data Protection:**
- bcryptjs Password Hashing
- HMAC Request Signing
- Encrypted Session Tokens
- CSRF Token Validation
- Content Security Policy (CSP)

**Threat Detection:**
- IP Spoofing Detection
- Bot Detection Engine
- Replay Attack Prevention
- DDoS Mitigation
- Behavioral Anomaly Detection
- Brute Force Protection

---

### 6. **External Services Integration**

**Email Service**
- Email Delivery for Verification
- Password Reset Notifications
- Alert Notifications

**OAuth Providers**
- Google Authentication
- Account Linking
- Profile Synchronization

**Payment Gateway** (Optional)
- Subscription Processing
- Payment Validation
- Webhook Handling

---

## Data Flow

### Authentication Flow

```
User Credentials
       |
       v
POST /api/v1/auth/login
       |
       v
Input Validation Middleware
       |
       v
Rate Limiting Check
       |
       v
IP Blacklist Check
       |
       v
Bot Detection
       |
       v
authController.login()
       |
       v
Database Query (User Lookup)
       |
       v
Password Verification (bcryptjs)
       |
       v
Zero Trust Scoring
       |
       v
MFA Required?
    |       |
   YES     NO
    |       |
    v       v
  MFA   Generate JWT
 Flow   Access Token
        Refresh Token
        CSRF Token
    |
    v
Create Auth Session
    |
    v
Log Audit Event
    |
    v
Return Response
```

### WebSocket Real-time Flow

```
Client Socket Connection
       |
       v
Nginx WebSocket Upgrade
       |
       v
Socket.IO Server Accepts
       |
       v
Authentication Check
       |
       v
User Session Hydration
       |
       v
Join User Room
       |
       v
Event Listeners Ready
       |
       v
Application Events
   - Session Timeout
   - Security Alert
   - Notification
   - Cross-device Logout
   - Real-time Updates
       |
       v
Emit to Client
       |
       v
Client Receives Event
```

---

## Security Pipeline

Every request passes through layered security middleware:

```
1. CORS Validation
2. Rate Limiting
3. Request Parsing
4. Helmet Headers
5. Bot Detection
6. IP Validation
7. Signature Verification
8. CSRF Validation
9. JWT Verification
10. Zero Trust Scoring
11. Replay Attack Check
12. WAF Pattern Matching
13. DDoS Detection
14. Auto-Logout Detection
15. Route Authorization
```

---

## Deployment Architecture

```
Source Code (GitHub)
       |
       v
Docker Build Process
       |
       v
Backend Image    Frontend Image
       |                |
       |________________|
              |
              v
        Docker Registry
              |
              v
        Render Platform
              |
       _______|_______
      |               |
   Backend      Frontend
   Container    Container
      |               |
      |_______|_______|
              |
              v
        Nginx Container
        (Reverse Proxy)
              |
              v
        Public Internet
```

---

## Scalability Considerations

- **Horizontal Scaling**: Nginx Load Balancing for Multiple Backend Instances
- **Session Persistence**: MongoDB for Distributed Session Storage
- **Database Indexing**: Optimized Queries for High Concurrency
- **Caching Layer**: Redis Integration Ready (See guides/REDIS_CACHING_GUIDE.js)
- **WebSocket Clusters**: Socket.IO Adapter Support for Multiple Instances
- **Rate Limiting**: Dynamic Rate Limit Configuration
- **Async Processing**: Non-blocking I/O with Node.js Event Loop

---

## Monitoring & Observability

- **Request Logging**: Morgan HTTP Logger
- **Audit Trail**: Comprehensive Security Event Logging
- **Error Tracking**: Centralized Error Handler
- **Performance Metrics**: Response Time Monitoring
- **Health Checks**: /api/health Endpoint
- **Database Monitoring**: Mongoose Query Logging

---

## See Also

- [Error Handling Guide](./ERROR_HANDLING.md)
- [Security Architecture](./SECURITY.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema](./DATABASE.md)
- [Middleware Documentation](./MIDDLEWARE.md)
