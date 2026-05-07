import crypto from 'crypto';
import AuthSession from '../models/AuthSession.js';
import AppError from '../utils/errorUtils.js';

/**
 * POST /api/auth/init-session
 * Creates a cryptographically secure pre-auth session ID.
 * Stores metadata (IP, user-agent, timestamp) for security tracking.
 */
export const initSession = async (req, res, next) => {
    try {
        const { type } = req.body; // 'login' or 'signup'

        if (!type || !['login', 'signup'].includes(type)) {
            return next(new AppError('Session type must be "login" or "signup".', 400));
        }

        const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';

        // Rate-limit: max 10 active sessions per IP to prevent abuse
        const activeCount = await AuthSession.countDocuments({
            ipAddress,
            status: 'pending',
        });

        if (activeCount >= 10) {
            return next(new AppError('Too many active sessions. Please try again later.', 429));
        }

        // Generate a cryptographically secure, unguessable session ID
        const sid = crypto.randomUUID();

        const session = await AuthSession.create({
            sid,
            type,
            ipAddress,
            userAgent,
        });

        res.status(201).json({
            status: 'success',
            data: {
                sid: session.sid,
                type: session.type,
                expiresAt: session.expiresAt,
            },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Middleware: validateSessionId
 * Validates the `sid` query parameter on login/register pages.
 * Increments attempt counter and blocks if too many attempts.
 */
export const validateSessionId = async (req, res, next) => {
    try {
        const sid = req.body.sid || req.query.sid;

        if (!sid) {
            return next(new AppError('Session ID is required. Please initiate login/signup from the application.', 403));
        }

        const session = await AuthSession.findOne({ sid });

        if (!session) {
            return next(new AppError('Invalid or expired session. Please try again.', 403));
        }

        if (session.status === 'blocked') {
            return next(new AppError('This session has been blocked due to too many attempts.', 403));
        }

        if (session.status === 'completed') {
            return next(new AppError('This session has already been used.', 403));
        }

        if (session.status === 'expired' || session.expiresAt < new Date()) {
            session.status = 'expired';
            await session.save();
            return next(new AppError('Session expired. Please initiate login/signup again.', 403));
        }

        // Rate-limit: block after 5 failed attempts on same session
        session.attempts += 1;
        if (session.attempts > 5) {
            session.status = 'blocked';
            await session.save();
            return next(new AppError('Too many attempts on this session. Please start over.', 429));
        }

        await session.save();

        // Attach session to request for downstream use
        req.authSession = session;
        next();
    } catch (err) {
        next(err);
    }
};

/**
 * Middleware: markSessionComplete
 * Called after successful login/register to mark the session as used.
 */
export const markSessionComplete = async (sid) => {
    try {
        if (!sid) return;
        await AuthSession.findOneAndUpdate(
            { sid },
            { status: 'completed' }
        );
    } catch {
        // Non-critical — don't block auth flow if this fails
        console.warn('[AuthSession] Failed to mark session complete:', sid);
    }
};
