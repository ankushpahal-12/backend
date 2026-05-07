import User from '../models/User.js';
import EmailVerificationOTP from '../models/EmailVerificationOTP.js';
import AppError from '../utils/errorUtils.js';
import config from '../config/config.js';
import { ethers } from 'ethers';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import { sendOTP, sendSecurityAlert } from '../utils/emailService.js';
import {
    generateOTP,
    hashOTP,
    verifyOTP,
    generateAPIKey,
    generateDeviceToken,
    hashDeviceToken
} from '../utils/otpUtils.js';
import * as refreshTokenService from './refreshTokenService.js';
import { sendLoadingUpdate } from '../socket.js';

export const registerUser = async (userData, deviceInfo, requestId = null) => {
    const { name, email, password } = userData;

    sendLoadingUpdate(requestId, 'Verifying identity uniqueness...');
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new AppError('Email already registered. Please login or use a different email.', 400);
    }

    sendLoadingUpdate(requestId, 'Generating secure credentials...');
    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp); // HIGH-1: now bcrypt

    const plainApiKey = generateAPIKey();
    const hashedApiKey = await hashOTP(plainApiKey);

    // CRIT-3: Generate a device token for the registering device
    const plainDeviceToken = generateDeviceToken();
    const hashedDeviceToken = hashDeviceToken(plainDeviceToken);

    sendLoadingUpdate(requestId, 'Provisioning neural nodes...');
    const newUser = await User.create({
        name,
        email,
        password,
        otp: hashedOtp,
        otpExpires: Date.now() + 10 * 60 * 1000,
        lastOtpSentAt: Date.now(),
        apiKey: hashedApiKey,
        trustedDevices: [{
            deviceToken: hashedDeviceToken, // CRIT-3: store hashed token
            userAgent: deviceInfo.userAgent,
            ip: deviceInfo.ip,
            lastLogin: Date.now()
        }]
    });

    sendLoadingUpdate(requestId, 'Transmitting synchronization token...');
    try {
        await sendOTP(email, otp, 'verification');
    } catch (err) {
        console.error('Registration email failed:', err);
    }

    // Return the plain device token so the controller can set it as a cookie
    return { email, apiKey: plainApiKey, deviceToken: plainDeviceToken };
};

export const isEmailRegistered = async (email) => {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    return !!existingUser;
};

export const verifyUserEmail = async (email, otp) => {
    // HIGH-1: Bcrypt OTPs cannot be queried by hash — find by email then compare
    const user = await User.findOne({
        email,
        otpExpires: { $gt: Date.now() },
    }).select('+otp +otpExpires +otpAttempts');

    if (!user || !user.otp) {
        throw new AppError('Invalid or expired OTP', 400);
    }

    const isValid = await verifyOTP(otp, user.otp);
    if (!isValid) {
        // Increment OTP attempts to prevent brute force
        user.otpAttempts = (user.otpAttempts || 0) + 1;
        if (user.otpAttempts >= 5) {
            user.otp = undefined;
            user.otpExpires = undefined;
            user.otpAttempts = 0;
            await user.save();
            throw new AppError('Too many invalid attempts. Please request a new OTP.', 429);
        }
        await user.save();
        throw new AppError('Invalid or expired OTP', 400);
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    await user.save();

    return user;
};

export const loginUser = async (email, password, deviceInfo, requestId = null, deviceTokenFromCookie = null) => {
    if (!email || !password) {
        throw new AppError('Please provide email and password', 400);
    }

    sendLoadingUpdate(requestId, 'Retrieving encrypted shard...');
    const user = await User.findOne({ email }).select('+password +trustedDevices +loginAttempts +lockUntil');

    // Check if account is locked
    if (user && user.isLocked) {
        const lockMinutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
        throw new AppError(`Account temporarily locked. Try again in ${lockMinutes} minute(s).`, 423);
    }

    // Check if user doesn't have a password set (admin-created user who hasn't completed OTP verification)
    if (user && !user.password) {
        throw new AppError('Please complete email verification and set your password first', 403);
    }

    sendLoadingUpdate(requestId, 'Validating key signatures...');
    if (!user || !(await user.comparePassword(password, user.password))) {
        if (user) {
            await user.incLoginAttempts();
            throw new AppError('Incorrect email or password.', 401);
        }
        throw new AppError('Incorrect email or password', 401);
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0 || user.lockUntil) {
        await user.updateOne({ $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } });
    }

    if (!user.isVerified) {
        const err = new AppError('Please verify your email first', 403);
        err.email = email;
        throw err;
    }

    // CRIT-3: Match device by hashed token from cookie (unforgeable),
    // NOT by User-Agent + IP (spoofable headers)
    let isKnownDevice = false;
    let deviceIndex = -1;

    if (deviceTokenFromCookie) {
        const hashedIncoming = hashDeviceToken(deviceTokenFromCookie);
        deviceIndex = user.trustedDevices?.findIndex(d => d.deviceToken === hashedIncoming) ?? -1;
        isKnownDevice = deviceIndex !== -1;
    }

    if (isKnownDevice) {
        user.trustedDevices[deviceIndex].lastLogin = Date.now();
        await user.save();

        const validSessions = user.activeSessions?.filter(s => s.expiresAt > Date.now()) || [];
        return { user, activeSessionsCount: validSessions.length };
    }

    // New or unrecognized device: trigger OTP verification
    const otp = generateOTP();
    user.otp = await hashOTP(otp);
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    user.lastOtpSentAt = Date.now();
    await user.save();

    const { userAgent, ip } = deviceInfo;
    sendSecurityAlert(user.email, 'new_device', { userAgent, ip }).catch(err =>
        console.error('Background alert failed:', err)
    );
    try {
        await sendOTP(user.email, otp, 'verification');
    } catch (err) {
        console.error('Security alert/OTP failed:', err);
    }

    return {
        requireOTP: true,
        email: user.email,
        message: 'New device detected. Please verify your identity with the OTP sent to your email.'
    };
};

