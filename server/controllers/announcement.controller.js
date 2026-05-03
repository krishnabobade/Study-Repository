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
