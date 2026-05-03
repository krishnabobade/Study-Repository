const mongoose = require('mongoose');
const Resource = require('../models/Resource');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/studyrepo').then(async () => {
  console.log('Connected, deleting broken localhost resources...');
  const result = await Resource.deleteMany({ fileUrl: { $regex: '^http://localhost' } });
  console.log(`Successfully deleted ${result.deletedCount} broken local resources.`);
  process.exit(0);
}).catch(console.error);
