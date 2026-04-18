const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');

router.get('/stats', analyticsController.getStats);

module.exports = router;
