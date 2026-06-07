const User = require('../models/User');
const Resource = require('../models/Resource');
const Comment = require('../models/Comment');
const UserInteraction = require('../models/UserInteraction');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Announcement = require('../models/Announcement');
const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');
const UserReview = require('../models/UserReview');
const { cloudinary } = require('./cloudinary');
const logger = require('../config/logger');

/**
 * Permanently deletes a user and cascades the deletion of all their assets, resources, files, and relationships.
 * @param {string} targetUserId - The ID of the user to delete.
 */
const deleteUserCascade = async (targetUserId) => {
  // 1. Delete physical files from Cloudinary for Resources
  const userResources = await Resource.find({ uploadedBy: targetUserId });
  for (const res of userResources) {
    if (res.filePublicId && process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        await cloudinary.uploader.destroy(res.filePublicId, {
          resource_type: ['pdf', 'doc', 'ppt', 'other'].includes(res.fileType) ? 'raw' : 'image'
        });
      } catch (e) {
        logger.error(`Failed to delete Resource file from Cloudinary: ${res.filePublicId}`, e);
      }
    }
    if (res.previousVersions) {
      for (const pv of res.previousVersions) {
        if (pv.filePublicId && process.env.CLOUDINARY_CLOUD_NAME) {
          try {
            await cloudinary.uploader.destroy(pv.filePublicId, {
              resource_type: ['pdf', 'doc', 'ppt', 'other'].includes(res.fileType) ? 'raw' : 'image'
            });
          } catch (e) {
            logger.error(`Failed to delete Resource previous version file: ${pv.filePublicId}`, e);
          }
        }
      }
    }
  }
  await Resource.deleteMany({ uploadedBy: targetUserId });

  // 2. Delete physical files from Cloudinary for Submissions
  const userSubmissions = await Submission.find({ studentId: targetUserId });
  for (const sub of userSubmissions) {
    if (sub.filePublicId && process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        await cloudinary.uploader.destroy(sub.filePublicId, { resource_type: 'raw' });
      } catch (e) {
        logger.error(`Failed to delete Submission file from Cloudinary: ${sub.filePublicId}`, e);
      }
    }
  }
  await Submission.deleteMany({ studentId: targetUserId });

  // 3. Remove user likes/dislikes from all resources
  await Resource.updateMany(
    { $or: [{ likes: targetUserId }, { dislikes: targetUserId }] },
    { $pull: { likes: targetUserId, dislikes: targetUserId } }
  );

  // 4. Delete user's comments
  await Comment.deleteMany({ user: targetUserId });

  // 5. Delete interactions involving the user
  await UserInteraction.deleteMany({ $or: [{ fromUser: targetUserId }, { targetUser: targetUserId }] });

  // 6. Delete reviews involving the user
  await UserReview.deleteMany({ $or: [{ reviewer: targetUserId }, { targetUser: targetUserId }] });

  // 7. Delete Notifications sent to or triggered by the user
  await Notification.deleteMany({ $or: [{ userId: targetUserId }, { triggeredBy: targetUserId }] });

  // 8. Delete Assignments uploaded by the user (and cascade their submissions)
  const userAssignments = await Assignment.find({ uploadedBy: targetUserId });
  const assignmentIds = userAssignments.map(a => a._id);
  
  if (assignmentIds.length > 0) {
    const assignmentSubmissions = await Submission.find({ assignmentId: { $in: assignmentIds } });
    for (const sub of assignmentSubmissions) {
      if (sub.filePublicId && process.env.CLOUDINARY_CLOUD_NAME) {
        try {
          await cloudinary.uploader.destroy(sub.filePublicId, { resource_type: 'raw' });
        } catch (e) {
          logger.error(`Failed to delete assignment submission file: ${sub.filePublicId}`, e);
        }
      }
    }
    await Submission.deleteMany({ assignmentId: { $in: assignmentIds } });
    await Assignment.deleteMany({ uploadedBy: targetUserId });
  }

  // 9. Delete Announcements
  await Announcement.deleteMany({ createdBy: targetUserId });

  // 10. Delete Feedbacks
  await Feedback.deleteMany({ user: targetUserId });

  // 11. Finally delete the user account
  await User.findByIdAndDelete(targetUserId);
};

module.exports = { deleteUserCascade };
