const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedData = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/studyrepo';
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB (27017) for seeding...');

        // 1. Create Admin
        const email = 'admin@mitwpu.edu.in';
        const adminExists = await User.findOne({ email });
        if (!adminExists) {
            await User.create({
                name: 'Admin User',
                email: email,
                password: 'adminPassword123',
                role: 'admin',
                isVerified: true
            });
            console.log('✅ Admin user created (admin@mitwpu.edu.in / adminPassword123)');
        }

        console.log('Seeding completed successfully! Check your MongoDB Compass.');
        process.exit();
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

seedData();
