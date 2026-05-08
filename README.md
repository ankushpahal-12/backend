# Online Assessment and Test Management Platform

## Overview

The Online Assessment and Test Management Platform is a full-stack, production-grade web application designed to enable organizations, educators, and administrators to create, manage, distribute, and evaluate assessments and tests at scale. The platform provides a complete end-to-end test lifecycle — from drafting and publishing test content to tracking user performance, managing subscriptions, and monitoring platform activity through a dedicated administration panel.

The system is built as a monorepo containing two independent but tightly integrated applications: a React and TypeScript single-page application on the frontend, and a Node.js REST API on the backend. These two layers are orchestrated together through Docker Compose for local development and deployed to cloud infrastructure via Render. A dedicated Nginx reverse proxy handles traffic routing, WebSocket upgrade for real-time communication, and serves as the single entry point for all client traffic.

What sets this platform apart from a basic test-taking application is its security-first engineering philosophy. The authentication and authorization system is enterprise-grade, implementing Zero Trust Architecture, multi-factor authentication, CSRF protection, HMAC request signing, IP spoofing detection, bot detection, behavioral anomaly monitoring, replay attack prevention, and a full audit logging pipeline. Security is not an add-on layer — it is embedded into every tier of the stack from the database schema through to the HTTP response headers returned on each request.

## Technology Stack

### Backend Skills & Technologies
- **Runtime**: Node.js with ES6 Modules
- **Framework**: Express.js v5.2.1
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, OAuth 2.0, TOTP, OTP
- **Real-Time Communication**: Socket.IO v4.8.3
- **Security**: Helmet.js, Express Rate Limit, HMAC Signing
- **Validation**: Express Validator, Zod Schema Validation
- **Crypto**: bcryptjs, ethers.js v6.16.0
- **Email**: Nodemailer v8.0.1
- **Utilities**: Morgan Logging, CORS, Cookie Parser, HPP

### Frontend Skills & Technologies
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite with Hot Module Replacement
- **Styling**: Tailwind CSS v4
- **State Management**: Redux/Context API
- **HTTP Client**: Axios
- **Real-Time**: Socket.IO Client
- **Code Quality**: ESLint Configuration

### Infrastructure & DevOps
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx with TLS Support
- **Reverse Proxy**: Nginx Proxy with WebSocket Support
- **Deployment**: Render Cloud Platform
- **IaC**: Docker Compose, render.yaml Configuration

---

---

## Core Capabilities

### Test and Assessment Management

Administrators can create tests in draft state, refine content, and publish when ready. The platform supports categorization of tests, viewing all active tests, managing draft tests, and archiving completed assessments. A dedicated admin sidebar provides navigation to all test management areas including All Tests, Draft Tests, and the Create Test workflow.

### User Authentication and Identity

The platform implements a complete, hardened authentication system supporting standard email and password registration, Google OAuth 2.0 social login, email OTP-based account verification, TOTP two-factor authentication with QR code provisioning, password reset via secure email links, and automated refresh token rotation. Every authentication event is logged in the audit trail.

### Practice Module

Authenticated users have access to a practice section where they can attempt tests in a non-evaluated mode. The active test interface includes a test header, question card display, an interactive options selection system, and a question navigation palette for jumping between questions and tracking completion status.

### AI Insights

The platform includes an AI-powered insights module that surfaces learning patterns, performance trends, and personalized recommendations to users based on their test history and engagement metrics.

### Notes and Study Tools

Users can create, manage, and organize study notes within the platform, providing an integrated study environment alongside the test-taking experience.

### Subscription and Pricing Management

The platform operates a subscription model with tiered pricing plans. A dedicated subscription management system handles plan assignment, user upgrades, coupon redemption, and subscription lifecycle tracking. The admin panel includes comprehensive tools for managing subscriptions and monitoring plan health.

### Real-Time Communication

Socket.IO provides real-time bidirectional communication for events such as session timeout warnings, suspicious activity alerts, live notifications, and cross-session synchronization when a user logs in or out on another device.

### Administration Panel

