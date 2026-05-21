import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Test from '../backend/models/Test.js';

dotenv.config({ path: '../backend/.env' });

const generateTestId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'TST-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const tests = await Test.find({ testId: { $exists: false } });
    console.log(`Found ${tests.length} tests without testId`);

    for (const test of tests) {
      let unique = false;
      while (!unique) {
        const id = generateTestId();
        const existing = await Test.findOne({ testId: id });
        if (!existing) {
          test.testId = id;
          await test.save();
          unique = true;
          console.log(`Updated test ${test._id} with testId ${id}`);
        }
      }
    }

    console.log('Migration complete');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
