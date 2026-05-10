const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const assignmentController = require('../controllers/assignment.controller');
const upload = require('../middleware/upload');

router.use(protect);

router.post('/', authorize('super_admin'), assignmentController.createAssignment);
router.get('/', assignmentController.getAssignments);
router.post('/:id/submit', upload.single('file'), assignmentController.submitAssignment);

module.exports = router;
