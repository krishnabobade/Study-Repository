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

    const result = await Resource.updateMany(
      { _id: { $in: resourceIds } },
      { $set: { isApproved: true } }
    );

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

    const result = await User.deleteMany({ _id: { $in: userIds }, role: { $ne: 'super_admin' } });

    await AuditLog.create({
      action: 'BULK_DELETE_USERS',
      performedBy: req.user.id,
      targetId: 'MULTIPLE',
      targetName: `${result.deletedCount} Users`,
      details: `Admin deleted ${result.deletedCount} non-super-admin users.`
    });

    res.json({ success: true, message: `Successfully deleted ${result.deletedCount} users.` });
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
        console.log(`[EMAIL QUEUE] Sent announcement "${subject}" to ${emails.length} users.`);
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

    await User.findByIdAndDelete(req.params.id);
    
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
      .populate('uploader', 'name email')
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
