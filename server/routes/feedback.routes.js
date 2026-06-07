const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');
const auth = require('../middleware/auth');

router.post('/', auth.protect, feedbackController.submitFeedback);
router.get('/', auth.protect, feedbackController.getFeedback);
router.patch('/:id/status', auth.protect, feedbackController.updateFeedbackStatus);
router.patch('/:id/read', auth.protect, feedbackController.markFeedbackAsRead);
router.delete('/:id', auth.protect, feedbackController.deleteFeedback);

module.exports = router;
