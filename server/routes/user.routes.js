const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth');

const upload = require('../middleware/upload');

router.get('/me/uploads', auth.protect, userController.getMyUploads);
router.patch('/me', auth.protect, upload.single('avatar'), userController.updateProfile);

module.exports = router;
