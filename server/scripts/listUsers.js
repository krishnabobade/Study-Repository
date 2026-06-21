const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const run = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/studyrepo';
    await mongoose.connect(MONGO_URI);
    const users = await User.find({}, 'name email role createdAt');
    console.log('Total Users in Database:', users.length);
    console.log(JSON.stringify(users, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
};

run();
