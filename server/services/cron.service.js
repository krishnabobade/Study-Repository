const cron = require('node-cron');
const Resource = require('../models/Resource');
const User = require('../models/User');
const sendEmail = require('../utils/email');
const logger = require('../config/logger');

// Initialize all scheduled jobs
exports.initCronJobs = () => {
  
  // 1. Weekly Admin Report (Runs every Sunday at midnight)
  cron.schedule('0 0 * * 0', async () => {
    try {
      logger.info('[CRON] Running Weekly Analytics Report...');
      
      const newUsersCount = await User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      });
      
      const newUploadsCount = await Resource.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      });

      // Find all super_admins to send the report
      const admins = await User.find({ role: 'super_admin' });
      
      for (const admin of admins) {
        await sendEmail({
          email: admin.email,
          subject: 'Weekly Platform Analytics 📊',
          htmlContent: `
            <h2>Weekly Growth Report</h2>
            <p>Here is your summary for the past 7 days:</p>
            <ul>
              <li><strong>New Users:</strong> ${newUsersCount}</li>
              <li><strong>New Uploads:</strong> ${newUploadsCount}</li>
            </ul>
            <p>Log in to the admin dashboard for detailed metrics.</p>
          `
        });
      }
    } catch (err) {
      logger.error('[CRON] Weekly Report Error: %o', err);
    }
  });

  // 2. Automated File Expiry Cleanup (Runs every day at 3 AM)
  cron.schedule('0 3 * * *', async () => {
    try {
      logger.info('[CRON] Cleaning up expired files...');
      const now = new Date();
      // Find files that have expired and aren't archived yet
      const expiredFiles = await Resource.updateMany(
        { expiresAt: { $lt: now }, isArchived: false },
        { $set: { isArchived: true } }
      );
      if (expiredFiles.modifiedCount > 0) {
        logger.info(`[CRON] Archived ${expiredFiles.modifiedCount} expired resources.`);
      }
    } catch (err) {
      logger.error('[CRON] File Cleanup Error: %o', err);
    }
  });

  // 3. User Inactivity Reminders (Runs 1st of every month)
  cron.schedule('0 0 1 * *', async () => {
    try {
      logger.info('[CRON] Checking for inactive users...');
      // Logic would find users inactive for 30+ days and send an engagement email
    } catch (err) {
      logger.error('[CRON] Inactivity Check Error: %o', err);
    }
  });

  logger.info('[SYSTEM] Automated Background Jobs Initialized.');
};