Administrators access a fully separate portal with its own authentication flow. The admin panel provides user management, test management, subscription oversight, security monitoring dashboards, audit log review, and system configuration controls.

### Zero Trust Security Enforcement

Every sensitive request is evaluated against a dynamically computed trust score derived from device fingerprint, behavioral patterns, IP reputation, geographic consistency, and session history. Requests that fall below the trust threshold are stepped up with an MFA challenge before access is granted.

---

## Repository Structure

```
project-root/
├── backend/                          Node.js Express API server
│   ├── config/
│   │   ├── config.js                 Centralized configuration with startup validation
│   │   ├── db.js                     MongoDB connection factory
│   │   ├── constants.js              Application-wide constants and enumerations
│   │   ├── indexes.js                MongoDB index definitions for performance
│   │   ├── secretsManager.js         Secure secrets retrieval abstraction
│   │   └── web3.js                   Ethereum provider configuration
│   ├── controllers/
│   │   ├── authController.js         Authentication flows (login, register, MFA, OAuth)
│   │   ├── adminController.js        Admin operations and user management
│   │   ├── userController.js         User profile and settings operations
│   │   ├── tokenController.js        Token refresh, rotation, and revocation
│   │   ├── sessionController.js      Session inspection and termination
│   │   ├── twoFactorController.js    2FA setup and verification flows
│   │   ├── dataPrivacyController.js  GDPR data export and account deletion
│   │   └── zeroTrustController.js    Device trust and behavioral scoring endpoints
│   ├── middlewares/
│   │   ├── authMiddleware.js         JWT token verification and user hydration
│   │   ├── csrfMiddleware.js         CSRF token generation and validation
│   │   ├── zeroTrustMiddleware.js    Zero Trust scoring and decision enforcement
│   │   ├── reverseProxyMiddleware.js Proxy validation, header obfuscation, bypass blocking
│   │   ├── ipBlacklistMiddleware.js  Real-time IP blacklist enforcement
│   │   ├── ipSpoofingDetectionMiddleware.js  X-Forwarded-For manipulation detection
│   │   ├── signatureMiddleware.js    HMAC request body signature verification
│   │   ├── wafMiddleware.js          Web Application Firewall pattern matching
│   │   ├── ddosProtection.js         DDoS mitigation and traffic shaping
│   │   ├── botDetectionMiddleware.js Automated bot and scraper detection
│   │   ├── replayAttackMiddleware.js Request nonce and timestamp replay prevention
│   │   ├── inputValidationMiddleware.js  Schema-based input validation
│   │   ├── cspNonceMiddleware.js     Content Security Policy nonce injection
│   │   ├── autoLogoutMiddleware.js   Idle session detection and forced logout
│   │   ├── apiVersionMiddleware.js   API version routing and deprecation handling
│   │   └── errorMiddleware.js        Global error handler and stack trace suppression
│   ├── models/
│   │   ├── User.js                   Core user schema with roles and security fields
│   │   ├── AuthSession.js            Active session tracking per device
│   │   ├── LoginAttempt.js           Failed login tracking for lockout enforcement
│   │   ├── ApiKey.js                 API key management for service integrations
│   │   ├── IpBlacklist.js            Persisted IP block list with expiry
│   │   ├── DeviceStore.js            Device fingerprint registry and trust records
│   │   ├── BehaviorStore.js          Per-user behavioral baseline and anomaly scores
│   │   ├── MFAChallenge.js           In-flight MFA challenge state
│   │   └── EmailVerificationOTP.js   Time-limited OTP records for email verification
│   ├── routes/
│   │   ├── authRoutes.js             Authentication endpoint definitions
│   │   ├── userRoutes.js             User profile and settings endpoints
│   │   ├── adminRoutes.js            Admin-only management endpoints
│   │   ├── securityRoutes.js         Security events and telemetry endpoints
│   │   ├── zeroTrustRoutes.js        Device trust and session management endpoints
│   │   └── privacyRoutes.js          Data privacy and GDPR compliance endpoints
│   ├── services/
│   │   ├── authService.js            Authentication business logic and token issuance
│   │   ├── zeroTrustService.js       Trust score computation and device evaluation
│   │   ├── refreshTokenService.js    Refresh token storage, rotation, and revocation
│   │   ├── loginAttemptService.js    Brute force detection and account lockout logic
│   │   ├── incidentResponseService.js  Automated incident detection and response
│   │   ├── securityMonitoringService.js  Real-time anomaly monitoring
│   │   ├── apiKeyRotationService.js  Scheduled API key rotation management
│   │   └── container.js             Dependency injection container for service wiring
│   ├── utils/
│   │   ├── auditLogger.js            Structured security event audit logging
│   │   ├── emailService.js           Transactional email composition and delivery
│   │   ├── fieldEncryption.js        AES field-level encryption for sensitive data
│   │   ├── logMasking.js             PII masking in log output
│   │   ├── logger.js                 Structured application logger
│   │   ├── otpUtils.js               OTP generation and secure comparison
│   │   ├── paginationUtils.js        Cursor and offset pagination helpers
│   │   ├── validationSchemas.js      Zod validation schema definitions
│   │   └── errorUtils.js             Custom AppError class
│   ├── app.js                        Express application factory and middleware pipeline
│   ├── server.js                     HTTP server bootstrap with graceful shutdown
│   └── socket.js                     Socket.IO initialization and event handlers
│
├── frontend/                         React 18 + TypeScript SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/                 Login, register, and MFA UI components
│   │   │   ├── admin/                Admin panel layout and navigation components
│   │   │   ├── landing/              Public landing page sections
│   │   │   ├── common/               Shared UI elements (buttons, inputs, modals)
│   │   │   ├── layouts/              Page layout wrappers and shell components
│   │   │   ├── ui/                   Low-level design system primitives
│   │   │   ├── ZeroTrust/            Zero Trust UI overlays and challenge modals
│   │   │   ├── SessionTimeoutWarning.tsx   Idle session countdown dialog
│   │   │   └── SuspiciousActivityAlert.tsx  Real-time threat notification banner
│   │   ├── context/
│   │   │   ├── AuthContext.tsx        Global authentication state provider
│   │   │   ├── SocketContext.tsx      Socket.IO connection lifecycle manager
│   │   │   ├── ThemeContext.tsx       Dark/light theme state provider
│   │   │   ├── LoadingContext.tsx     Global loading state coordinator
│   │   │   └── NotificationContext.tsx  Toast notification queue manager
│   │   ├── hooks/                    23 custom hooks covering all platform concerns
│   │   │   ├── useLogin.ts           Login form logic with MFA step handling
│   │   │   ├── useSignup.ts          Registration form with email availability check
│   │   │   ├── useVerify.ts          Email OTP verification flow
│   │   │   ├── useCSRFToken.ts       CSRF token fetching, caching, and rotation
│   │   │   ├── useZeroTrust.ts       Client-side trust score evaluation
│   │   │   ├── useAutoLogout.ts      Idle timer management and logout dispatch
│   │   │   ├── useTokenRefresh.ts    Silent access token refresh scheduling
│   │   │   ├── useSecurityMonitoring.ts  Real-time security event subscription
│   │   │   ├── useTwoFactor.ts       2FA setup and verification interaction
│   │   │   ├── useInteractionMetrics.ts  Behavioral telemetry collection
│   │   │   └── ...13 additional specialized hooks
│   │   ├── pages/
│   │   │   ├── auth/                 Login, Register, VerifyEmail, ForgotPassword,
│   │   │   │                         ResetPassword, TwoFactorSetup
│   │   │   ├── user/                 Dashboard, Profile, AIInsights, Notes,
│   │   │   │                         Practise, Pricing, UserSettings
│   │   │   ├── admin/                AdminDashboard, AdminLogin, AdminSettings,
│   │   │   │                         and all test/subscription management pages
│   │   │   └── public/               Landing, PrivacyPolicy, TermsOfService, NotFound
│   │   ├── services/
│   │   │   ├── api.ts                Axios instance with interceptors and auth headers
│   │   │   ├── authService.ts        Auth API call wrappers
│   │   │   ├── dataService.ts        Platform data API call wrappers
│   │   │   ├── securityService.ts    Security telemetry submission service
│   │   │   └── googleAuth.ts         Google OAuth token exchange helper
│   │   └── utils/
│   │       ├── api.ts                Request builder with CSRF and signature injection
│   │       ├── sanitize.ts           DOMPurify-based HTML and input sanitization
│   │       ├── secureStorage.ts      Encrypted localStorage abstraction
│   │       ├── securityGuard.ts      Client-side security policy enforcement
│   │       ├── pageSecurity.ts       Page-level visibility and focus security hooks
│   │       ├── cspNonce.ts           CSP nonce extraction and injection helper
│   │       ├── errorHandler.ts       Centralized API error normalization
│   │       └── web3Config.ts         Ethereum provider and wallet connection utilities
│   └── vite.config.ts                Vite build and dev proxy configuration
│
├── docs/
│   ├── ARCHITECTURE.md               Complete system architecture reference
│   └── WORKFLOW.md                   End-to-end request and user workflow documentation
│
├── docker-compose.yml                Docker orchestration for all four services
├── nginx.conf                        Nginx HTTP reverse proxy configuration
├── nginx.tls.conf                    Nginx HTTPS/TLS configuration for production
└── render.yaml                       Render cloud deployment service definition
```