export const forceUserLogin = async (email) => {
    const user = await User.findOne({ email }).select('+activeSessions');
    if (!user) throw new AppError('User not found', 404);

    user.activeSessions = [];
    await user.save({ validateBeforeSave: false });

    return user;
};

export const verifyLoginOTP = async (email, otp, deviceInfo, trustDevice) => {
    const user = await User.findOne({ email })
        .select('+trustedDevices +otp +otpExpires +otpAttempts');
    if (!user) throw new AppError('User not found', 404);

    // HIGH-1: bcrypt comparison instead of hash equality
    const isExpired = !user.otpExpires || user.otpExpires < Date.now();
    const isValid = user.otp && !isExpired ? await verifyOTP(otp, user.otp) : false;

    if (!isValid) {
        user.otpAttempts = (user.otpAttempts || 0) + 1;
        if (user.otpAttempts >= 5) {
            user.otp = undefined;
            user.otpExpires = undefined;
            user.otpAttempts = 0;
            await user.save();
            throw new AppError('Too many invalid OTP attempts. Please log in again.', 429);
        }
        await user.save();
        throw new AppError('Invalid or expired OTP', 400);
    }

    // Clear OTP on success
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;

    // CRIT-3: Trust device if requested — use token, not UA+IP
    let plainDeviceToken = null;
    if (trustDevice) {
        plainDeviceToken = generateDeviceToken();
        const hashedToken = hashDeviceToken(plainDeviceToken);
        const { userAgent, ip } = deviceInfo;
        user.trustedDevices.push({ deviceToken: hashedToken, userAgent, ip, lastLogin: Date.now() });
    }

    await user.save();
    return { user, plainDeviceToken };
};

export const processForgotPassword = async (email) => {
    const user = await User.findOne({ email });
    // Generic response to prevent user enumeration
    if (!user) return true;

    const otp = generateOTP();
    user.passwordResetToken = await hashOTP(otp); // HIGH-1: bcrypt
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    user.lastOtpSentAt = Date.now();
    await user.save();

    // VULN-2 FIX: Never embed OTP in URL — it ends up in server logs, browser history, and Referer headers.
    // The user enters the OTP manually from their email.
    const resetUrl = `${config.frontendUrl}/user/reset-password?email=${encodeURIComponent(email)}`;
    await sendOTP(email, otp, 'passwordReset', resetUrl);
    return true;
};

