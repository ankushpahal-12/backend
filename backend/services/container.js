/**
 * DEPENDENCY INJECTION CONTAINER
 * 
 * Manages service instances and their dependencies
 * Makes testing easier (mock services)
 * Reduces tight coupling between modules
 */

import * as authService from '../services/authService.js';
import * as loginAttemptService from '../services/loginAttemptService.js';
import * as refreshTokenService from '../services/refreshTokenService.js';
import * as securityMonitoringService from '../services/securityMonitoringService.js';
import * as incidentResponseService from '../services/incidentResponseService.js';
import * as apiKeyRotationService from '../services/apiKeyRotationService.js';
import * as zeroTrustService from '../services/zeroTrustService.js';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

/**
 * Service container singleton
 * All services are initialized once and reused
 */
export class ServiceContainer {
    constructor() {
        // Services
        this.authService = authService;
        this.loginAttemptService = loginAttemptService;
        this.refreshTokenService = refreshTokenService;
        this.securityMonitoringService = securityMonitoringService;
        this.incidentResponseService = incidentResponseService;
        this.apiKeyRotationService = apiKeyRotationService;
        this.zeroTrustService = zeroTrustService;
        
        // Models
        this.User = User;
        
        // Utilities
        this.logger = logger;
    }
    
    /**
     * Register a custom service (for testing or overrides)
     */
    registerService(name, serviceImplementation) {
        this[name] = serviceImplementation;
        this.logger.info(`[DI] Service registered: ${name}`);
    }
    
    /**
     * Get a service by name
     */
    getService(name) {
        if (!this[name]) {
            throw new Error(`Service not found: ${name}`);
        }
        return this[name];
    }
    
    /**
     * Check if a service exists
     */
    hasService(name) {
        return !!this[name];
    }
}

/**
 * Global service container instance
 */
export const container = new ServiceContainer();

/**
 * Middleware to inject container into request
 * Usage: app.use(injectContainerMiddleware);
 */
export const injectContainerMiddleware = (req, res, next) => {
    req.services = container;
    next();
};

/**
 * Higher-order function to inject services into controllers
 * Usage:
 * export const register = withServiceInjection(async (req, res, next, services) => {
 *   const user = await services.authService.registerUser(...);
 * });
 */
export function withServiceInjection(controllerFn) {
    return async (req, res, next) => {
        try {
            return await controllerFn(req, res, next, req.services || container);
        } catch (err) {
            next(err);
        }
    };
}

/**
 * Create a mock service container for testing
 */
export function createMockContainer() {
    const mock = new ServiceContainer();
    
    // Replace services with mocks
    mock.authService = {
        registerUser: jest.fn(),
        loginUser: jest.fn(),
        verifyUserEmail: jest.fn(),
        // ... other mocked methods
    };
    
    mock.User = {
        findOne: jest.fn(),
        create: jest.fn(),
        // ... other mocked methods
    };
    
    return mock;
}

/**
 * Example usage in controllers:
 * 
 * Before (tightly coupled):
 * ──────────────────────────
 * import * as authService from '../services/authService.js';
 * 
 * export const register = async (req, res, next) => {
 *   try {
 *     const user = await authService.registerUser(req.body);
 *     res.json(user);
 *   } catch (err) {
 *     next(err);
 *   }
 * };
 * 
 * After (loosely coupled with DI):
 * ─────────────────────────────────
 * import { withServiceInjection } from '../services/container.js';
 * 
 * export const register = withServiceInjection(async (req, res, next, services) => {
 *   try {
 *     const user = await services.authService.registerUser(req.body);
 *     res.json(user);
 *   } catch (err) {
 *     next(err);
 *   }
 * });
 * 
 * For testing:
 * ────────────
 * import { createMockContainer } from '../services/container.js';
 * 
 * describe('registerController', () => {
 *   it('should register a user', async () => {
 *     const mockContainer = createMockContainer();
 *     mockContainer.authService.registerUser.mockResolvedValue({ id: 1, email: 'test@example.com' });
 *     
 *     const req = { body: { email: 'test@example.com', password: 'password' } };
 *     const res = { json: jest.fn() };
 *     
 *     await register(req, res, jest.fn());
 *     
 *     expect(mockContainer.authService.registerUser).toHaveBeenCalled();
 *   });
 * });
 */

export default container;
