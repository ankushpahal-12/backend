/**
 * CSP Nonce Middleware
 * 
 * Generates a random nonce for each request and injects it into:
 * 1. X-CSP-Nonce header (for frontend to use)
 * 2. CSP headers (script-src, style-src)
 * 
 * Nonce prevents inline scripts/styles from executing unless they have matching nonce
 */

import crypto from 'crypto';
import helmet from 'helmet';

/**
 * Generate a random nonce
 * Cryptographically secure random string
 */
function generateNonce(): string {
    return crypto.randomBytes(16).toString('base64');
}

/**
 * CSP Nonce Middleware
 * 
 * Usage in app.js:
 * ```
 * app.use(cspNonceMiddleware);
 * ```
 * 
 * Then use in helmet CSP:
 * ```
 * app.use(helmet({
 *   contentSecurityPolicy: {
 *     directives: {
 *       scriptSrc: (req, res) => [`'self'`, `'nonce-${req.cspNonce}'`],
 *       styleSrc: (req, res) => [`'self'`, `'nonce-${req.cspNonce}'`],
 *     }
 *   }
 * }));
 * ```
 */
export const cspNonceMiddleware = (req, res, next) => {
    // Generate nonce
    const nonce = generateNonce();
    
    // Store in request object for use in templates/responses
    req.cspNonce = nonce;
    
    // Add to response header so frontend can access it
    res.setHeader('X-CSP-Nonce', nonce);
    
    // Add nonce to local variables (for Express templates)
    res.locals.nonce = nonce;
    
    next();
};

