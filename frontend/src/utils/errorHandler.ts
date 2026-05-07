export interface BackendErrorResponse {
  status: string;
  statusCode: number;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  };
}

export class BackendError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string,
    public details?: any,
    public timestamp?: string
  ) {
    super(message);
    this.name = 'BackendError';
  }
}

/**
 * Parse backend error response and return user-friendly message
 */
export const getErrorMessage = (error: any): string => {
  // Handle new backend error format
  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message;
  }

  // Handle API error object
  if (error?.message) {
    return error.message;
  }

  // Fallback
  return 'An unexpected error occurred';
};

/**
 * Parse backend error response and return error details
 */
export const parseBackendError = (error: any): BackendError => {
  const response = error?.response?.data;

  if (response?.error) {
    return new BackendError(
      response.statusCode || error?.response?.status || 500,
      response.error.code || 'UNKNOWN_ERROR',
      response.error.message || 'An unexpected error occurred',
      response.error.details,
      response.error.timestamp
    );
  }

  // Fallback for non-backend errors
  return new BackendError(
    error?.response?.status || 500,
    'UNKNOWN_ERROR',
    error?.message || 'An unexpected error occurred'
  );
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: any): boolean => {
  const status = error?.response?.status || error?.statusCode;
  return status === 401;
};

/**
 * Check if error is a validation error
 */
export const isValidationError = (error: any): boolean => {
  const code = error?.response?.data?.error?.code || error?.errorCode;
  return code?.includes('VALIDATION') || error?.response?.status === 400;
};

/**
 * Check if error is a permission error
 */
export const isPermissionError = (error: any): boolean => {
  const status = error?.response?.status || error?.statusCode;
  return status === 403;
};

/**
 * Format error for display in UI
 */
export const formatErrorForUI = (error: any): {
  title: string;
  message: string;
  code: string;
} => {
  const backendError = parseBackendError(error);

  let title = 'Error';
  let message = backendError.message;

  if (isAuthError(error)) {
    title = 'Authentication Failed';
    message = 'Your session has expired. Please log in again.';
  } else if (isPermissionError(error)) {
    title = 'Permission Denied';
    message = 'You do not have permission to perform this action.';
  } else if (isValidationError(error)) {
    title = 'Validation Error';
    // message is already set from backend
  } else if (error?.response?.status === 404) {
    title = 'Not Found';
    message = 'The requested resource was not found.';
  } else if (error?.response?.status === 500) {
    title = 'Server Error';
    message = 'An error occurred on the server. Please try again later.';
  }

  return {
    title,
    message,
    code: backendError.errorCode,
  };
};

/**
 * Extract validation errors from backend response
 */
export const getValidationErrors = (error: any): Record<string, string> => {
  const details = error?.response?.data?.error?.details;

  if (Array.isArray(details?.errors)) {
    return details.errors.reduce((acc: Record<string, string>, err: any) => {
      if (err.field) {
        acc[err.field] = err.message;
      }
      return acc;
    }, {});
  }

  return {};
};
