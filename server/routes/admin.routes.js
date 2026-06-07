const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// All routes require 'super_admin'
router.use(auth.protect);
router.use(role.requireRole('super_admin'));

router.post('/bulk-approve', adminController.bulkApproveResources);
router.post('/bulk-delete-users', adminController.bulkDeleteUsers);
router.post('/broadcast', adminController.sendSystemAnnouncement);

// SUPER ADMIN ONLY - Management
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

router.get('/resources', adminController.getAllResources);
router.delete('/resources/:id', adminController.deleteResource);

router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
