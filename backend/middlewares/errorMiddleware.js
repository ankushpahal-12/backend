import config from '../config/config.js';
import AppError from '../utils/errorUtils.js';

// --- DATABASE ERROR HANDLERS ---

// 1. Invalid Database IDs (e.g., /api/users/123-not-an-id)
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

// 2. Duplicate Fields (e.g., Registering an email that already exists)
const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
};

// 3. Validation Errors (e.g., Password too short)
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

// 4. JWT Errors
const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

// --- RESPONSE SENDERS ---

const sendErrorDev = (err, res) => {
    // Log stack trace to server console only — never expose it to API clients
    // Suppress expected 401 errors (not logged in) on /users/me endpoint to reduce noise
    const isExpectedUnauthorized = err.statusCode === 401 && err.message.includes('not logged in');
    if (!isExpectedUnauthorized) {
        console.error('[DEV ERROR]', err.stack || err);
    }
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: { name: err.name, statusCode: err.statusCode },
    });
};

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        // Programming or other unknown error: don't leak details
        console.error('ERROR', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!',
        });
    }
};

// --- MAIN EXPORT ---

const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (config.env === 'development') {
        sendErrorDev(err, res);
    } else {
        // VULN-6 FIX: Object.assign(err) with one arg is a no-op — it returns the same reference.
        // Properly clone the error by copying own-properties onto a new object with the same prototype.
        let error = Object.assign(Object.create(Object.getPrototypeOf(err)), err);
        error.message = err.message;

        // Specific Mongoose/JWT Error Handling
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }
};

export default globalErrorHandler;