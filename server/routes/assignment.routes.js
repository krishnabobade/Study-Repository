const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const assignmentController = require('../controllers/assignment.controller');

router.use(protect);

router.post('/', authorize('teacher', 'admin'), assignmentController.createAssignment);
router.get('/', assignmentController.getAssignments);
router.post('/:id/submit', authorize('student'), assignmentController.submitAssignment);

module.exports = router;
