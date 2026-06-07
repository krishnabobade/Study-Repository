const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const PRESET_AVATARS = [
  '/avatars/avatar_1.jpg',
  '/avatars/avatar_2.jpg',
  '/avatars/avatar_3.jpg',
  '/avatars/avatar_4.jpg',
  '/avatars/avatar_5.jpg',
  '/avatars/avatar_6.jpg'
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/studyrepo').then(async () => {
  console.log('Migrating empty avatars to random preset avatars...');
  
  const users = await User.find({
    $or: [
      { avatar: { $exists: false } },
      { avatar: null },
      { avatar: '' }
    ]
  });

  console.log(`Found ${users.length} users with missing avatars.`);

  let updatedCount = 0;
  for (const user of users) {
    const randomAvatar = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
    user.avatar = randomAvatar;
    await user.save();
    updatedCount++;
    console.log(`Updated user ${user.name} (${user.email}) -> ${randomAvatar}`);
  }

  console.log(`Migration completed successfully! Assigned random preset avatars to ${updatedCount} users.`);
  process.exit(0);
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
  process.exit(1);
});
