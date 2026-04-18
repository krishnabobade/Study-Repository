const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const auth = require('../middleware/auth');

router.get('/stats', analyticsController.getStats);
router.get('/teacher/:id', auth.protect, analyticsController.getTeacherAnalytics);
router.get('/student/:id', auth.protect, analyticsController.getStudentAnalytics);

module.exports = router;
