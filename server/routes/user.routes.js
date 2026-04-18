const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth');

const upload = require('../middleware/upload');

router.get('/me/uploads', auth.protect, userController.getMyUploads);
router.patch('/me', auth.protect, upload.single('avatar'), userController.updateProfile);

router.post('/me/bookmark', auth.protect, userController.toggleBookmark);
router.get('/me/saved', auth.protect, userController.getSavedResources);

router.get('/:id/profile', auth.protect, userController.getPublicProfile);
router.post('/:id/interact', auth.protect, userController.interactWithUser);

module.exports = router;
