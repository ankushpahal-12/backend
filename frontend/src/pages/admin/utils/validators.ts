/**
 * Validation utilities for user management forms
 */

export interface ValidationError {
  field: string;
  message: string;
}

export const validators = {
  // Email validation
  isValidEmail: (email: string): boolean => {
    return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
  },

  // Password validation (min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char)
  isValidPassword: (password: string): boolean => {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
    return true;
  },

  // Password strength (basic: just length check)
  isStrongPassword: (password: string): boolean => {
    return password.length >= 8;
  },

  // Name validation
  isValidName: (name: string): boolean => {
    return name.trim().length >= 2 && name.trim().length <= 100;
  },

  // Check if passwords match
  passwordsMatch: (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword;
  },

  // Validate user creation form
  validateAddUserForm: (data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!data.name?.trim()) {
      errors.push({ field: 'name', message: 'Name is required' });
    } else if (!validators.isValidName(data.name)) {
      errors.push({ field: 'name', message: 'Name must be 2-100 characters' });
    }

    if (!data.email?.trim()) {
      errors.push({ field: 'email', message: 'Email is required' });
    } else if (!validators.isValidEmail(data.email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }

    if (!data.password) {
      errors.push({ field: 'password', message: 'Password is required' });
    } else if (!validators.isStrongPassword(data.password)) {
      errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
    }

    if (!data.role || !['user', 'admin'].includes(data.role)) {
      errors.push({ field: 'role', message: 'Valid role is required' });
    }

    return errors;
  },

  // Validate password reset form
  validatePasswordResetForm: (data: {
    newPassword: string;
    confirmPassword: string;
  }): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!data.newPassword) {
      errors.push({ field: 'newPassword', message: 'New password is required' });
    } else if (!validators.isStrongPassword(data.newPassword)) {
      errors.push({ field: 'newPassword', message: 'Password must be at least 8 characters' });
    }

    if (!data.confirmPassword) {
      errors.push({ field: 'confirmPassword', message: 'Confirm password is required' });
    }

    if (data.newPassword && data.confirmPassword && !validators.passwordsMatch(data.newPassword, data.confirmPassword)) {
      errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
    }

    return errors;
  },

  // Get error message for a field
  getFieldError: (errors: ValidationError[], field: string): string | undefined => {
    return errors.find(e => e.field === field)?.message;
  },

  // Check if any errors
  hasErrors: (errors: ValidationError[]): boolean => {
    return errors.length > 0;
  },

  // Get first error message
  getFirstError: (errors: ValidationError[]): string | undefined => {
    return errors[0]?.message;
  },
};

// Explicit re-export for better module resolution
export type { ValidationError };
