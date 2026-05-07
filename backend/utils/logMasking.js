/**
 * Log Masking Utility
 * Automatically mask sensitive data in logs
 */

// Fields to mask in logs
const SENSITIVE_FIELDS = [
  'password',
  'ssn',
  'creditCard',
  'bankAccount',
  'token',
  'secret',
  'apiKey',
  'privateKey',
  'refreshToken',
  'accessToken',
  'authToken',
  'sessionId',
  'pin',
  'otp',
];

/**
 * Check if field name is sensitive
 */
function isSensitiveField(fieldName) {
  const normalizedName = fieldName.toLowerCase();
  return SENSITIVE_FIELDS.some((field) => 
    normalizedName.includes(field.toLowerCase())
  );
}

/**
 * Mask a sensitive value
 * Shows only first 2 and last 2 characters
 */
function maskValue(value) {
  if (typeof value !== 'string') {
    return '[REDACTED]';
  }

  if (value.length <= 4) {
    return '*'.repeat(value.length);
  }

  const start = value.substring(0, 2);
  const end = value.substring(value.length - 2);
  const masked = '*'.repeat(Math.max(4, value.length - 4));

  return `${start}${masked}${end}`;
}

/**
 * Recursively mask sensitive data in an object
 */
function maskSensitiveData(data, depth = 0) {
  // Prevent circular reference
  if (depth > 10) {
    return '[DEEP_OBJECT]';
  }

  if (data === null || data === undefined) {
    return data;
  }

  // Handle primitives
  if (typeof data !== 'object') {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item, depth + 1));
  }

  // Handle objects
  const masked = {};

  for (const [key, value] of Object.entries(data)) {
    if (isSensitiveField(key)) {
      // Mask sensitive fields
      if (typeof value === 'string') {
        masked[key] = maskValue(value);
      } else if (value !== null && typeof value === 'object') {
        masked[key] = '[REDACTED]';
      } else {
        masked[key] = '[REDACTED]';
      }
    } else if (typeof value === 'object' && value !== null) {
      // Recurse into nested objects
      masked[key] = maskSensitiveData(value, depth + 1);
    } else {
      // Keep non-sensitive values as-is
      masked[key] = value;
    }
  }

  return masked;
}

/**
 * Mask sensitive data in request/response
 */
function maskRequestResponse(data) {
  const masked = {
    ...data,
    body: data.body ? maskSensitiveData(data.body) : undefined,
    query: data.query ? maskSensitiveData(data.query) : undefined,
    params: data.params ? maskSensitiveData(data.params) : undefined,
  };

  return masked;
}

/**
 * Create a logger wrapper that masks sensitive data
 */
function createMaskedLogger(originalLogger) {
  return {
    info: (message, data) => {
      const maskedData = data ? maskSensitiveData(data) : undefined;
      originalLogger.info(message, maskedData);
    },
    warn: (message, data) => {
      const maskedData = data ? maskSensitiveData(data) : undefined;
      originalLogger.warn(message, maskedData);
    },
    error: (message, data) => {
      const maskedData = data ? maskSensitiveData(data) : undefined;
      originalLogger.error(message, maskedData);
    },
    debug: (message, data) => {
      const maskedData = data ? maskSensitiveData(data) : undefined;
      originalLogger.debug(message, maskedData);
    },
  };
}

module.exports = {
  maskSensitiveData,
  maskRequestResponse,
  maskValue,
  createMaskedLogger,
  isSensitiveField,
  SENSITIVE_FIELDS,
};
