const Resource = require('../models/Resource');
const User = require('../models/User');
const mongoose = require('mongoose');
const { uploadStream } = require('../utils/cloudinary');
const path = require('path');

exports.getAllResources = async (req, res) => {
  try {
    const { search, course, semester, category, fileType, dateRange, sort, limit = 12, page = 1 } = req.query;
    
    // 1. Text Search (Primary Engine)
    let query = {};
    let sortCondition = { createdAt: -1 }; // Default new

    if (search) {
      // Basic Text Index Match (High performance, exact stem)
      query.$text = { $search: search };
      sortCondition = { score: { $meta: 'textScore' } }; 
      
      // If user forces a certain sort, override relevance
      if (sort && sort !== 'relevance') {
         if (sort === '-createdAt') sortCondition = { createdAt: -1 };
         if (sort === 'createdAt') sortCondition = { createdAt: 1 };
         if (sort === '-downloads') sortCondition = { downloads: -1 };
      }
    } else if (sort) {
       if (sort === '-createdAt') sortCondition = { createdAt: -1 };
       if (sort === 'createdAt') sortCondition = { createdAt: 1 };
       if (sort === '-downloads') sortCondition = { downloads: -1 };
    }

    if (course) query.course = course;
    if (semester) query.semester = Number(semester);
    if (category) query.category = category;
    if (fileType) query.fileType = fileType;

    // Advanced filtering by date
    if (dateRange) {
      const now = new Date();
      if (dateRange === 'week') query.createdAt = { $gte: new Date(now.setDate(now.getDate() - 7)) };
      else if (dateRange === 'month') query.createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
      else if (dateRange === 'year') query.createdAt = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    let resources = await Resource.find(query, search ? { score: { $meta: 'textScore' } } : {})
      .populate('uploadedBy', 'name email role')
      .sort(sortCondition)
      .skip(skip)
      .limit(Number(limit));
      
    // 2. Fuzzy Search Fallback Engine
    // If exact text index fails to find anything, fallback to a fuzzy regex on title/tags
    if (search && resources.length === 0) {
      const fuzzyRegex = new RegExp(search.split(' ').join('.*'), 'i');
      delete query.$text; // Remove text score expectation
      query.$or = [
        { title: fuzzyRegex },
        { autoTags: fuzzyRegex },
        { subject: fuzzyRegex }
      ];
      
      resources = await Resource.find(query)
        .populate('uploadedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));
    }

    const total = await Resource.countDocuments(query);

    res.json({ 
      success: true, 
      resources,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
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
    const uploadedBy = req.user ? req.user.id : await User.findOne().then(u => u?._id);
    if (!uploadedBy) return res.status(401).json({ success: false, message: 'User must be logged in' });
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const crypto = require('crypto');
    // Generate File Hash (Document Auth)
    const fileHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');

    // Duplicate detection across system
    const existingFile = await Resource.findOne({ fileHash });
    if (existingFile) {
      return res.status(409).json({ success: false, message: 'Security System: Duplicate file detected across repository.' });
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
      let resource_type = ['doc', 'docx', 'ppt', 'pptx', 'pdf', 'other'].includes(fileType) ? 'raw' : 'auto';
      const cloudinaryResult = await uploadStream(req.file.buffer, { folder: 'studyrepo', resource_type });
      fileUrl = cloudinaryResult.secure_url;
      filePublicId = cloudinaryResult.public_id;
    } else {
      const fs = require('fs');
      const uploadDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
      fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
      const baseUrl = req.protocol + '://' + req.get('host');
      fileUrl = `${baseUrl}/uploads/${filename}`;
      filePublicId = filename;
    }

    // AI Intelligence tags (Simulated NLP keyword extraction from title & subject)
    const stopWords = ['the', 'and', 'for', 'with', 'intro', 'basics', 'of', 'in', 'part'];
    const autoTags = `${title} ${subject} ${category}`.toLowerCase().split(/[\s,-]+/)
      .filter(w => w.length > 3 && !stopWords.includes(w));
    
    const aiSummary = `This is a ${category} document covering topics on ${subject}. Automatically processed for ${course} students.`;

    const documentId = `DOC-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    const resource = await Resource.create({
      title, description, subject, course, semester: Number(semester), category,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      fileUrl, filePublicId, fileType, fileSize: req.file.size, uploadedBy,
      fileHash, documentId,
      autoTags: [...new Set(autoTags)], aiSummary,
      isApproved: true
    });

    await User.findByIdAndUpdate(uploadedBy, { $inc: { totalUploads: 1 } });

    const notificationController = require('./notification.controller');
    await notificationController.createNotification(
      uploadedBy,
      `High-five! Your resource "${title}" is now live and secured with Auth ID: ${documentId}`,
      'info'
    );

    res.status(201).json({ success: true, message: 'Resource created safely', resource });
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

    // Track user viewing
    if (req.user) {
      await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { viewedResources: resource._id }
      });
    }

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

exports.interactResource = async (req, res) => {
  try {
    const { action } = req.body; // 'like', 'dislike', 'none'
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    
    // Track initial state
    const wasLiked = resource.likes.some(id => id.toString() === req.user.id);
    const wasDisliked = resource.dislikes.some(id => id.toString() === req.user.id);

    // Remove user from both arrays to prevent duplicates
    resource.likes = resource.likes.filter(id => id.toString() !== req.user.id);
    resource.dislikes = resource.dislikes.filter(id => id.toString() !== req.user.id);

    // Apply new interaction
    if (action === 'like') {
      resource.likes.push(req.user.id);
    } else if (action === 'dislike') {
      resource.dislikes.push(req.user.id);
    }

    await resource.save();

    // Propagate diff to the document uploader's User profile
    let likeDiff = 0, dislikeDiff = 0;
    if (wasLiked && action !== 'like') likeDiff -= 1;
    if (!wasLiked && action === 'like') likeDiff += 1;
    if (wasDisliked && action !== 'dislike') dislikeDiff -= 1;
    if (!wasDisliked && action === 'dislike') dislikeDiff += 1;

    if (likeDiff !== 0 || dislikeDiff !== 0) {
      await User.findByIdAndUpdate(resource.uploadedBy, {
        $inc: { documentLikes: likeDiff, documentDislikes: dislikeDiff }
      });
    }

    res.json({ 
      success: true, 
      likes: resource.likes, 
      dislikes: resource.dislikes 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    // Validate global role permissions
    const isOwner = resource.uploadedBy.toString() === req.user.id;
    const isTeacher = req.user.role === 'teacher';
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isTeacher && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this resource. Insufficient permissions.' });
    }

    // Physical File Cleanup
    if (resource.filePublicId) {
      if (process.env.CLOUDINARY_CLOUD_NAME) {
         const { cloudinary } = require('../utils/cloudinary');
         // We might need to specify resource_type if it is raw, but destroy often figures it out or doesn't care. Safe to just attempt a basic destroy.
         await cloudinary.uploader.destroy(resource.filePublicId, { resource_type: resource.fileType === 'pdf' || resource.fileType === 'doc' || resource.fileType === 'ppt' || resource.fileType === 'other' ? 'raw' : 'image' });
      } else {
         const fs = require('fs');
         const path = require('path');
         const filePath = path.join(__dirname, '../uploads', resource.filePublicId);
         if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    }

    // Generate Moderation Audit Trail
    if (!isOwner) {
       const AuditLog = require('../models/AuditLog');
       await AuditLog.create({
          action: 'GLOBAL_DELETE_RESOURCE',
          performedBy: req.user.id,
          targetId: resource._id.toString(),
          targetName: resource.title,
          details: `${req.user.role.toUpperCase()} permanently deleted study material belonging to user [${resource.uploadedBy}].`
       });
    }

    await Resource.findByIdAndDelete(req.params.id);

    // Decrement the user's total upload stats
    await User.findByIdAndUpdate(resource.uploadedBy, { $inc: { totalUploads: -1 } });

    res.json({ success: true, message: 'Resource deleted safely and permanently.' });
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

exports.verifyDocument = async (req, res) => {
  try {
    const { id } = req.params; // documentId
    const resource = await Resource.findOne({ documentId: id }).populate('uploadedBy', 'name role');
    
    if (!resource) return res.status(404).json({ status: 'Not Found', message: 'Invalid Document ID' });

    res.json({
      status: 'Verified',
      authenticity: {
        documentId: resource.documentId,
        hash: resource.fileHash,
        uploader: resource.uploadedBy.name,
        uploadedAt: resource.createdAt,
        latestVersion: resource.version
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateResourceVersion = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findById(id);
    
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    if (resource.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized manually version this document.' });
    }
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded for new version' });

    const crypto = require('crypto');
    const newHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');

    if (newHash === resource.fileHash) {
      return res.status(400).json({ success: false, message: 'This exact file is already the latest version.' });
    }

    // Archive current file
    resource.previousVersions.push({
      version: resource.version,
      fileUrl: resource.fileUrl,
      filePublicId: resource.filePublicId,
      fileHash: resource.fileHash,
      uploadedAt: resource.updatedAt
    });

    // Handle Upload for new file
    const ext = require('path').extname(req.file.originalname).replace('.', '').toLowerCase();
    const fs = require('fs');
    const uploadDir = require('path').join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
    fs.writeFileSync(require('path').join(uploadDir, filename), req.file.buffer);
    const baseUrl = req.protocol + '://' + req.get('host');
    
    resource.fileUrl = `${baseUrl}/uploads/${filename}`;
    resource.filePublicId = filename;
    resource.fileHash = newHash;
    resource.version += 1;

    await resource.save();

    res.json({ success: true, message: `Upgraded to Version ${resource.version}`, resource });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
