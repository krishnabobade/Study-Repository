const express = require('express');
const router = express.Router();
const trendingController = require('../controllers/trending.controller');
const auth = require('../middleware/auth');

// Protected route to fetch trending creators and resources
router.get('/', auth.protect, trendingController.getTrending);

module.exports = router;
