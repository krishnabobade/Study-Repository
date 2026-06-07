const mongoose = require('mongoose');
const Resource = require('../models/Resource');
const User = require('../models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/studyrepo').then(async () => {
  console.log('Connected, resetting stats...');
  
  await Resource.updateMany({}, {
    $set: {
      views: 0,
      downloads: 0,
      avgRating: 0,
      ratingCount: 0,
      likes: [],
      dislikes: []
    }
  });

  await User.updateMany({}, {
    $set: {
      totalDownloads: 0,
      documentLikes: 0,
      documentDislikes: 0
    }
  });

  console.log('Successfully reset all fake stats to 0 across the database.');
  process.exit(0);
}).catch(console.error);
