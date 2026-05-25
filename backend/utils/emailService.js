import nodemailer from 'nodemailer';
import { setDefaultResultOrder } from 'dns';
import dotenv from 'dotenv';
import config from '../config/config.js';
import { formatDateTime } from './dateHelpers.js';

// Force IPv4 DNS resolution — Render free tier blocks IPv6 outbound connections.
// Must be called here (not just in server.js) because ES module imports are hoisted,
// meaning this module's body runs before server.js can call setDefaultResultOrder.
setDefaultResultOrder('ipv4first');

// Escape HTML special characters to prevent XSS via dynamic email content
const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
};

dotenv.config();

// Only create transporter if email credentials are provided
let transporter = null;
let emailConfigured = false;

// Prefer custom SMTP (Mailtrap, SendGrid, etc.) for cloud deployments
if (config.email.host && config.email.port) {
    transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: Number(config.email.port) === 465 || config.email.secure, 
        family: 4, // Force IPv4 — Render free tier does not support IPv6 outbound
        auth: config.email.user && config.email.pass ? {
            user: config.email.user,
            pass: config.email.pass,
        } : undefined,
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000,
    });

    console.log(`✉️  Using SMTP: ${config.email.host}:${config.email.port} (secure: ${Number(config.email.port) === 465 || config.email.secure})`);

    // Verify connection configuration
    transporter.verify((error, success) => {
        if (error) {
            console.error('SMTP Connection Error:', error.message);
            console.warn('Email sending is disabled - SMTP configuration failed');
            console.warn('\n📧 PRODUCTION EMAIL SETUP:');
            console.warn('For Render deployments, use one of these services:');
            console.warn('  • Mailtrap: https://mailtrap.io (Free tier available)');
            console.warn('  • SendGrid: https://sendgrid.com (Free 100 emails/day)');
            console.warn('  • Mailgun: https://mailgun.com (Free tier available)');
            console.warn('\nEnvironment variables needed:');
            console.warn('  EMAIL_HOST=smtp.mailtrap.io');
            console.warn('  EMAIL_PORT=465 (or 587)');
            console.warn('  EMAIL_USER=your_username');
            console.warn('  EMAIL_PASS=your_password');
            console.warn('  EMAIL_FROM=noreply@yourapp.com\n');
            emailConfigured = false;
        } else {
            console.log('✅ SMTP Server is ready to send messages');
            emailConfigured = true;
        }
    });
} else {
    console.warn('Email credentials not configured - email sending is disabled');
    console.warn('\n📧 PRODUCTION EMAIL SETUP:');
    console.warn('For Render deployments, use one of these services:');
    console.warn('  • Mailtrap: https://mailtrap.io (Free tier available)');
    console.warn('  • SendGrid: https://sendgrid.com (Free 100 emails/day)');
    console.warn('  • Mailgun: https://mailgun.com (Free tier available)');
    console.warn('\nEnvironment variables needed:');
    console.warn('  EMAIL_HOST=smtp.mailtrap.io');
    console.warn('  EMAIL_PORT=465 (or 587)');
    console.warn('  EMAIL_USER=your_username');
    console.warn('  EMAIL_PASS=your_password');
    console.warn('  EMAIL_FROM=noreply@yourapp.com\n');
    emailConfigured = false;
}

