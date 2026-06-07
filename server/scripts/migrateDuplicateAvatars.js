const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/studyrepo';

mongoose.connect(MONGO_URI).then(async () => {
  console.log('Connecting to database for avatar migration...');
  
  // 1. Users with duplicate /avatars/avatar_5.jpg -> /avatars/avatar_3.jpg
  const dupResult = await User.updateMany(
    { avatar: '/avatars/avatar_5.jpg' },
    { $set: { avatar: '/avatars/avatar_3.jpg' } }
  );
  console.log(`Migrated ${dupResult.modifiedCount} users from duplicate avatar_5 to avatar_3.`);

  // 2. Users with /avatars/avatar_6.jpg -> /avatars/avatar_5.jpg
  const shift6Result = await User.updateMany(
    { avatar: '/avatars/avatar_6.jpg' },
    { $set: { avatar: '/avatars/avatar_5.jpg' } }
  );
  console.log(`Shifted ${shift6Result.modifiedCount} users from avatar_6 to avatar_5.`);

  // 3. Users with /avatars/avatar_7.jpg -> /avatars/avatar_6.jpg
  const shift7Result = await User.updateMany(
    { avatar: '/avatars/avatar_7.jpg' },
    { $set: { avatar: '/avatars/avatar_6.jpg' } }
  );
  console.log(`Shifted ${shift7Result.modifiedCount} users from avatar_7 to avatar_6.`);

  console.log('Database avatar migration completed successfully!');
  process.exit(0);
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
  process.exit(1);
});
