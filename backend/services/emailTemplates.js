/**
 * Email Templates
 * All templates return HTML strings
 */

const baseStyles = `
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px; border-radius: 8px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: white; padding: 30px; }
    .otp-box { background: #f0f4ff; border: 2px solid #667eea; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
    .otp-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
    .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
    .btn { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .alert-success { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .alert-warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .test-details { background: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; }
    .test-details p { margin: 8px 0; }
    .score-high { color: #10b981; font-size: 24px; font-weight: bold; }
    .score-low { color: #ef4444; font-size: 24px; font-weight: bold; }
  </style>
`;

export const emailTemplates = {
  /**
   * OTP Verification Email
   */
  otpVerification: ({ otp, testTitle }) => `
    <!DOCTYPE html>
    <html>
    <head>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Email Verification Required</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>You're about to take the test: <strong>${testTitle}</strong></p>
          <p>Please verify your email using the OTP below:</p>
          
          <div class="otp-box">
            <p>Your verification code:</p>
            <div class="otp-code">${otp}</div>
            <p style="color: #6b7280; margin-top: 15px; font-size: 14px;">This code expires in 10 minutes</p>
          </div>

          <p><strong>How to verify:</strong></p>
          <ol>
            <li>Enter the OTP code above on the test verification page</li>
            <li>You'll have up to 5 attempts</li>
            <li>Once verified, you can start your test</li>
          </ol>

          <p style="color: #6b7280; margin-top: 30px; font-size: 14px;">
            <strong>Note:</strong> If you did not request this OTP, please contact the test administrator.
          </p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Test Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  /**
   * Test Invitation Email
   */
  testInvitation: ({ email, testTitle, testDescription, testDuration, shareLink }) => `
    <!DOCTYPE html>
    <html>
    <head>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>You're Invited to Take a Test</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>You've been invited to take a test. Here are the details:</p>

          <div class="test-details">
            <p><strong>Test Title:</strong> ${testTitle}</p>
            <p><strong>Description:</strong> ${testDescription || 'N/A'}</p>
            <p><strong>Duration:</strong> ${testDuration} minutes</p>
            <p><strong>Email:</strong> ${email}</p>
          </div>

          <p>Click the button below to start:</p>
          <div style="text-align: center;">
            <a href="${shareLink}" class="btn">Start Test Now</a>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            <strong>Or copy this link:</strong><br>
            <code style="background: #f3f4f6; padding: 8px; display: inline-block; border-radius: 4px; word-break: break-all;">
              ${shareLink}
            </code>
          </p>

          <div class="alert-warning">
            <p><strong>Important:</strong> Make sure to complete this test before the deadline. The link will remain active as long as it's configured by the administrator.</p>
          </div>
        </div>
        <div class="footer">
          <p>&copy; 2026 Test Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  /**
   * Test Results Email
   */
  testResults: ({ testTitle, score, totalMarks, percentage, isPassed, passingMarks }) => `
    <!DOCTYPE html>
    <html>
    <head>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Test Results</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>You have completed the test: <strong>${testTitle}</strong></p>

          <div class="test-details">
            <p><strong>Status:</strong> ${isPassed ? '✅ PASSED' : '❌ NOT PASSED'}</p>
            <p><strong>Your Score:</strong> 
              <span class="${isPassed ? 'score-high' : 'score-low'}">${score}/${totalMarks}</span>
            </p>
            <p><strong>Percentage:</strong> ${percentage.toFixed(2)}%</p>
            <p><strong>Passing Score:</strong> ${passingMarks}%</p>
          </div>

          ${isPassed ? `
            <div class="alert-success">
              <p><strong>Congratulations!</strong> You have passed this test.</p>
            </div>
          ` : `
            <div class="alert-warning">
              <p><strong>Keep Trying!</strong> You did not pass this test. If allowed by the administrator, you may retake it.</p>
            </div>
          `}

          <p style="margin-top: 30px;">Thank you for taking the test. If you have any questions, please contact the test administrator.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Test Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  /**
   * User Block Notification Email (to admin)
   */
  blockNotification: ({ email, reason }) => `
    <!DOCTYPE html>
    <html>
    <head>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
          <h1>User Blocked Alert</h1>
        </div>
        <div class="content">
          <p>An administrator action is required.</p>

          <div class="alert-warning">
            <p><strong>User Email:</strong> ${email}</p>
            <p><strong>Reason:</strong> ${reason}</p>
          </div>

          <p>The user has been automatically blocked from continuing with their test due to suspicious activity or policy violations.</p>

          <p><strong>Recommended Actions:</strong></p>
          <ul>
            <li>Review the user's activity logs</li>
            <li>Contact the user to explain the block</li>
            <li>Unblock if the block was in error</li>
            <li>Document the incident</li>
          </ul>

          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">This is an automated notification. Please log into the admin panel to manage blocks.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Test Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  /**
   * User Unblock Notification Email (to user)
   */
  unblockNotification: ({ testTitle }) => `
    <!DOCTYPE html>
    <html>
    <head>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
          <h1>Access Restored</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          
          <div class="alert-success">
            <p>Good news! Your access to the test "<strong>${testTitle}</strong>" has been restored.</p>
          </div>

          <p>You can now resume or retake this test if permitted by the administrator.</p>

          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            If you believe this block was in error, please contact the test administrator for assistance.
          </p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Test Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
};