---

## Technology Stack

### Backend

| Category | Technology | Version |
|---|---|---|
| Runtime | Node.js (ESM modules) | 20+ |
| Framework | Express.js | v5 |
| Database | MongoDB | 7 |
| ODM | Mongoose | v9 |
| Authentication | jsonwebtoken + bcryptjs | Latest |
| Two-Factor Auth | speakeasy + qrcode | Latest |
| OAuth | google-auth-library | v10 |
| Real-Time | Socket.IO | v4 |
| Email | Nodemailer | v8 |
| Web3 | ethers.js | v6 |
| Input Validation | express-validator + zod | Latest |
| Rate Limiting | express-rate-limit | v8 |
| Security Headers | helmet | v8 |
| Injection Prevention | express-mongo-sanitize + xss-clean | Latest |
| Parameter Pollution | hpp | Latest |
| Dev Tooling | nodemon | Latest |

### Frontend

| Category | Technology | Version |
|---|---|---|
| Framework | React | 18 |
| Language | TypeScript | 5 |
| Build Tool | Vite | 5 |
| Styling | Tailwind CSS | v4 |
| Component Library | Chakra UI + MUI | Latest |
| Animations | Framer Motion + Lenis | Latest |
| Charts | Recharts | v3 |
| Forms | React Hook Form + Zod | Latest |
| Routing | React Router DOM | v7 |
| HTTP Client | Axios | Latest |
| Real-Time | Socket.IO Client | v4 |
| Sanitization | DOMPurify | Latest |
| Web3 | ethers.js | v6 |
| Notifications | React Hot Toast + React Toastify | Latest |

