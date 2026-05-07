import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export const generateOTP = () => {
    // Generate a 6-digit OTP using cryptographically secure randomInt
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hash an OTP using bcrypt (12 rounds).
 * SHA-256 is too fast for 6-digit values — bcrypt makes brute-force expensive.
 * NOTE: Because bcrypt hashes are non-deterministic, OTPs can no longer be
 * looked up in the DB by hash. Use verifyOTP() to compare in-memory instead.
 */
export const hashOTP = async (otp) => {
    return await bcrypt.hash(otp, 12);
};

/**
 * Verify a plain OTP against a stored bcrypt hash.
 */
export const verifyOTP = async (plainOtp, hashedOtp) => {
    return await bcrypt.compare(plainOtp, hashedOtp);
};

export const generateAPIKey = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate a secure random device token (plain) for trusted device cookies.
 * The plain value is set in an HttpOnly cookie; the hash is stored in DB.
 */
export const generateDeviceToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash a device token using SHA-256 for DB storage.
 * Device tokens are long random values (256-bit entropy), so SHA-256 is safe here.
 */
export const hashDeviceToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};
