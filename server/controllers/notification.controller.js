const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .populate('triggeredBy', 'name avatar')
      .sort('-createdAt')
      .limit(40); // slightly higher limit for premium notifications list
    const unreadCount = await Notification.countDocuments({ userId: req.user.id, read: false });
    
    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createNotification = async (userId, message, type = 'info', triggeredBy = null, link = null) => {
  try {
    let notif = await Notification.create({ userId, message, type, triggeredBy, link });
    
    if (triggeredBy) {
      notif = await notif.populate('triggeredBy', 'name avatar');
    }
    
    // Realtime Push Event via WebSockets
    const io = require('../socket').getIo();
    io.to(`user_${userId}`).emit('new_notification', notif);
  } catch (err) {
    console.error('Notification creation failed:', err);
  }
};

exports.notifyAdmins = async (message, type = 'info', triggeredBy = null, link = null) => {
  try {
    const User = require('../models/User');
    const admins = await User.find({
      $or: [
        { role: 'super_admin' },
        { email: 'krishna.bobade@mitwpu.edu.in' }
      ]
    });
    
    for (const admin of admins) {
      if (triggeredBy && triggeredBy.toString() === admin._id.toString()) {
        continue;
      }
      await exports.createNotification(admin._id, message, type, triggeredBy, link);
    }
  } catch (err) {
    console.error('Failed to notify admins:', err);
  }
};
