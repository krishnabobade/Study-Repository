const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.createAssignment = async (req, res) => {
  try {
    const { title, description, subject, course, semester, dueDate, attachments } = req.body;
    
    // Only teachers/admins can create
    if (req.user.role === 'student') return res.status(403).json({ message: 'Not authorized' });

    const assignment = await Assignment.create({
      title, description, subject, course, semester, dueDate, attachments,
      uploadedBy: req.user._id
    });

    // Notify students of this course and semester
    const students = await User.find({ role: 'student', course, semester });
    const notifications = students.map(student => ({
      userId: student._id,
      type: 'alert',
      message: `New Assignment uploaded: ${title} for ${subject}`
    }));
    if (notifications.length > 0) {
      const inserted = await Notification.insertMany(notifications);
      const io = require('../socket').getIo();
      inserted.forEach(notif => {
        io.to(`user_${notif.userId}`).emit('new_notification', notif);
      });
    }

    res.status(201).json({ success: true, assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const filter = req.user.role === 'student' 
      ? { course: req.user.course, semester: req.user.semester, isActive: true } 
      : { uploadedBy: req.user._id };

    const assignments = await Assignment.find(filter).sort({ dueDate: 1 }).populate('uploadedBy', 'name avatar');
    res.json({ success: true, assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { fileUrl, filePublicId } = req.body;

    const assignment = await Assignment.findById(id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    let status = 'Submitted';
    if (new Date() > new Date(assignment.dueDate)) {
      status = 'Late';
    }

    const submission = await Submission.findOneAndUpdate(
      { assignmentId: id, studentId: req.user._id },
      { fileUrl, filePublicId, status, submittedAt: new Date() },
      { new: true, upsert: true }
    );

    // Notify teacher
    await Notification.create({
      userId: assignment.uploadedBy,
      type: 'info',
      message: `${req.user.name} submitted assignment: ${assignment.title}`
    });

    res.json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
