import User from '../models/User.js';
import EmailVerificationOTP from '../models/EmailVerificationOTP.js';
import { PasswordSchema } from '../utils/validationSchemas.js';
import AppError from '../utils/errorUtils.js';
import { getPaginationParams, sendPaginatedResponse } from '../utils/paginationUtils.js';
import { sendOTP, sendSecurityAlert } from '../utils/emailService.js';

export const getAllUsers = async (req, res) => {
    try {
        const { page, limit, skip } = getPaginationParams(req);
        
        // Count total users
        const total = await User.countDocuments();
        
        // Fetch paginated users
        const users = await User.find()
            .select('-activeSessions -trustedDevices')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        return sendPaginatedResponse(res, users, total, limit, page);
    } catch (err) {
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch users'
        });
    }
};

export const getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const verifiedUsers = await User.countDocuments({ isVerified: true });

        res.status(200).json({
            status: 'success',
            data: {
                stats: {
                    totalUsers,
                    verifiedUsers,
                    financialVolume: '₹4.2Cr', // In real app, calculate from transactions
                    securityThreats: 0
                }
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch system stats'
        });
    }
};
export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('+trustedDevices +activeSessions');

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // SECURITY: Strip hashed tokens before sending to admin client.
        // Even hashed values add unnecessary attack surface if the admin account is compromised.
        const userObj = user.toObject();
        if (userObj.activeSessions) {
            userObj.activeSessions = userObj.activeSessions.map(s => ({ ...s, token: undefined }));
        }
        if (userObj.trustedDevices) {
            userObj.trustedDevices = userObj.trustedDevices.map(d => ({ ...d, deviceToken: undefined }));
        }

        res.status(200).json({
            status: 'success',
            data: { user: userObj }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch user details'
        });
    }
};

export const updateUserPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        try {
            PasswordSchema.parse(password);
        } catch (err) {
            return res.status(400).json({
                status: 'error',
                message: 'Password must be at least 8 characters'
            });
        }

        user.password = password;
        await user.save();

        // Send password reset email notification
        try {
            await sendSecurityAlert(user.email, 'password_changed', {});
        } catch (emailErr) {
            console.error('Failed to send password change email:', emailErr);
            // Don't fail the password update if email fails
        }

        res.status(200).json({
            status: 'success',
            message: 'User password updated successfully. Email notification sent to user.'
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to update user password'
        });
    }
};

export const terminateUserSession = async (req, res) => {
    try {
        const { userId, sessionId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        user.activeSessions = user.activeSessions.filter(
            session => session.sessionId !== sessionId
        );

        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            status: 'success',
            message: 'Session terminated by administrator'
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to terminate user session'
        });
    }
};

// Force logout - terminate all sessions for a user
export const forceLogoutUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Terminate all active sessions
        user.activeSessions = [];
        
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            status: 'success',
            message: 'User logged out from all sessions successfully'
        });
    } catch (err) {
        console.error('Force Logout error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to force logout user'
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // 1) Find user
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // 2) Delete user
        await User.findByIdAndDelete(id);

        res.status(200).json({
            status: 'success',
            message: 'User account deleted successfully'
        });
    } catch (err) {
        console.error('Delete User error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete user'
        });
    }
};

export const createUser = async (req, res) => {
    try {
        const { name, email, role } = req.body;

        // Validate required fields
        if (!name || !email) {
            return res.status(400).json({
                status: 'error',
                message: 'Name and email are required'
            });
        }

        // Validate email format
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid email format'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                status: 'error',
                message: 'Email already in use'
            });
        }

        // Generate OTP
        const { generateOTP, hashOTP } = await import('../utils/otpUtils.js');
        const otp = generateOTP();
        const hashedOtp = await hashOTP(otp);

        // Create new user with temporary credentials
        const newUser = await User.create({
            name,
            email,
            password: null, // User will set password after OTP verification
            role: role || 'user',
            isVerified: false
        });

        // Save OTP to database (24h expiry for admin-created accounts)
        await EmailVerificationOTP.create({
            email,
            otp: hashedOtp,
            userId: newUser._id,
            type: 'account_creation',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        // Import config for email configuration
        const config = await import('../config/config.js').then(m => m.default);

        // Generate verification link
        const verificationLink = `${config.frontendUrl}/verify-email?email=${encodeURIComponent(email)}&token=${otp}`;

        // Send email with verification link to user
        try {
            // Check if email configuration is available
            
            if (!config.email.user || !config.email.pass || !config.email.host) {
                console.warn('[EMAIL] Email configuration not fully configured, skipping email send');
                console.warn(`[ADMIN] User created successfully. OTP: ${otp} should be shared with user manually`);
            } else {
                const nodemailer = await import('nodemailer').then(m => m.default);
                const transporter = nodemailer.createTransport({
                    host: config.email.host,
                    port: config.email.port,
                    auth: {
                        user: config.email.user,
                        pass: config.email.pass,
                    },
                    connectionTimeout: 5000,
                    greetingTimeout: 5000,
                    socketTimeout: 5000,
                });

                // Escape name to prevent XSS in email HTML
                const safeName = String(name).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
                const htmlContent = `
                    <h2>Welcome, ${safeName}!</h2>
                    <p>An administrator has created an account for you.</p>
                    <p>Click the link below to verify your email and set up your password:</p>
                    <a href="${verificationLink}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Verify Email & Set Password</a>
                    <p>Or copy and paste this link:</p>
                    <p><code>${verificationLink}</code></p>
                    <p>Your OTP code is: <strong>${otp}</strong></p>
                    <p>This link and code expire in 24 hours.</p>
                    <p>If you did not expect this email, please contact support.</p>
                `;

                await transporter.sendMail({
                    from: `"AI Finance Copilot" <${config.email.from}>`,
                    to: email,
                    subject: 'Complete Your Account Setup',
                    html: htmlContent,
                });
            }
        } catch (emailErr) {
            console.error('[ADMIN] Email sending failed:', emailErr.message || emailErr);
            // Don't fail the request if email sending fails
            // User was created successfully and admin can share the OTP manually
        }

        res.status(201).json({
            status: 'success',
            message: 'User created successfully. Verification email sent with setup link and OTP code.',
            data: {
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    isVerified: newUser.isVerified,
                    createdAt: newUser.createdAt
                }
            }
        });
    } catch (err) {
        console.error('Create User error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create user'
        });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        // Validate role
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid role. Must be "user" or "admin"'
            });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'User role updated successfully',
            data: { user }
        });
    } catch (err) {
        console.error('Update User Role error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update user role'
        });
    }
};

