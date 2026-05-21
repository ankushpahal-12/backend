import 'dotenv/config.js';
import mongoose from 'mongoose';
import EmailVerification from './models/EmailVerification.js';
import connectDB from './config/db.js';

async function checkOTP() {
  try {
    // Connect using the config function
    await connectDB();
    
    // Get the latest OTP for the test email
    const verification = await EmailVerification.findOne({ 
      email: 'jaatankush976@gmail.com' 
    }).sort({ createdAt: -1 });
    
    if (verification) {
      console.log('✅ Latest OTP Record:');
      console.log('  Email:', verification.email);
      console.log('  OTP:', verification.otp);
      console.log('  Verified:', verification.verified);
      console.log('  Attempt Count:', verification.attemptCount);
      console.log('  Created:', verification.createdAt);
    } else {
      console.log('❌ No OTP found for this email');
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkOTP();
