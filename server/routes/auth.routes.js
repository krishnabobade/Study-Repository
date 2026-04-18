const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

router.post('/register', upload.single('avatar'), authController.register);
router.post('/login', authController.login);
router.get('/me', auth.protect, authController.getMe);
router.get('/user/:id', authController.getUserById);

module.exports = router;