/**
 * IMPLEMENTATION GUIDE
 * 
 * STEP 1: Add middleware to app.js
 * ════════════════════════════════════════════════════════════════════════
 * 
 * Location: app.js, before helmet middleware
 * 
 * Code:
 * ```
 * import { cspNonceMiddleware } from './middlewares/cspNonceMiddleware.js';
 * 
 * app.use(cspNonceMiddleware);
 * 
 * app.use(helmet({
 *   contentSecurityPolicy: {
 *     directives: {
 *       scriptSrc: ['\'self\''],
 *       styleSrc: ['\'self\''],
 *       // Add more directives as needed
 *     }
 *   }
 * }));
 * ```
 * 
 * STEP 2: Update helmet to use nonce dynamically
 * ════════════════════════════════════════════════════════════════════════
 * 
 * Modify app.js helmet configuration:
 * 
 * ```
 * app.use(helmet({
 *   contentSecurityPolicy: {
 *     directives: {
 *       scriptSrc: (req, res) => {
 *         const nonce = req.cspNonce;
 *         return ['\'self\'', `'nonce-${nonce}'`];
 *       },
 *       styleSrc: (req, res) => {
 *         const nonce = req.cspNonce;
 *         return ['\'self\'', `'nonce-${nonce}'`];
 *       },
 *       defaultSrc: ['\'self\''],
 *       connectSrc: ['\'self\'', 'ws:', 'wss:'],
 *       imgSrc: ['\'self\'', 'data:', 'https:'],
 *       fontSrc: ['\'self\'', 'https:'],
 *       frameSrc: ['\'none\''],
 *       frameAncestors: ['\'none\''],
 *       baseUri: ['\'self\''],
 *       formAction: ['\'self\''],
 *       objectSrc: ['\'none\''],
 *     }
 *   }
 * }));
 * ```
 * 
 * STEP 3: Frontend - Access nonce from header
 * ════════════════════════════════════════════════════════════════════════
 * 
 * Create a utility to get the nonce:
 * 
 * ```tsx
 * // frontend/src/utils/cspNonce.ts
 * 
 * export function getCSPNonce(): string | null {
 *   return document.currentScript?.getAttribute('nonce') ?? null;
 * }
 * 
 * // Or from response header if available during initial load
 * export function getCSPNonceFromHeader(): string {
 *   // Get from meta tag set on page load
 *   const metaTag = document.querySelector('meta[name="csp-nonce"]');
 *   return metaTag?.getAttribute('content') ?? '';
 * }
 * ```
 * 
 * STEP 4: Use nonce in inline scripts
 * ════════════════════════════════════════════════════════════════════════
 * 
 * In HTML template (e.g., index.html):
 * 
 * ```html
 * <!DOCTYPE html>
 * <html>
 *   <head>
 *     <!-- Store nonce in meta tag for JS access -->
 *     <meta name="csp-nonce" content="{{ nonce }}">
 *     
 *     <!-- Inline script with nonce -->
 *     <script nonce="{{ nonce }}">
 *       // Your inline JavaScript here
 *       console.log('Inline script loaded safely');
 *     </script>
 *   </head>
 *   <body>
 *     <div id="root"></div>
 *   </body>
 * </html>
 * ```
 * 
 * STEP 5: Use nonce in React components
 * ════════════════════════════════════════════════════════════════════════
 * 
 * For injecting inline styles dynamically:
 * 
 * ```tsx
 * import { getCSPNonceFromHeader } from '../utils/cspNonce';
 * 
 * export function DynamicStyles() {
 *   const nonce = getCSPNonceFromHeader();
 *   
 *   return (
 *     <>
 *       {/* Dynamic inline style with nonce */}
 *       <style nonce={nonce}>
 *         {`
 *           .dynamic-style {
 *             color: red;
 *           }
 *         `}
 *       </style>
 *       
 *       {/* Content */}
 *       <div className="dynamic-style">Dynamic Content</div>
 *     </>
 *   );
 * }
 * ```
 * 
 * STEP 6: Testing CSP with nonce
 * ════════════════════════════════════════════════════════════════════════
 * 
 * 1. Check response headers:
 *    curl -i https://yourapp.com
 *    Look for: X-CSP-Nonce: abc123...
 *    Look for: Content-Security-Policy: script-src 'self' 'nonce-abc123...'
 * 
 * 2. Check browser DevTools:
 *    Open Console
 *    Should NOT see CSP violation warnings
 * 
 * 3. Test with inline script:
 *    Add script tag without nonce
 *    Should see CSP violation in console
 * 
 * 4. Test with correct nonce:
 *    Add script tag with correct nonce
 *    Should execute normally
 */

/**
 * SECURITY BENEFITS
 * ═════════════════════════════════════════════════════════════════════
 * 
 * Without nonce:
 * - CSP: script-src 'self'
 * - Attacker cannot add inline script: <script>alert('xss')</script>
 * - BUT: Attacker can still load malicious external script:
 *        <script src="https://attacker.com/malicious.js"></script>
 * 
 * With nonce:
 * - CSP: script-src 'self' 'nonce-abc123'
 * - Attacker cannot add inline script (no nonce)
 * - Attacker cannot load external script (not in whitelist)
 * - ONLY inline scripts with matching nonce execute
 * 
 * Best for: Dynamically generated content, user-controlled styles
 * 
 * Example: User bio that might contain HTML:
 * 
 * ❌ Without nonce (vulnerable):
 * ```html
 * <style>
 *   .bio { color: user-input; } <!-- Attacker injects styles -->
 * </style>
 * ```
 * 
 * ✅ With nonce (safe):
 * ```html
 * <style nonce="abc123">
 *   .bio { color: red; }
 * </style>
 * <!-- Even if attacker injects style tag, it needs nonce to run -->
 * ```
 */

/**
 * BROWSER COMPATIBILITY
 * ═════════════════════════════════════════════════════════════════════
 * 
 * Nonce is supported in all modern browsers:
 * - Chrome 39+
 * - Firefox 23+
 * - Safari 10+
 * - Edge 15+
 * - Opera 26+
 * 
 * Older browsers: CSP still works, just ignores nonce
 */

export default cspNonceMiddleware;
