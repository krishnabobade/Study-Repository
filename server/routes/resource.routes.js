const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resource.controller');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth'); // Optionally require auth middleware

router.get('/', resourceController.getAllResources);
router.get('/trending', resourceController.getTrendingResources);
router.get('/:id', resourceController.getResource);
router.post('/', auth.protect, upload.single('file'), resourceController.createResource);
router.delete('/:id', auth.protect, resourceController.deleteResource);
router.post('/:id/download', auth.protect || ((_, __, next) => next()), resourceController.downloadResource);

// Comment routes
router.get('/:id/comments', resourceController.getComments);
router.post('/:id/comments', auth.protect, resourceController.addComment);

module.exports = router;
