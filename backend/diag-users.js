import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const diag = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({}, 'name email role _id').lean();
        console.log('--- USER DATA ---');
        console.log(JSON.stringify(users, null, 2));
        console.log('--- END DATA ---');
        process.exit(0);
    } catch (err) {
        console.error('Diag failed:', err);
        process.exit(1);
    }
};

diag();
