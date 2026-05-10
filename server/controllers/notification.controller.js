const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .populate('sender', 'name avatar')
      .populate('resourceId', 'title')
      .sort('-createdAt')
      .limit(30);
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

exports.clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createNotification = async (userId, message, type = 'info', sender = null, resourceId = null) => {
  try {
    const notif = await Notification.create({ userId, message, type, sender, resourceId });
    
    const populatedNotif = await Notification.findById(notif._id)
      .populate('sender', 'name avatar')
      .populate('resourceId', 'title');

    // Realtime Push Event via WebSockets
    const io = require('../socket').getIo();
    io.to(`user_${userId}`).emit('new_notification', populatedNotif);
  } catch (err) {
    console.error('Notification creation failed:', err);
  }
};
