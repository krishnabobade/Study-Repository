const mongoose = require('mongoose');
const User = require('../models/User');
const Resource = require('../models/Resource');
const UserInteraction = require('../models/UserInteraction');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/studyrepo').then(async () => {
  console.log('Syncing real user stats...');
  
  const users = await User.find();
  for (const user of users) {
    // 1. Exact total uploads
    const totalUploads = await Resource.countDocuments({ uploadedBy: user._id });
    
    // 2. Exact total downloads of their resources
    const resources = await Resource.find({ uploadedBy: user._id });
    const totalDownloads = resources.reduce((acc, r) => acc + (r.downloads || 0), 0);
    
    // 3. Exact interactions
    const stats = await UserInteraction.aggregate([
      { $match: { targetUser: user._id } },
      { $group: {
          _id: '$targetUser',
          totalLikes: { $sum: { $cond: [{ $eq: ['$action', 'like'] }, 1, 0] } },
          totalDislikes: { $sum: { $cond: [{ $eq: ['$action', 'dislike'] }, 1, 0] } },
          ratingSum: { $sum: { $cond: [{ $gt: ['$rating', 0] }, '$rating', 0] } },
          ratingCount: { $sum: { $cond: [{ $gt: ['$rating', 0] }, 1, 0] } }
      }}
    ]);

    let totalLikes = 0, totalDislikes = 0, avgRating = 0, ratingCount = 0;
    if (stats.length > 0) {
      totalLikes = stats[0].totalLikes;
      totalDislikes = stats[0].totalDislikes;
      ratingCount = stats[0].ratingCount;
      avgRating = ratingCount > 0 ? (stats[0].ratingSum / ratingCount).toFixed(1) : 0;
    }

    user.totalUploads = totalUploads;
    user.totalDownloads = totalDownloads;
    user.totalLikes = totalLikes;
    user.totalDislikes = totalDislikes;
    user.ratingCount = ratingCount;
    user.avgRating = avgRating;
    
    await user.save();
  }
  
  console.log('User stats successfully synced with absolute real database values!');
  process.exit(0);
}).catch(console.error);
