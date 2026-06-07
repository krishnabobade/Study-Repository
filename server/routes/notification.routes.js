const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const auth = require('../middleware/auth');

router.get('/', auth.protect, notificationController.getNotifications);
router.patch('/mark-all-read', auth.protect, notificationController.markAllRead);
router.patch('/:id/read', auth.protect, notificationController.markAsRead);
router.delete('/clear-all', auth.protect, notificationController.deleteAllNotifications);
router.delete('/:id', auth.protect, notificationController.deleteNotification);

module.exports = router;
