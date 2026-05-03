const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Resource = require('./models/Resource');
const Feedback = require('./models/Feedback');
const AuditLog = require('./models/AuditLog');
const Notification = require('./models/Notification');
const Assignment = require('./models/Assignment');

async function purgeData() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/studyrepo';
    await mongoose.connect(MONGO_URI);
    console.log('--- PURGE INITIATED ---');

    const admins = ['admin@mitwpu.edu.in', 'krishna.bobade@mitwpu.edu.in'];

    // 1. Delete all resources
    const resources = await Resource.deleteMany({});
    console.log(`- Deleted ${resources.deletedCount} resources`);

    // 2. Delete all feedback/bugs
    const feedback = await Feedback.deleteMany({});
    console.log(`- Deleted ${feedback.deletedCount} feedback entries`);

    // 3. Delete all audit logs
    const logs = await AuditLog.deleteMany({});
    console.log(`- Deleted ${logs.deletedCount} audit logs`);

    // 4. Delete all notifications
    const notifs = await Notification.deleteMany({});
    console.log(`- Deleted ${notifs.deletedCount} notifications`);

    // 5. Delete all assignments
    const assignments = await Assignment.deleteMany({});
    console.log(`- Deleted ${assignments.deletedCount} assignments`);

    // 6. Delete all users EXCEPT the admins
    const users = await User.deleteMany({ email: { $nin: admins } });
    console.log(`- Deleted ${users.deletedCount} users (kept ${admins.join(', ')})`);

    // 7. Reset stats for all kept admins
    await User.updateMany(
      { email: { $in: admins } },
      { $set: { totalUploads: 0, totalDownloads: 0 } }
    );
    console.log(`- Reset stats for ${admins.join(', ')}`);

    console.log('--- PURGE COMPLETE ---');
    process.exit(0);
  } catch (err) {
    console.error('Purge Error:', err);
    process.exit(1);
  }
}

purgeData();
