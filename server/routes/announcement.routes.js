const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const announcementController = require('../controllers/announcement.controller');

router.use(protect);

router.post('/', authorize('teacher', 'admin'), announcementController.createAnnouncement);
router.get('/', announcementController.getAnnouncements);

module.exports = router;
