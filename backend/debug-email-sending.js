import Test from './models/Test.js';
import { sendTestInvitationEmail } from './services/emailService.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

console.log('🔍 Email Sending Debug Test\n');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expensetracker')
  .then(() => console.log('✓ Connected to MongoDB'))
  .catch(err => {
    console.error('✗ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// Find the test
async function testEmailSending() {
  try {
    const testId = 'TST-V1TAD4';
    console.log(`Finding test with ID: ${testId}`);
    
    const test = await Test.findOne({ testId });
    if (!test) {
      console.error('✗ Test not found');
      process.exit(1);
    }
    
    console.log(`✓ Found test: ${test.title}`);
    console.log(`  - Visibility: ${test.accessControl?.visibility || test.visibility || 'public'}`);
    console.log(`  - Assigned Emails: ${test.assignedEmails?.length || 0}`);
    console.log(`  - URL: ${process.env.FRONTEND_URL}\n`);
    
    if (!test.assignedEmails || test.assignedEmails.length === 0) {
      console.error('✗ No emails assigned to this test');
      process.exit(1);
    }
    
    // Generate share token
    const shareToken = jwt.sign(
      {
        testId: test.testId,
        tokenType: 'TEST_SHARE',
        scope: 'attempt',
        version: test.shareTokenVersion || 1
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    const shareLink = `${process.env.FRONTEND_URL}/test/${shareToken}`;
    console.log(`Share Link: ${shareLink}\n`);
    
    // Try sending email to each assigned email
    console.log('Attempting to send emails...\n');
    
    for (const emailObj of test.assignedEmails) {
      const email = typeof emailObj === 'string' ? emailObj : emailObj.email;
      console.log(`📧 Sending to: ${email}`);
      
      try {
        const result = await sendTestInvitationEmail(email, test, shareLink);
        if (result) {
          console.log(`✅ Email sent successfully to ${email}\n`);
        } else {
          console.log(`⚠️ Email sending returned false for ${email}\n`);
        }
      } catch (err) {
        console.error(`❌ Error sending to ${email}:`, err.message, '\n');
      }
    }
    
    console.log('Test complete!');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Wait for connection then run test
setTimeout(() => {
  testEmailSending();
}, 1000);