const getEmailTemplate = (title, message, details = '', actionLabel = '', actionUrl = '') => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #F8FAFC; margin: 0; padding: 40px; }
        .container { max-width: 600px; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #E2E8F0; }
        .logo { font-size: 24px; font-weight: 800; color: #0061FF; margin-bottom: 30px; }
        h1 { font-size: 20px; color: #1E293B; margin-bottom: 16px; }
        p { color: #64748B; line-height: 1.6; margin-bottom: 24px; }
        .details-box { background: #F8FAFC; padding: 20px; border-radius: 12px; border: 1px solid #E2E8F0; margin-bottom: 24px; }
        .detail-item { font-size: 14px; margin-bottom: 8px; color: #1E293B; }
        .detail-label { font-weight: 600; color: #64748B; margin-right: 8px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #0061FF; color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
        .otp-container { background: #F1F5F9; padding: 24px; border-radius: 12px; text-align: center; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0061FF; margin: 20px 0; }
        .footer { margin-top: 40px; font-size: 12px; color: #94A3B8; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">AI Finance Copilot</div>
        <h1>${title}</h1>
        <p>${message}</p>
        ${details}
        ${actionLabel ? `<a href="${actionUrl}" class="button">${actionLabel}</a>` : ''}
        <div class="footer">
            Generated on ${formatDateTime()}<br/>
            &copy; ${new Date().getFullYear()} AI Finance Copilot. All rights reserved.
        </div>
    </div>
</body>
</html>
`;

export const sendOTP = async (email, otp, type = 'verification', actionUrl = '') => {
    try {
        if (!emailConfigured || !transporter) {
            console.warn(`[EMAIL] Email not configured. Skipping OTP email to ${email}`);
            return { success: false, reason: 'Email service not configured' };
        }

        const isReset = type === 'passwordReset';
        const isPurge = type === 'accountPurge';

        let title, message;

        if (isPurge) {
            title = '⚠️ Account Deletion Confirmation Code';
            message = [
                '<strong style="color:#DC2626">You have requested permanent account deletion.</strong>',
                'Use the code below to confirm. This action is <strong>irreversible</strong> — all your data will be permanently erased.',
                '<br/>',
                '<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:16px;margin-bottom:16px;color:#991B1B;font-size:14px;">',
                '⚠️ If you did NOT request account deletion, someone may have access to your account.',
                'Change your password immediately and contact support.',
                '</div>',
                'This code expires in <strong>10 minutes</strong>.',
            ].join(' ');
        } else if (isReset) {
            title = 'Reset Your Password';
            message = 'Use the following code to reset your password. For security, never share this code.';
            message += '<br/><br/><strong>Is this you? If not, please change your password immediately.</strong>';
        } else {
            title = 'Verify Your Email';
            message = 'Welcome to AI Finance Copilot! Use the code below to verify your email address.';
        }

        const otpBox = `<div class="otp-container">${otp}</div>`;

        const subject = isPurge
            ? 'Account Deletion Confirmation Code'
            : isReset
                ? 'Password Reset Code'
                : 'Email Verification Code';

        const mailOptions = {
            from: `"AI Finance Copilot Security" <${isPurge ? config.email.securityFrom : config.email.from}>`,
            to: email,
            subject,
            html: getEmailTemplate(title, message, otpBox, isPurge ? 'Cancel — Contact Support' : isReset ? 'Reset Password' : '', actionUrl),
        };

        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error(`[EMAIL] Failed to send OTP to ${email}:`, error.message);
        return { success: false, error: error.message };
    }
};

export const sendMFACode = async (email, code) => {
    if (!emailConfigured || !transporter) {
        console.warn(`[EMAIL] Email not configured. Skipping MFA code email to ${email}`);
        return { success: false, reason: 'Email service not configured' };
    }
    return await sendOTP(email, code, 'mfa');
};

export const sendSecurityAlert = async (email, type, data) => {
    try {
        if (!emailConfigured || !transporter) {
            console.warn(`[EMAIL] Email not configured. Skipping security alert email to ${email}`);
            return { success: false, reason: 'Email service not configured' };
        }

        let title, message, details = '', actionLabel = '', actionUrl = '';

        if (type === 'new_device') {
            title = 'New Device Login Detected';
            message = 'Your account was just logged into from a new device or browser. If this was you, you can ignore this email.';
            details = `
      <div class="details-box">
        <div class="detail-item"><span class="detail-label">Browser:</span> ${escapeHtml(data.userAgent)}</div>
        <div class="detail-item"><span class="detail-label">IP Address:</span> ${escapeHtml(data.ip)}</div>
        <div class="detail-item"><span class="detail-label">Time:</span> ${formatDateTime()}</div>
      </div>
    `;
        } else if (type === 'password_changed') {
            title = 'Password Successfully Changed';
            message = 'Your account password has been successfully updated. If you did not make this change, please contact our support team immediately.';
            actionLabel = 'Contact Support';
            actionUrl = `${config.frontendUrl}/contact`;
        } else if (type === 'email_changed') {
            title = ' Email Address Changed';
            message = `Your account email address has been changed. <strong>Your current session will expire in 10 minutes.</strong> If you did not make this change, please contact support immediately — your account may be compromised.`;
            details = `
      <div class="details-box">
        <div class="detail-item"><span class="detail-label">New Email:</span> ${escapeHtml(data?.newEmail || 'N/A')}</div>
        <div class="detail-item"><span class="detail-label">Time:</span> ${formatDateTime()}</div>
        <div class="detail-item"><span class="detail-label">Session Expires:</span> 10 minutes from now</div>
      </div>
    `;
            actionLabel = 'Contact Support';
            actionUrl = `${config.frontendUrl}/contact`;
        } else if (type === '2fa_enabled') {
            title = 'Two-Factor Authentication Enabled';
            message = 'Two-factor authentication (Google Authenticator) has been successfully enabled on your account. From now on, you will need your authenticator app every time you log in.<br/><br/>If you did not enable this, please contact support and change your password immediately.';
        } else if (type === 'account_deactivated') {
            title = 'Account Deactivated';
            message = 'Your AI Finance Copilot account has been deactivated. You can reactivate it at any time by logging in again.<br/><br/><strong>Did not do this?</strong> Contact support immediately — someone may have access to your account.';
            actionLabel = 'Reactivate Account';
            actionUrl = `${config.frontendUrl}/user/login`;
        } else if (type === 'session_terminated') {
            title = 'Session Terminated';
            message = 'A session was terminated from your account.<br/><br/>If you did not do this, your account may be compromised. Please change your password immediately.';
            actionLabel = 'Change Password';
            actionUrl = `${config.frontendUrl}/user/settings`;
        } else if (type === 'email_verified') {
            title = 'Email Verified Successfully';
            message = 'Your email has been verified and your password has been set. You can now log in to your account with your credentials.';
            actionLabel = 'Log In Now';
            actionUrl = `${config.frontendUrl}/user/login`;
        }

        const mailOptions = {
            from: `"AI Finance Copilot Security" <${config.email.securityFrom}>`,
            to: email,
            subject: title,
            html: getEmailTemplate(title, message, details, actionLabel, actionUrl),
        };

        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error(`[EMAIL] Failed to send security alert to ${email}:`, error.message);
        return { success: false, error: error.message };
    }
};

export const sendContactEmail = async (contactData) => {
    try {
        if (!emailConfigured || !transporter) {
            console.warn(`[EMAIL] Email not configured. Skipping contact email`);
            return { success: false, reason: 'Email service not configured' };
        }

        const { name, email, subject, message } = contactData;

        const contactDetails = `
      <div class="details-box">
        <div class="detail-item"><span class="detail-label">From:</span> ${escapeHtml(name)}</div>
        <div class="detail-item"><span class="detail-label">Email:</span> ${escapeHtml(email)}</div>
        <div class="detail-item"><span class="detail-label">Subject:</span> ${escapeHtml(subject)}</div>
        <div class="detail-item"><span class="detail-label">Time:</span> ${formatDateTime()}</div>
      </div>
    `;

        const mailOptions = {
            from: `"AI Finance Copilot Contact" <${config.email.from}>`,
            to: config.email.user,
            subject: `Contact Form: ${subject}`,
            html: getEmailTemplate(`New Message from ${name}`, escapeHtml(message), contactDetails),
            replyTo: email
        };

        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error(`[EMAIL] Failed to send contact email:`, error.message);
        return { success: false, error: error.message };
    }
};
