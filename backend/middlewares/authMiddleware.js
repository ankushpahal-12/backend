import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { promisify } from 'util';
import User from '../models/User.js';
import TestAttempt from '../models/TestAttempt.js';
import config from '../config/config.js';
import AppError from '../utils/errorUtils.js';

export const protect = async (req, res, next) => {
    try {
        // 1) Getting token and check if it's there
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            return next(new AppError('You are not logged in! Please log in to get access.', 401));
        }

        // 2) Verification token with ALGORITHM RESTRICTION (prevent confusion attack)
        const decoded = await promisify(jwt.verify)(
            token,
            config.jwtSecret,
            {
                algorithms: ['HS256'],  // ✅ ONLY allow HS256, reject 'none' or others
            }
        );

        // 3) Check if user still exists
        const currentUser = await User.findById(decoded.id).select('+activeSessions');
        if (!currentUser) {
            return next(new AppError('The user belonging to this token no longer exists.', 401));
        }

        // 4) Check if session is still active — validate BOTH session ID AND hashed token
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const isSessionActive = currentUser.activeSessions.some(
            session =>
                session.sessionId === decoded.sid &&
                session.token === hashedToken &&
                session.expiresAt > Date.now()
        );

        if (!isSessionActive) {
            return next(new AppError('Session expired or invalidated. Please log in again.', 401));
        }

        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = currentUser;
        next();
    } catch (err) {
        next(new AppError('Invalid token. Please log in again!', 401));
    }
};

// Flexible auth for test attempts: Allow either authenticated users OR unauthenticated users accessing their own attempt
export const protectAttempt = async (req, res, next) => {
    try {
        // Try to authenticate as a logged-in user first
        let token;
        let currentUser = null;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (token) {
            try {
                const decoded = await promisify(jwt.verify)(
                    token,
                    config.jwtSecret,
                    { algorithms: ['HS256'] }
                );

                currentUser = await User.findById(decoded.id).select('+activeSessions');
                if (currentUser) {
                    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
                    const isSessionActive = currentUser.activeSessions.some(
                        session =>
                            session.sessionId === decoded.sid &&
                            session.token === hashedToken &&
                            session.expiresAt > Date.now()
                    );

                    if (isSessionActive) {
                        req.user = currentUser;
                        return next();
                    }
                }
            } catch (err) {
                // Token verification failed, continue to check for valid attempt
            }
        }

        // If not authenticated, allow access only if they have a valid test attempt
        const { attemptId } = req.params;
        if (attemptId) {
            const attempt = await TestAttempt.findById(attemptId);
            if (attempt) {
                // Validate session for unauthenticated users
                const activeSessionId = req.headers['x-session-id'] || 'default-session';
                if (attempt.activeSessionId === activeSessionId) {
                    // Store minimal info for audit logging
                    req.testAttempt = attempt;
                    req.isUnauthenticatedAttempt = true;
                    return next();
                }
            }
        }

        // No valid auth or valid attempt found
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    } catch (err) {
        next(new AppError('Authorization error', 401));
    }
};

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin', 'manager']. role='user'
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
