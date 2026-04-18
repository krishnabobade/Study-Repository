const Resource = require('../models/Resource');
const User = require('../models/User');
const mongoose = require('mongoose');
const { uploadStream } = require('../utils/cloudinary');
const path = require('path');

exports.getAllResources = async (req, res) => {
  try {
    const { search, course, semester, category, fileType, sort = '-createdAt', limit = 12, page = 1 } = req.query;
    
    const query = {};
    if (search) {
      query.$text = { $search: search };
    }
    if (course) query.course = course;
    if (semester) query.semester = Number(semester);
    if (category) query.category = category;
    if (fileType) query.fileType = fileType;

    const skip = (Number(page) - 1) * Number(limit);
    
    const resources = await Resource.find(query)
      .populate('uploadedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));
      
    const total = await Resource.countDocuments(query);

    res.json({ 
      success: true, 
      resources,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTrendingResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .sort({ downloads: -1, views: -1, createdAt: -1 })
      .limit(4)
      .populate('uploadedBy', 'name');
    res.json({ success: true, resources });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createResource = async (req, res) => {
  try {
    // If auth is not strictly required yet, we can mock uploadedBy for testing
    // production requires req.user coming from auth middleware
    const uploadedBy = req.user ? req.user.id : await User.findOne().then(u => u?._id);
    
    if (!uploadedBy) {
      return res.status(401).json({ success: false, message: 'User must be logged in' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { title, description, subject, course, semester, category, tags } = req.body;

    const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase();
    
    let fileType = 'other';
    if (ext === 'pdf') fileType = 'pdf';
    else if (['doc', 'docx'].includes(ext)) fileType = 'doc';
    else if (['ppt', 'pptx'].includes(ext)) fileType = 'ppt';
    else if (['jpg', 'jpeg', 'png'].includes(ext)) fileType = 'image';
    else if (['mp4'].includes(ext)) fileType = 'video';

    let fileUrl = '';
    let filePublicId = '';

    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      // Use Cloudinary
      let resource_type = 'auto';
      if (['doc', 'docx', 'ppt', 'pptx', 'pdf'].includes(fileType) || fileType === 'other') {
        resource_type = 'raw';
      }

      const uploadOptions = {
        folder: 'studyrepo',
        resource_type: resource_type
      };

      const cloudinaryResult = await uploadStream(req.file.buffer, uploadOptions);
      fileUrl = cloudinaryResult.secure_url;
      filePublicId = cloudinaryResult.public_id;
    } else {
      // Local App Storage Fallback
      const fs = require('fs');
      const crypto = require('crypto');
      const uploadDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      
      const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
      fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
      
      const baseUrl = req.protocol + '://' + req.get('host');
      fileUrl = `${baseUrl}/uploads/${filename}`;
      filePublicId = filename;
    }

    const resource = await Resource.create({
      title,
      description,
      subject,
      course,
      semester: Number(semester),
      category,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      fileUrl,
      filePublicId,
      fileType,
      fileSize: req.file.size,
      uploadedBy,
      isApproved: true // Auto-approve for now
    });

    // Update user stats
    await User.findByIdAndUpdate(uploadedBy, { $inc: { totalUploads: 1 } });

    // Notify user
    const notificationController = require('./notification.controller');
    await notificationController.createNotification(
      uploadedBy,
      `High-five! Your resource "${title}" is now live and ready for students to download.`,
      'info'
    );

    res.status(201).json({ success: true, message: 'Resource created', resource });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('uploadedBy', 'name email');
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    
    // Increment view count
    resource.views += 1;
    await resource.save();

    res.json({ success: true, resource });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    // Increment download count
    resource.downloads += 1;
    await resource.save();

    if (req.user) {
      await User.findByIdAndUpdate(req.user.id, { $inc: { totalDownloads: 1 } });
    }

    res.json({ success: true, fileUrl: resource.fileUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    // Ensure the current user has permission (uploadedBy or is admin)
    if (resource.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this resource' });
    }

    await Resource.findByIdAndDelete(req.params.id);

    // Decrement the user's total upload stats
    await User.findByIdAndUpdate(resource.uploadedBy, { $inc: { totalUploads: -1 } });

    res.json({ success: true, message: 'Resource deleted safely' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
const Comment = require('../models/Comment');

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ resource: req.params.id })
      .populate('user', 'name avatar')
      .sort('-createdAt');
    res.json({ success: true, comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const resourceId = req.params.id;
    const userId = req.user.id;

    const resource = await Resource.findById(resourceId);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    const newComment = await Comment.create({
      resource: resourceId,
      user: userId,
      rating: Number(rating),
      comment
    });

    // Update resource rating
    const stats = await Comment.aggregate([
      { $match: { resource: new mongoose.Types.ObjectId(resourceId) } },
      { $group: { _id: '$resource', avgRating: { $sum: '$rating' }, count: { $sum: 1 } } }
    ]);

    if (stats.length > 0) {
      await Resource.findByIdAndUpdate(resourceId, {
        avgRating: stats[0].avgRating / stats[0].count,
        ratingCount: stats[0].count
      });
    }

    const populated = await newComment.populate('user', 'name avatar');
    
    // Notify uploader
    const notificationController = require('./notification.controller');
    if (resource.uploadedBy.toString() !== userId) {
      await notificationController.createNotification(
        resource.uploadedBy,
        `${populated.user.name} rated your resource "${resource.title}" with ${rating} stars`,
        'activity'
      );
    }

    res.status(201).json({ success: true, comment: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