### Infrastructure

| Category | Technology |
|---|---|
| Containerization | Docker + Docker Compose |
| Reverse Proxy | Nginx 1.27 Alpine |
| Cloud Platform | Render |
| Process Manager | Native Node.js with signal handling |

---

## Documentation

Complete technical documentation is available in the `docs/` directory. Start here based on your role:

### Quick Links by Role

**Backend Developer**
- [System Architecture](./docs/SYSTEM_ARCHITECTURE.md) — Understand the overall system design
- [Middleware Documentation](./docs/MIDDLEWARE.md) — Learn request processing pipeline
- [API Documentation](./docs/API_DOCUMENTATION.md) — Build and integrate endpoints
- [Database Schema](./docs/DATABASE.md) — Data models and queries

**Frontend Developer**
- [System Architecture](./docs/SYSTEM_ARCHITECTURE.md) — Understand the overall system design
- [API Documentation](./docs/API_DOCUMENTATION.md) — Consume REST and WebSocket APIs
- [Security Architecture](./docs/SECURITY.md) — Implement security on frontend

**DevOps / Operations**
- [Deployment Guide](./docs/DEPLOYMENT.md) — Deploy to local, staging, production
- [System Architecture](./docs/SYSTEM_ARCHITECTURE.md) — Infrastructure requirements
- [Security Architecture](./docs/SECURITY.md) — Security configuration

