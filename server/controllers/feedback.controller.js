const Feedback = require('../models/Feedback');

exports.submitFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.create({
      user: req.user.id,
      message: req.body.message
    });
    res.status(201).json({ success: true, feedback });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFeedback = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    const feedback = await Feedback.find()
      .populate('user', 'name email avatar')
      .sort('-createdAt');
    res.json({ success: true, feedback });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateFeedbackStatus = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    const { status } = req.body;
    if (!['open', 'in-progress', 'resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const feedback = await Feedback.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ success: true, feedback });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
