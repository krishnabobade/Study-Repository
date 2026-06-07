const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

/**
 * SECURITY: Seed script for development use only.
 * The admin password must be set via SEED_ADMIN_PASSWORD environment variable.
 * NEVER commit plaintext credentials to source code.
 * 
 * Usage: SEED_ADMIN_PASSWORD=YourSecurePassword node seed.js
 */
const seedData = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/studyrepo';
        const SEED_PASSWORD = process.env.SEED_ADMIN_PASSWORD;
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

        if (!SEED_PASSWORD) {
            console.error('[SEED ERROR] SEED_ADMIN_PASSWORD environment variable is required.');
            console.error('[SEED ERROR] Usage: SEED_ADMIN_PASSWORD=YourSecurePassword node seed.js');
            process.exit(1);
        }

        if (!ADMIN_EMAIL) {
            console.error('[SEED ERROR] ADMIN_EMAIL environment variable is required.');
            process.exit(1);
        }

        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // 1. Create Admin (only if not exists)
        const adminExists = await User.findOne({ email: ADMIN_EMAIL });
        if (!adminExists) {
            await User.create({
                name: 'Admin User',
                email: ADMIN_EMAIL,
                password: SEED_PASSWORD,
                role: 'super_admin',
                isVerified: true
            });
            // Log existence but never log the password
            console.log(`✅ Admin user created: ${ADMIN_EMAIL}`);
        } else {
            console.log(`ℹ️  Admin user already exists: ${ADMIN_EMAIL}`);
        }

        console.log('Seeding completed successfully.');
        process.exit();
    } catch (err) {
        console.error('Seeding error:', err.message);
        process.exit(1);
    }
}

seedData();
