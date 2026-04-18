const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, targetCourses, targetSemesters, isGlobal } = req.body;

    if (req.user.role === 'student') return res.status(403).json({ message: 'Not authorized' });

    const announcement = await Announcement.create({
      title, content, targetCourses, targetSemesters, isGlobal,
      authorId: req.user._id
    });

    // Determine target users for notifications
    let filter = { role: 'student' };
    if (!isGlobal) {
      if (targetCourses && targetCourses.length > 0) filter.course = { $in: targetCourses };
      if (targetSemesters && targetSemesters.length > 0) filter.semester = { $in: targetSemesters };
    }

    const targetUsers = await User.find(filter);
    const notifications = targetUsers.map(u => ({
      userId: u._id,
      type: 'info',
      message: `Announcement: ${title}`
    }));

    if (notifications.length > 0) {
      const inserted = await Notification.insertMany(notifications);
      const io = require('../socket').getIo();
      inserted.forEach(notif => {
        io.to(`user_${notif.userId}`).emit('new_notification', notif);
      });
    }

    res.status(201).json({ success: true, announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'student') {
      filter = {
        $or: [
          { isGlobal: true },
        ]
      };
      if (req.user.course) filter.$or.push({ targetCourses: req.user.course });
      if (req.user.semester) filter.$or.push({ targetSemesters: req.user.semester });
    } else {
      filter = { authorId: req.user._id };
    }

    const announcements = await Announcement.find(filter).sort({ createdAt: -1 }).populate('authorId', 'name role');
    res.json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
