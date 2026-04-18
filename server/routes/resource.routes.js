const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resource.controller');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth'); // Optionally require auth middleware
const { validateAcademicContent } = require('../middleware/academicValidator');

router.get('/', resourceController.getAllResources);
router.get('/trending', resourceController.getTrendingResources);
router.get('/:id', resourceController.getResource);
// Apply AI Content scanning right after file is uploaded to memory
router.post('/', auth.protect, auth.authorize('teacher', 'admin'), upload.single('file'), validateAcademicContent, resourceController.createResource);
router.delete('/:id', auth.protect, auth.authorize('teacher', 'admin'), resourceController.deleteResource);
router.post('/:id/download', auth.protect, resourceController.downloadResource);
router.post('/:id/interact', auth.protect, resourceController.interactResource);

// Document Intelligence & Auth
router.get('/verify-document/:id', resourceController.verifyDocument);
router.post('/:id/version', auth.protect, auth.authorize('teacher', 'admin'), upload.single('file'), validateAcademicContent, resourceController.updateResourceVersion);

// Comment routes
router.get('/:id/comments', resourceController.getComments);
router.post('/:id/comments', auth.protect, resourceController.addComment);

module.exports = router;
