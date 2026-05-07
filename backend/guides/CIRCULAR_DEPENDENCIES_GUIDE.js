/**
 * CIRCULAR DEPENDENCY DETECTION & RESOLUTION GUIDE
 * 
 * Tools and strategies for finding and fixing circular imports
 */

/**
 * STEP 1: Install detection tool
 * 
 * npm install --save-dev madge
 * 
 * Add to package.json scripts:
 * "check-circular": "madge --circular backend/**\/*.js"
 * "check-deps": "madge --image backend-deps.png backend/\*.js"
 */

/**
 * STEP 2: Run detection
 * 
 * npm run check-circular
 * 
 * Output will show circular dependencies:
 * Circular dependencies found:
 * ✖ a.js -> b.js -> a.js
 * ✖ x.js -> y.js -> z.js -> x.js
 */

/**
 * COMMON CIRCULAR DEPENDENCY PATTERNS
 */

// ─── Pattern 1: Model -> Controller -> Model ─────────────────────
// models/User.js
// import { getUserById } from '../controllers/userController.js'; // BAD
// export default User;

// controllers/userController.js
// import User from '../models/User.js';
// Circular dependency!

// FIX: Keep models independent of controllers
// Move controller logic to services instead


// ─── Pattern 2: Service A -> Service B -> Service A ─────────────
// services/authService.js
// import * as userService from './userService.js'; // Could be circular

// services/userService.js
// import * as authService from './authService.js'; // BAD

// FIX: Extract shared logic to utility
// utils/commonUtils.js (no imports from services)
// Both services import from utils


// ─── Pattern 3: Middleware -> Utility -> Middleware ──────────────
// middlewares/auth.js
// import { checkPermission } from '../utils/permissionUtils.js';

// utils/permissionUtils.js
// import { authMiddleware } from '../middlewares/auth.js'; // BAD

// FIX: permissionUtils should be pure functions
// Don't import middleware/controllers


/**
 * ARCHITECTURE RULES TO PREVENT CIRCULARS
 */

const rules = [
    {
        rule: "No upward imports",
        description: "Controllers should not import from consumers (routes, middlewares)",
        good: "controllers/userController.js imports models/User.js",
        bad: "controllers/userController.js imports routes/userRoutes.js"
    },
    {
        rule: "Services are independent",
        description: "Each service should have minimal cross-service dependencies",
        good: "serviceA.js has few imports from serviceB.js",
        bad: "serviceA <-> serviceB <-> serviceC (circular chain)"
    },
    {
        rule: "Models are leaf nodes",
        description: "Models should not import from services/controllers",
        good: "models/User.js only imports schemas, validators",
        bad: "models/User.js imports controllers or services"
    },
    {
        rule: "Utilities are pure",
        description: "Utility functions should not import from domain logic",
        good: "utils/validation.js only imports zod",
        bad: "utils/validation.js imports services or controllers"
    },
    {
        rule: "Middlewares are isolated",
        description: "Middlewares should be self-contained",
        good: "middlewares/auth.js imports models and utilities only",
        bad: "middlewares/auth.js imports controllers or routes"
    }
];

/**
 * DIRECTORY STRUCTURE (Prevents Circulars)
 * 
 * backend/
 * ├── config/          (No imports from other domains)
 * ├── utils/           (Leaf: imports from config only)
 * ├── models/          (Leaf: imports from config, utils)
 * ├── validators/      (Leaf: imports from utils)
 * ├── services/        (Core: imports models, utils)
 * ├── middlewares/     (Imports models, utils, services)
 * ├── controllers/     (Imports models, services, utils)
 * ├── routes/          (Imports controllers, middlewares)
 * ├── app.js           (Imports routes, middlewares)
 * └── server.js        (Entry point)
 * 
 * IMPORT RULES:
 * - config/* → Never imports anything in backend/
 * - utils/* → imports config/* only
 * - models/* → imports config/*, utils/*
 * - validators/* → imports utils/*, config/*
 * - services/* → imports models/*, utils/*, config/*
 * - middlewares/* → imports services/*, models/*, utils/*, config/*
 * - controllers/* → imports services/*, models/*, utils/*, config/*
 * - routes/* → imports controllers/*, middlewares/*, config/*
 */

/**
 * RESOLUTION STRATEGIES
 */

export const resolutionStrategies = [
    {
        name: "Extract to utility",
        description: "Move shared code to a utility module that both modules import from",
        example: "If serviceA and serviceB circularly depend on common logic, create utils/shared.js"
    },
    {
        name: "Dependency injection",
        description: "Pass dependencies as parameters instead of importing",
        example: "function serviceA(serviceB) { return { doSomething: () => serviceB.call() } }"
    },
    {
        name: "Late import",
        description: "Import only where needed instead of at module top",
        example: "function myFunc() { const dep = require('./other'); return dep.call(); }"
    },
    {
        name: "Restructure modules",
        description: "Split modules to reduce dependencies",
        example: "If authController and userController both depend on each other, merge or restructure"
    },
    {
        name: "Use interfaces",
        description: "Define contract/interface separately from implementation",
        example: "interfaces/IAuthService.js - just the contract, import implementation only where needed"
    }
];

/**
 * DETECTION COMMANDS
 */

export const detectionCommands = [
    {
        tool: "madge",
        install: "npm install --save-dev madge",
        commands: [
            "madge --circular backend/**/*.js",
            "madge --image backend-deps.png backend/**/*.js",
            "madge --json backend/**/*.js > deps.json",
            "madge --extensions js --paths backend",
        ]
    },
    {
        tool: "depcheck",
        install: "npm install --save-dev depcheck",
        commands: [
            "depcheck backend",
            "depcheck --missing backend",
            "depcheck --unused backend",
        ]
    },
    {
        tool: "Node built-in",
        install: "Already installed",
        commands: [
            "node --trace-imports app.js 2>&1 | head -100",
            "strace -e openat node app.js 2>&1 | grep '.js'",
        ]
    }
];

/**
 * CURRENT STATUS FOR EXPENSE TRACKER
 * 
 * Run periodically (monthly):
 * npm run check-circular
 * 
 * Expected: No circular dependencies
 * 
 * If any appear, use resolution strategies above to fix them.
 */

export const checkCircularDependencies = async () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║   CIRCULAR DEPENDENCY CHECK                            ║
║   Run: npm run check-circular                          ║
╚════════════════════════════════════════════════════════╝

If any circular dependencies found:

1. Use: npm run check-circular > circular-deps.txt
2. Examine the circular chains
3. Apply resolution strategy above
4. Refactor problematic modules
5. Re-run to verify fix

Architecture rule: Each layer should only import from lower layers.
    
    routes/ ← controllers/ ← services/ ← models/ ← utils/ ← config/
    
    (Never import upward)
    `);
};

export default {
    rules,
    resolutionStrategies,
    detectionCommands,
    checkCircularDependencies,
};
