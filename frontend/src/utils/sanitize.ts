/**
 * Input Sanitization & XSS Protection Utilities
 * 
 * Provides functions to sanitize user input and prevent XSS attacks
 */

import DOMPurify from 'dompurify';

interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: string[];
  maxLength?: number;
}

/**
 * Sanitize HTML content
 * Removes dangerous tags and attributes while preserving safe formatting
 */
export function sanitizeHTML(
  html: string,
  options: SanitizeOptions = {}
): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const {
    allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br'],
    allowedAttributes = [],
    maxLength = 1000,
  } = options;

  // Truncate if too long
  let sanitized = html.substring(0, maxLength);

  // Sanitize with DOMPurify
  sanitized = DOMPurify.sanitize(sanitized, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    KEEP_CONTENT: true, // Keep text inside removed tags
  });

  return sanitized;
}

/**
 * Sanitize plain text
 * Trims whitespace and truncates to maxLength
 */
export function sanitizeText(text: string, maxLength = 500): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text.trim().substring(0, maxLength);
}

/**
 * Validate if URL is safe
 * Only allows http:, https:, and mailto: protocols
 */
export function isSafeURL(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url);
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
  } catch {
    // If URL() throws, it's invalid
    return false;
  }
}

/**
 * Escape HTML special characters
 * Converts to HTML entities to prevent interpretation as tags
 */
export function escapeHTML(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export function isStrongPassword(password: string): boolean {
  if (!password || password.length < 8) {
    return false;
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  return hasUppercase && hasLowercase && hasNumber;
}

/**
 * Validate amount (currency)
 * - Must be positive number
 * - Max 2 decimal places
 * - Max value: 999,999.99
 */
export function isValidAmount(amount: unknown): boolean {
  if (typeof amount !== 'number' && typeof amount !== 'string') {
    return false;
  }

  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(num) || num <= 0) {
    return false;
  }

  // Check decimal places
  const decimalPlaces = (num.toString().split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    return false;
  }

  // Check max value
  if (num > 999999.99) {
    return false;
  }

  return true;
}

/**
 * Remove all HTML tags
 */
export function stripHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  return html.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize filename
 * Removes path traversal and special characters
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return 'file';
  }

  // Remove path traversal attempts
  let safe = filename.replace(/\.\./g, '').replace(/[/\\]/g, '');

  // Keep only alphanumeric, dots, hyphens, underscores
  safe = safe.replace(/[^a-zA-Z0-9._-]/g, '-');

  // Remove leading/trailing dots and hyphens
  safe = safe.replace(/^[.-]+|[.-]+$/g, '');

  // Limit length
  safe = safe.substring(0, 255);

  // Ensure not empty
  return safe || 'file';
}

/**
 * Create a context-specific sanitizer
 * Returns a function that sanitizes input for a specific context
 */
export function createContextSanitizer(context: 'html' | 'text' | 'url' | 'email') {
  switch (context) {
    case 'html':
      return (input: string) => sanitizeHTML(input);
    case 'text':
      return (input: string) => sanitizeText(input);
    case 'url':
      return (input: string) => (isSafeURL(input) ? input : '');
    case 'email':
      return (input: string) => (isValidEmail(input) ? sanitizeText(input) : '');
    default:
      return sanitizeText;
  }
}

export default {
  sanitizeHTML,
  sanitizeText,
  isSafeURL,
  escapeHTML,
  isValidEmail,
  isStrongPassword,
  isValidAmount,
  stripHTML,
  sanitizeFilename,
  createContextSanitizer,
};
