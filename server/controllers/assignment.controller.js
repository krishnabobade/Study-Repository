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
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    let status = 'Submitted';
    if (new Date() > new Date(assignment.dueDate)) {
      status = 'Late';
    }

    const { uploadStream } = require('../utils/cloudinary');
    const cloudinaryResult = await uploadStream(req.file.buffer, {
      folder: 'studyrepo/submissions',
      resource_type: 'auto',
    });

    const fileUrl = cloudinaryResult.secure_url;
    const filePublicId = cloudinaryResult.public_id;

    const submission = await Submission.findOneAndUpdate(
      { assignmentId: id, studentId: req.user._id },
      { fileUrl, filePublicId, status, submittedAt: new Date() },
      { new: true, upsert: true }
    );

    res.json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