**Security Architect**
- [Security Architecture](./docs/SECURITY.md) — Complete security overview
- [Middleware Documentation](./docs/MIDDLEWARE.md) — Security middleware details
- [Error Handling](./docs/ERROR_HANDLING.md) — Security event logging

**Contributor**
- [Contributing Guidelines](./docs/CONTRIBUTING.md) — Development workflow and code standards
- [System Architecture](./docs/SYSTEM_ARCHITECTURE.md) — Project overview

### All Documentation Files

1. **[SYSTEM_ARCHITECTURE.md](./docs/SYSTEM_ARCHITECTURE.md)**
   - Architecture layers and components
   - Request flow diagrams
   - Middleware execution pipeline
   - Security architecture
   - Database design
   - Scalability strategy

2. **[API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)**
   - Complete REST API reference
   - All endpoints with examples
   - WebSocket events
   - Error responses
   - Rate limiting policies
   - Authentication requirements

3. **[ERROR_HANDLING.md](./docs/ERROR_HANDLING.md)**
   - Error categories and codes
   - Error response formats
   - Handling pipeline
   - Recovery strategies
   - Monitoring and alerts
   - Troubleshooting guide

4. **[SECURITY.md](./docs/SECURITY.md)**
   - Authentication systems (JWT, OAuth 2.0, TOTP, OTP)
   - Authorization and RBAC
   - Zero Trust Architecture
   - Threat detection and prevention
   - Data protection (encryption, signing)
   - Compliance standards

5. **[MIDDLEWARE.md](./docs/MIDDLEWARE.md)**
   - 20+ middleware functions
   - Execution order
   - Configuration examples
   - Implementation details
   - Troubleshooting tips

6. **[DATABASE.md](./docs/DATABASE.md)**
   - 10 MongoDB collections
   - Complete schema definitions
   - Indexing strategy
   - Query patterns
   - Data retention policies
   - Backup and recovery

7. **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)**
   - Local development setup
   - Staging deployment
   - Production deployment
   - CI/CD pipeline
   - Monitoring and scaling
   - Rollback procedures

8. **[CONTRIBUTING.md](./docs/CONTRIBUTING.md)**
   - Getting started guide
   - Development workflow
   - Code style guidelines
   - Pull request process
   - Testing requirements
   - Security considerations

9. **[Documentation Index](./docs/README.md)**
   - Navigation guide
   - Role-based quick links
   - Common tasks reference
   - Technology stack summary

---

## Getting Started

### I want to...

**Understand the system architecture**
→ Read [System Architecture](./docs/SYSTEM_ARCHITECTURE.md) for complete system design with architecture diagrams

