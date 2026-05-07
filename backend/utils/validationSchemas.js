import { z } from 'zod';

/**
 * Branded Types for enhanced type safety
 */
export const EmailSchema = z.string().email().brand('Email');
export const PasswordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
    .brand('Password');
export const OTPSchema = z.string().length(6).regex(/^\d{6}$/, 'OTP must be 6 digits').brand('OTP');

/**
 * Validation schemas for Auth routes
 */
export const registerSchema = z.object({
    name: z.string().min(1, 'Name is required').max(60, 'Name too long'),
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Must contain at least one number')
        .regex(/[^a-zA-Z0-9]/, 'Must contain at least one special character'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const verifyOTPSchema = z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const resetPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must be numeric'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Must contain at least one number')
        .regex(/[^a-zA-Z0-9]/, 'Must contain at least one special character'),
    logoutAll: z.boolean().optional(),
});

export const adminLoginSchema = z.object({
    email: z.string().email('Invalid admin email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const validateSchema = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (err) {
        if (err instanceof z.ZodError) {
            const validationIssues = err.issues || err.errors || [];
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: validationIssues.map(e => ({ path: e.path.join('.'), message: e.message })),
            });
        }
        next(err);
    }
};
