const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// All routes require at least 'college_admin'
router.use(auth.protect);
router.use(role.requireRole('college_admin'));

router.post('/bulk-approve', adminController.bulkApproveResources);
router.post('/bulk-delete-users', adminController.bulkDeleteUsers);
router.post('/broadcast', adminController.sendSystemAnnouncement);

// SUPER ADMIN ONLY - Management
router.get('/users', role.requireRole('super_admin'), adminController.getAllUsers);
router.patch('/users/:id', role.requireRole('super_admin'), adminController.updateUser);
router.delete('/users/:id', role.requireRole('super_admin'), adminController.deleteUser);

router.get('/resources', role.requireRole('super_admin'), adminController.getAllResources);
router.delete('/resources/:id', role.requireRole('super_admin'), adminController.deleteResource);

router.get('/audit-logs', role.requireRole('super_admin'), adminController.getAuditLogs);

module.exports = router;
