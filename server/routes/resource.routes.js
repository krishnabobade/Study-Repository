const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resource.controller');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth'); // Optionally require auth middleware
const { validateAcademicContent } = require('../middleware/academicValidator');

router.get('/', resourceController.getAllResources);
router.get('/trending', resourceController.getTrendingResources);
router.get('/recommendations', auth.protect, resourceController.getRecommendations);
router.get('/pending', auth.protect, resourceController.getPendingResources);
router.get('/:id', resourceController.getResource);
router.patch('/:id', auth.protect, resourceController.updateResourceStatus);
// Apply AI Content scanning right after file is uploaded to memory
router.post('/', auth.protect, upload.single('file'), validateAcademicContent, resourceController.createResource);
router.delete('/:id', auth.protect, resourceController.deleteResource);
router.post('/:id/download', auth.protect, resourceController.downloadResource);
router.post('/:id/view', auth.protect, resourceController.recordView);
router.post('/:id/interact', auth.protect, resourceController.interactResource);

// Document Intelligence & Auth
router.get('/verify-document/:id', resourceController.verifyDocument);
router.post('/:id/version', auth.protect, upload.single('file'), validateAcademicContent, resourceController.updateResourceVersion);

// Comment routes
router.get('/:id/comments', resourceController.getComments);
router.post('/:id/comments', auth.protect, resourceController.addComment);
router.delete('/:id/comments/:commentId', auth.protect, resourceController.deleteComment);

module.exports = router;