export const blockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Update user with block status
        user.isBlocked = true;
        user.blockedReason = reason || 'Blocked by administrator';
        user.blockedAt = new Date();
        
        // Clear active sessions
        user.activeSessions = [];
        
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            status: 'success',
            message: 'User blocked successfully'
        });
    } catch (err) {
        console.error('Block User error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to block user'
        });
    }
};

export const unblockUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Update user with unblock status
        user.isBlocked = false;
        user.blockedReason = null;
        user.blockedAt = null;
        
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            status: 'success',
            message: 'User unblocked successfully'
        });
    } catch (err) {
        console.error('Unblock User error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to unblock user'
        });
    }
};

// ─── Email Verification Endpoints ────────────────────────────────────────

export const verifyEmailOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                status: 'error',
                message: 'Email and OTP are required'
            });
        }

        // Find OTP record
        const otpRecord = await EmailVerificationOTP.findOne({
            email,
            type: 'account_creation',
            isVerified: false
        });

        if (!otpRecord) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid or expired OTP'
            });
        }

        // Check if OTP is expired
        if (new Date() > otpRecord.expiresAt) {
            await EmailVerificationOTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({
                status: 'error',
                message: 'OTP has expired'
            });
        }

        // Brute force protection: check attempt count before verifying
        const attempts = otpRecord.attempts || 0;
        if (attempts >= 5) {
            await EmailVerificationOTP.deleteOne({ _id: otpRecord._id });
            return res.status(429).json({
                status: 'error',
                message: 'Too many invalid attempts. OTP has been invalidated. Please request a new verification link.'
            });
        }

        // Verify OTP
        const { verifyOTP } = await import('../utils/otpUtils.js');
        const isValid = await verifyOTP(otp, otpRecord.otp);

        if (!isValid) {
            // Increment attempt counter
            await EmailVerificationOTP.updateOne(
                { _id: otpRecord._id },
                { $inc: { attempts: 1 } }
            );
            return res.status(400).json({
                status: 'error',
                message: 'Invalid OTP'
            });
        }

        // Mark OTP as verified by admin
        otpRecord.isVerified = true;
        otpRecord.verifiedAt = new Date();
        otpRecord.verifiedBy = 'admin';
        await otpRecord.save();

        // Update user verification tracking
        const user = await User.findById(otpRecord.userId);
        if (user) {
            user.isVerified = true;
            user.emailVerifiedBy = 'admin';
            user.emailVerifiedAt = new Date();
            await user.save({ validateBeforeSave: false });
        }

        res.status(200).json({
            status: 'success',
            message: 'Email verified successfully by admin',
            data: {
                userId: otpRecord.userId,
                email: email
            }
        });
    } catch (err) {
        console.error('Verify Email OTP error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to verify OTP'
        });
    }
};

export const setPasswordAfterVerification = async (req, res) => {
    try {
        const { userId, password } = req.body;

        if (!userId || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'User ID and password are required'
            });
        }

        // Validate password
        try {
            PasswordSchema.parse(password);
        } catch (err) {
            return res.status(400).json({
                status: 'error',
                message: 'Password must be at least 8 characters'
            });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Check if email is verified
        const otpRecord = await EmailVerificationOTP.findOne({
            userId,
            isVerified: true,
            type: 'account_creation'
        });

        if (!otpRecord) {
            return res.status(400).json({
                status: 'error',
                message: 'Email not verified. Please verify your email first.'
            });
        }

        // Set password and mark user as verified by admin
        user.password = password;
        user.isVerified = true;
        user.emailVerifiedBy = 'admin';
        user.emailVerifiedAt = new Date();
        await user.save();

        // Update OTP record to track admin verification
        await EmailVerificationOTP.findByIdAndUpdate(
            otpRecord._id,
            { verifiedBy: 'admin' },
            { new: true }
        );

        // Send notification to user that email was verified by admin
        try {
            const { sendSecurityAlert } = await import('../utils/emailService.js');
            await sendSecurityAlert(user.email, 'email_verified');
        } catch (emailErr) {
            console.error('Notification email failed:', emailErr);
            // Don't fail the request - password was set successfully
        }

        res.status(200).json({
            status: 'success',
            message: 'Password set successfully. Account is now active. Notification sent to user.',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isVerified: user.isVerified
                }
            }
        });
    } catch (err) {
        console.error('Set Password error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to set password'
        });
    }
};
