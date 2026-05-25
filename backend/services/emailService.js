import nodemailer from 'nodemailer';
import { setDefaultResultOrder } from 'dns';
import { emailTemplates } from './emailTemplates.js';

// Force IPv4 DNS resolution — Render free tier blocks IPv6 outbound connections.
// Must be called here (not just in server.js) because ES module imports are hoisted,
// meaning this module's body runs before server.js can call setDefaultResultOrder.
setDefaultResultOrder('ipv4first');

// Initialize transporter - supports custom SMTP (Mailtrap, SendGrid, Mailgun, etc.)
let transporter;

// For cloud deployments (Render, Heroku, etc.), use SMTP instead of service mode
// Render blocks Gmail/Outlook SMTP connections. Use Mailtrap, SendGrid, or Mailgun instead.
if (process.env.EMAIL_HOST && process.env.EMAIL_PORT) {
  const emailPass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true' || parseInt(process.env.EMAIL_PORT) === 465,
    family: 4, // Force IPv4 — Render free tier does not support IPv6 outbound
    auth: (process.env.EMAIL_USER || process.env.EMAIL_USERNAME) && emailPass ? {
      user: process.env.EMAIL_USER || process.env.EMAIL_USERNAME,
      pass: emailPass
    } : undefined,
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });
  console.log(`✉️  Using SMTP: ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT} (secure: ${parseInt(process.env.EMAIL_PORT) === 465})`);
} else if ((process.env.EMAIL_USER || process.env.EMAIL_USERNAME) && (process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS)) {
  // Fallback for development: use Gmail with app password
  console.warn('⚠️  EMAIL_HOST not configured. Attempting Gmail authentication.');
  console.warn('   For production (Render), use Mailtrap, SendGrid, or Mailgun instead.');
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    family: 4, // Force IPv4
    auth: {
      user: process.env.EMAIL_USER || process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS
    }
  });
  console.log(`📧 Using Gmail service with user: ${process.env.EMAIL_USER || process.env.EMAIL_USERNAME}`);
} else {
  // Development mode: use ethereal test account
  console.warn('⚠️ No email credentials provided. Using Ethereal test account for development.');
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    family: 4,
    auth: {
      user: process.env.ETHEREAL_USER || 'test@ethereal.email',
      pass: process.env.ETHEREAL_PASS || 'test-password'
    }
  });
}

// Verify connection at startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service SMTP connection failed:', error.message);
    
    // Provide helpful guidance based on the error
    if (error.message.includes('Authentication failed') || error.message.includes('Invalid login')) {
      console.error('\n🔧 EMAIL AUTHENTICATION ERROR:');
      console.error('Gmail: Use 16-character app password (not your regular password)');
      console.error('Steps: https://myaccount.google.com/apppasswords → Select "Mail" and "Windows Computer"');
      console.error('\nFor Render deployments, use Mailtrap, SendGrid, or Mailgun instead.\n');
    } else if (error.code === 'ENETUNREACH' || error.message.includes('ENETUNREACH')) {
      console.error('\n🔧 NETWORK UNREACHABLE (common on Render):');
      console.error('Gmail/Outlook SMTP is blocked on Render. Use instead:');
      console.error('  • Mailtrap: https://mailtrap.io (Free tier)');
      console.error('  • SendGrid: https://sendgrid.com (Free 100 emails/day)');
      console.error('  • Mailgun: https://mailgun.com (Free tier)\n');
    }
  } else {
    console.log('✅ Email service ready - SMTP verified and working');
  }
});

/**
 * Send OTP for email verification
 */
export const sendOTPEmail = async (email, otp, testTitle) => {
  try {
    const html = emailTemplates.otpVerification({ otp, testTitle });
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@examplatform.com',
      to: email,
      subject: `Verify Your Email - OTP: ${otp}`,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`, result.messageId ? `(${result.messageId})` : '');
    return true;
  } catch (error) {
    // In development, log the OTP so testers can use it
    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 [DEV MODE] OTP for ${email}: ${otp}`);
      return true; // Return true so flow continues in development
    }
    console.error('❌ Failed to send OTP email:', error.message);
    return false;
  }
};

/**
 * Send test invitation email
 */
export const sendTestInvitationEmail = async (email, testData, shareLink) => {
  try {
    const html = emailTemplates.testInvitation({ 
      email, 
      testTitle: testData.title,
      testDescription: testData.description,
      testDuration: testData.durationMinutes,
      shareLink
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@examplatform.com',
      to: email,
      subject: `You're Invited to Take: ${testData.title}`,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✉️  Test invitation sent to ${email}` + (result.messageId ? ` (${result.messageId})` : ''));
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 [DEV MODE] Test invitation would be sent to ${email} - Share Link: ${shareLink}`);
      return true;
    }
    console.error('❌ Failed to send test invitation email to', email, ':', error.message);
    return false;
  }
};

/**
 * Send test results email
 */
export const sendTestResultsEmail = async (email, testData, attemptData) => {
  try {
    const html = emailTemplates.testResults({
      testTitle: testData.title,
      score: attemptData.totalMarksObtained,
      totalMarks: attemptData.totalMarksPossible,
      percentage: attemptData.percentage,
      isPassed: attemptData.isPassed,
      passingMarks: testData.settings?.passingMarks || 40
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@examplatform.com',
      to: email,
      subject: `Test Results: ${testData.title}`,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Test results sent to ${email}`);
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 [DEV MODE] Test results would be sent to ${email}`);
      return true;
    }
    console.error('❌ Failed to send test results email:', error.message);
    return false;
  }
};

/**
 * Send admin notification (user blocked)
 */
export const sendAdminBlockNotificationEmail = async (email, reason) => {
  try {
    const html = emailTemplates.blockNotification({ email, reason });

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@examplatform.com',
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'admin@examplatform.com',
      subject: `User Blocked Notification: ${email}`,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Block notification sent to admin`);
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 [DEV MODE] Block notification would be sent to admin`);
      return true;
    }
    console.error('❌ Failed to send block notification:', error.message);
    return false;
  }
};

/**
 * Send unblock notification to user
 */
export const sendUnblockNotificationEmail = async (email, testTitle) => {
  try {
    const html = emailTemplates.unblockNotification({ testTitle });

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@examplatform.com',
      to: email,
      subject: `Access Restored - ${testTitle}`,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Unblock notification sent to ${email}`);
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 [DEV MODE] Unblock notification would be sent to ${email}`);
      return true;
    }
    console.error('❌ Failed to send unblock notification:', error.message);
    return false;
  }
};

export default transporter;