**Start local development**
→ Follow [Deployment Guide - Local Section](./docs/DEPLOYMENT.md#local-development-deployment) for setup instructions

**Deploy to production**
→ Follow [Deployment Guide - Production Section](./docs/DEPLOYMENT.md#production-deployment-render-ha) for deployment steps

**Build an API endpoint**
→ See [API Documentation](./docs/API_DOCUMENTATION.md) for endpoint patterns and [System Architecture](./docs/SYSTEM_ARCHITECTURE.md) for controller placement

**Add security features**
→ Read [Security Architecture](./docs/SECURITY.md) for all security implementations and [Middleware Documentation](./docs/MIDDLEWARE.md) for security middleware

**Debug an issue**
→ Check [Error Handling](./docs/ERROR_HANDLING.md) for error codes and [Middleware Documentation](./docs/MIDDLEWARE.md) for request processing

**Understand the database**
→ See [Database Schema](./docs/DATABASE.md) for complete collection definitions and query examples

**Contribute to the project**
→ Follow [Contributing Guidelines](./docs/CONTRIBUTING.md) for development workflow and code standards

**Optimize performance**
→ Review [System Architecture](./docs/SYSTEM_ARCHITECTURE.md#scalability-considerations) and [Database Schema](./docs/DATABASE.md#query-patterns--performance) for optimization tips

---

## Local Development

### Without Docker

**Backend:**

```bash
cd backend
cp .env.example .env
# Configure all required environment variables
npm install
npm run dev
# API available at http://localhost:5000
```

**Frontend:**

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000
npm install
npm run dev
# UI available at http://localhost:5173
```

### With Docker Compose

```bash
cp .env.example .env
# Set VITE_API_URL, VITE_SOCKET_URL, VITE_GOOGLE_CLIENT_ID
docker compose up --build
# Full stack available at http://localhost:80
```

The Docker Compose setup starts four services: MongoDB, the backend API, the frontend static server, and Nginx as the reverse proxy.

---

## Environment Variables

All secrets are managed through `.env` files and are never committed to source control. The backend performs strict startup validation and will refuse to boot if any required variable is missing or contains an insecure placeholder value in production mode.

Key variables required for server startup:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Access token signing secret (minimum 32 characters) |
| `JWT_REFRESH_SECRET` | Refresh token signing secret (minimum 32 characters) |
| `HMAC_SECRET` | HMAC request signature secret |
| `INTERNAL_SERVICE_SECRET` | Internal service-to-service authentication secret |
| `EMAIL_USER` | SMTP authentication username |
| `EMAIL_PASS` | SMTP authentication password |
| `ALLOWED_ORIGINS` | Comma-separated list of permitted CORS origins |
| `FRONTEND_URL` | Public URL of the frontend application |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 client identifier |

Refer to `backend/.env.example` for a complete reference with descriptions and acceptable value formats for every configuration variable.

---

## Deployment

The project deploys to Render via the `render.yaml` service manifest. The backend is packaged as a Docker image using `backend/Dockerfile.prod` and deployed as a Render web service. All environment secrets are injected at runtime through the Render dashboard environment variable configuration.

For self-hosted HTTPS deployments, `nginx.tls.conf` provides a complete TLS-terminating Nginx configuration. Replace the certificate path placeholders with your SSL certificate and private key paths before use.

---

## Support & Resources

### Documentation
- [Complete Documentation Index](./docs/README.md) — Start here for guided navigation
- [System Architecture](./docs/SYSTEM_ARCHITECTURE.md) — How everything fits together
- [API Reference](./docs/API_DOCUMENTATION.md) — All endpoints and examples
- [Security Guide](./docs/SECURITY.md) — Security architecture and implementation
- [Contributing Guide](./docs/CONTRIBUTING.md) — How to contribute

### Common Tasks
- **Setup development:** [Deployment Guide - Local](./docs/DEPLOYMENT.md#local-development-deployment)
- **Deploy to production:** [Deployment Guide - Production](./docs/DEPLOYMENT.md#production-deployment-render-ha)
- **Implement authentication:** [Security Architecture](./docs/SECURITY.md#authentication-system)
- **Add new API endpoint:** [API Documentation](./docs/API_DOCUMENTATION.md) + [System Architecture](./docs/SYSTEM_ARCHITECTURE.md)
- **Debug errors:** [Error Handling Guide](./docs/ERROR_HANDLING.md)
- **Understand middleware:** [Middleware Reference](./docs/MIDDLEWARE.md)
- **Database queries:** [Database Schema](./docs/DATABASE.md#query-patterns--performance)

### External Resources
- [Express.js Docs](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [React Documentation](https://react.dev/)
- [Socket.IO Guide](https://socket.io/docs/)
- [Nginx Configuration](https://nginx.org/en/docs/)

---

## Project Status

- **Current Version:** 1.0.0
- **Last Updated:** May 2026
- **Node Version:** 18+ required
- **MongoDB Version:** 7+

---

## Contributors

See [CONTRIBUTORS.md](./CONTRIBUTORS.md) (coming soon) for the list of contributors.

---

## License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## Quick Reference

**For more information, see the [complete documentation](./docs/README.md).**