export const processResetPassword = async (email, otp, password) => {
    // HIGH-1: bcrypt OTPs — fetch user first, then verify in-memory
    const user = await User.findOne({
        email,
        passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user || !user.passwordResetToken) {
        throw new AppError('Invalid or expired reset code', 400);
    }

    const isValid = await verifyOTP(otp, user.passwordResetToken);
    if (!isValid) {
        throw new AppError('Invalid or expired reset code', 400);
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.isVerified = true;
    await user.save();

    sendSecurityAlert(user.email, 'password_changed').catch(err =>
        console.error('Background alert failed:', err)
    );

    return user;
};

export const resendUserOTP = async (email) => {
    const user = await User.findOne({ email }).select('+lastOtpSentAt +otp +otpExpires');
    // Generic response to prevent user enumeration
    if (!user) return true;

    // HIGH-2: Enforce 60-second cooldown between OTP resends
    if (user.lastOtpSentAt) {
        const secondsSinceLast = (Date.now() - user.lastOtpSentAt.getTime()) / 1000;
        if (secondsSinceLast < 60) {
            const waitSeconds = Math.ceil(60 - secondsSinceLast);
            throw new AppError(`Please wait ${waitSeconds} seconds before requesting another OTP.`, 429);
        }
    }

    const otp = generateOTP();
    user.otp = await hashOTP(otp); // HIGH-1: bcrypt
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    user.lastOtpSentAt = Date.now();
    await user.save();

    await sendOTP(email, otp, 'verification');
    return true;
};

export const adminLoginRequest = async (email, password, deviceInfo, requestId = null) => {
    sendLoadingUpdate(requestId, 'Verifying admin credentials...');
    const user = await User.findOne({ email }).select('+password');

    // MED-2: Always return 401 — never leak whether the failure was wrong password vs. wrong role
    const isValidPassword = user ? await user.comparePassword(password, user.password) : false;
    if (!user || !isValidPassword || user.role !== 'admin') {
        throw new AppError('Incorrect email or password', 401);
    }

    sendLoadingUpdate(requestId, 'Searching encrypted vault...');
    const otp = generateOTP();
    user.otp = await hashOTP(otp); // HIGH-1: bcrypt
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.lastOtpSentAt = Date.now();
    await user.save();

    sendLoadingUpdate(requestId, 'Dispatching 2FA security token...');
    try {
        await sendOTP(email, otp, 'verification');
    } catch (err) {
        console.error('Admin 2FA email failed:', err);
    }

    return { email, message: '2FA code sent to administrator email.' };
};

export const verifyAdmin2FA = async (email, otp, requestId = null) => {
    sendLoadingUpdate(requestId, 'Validating administrator token...');

    // VULN-3 FIX: Inline OTP verification instead of calling verifyUserEmail().
    // verifyUserEmail() has the side-effect of setting isVerified=true, which must
    // not happen here — admin 2FA should never alter the isVerified field.
    const user = await User.findOne({
        email,
        otpExpires: { $gt: Date.now() },
    }).select('+otp +otpExpires +otpAttempts');

    if (!user || !user.otp) throw new AppError('Invalid or expired 2FA code', 400);

    const isValid = await verifyOTP(otp, user.otp);
    if (!isValid) {
        user.otpAttempts = (user.otpAttempts || 0) + 1;
        if (user.otpAttempts >= 5) {
            user.otp = undefined;
            user.otpExpires = undefined;
            user.otpAttempts = 0;
            await user.save();
            throw new AppError('Too many invalid attempts. Please log in again.', 429);
        }
        await user.save();
        throw new AppError('Invalid or expired 2FA code', 400);
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    await user.save();

    if (user.role !== 'admin') {
        throw new AppError('Invalid operation.', 403);
    }

    sendLoadingUpdate(requestId, 'Establishing command bridge...');
    return user;
};

export const getWeb3Nonce = async (address) => {
    // VULN-8 FIX: Validate Ethereum address format before any DB operation
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
        throw new AppError('Invalid wallet address format', 400);
    }

    const nonce = crypto.randomBytes(32).toString('hex');

    let user = await User.findOne({ walletAddress: address.toLowerCase() });

    if (!user) {
        const uniqueTag = crypto.randomBytes(4).toString('hex');
        user = await User.create({
            name: 'Web3 User',
            email: `web3-${address.slice(2, 8).toLowerCase()}-${uniqueTag}@noreply.local`,
            walletAddress: address.toLowerCase(),
            password: crypto.randomBytes(16).toString('hex'),
            isVerified: true,
            nonce
        });
    } else {
        user.nonce = nonce;
        await user.save();
    }

    return nonce;
};

export const verifyWeb3Signature = async (address, signature) => {
    // VULN-8 FIX: Validate Ethereum address format before any DB operation
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
        throw new AppError('Invalid wallet address format', 400);
    }

    const user = await User.findOne({ walletAddress: address.toLowerCase() });
    if (!user || !user.nonce) {
        throw new AppError('Nonce not found. Please request a new one.', 400);
    }

    const message = `Sign this unique nonce to log in: ${user.nonce}`;
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        throw new AppError('Invalid signature', 401);
    }

    user.nonce = undefined;
    await user.save();

    return user;
};

