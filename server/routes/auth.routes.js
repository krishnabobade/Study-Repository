const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

router.post('/register', upload.single('avatar'), authController.register);
router.post('/login', authController.login);
router.get('/me', auth.protect, authController.getMe);
router.get('/user/:id', authController.getUserById);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.patch('/password', auth.protect, authController.updatePassword);

module.exports = router;
