const Resource = require('../models/Resource');

exports.getMyUploads = async (req, res) => {
  try {
    const resources = await Resource.find({ uploadedBy: req.user.id }).sort('-createdAt');
    res.json({ success: true, resources });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { uploadStream } = require('../utils/cloudinary');

const User = require('../models/User');

exports.updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    const allowedFields = ['name', 'phone', 'dob', 'gender', 'course', 'semester', 'yearOfStudy', 'bio'];
    Object.keys(updates).forEach(key => {
      if (!allowedFields.includes(key)) delete updates[key];
    });

    if (req.file) {
      const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase() || 'jpg';
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        const cloudinaryResult = await uploadStream(req.file.buffer, { folder: 'studyrepo/avatars', resource_type: 'image' });
        updates.avatar = cloudinaryResult.secure_url;
      } else {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        const filename = `avatar-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
        fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
        updates.avatar = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleBookmark = async (req, res) => {
  try {
    const { resourceId } = req.body;
    const user = await User.findById(req.user.id);
    const index = user.savedResources.indexOf(resourceId);
    
    if (index === -1) {
      user.savedResources.push(resourceId);
    } else {
      user.savedResources.splice(index, 1);
    }
    
    await user.save();
    res.json({ success: true, savedResources: user.savedResources });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSavedResources = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('savedResources');
    res.json({ success: true, resources: user.savedResources });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const UserInteraction = require('../models/UserInteraction');

exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name avatar bio role joined course semester yearOfStudy totalUploads totalDownloads totalLikes totalDislikes documentLikes documentDislikes avgRating ratingCount');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Fetch user's public activity
    let recentActivity = [];
    if (user.role === 'teacher' || user.role === 'admin') {
      recentActivity = await Resource.find({ uploadedBy: user._id, isApproved: true })
        .sort('-createdAt').limit(10)
        .select('title subject category views downloads createdAt');
    }

    // Check if the current requesting user has already interacted with this profile
    let myInteraction = null;
    if (req.user) {
      myInteraction = await UserInteraction.findOne({ targetUser: user._id, fromUser: req.user.id });
    }

    res.json({ success: true, profile: user, recentActivity, myInteraction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.interactWithUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const fromUserId = req.user.id;
    const { action, rating } = req.body; // action: 'like', 'dislike', or 'none'. rating: 1-5 (optional)

    if (targetUserId === fromUserId) {
      return res.status(400).json({ success: false, message: 'Cannot interact with your own profile' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    let interaction = await UserInteraction.findOne({ targetUser: targetUserId, fromUser: fromUserId });
    
    if (!interaction) {
      interaction = new UserInteraction({ targetUser: targetUserId, fromUser: fromUserId });
    }

    if (action !== undefined) {
      interaction.action = action;
    }
    if (rating !== undefined) {
      interaction.rating = Number(rating);
    }

    await interaction.save();

    // Recalculate aggregates for the target user safely
    const stats = await UserInteraction.aggregate([
      { $match: { targetUser: new require('mongoose').Types.ObjectId(targetUserId) } },
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

    targetUser.totalLikes = totalLikes;
    targetUser.totalDislikes = totalDislikes;
    targetUser.ratingCount = ratingCount;
    targetUser.avgRating = avgRating;
    await targetUser.save();

    // Send Notification
    const notificationController = require('./notification.controller');
    if (action === 'like') {
      await notificationController.createNotification(targetUserId, `Someone liked your profile!`, 'info');
    } else if (action === 'dislike') {
      await notificationController.createNotification(targetUserId, `Someone disliked your profile.`, 'alert');
    }
    if (rating !== undefined && rating > 0) {
      await notificationController.createNotification(targetUserId, `Someone rated your profile ${rating} stars!`, 'info');
    }

    res.json({ success: true, myInteraction: interaction, stats: { totalLikes, totalDislikes, avgRating, ratingCount } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const isAdmin = ['super_admin', 'college_admin', 'department_admin', 'admin'].includes(req.user.role);
    if (!isAdmin) return res.status(403).json({ success: false, message: 'Unauthorized. Admin access required.' });

    const targetUserId = req.params.id;
    if (targetUserId === req.user.id) return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });

    const user = await User.findById(targetUserId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await User.findByIdAndDelete(targetUserId);

    const AuditLog = require('../models/AuditLog');
    await AuditLog.create({
      action: 'DELETE_USER',
      performedBy: req.user.id,
      targetId: targetUserId,
      targetName: user.email,
      details: `${req.user.role} permanently deleted user account ${user.email}.`
    });

    res.json({ success: true, message: 'User permanently deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
