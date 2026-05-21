/**
 * sanitization.js
 * Utility functions for sanitizing and validating user input
 * Prevents XSS and injection attacks
 */

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param {string} str - The string to escape
 * @returns {string} HTML-escaped string
 */
export const escapeHtml = (str) => {
  if (typeof str !== 'string') return str;
  
  const htmlEscapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };
  
  return str.replace(/[&<>"'\/]/g, (char) => htmlEscapeMap[char]);
};

/**
 * Validates and sanitizes message content
 * @param {string} content - The message content
 * @returns {Object} {isValid: boolean, message: string, sanitized: string}
 */
export const validateMessageContent = (content) => {
  if (!content || typeof content !== 'string') {
    return { isValid: false, message: 'Content must be a string', sanitized: null };
  }

  const trimmed = content.trim();
  
  if (trimmed.length === 0) {
    return { isValid: false, message: 'Message cannot be empty', sanitized: null };
  }

  if (trimmed.length > 5000) {
    return { isValid: false, message: 'Message exceeds maximum length of 5000 characters', sanitized: null };
  }

  // Escape HTML entities
  const sanitized = escapeHtml(trimmed);

  return { isValid: true, message: 'Valid', sanitized };
};

/**
 * Validates email format
 * @param {string} email - The email to validate
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates and sanitizes ticket subject
 * @param {string} subject - The ticket subject
 * @returns {Object} {isValid: boolean, message: string, sanitized: string}
 */
export const validateTicketSubject = (subject) => {
  if (!subject || typeof subject !== 'string') {
    return { isValid: false, message: 'Subject must be a string', sanitized: null };
  }

  const trimmed = subject.trim();
  
  if (trimmed.length === 0) {
    return { isValid: false, message: 'Subject cannot be empty', sanitized: null };
  }

  if (trimmed.length > 200) {
    return { isValid: false, message: 'Subject exceeds maximum length of 200 characters', sanitized: null };
  }

  const sanitized = escapeHtml(trimmed);
  return { isValid: true, message: 'Valid', sanitized };
};

/**
 * Validates and sanitizes ticket description
 * @param {string} description - The ticket description
 * @returns {Object} {isValid: boolean, message: string, sanitized: string}
 */
export const validateTicketDescription = (description) => {
  if (!description || typeof description !== 'string') {
    return { isValid: false, message: 'Description must be a string', sanitized: null };
  }

  const trimmed = description.trim();
  
  if (trimmed.length === 0) {
    return { isValid: false, message: 'Description cannot be empty', sanitized: null };
  }

  if (trimmed.length > 5000) {
    return { isValid: false, message: 'Description exceeds maximum length of 5000 characters', sanitized: null };
  }

  const sanitized = escapeHtml(trimmed);
  return { isValid: true, message: 'Valid', sanitized };
};
