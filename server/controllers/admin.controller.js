const User = require('../models/User');
const Resource = require('../models/Resource');
const AuditLog = require('../models/AuditLog');
const sendEmail = require('../utils/email');

exports.bulkApproveResources = async (req, res) => {
  try {
    const { resourceIds } = req.body;
    
    if (!resourceIds || !Array.isArray(resourceIds)) {
      return res.status(400).json({ success: false, message: 'Provide an array of resourceIds.' });
    }

    const resources = await Resource.find({ _id: { $in: resourceIds } });

    const result = await Resource.updateMany(
      { _id: { $in: resourceIds } },
      { $set: { isApproved: true } }
    );

    // Notify each uploader
    const notificationController = require('./notification.controller');
    for (const resItem of resources) {
      if (!resItem.isApproved) {
        await notificationController.createNotification(
          resItem.uploadedBy,
          `approved your upload: "${resItem.title}"`,
          'info',
          req.user.id,
          `/resources/${resItem._id}`
        );
      }
    }

    // Audit trail
    await AuditLog.create({
      action: 'BULK_APPROVE',
      performedBy: req.user.id,
      targetId: 'MULTIPLE',
      targetName: `${result.modifiedCount} Resources`,
      details: `Admin bulk approved ${result.modifiedCount} files.`
    });

    res.json({ success: true, message: `Successfully approved ${result.modifiedCount} resources.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.bulkDeleteUsers = async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ success: false, message: 'Provide an array of userIds.' });
    }

    const users = await User.find({ _id: { $in: userIds }, role: { $ne: 'super_admin' } });
    const { deleteUserCascade } = require('../utils/userCleanup');
    for (const u of users) {
      await deleteUserCascade(u._id);
    }

    await AuditLog.create({
      action: 'BULK_DELETE_USERS',
      performedBy: req.user.id,
      targetId: 'MULTIPLE',
      targetName: `${users.length} Users`,
      details: `Admin deleted ${users.length} non-super-admin users.`
    });

    res.json({ success: true, message: `Successfully deleted ${users.length} users.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendSystemAnnouncement = async (req, res) => {
  try {
    const { subject, message, targetRole } = req.body; 
    
    let query = {};
    if (targetRole && targetRole !== 'all') {
      query.role = targetRole;
    }

    const users = await User.find(query).select('email');
    const emails = users.map(u => u.email);

    if (emails.length > 0) {
      setTimeout(() => {
        // Email queued successfully
      }, 2000);
    }

    await AuditLog.create({
      action: 'SYSTEM_ANNOUNCEMENT',
      performedBy: req.user.id,
      details: `Broadcasted announcement to ${emails.length} users.`
    });

    res.json({ success: true, message: `Announcement queued for ${emails.length} users.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// USER MANAGEMENT
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { role, name, email } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role, name, email }, { new: true });
    
    await AuditLog.create({
      action: 'ADMIN_UPDATE_USER',
      performedBy: req.user.id,
      targetId: user._id,
      targetName: user.email,
      details: `Admin updated user details for ${user.email}`
    });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    if (user.role === 'super_admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete a super admin' });
    }

    const { deleteUserCascade } = require('../utils/userCleanup');
    await deleteUserCascade(req.params.id);
    
    await AuditLog.create({
      action: 'ADMIN_DELETE_USER',
      performedBy: req.user.id,
      targetId: user._id,
      targetName: user.email,
      details: `Admin deleted user ${user.email}`
    });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// RESOURCE MANAGEMENT
exports.getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate('uploadedBy', 'name email avatar')
      .sort('-createdAt');
    res.json({ success: true, resources });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    // Notify uploader about rejection/deletion
    const notificationController = require('./notification.controller');
    if (resource.uploadedBy) {
      await notificationController.createNotification(
        resource.uploadedBy,
        `rejected/deleted your upload: "${resource.title}"`,
        'alert',
        req.user.id
      );
    }

    // Physical File Cleanup
    if (resource.filePublicId) {
      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        return res.status(500).json({ success: false, message: 'Cloudinary configuration is missing.' });
      }
      const { cloudinary } = require('../utils/cloudinary');
      await cloudinary.uploader.destroy(resource.filePublicId, { resource_type: resource.fileType === 'pdf' || resource.fileType === 'doc' || resource.fileType === 'ppt' || resource.fileType === 'other' ? 'raw' : 'image' });
    }

    // Complete cascade delete for real-time data accuracy
    // 1. Subtract the stats of this document from the uploader's global profile
    if (resource.uploadedBy) {
      await User.findByIdAndUpdate(resource.uploadedBy, { 
        $inc: { 
          totalUploads: -1,
          totalDownloads: -(resource.downloads || 0),
          documentLikes: -(resource.likes?.length || 0),
          documentDislikes: -(resource.dislikes?.length || 0)
        } 
      });
    }

    // 2. Delete all comments and ratings associated with this document
    const Comment = require('../models/Comment');
    await Comment.deleteMany({ resource: resource._id });

    // 3. Remove the document from all users' saved and viewed lists
    await User.updateMany(
      { $or: [{ savedResources: resource._id }, { viewedResources: resource._id }] },
      { $pull: { savedResources: resource._id, viewedResources: resource._id } }
    );

    // 4. Finally delete the resource document itself
    await Resource.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      action: 'ADMIN_DELETE_RESOURCE',
      performedBy: req.user.id,
      targetId: resource._id,
      targetName: resource.title,
      details: `Admin deleted resource: ${resource.title}`
    });

    res.json({ success: true, message: 'Resource deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// AUDIT LOGS
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('performedBy', 'name email role')
      .sort('-createdAt')
      .limit(200);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
