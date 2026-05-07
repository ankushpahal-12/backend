import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { promisify } from 'util';
import User from '../models/User.js';
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

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin', 'manager']. role='user'
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