// ─── User Email Verification & Password Setup (NEW) ────────────────────────────────

export const verifyEmailAndSetPassword = async (email, otp, password) => {
    if (!email || !otp || !password) {
        throw new AppError('Email, OTP, and password are required', 400);
    }

    // Validate password
    const { PasswordSchema } = await import('../utils/validationSchemas.js');
    try {
        PasswordSchema.parse(password);
    } catch (err) {
        throw new AppError('Password must be at least 8 characters', 400);
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Check if user already has a password (already verified)
    if (user.password) {
        throw new AppError('Email already verified. Please log in instead.', 400);
    }

    // Find OTP record
    const otpRecord = await EmailVerificationOTP.findOne({
        email,
        userId: user._id,
        type: 'account_creation',
        expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
        throw new AppError('Invalid or expired OTP', 400);
    }

    // Brute force protection: invalidate after 5 failed attempts
    if ((otpRecord.attempts || 0) >= 5) {
        await EmailVerificationOTP.deleteOne({ _id: otpRecord._id });
        throw new AppError('Too many invalid attempts. OTP has been invalidated. Please request a new verification link.', 429);
    }

    // Verify OTP matches (bcrypt compare)
    const isValidOTP = await verifyOTP(otp, otpRecord.otp);
    if (!isValidOTP) {
        // Increment attempt counter on the OTP record
        await EmailVerificationOTP.updateOne(
            { _id: otpRecord._id },
            { $inc: { attempts: 1 } }
        );
        throw new AppError('Invalid OTP', 400);
    }

    // Set password and mark as verified by user
    user.password = password;
    user.isVerified = true;
    user.emailVerifiedBy = 'user';
    user.emailVerifiedAt = new Date();
    await user.save();

    // Mark OTP as verified
    otpRecord.isVerified = true;
    otpRecord.verifiedAt = new Date();
    otpRecord.verifiedBy = 'user';
    await otpRecord.save();

    return {
        userId: user._id,
        email: user.email,
    };
};

// ─── TOTP 2FA Functions ────────────────────────────────────────────────────────

export const generate2FASecret = async (userId) => {
    const user = await User.findById(userId).select('+twoFactorSecret');
    if (!user) throw new AppError('User not found', 404);

    // Generate a new TOTP secret
    const secret = speakeasy.generateSecret({
        name: `AI Finance Copilot (${user.email})`,
        issuer: 'AI Finance Copilot',
        length: 20,
    });
    user.twoFactorSecret = secret.base32;
    user.twoFactorPending = true;
    user.twoFactorEnabled = false;
    await user.save({ validateBeforeSave: false });

    return {
        otpauthUrl: secret.otpauth_url,
        base32: secret.base32,
    };
};

export const confirm2FAToken = async (userId, token) => {
    const user = await User.findById(userId).select('+twoFactorSecret');
    if (!user) throw new AppError('User not found', 404);
    if (!user.twoFactorSecret || !user.twoFactorPending) {
        throw new AppError('No pending 2FA setup found. Please restart the setup.', 400);
    }

    const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 1, // allow 30s clock drift
    });

    if (!isValid) throw new AppError('Invalid authenticator code. Please try again.', 400);

    user.twoFactorEnabled = true;
    user.twoFactorPending = false;
    await user.save({ validateBeforeSave: false });

    // Send confirmation email
    sendSecurityAlert(user.email, '2fa_enabled').catch(err =>
        console.error('2FA confirmation email failed:', err)
    );

    return user;
};

export const disable2FA = async (userId, token) => {
    const user = await User.findById(userId).select('+twoFactorSecret');
    if (!user) throw new AppError('User not found', 404);
    if (!user.twoFactorEnabled) throw new AppError('2FA is not enabled on this account.', 400);

    const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 1,
    });

    if (!isValid) throw new AppError('Invalid authenticator code. Please try again.', 400);

    user.twoFactorSecret = undefined;
    user.twoFactorEnabled = false;
    user.twoFactorPending = false;
    await user.save({ validateBeforeSave: false });

    return user;
};

export const verifyTOTPLogin = async (email, token) => {
    const user = await User.findOne({ email }).select('+twoFactorSecret');
    if (!user) throw new AppError('User not found', 404);
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
        throw new AppError('2FA is not enabled for this account.', 400);
    }

    const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 1,
    });

    if (!isValid) throw new AppError('Invalid authenticator code. Please try again.', 401);

    return user;
};
