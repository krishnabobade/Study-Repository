const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function restoreUser() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/studyrepo';
    await mongoose.connect(MONGO_URI);
    
    const email = 'krishna.bobade@mitwpu.edu.in';
    
    // Check if exists
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        name: 'Krishna Bobade',
        email: email,
        password: 'Password@123', // Default password
        role: 'super_admin',
        isVerified: true,
        consentAccepted: true
      });
      console.log(`✅ User ${email} created as super_admin.`);
    } else {
      user.role = 'super_admin';
      user.consentAccepted = true;
      await user.save();
      console.log(`✅ User ${email} updated to super_admin.`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error restoring user:', err);
    process.exit(1);
  }
}

restoreUser();
