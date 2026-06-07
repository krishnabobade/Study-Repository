const Resource = require('../models/Resource');
const User = require('../models/User');
const mongoose = require('mongoose');
const trendingService = require('../services/trending.service');
const { uploadStream } = require('../utils/cloudinary');
const { uploadToS3, getPresignedDownloadUrl, deleteFromS3 } = require('../utils/s3');
const path = require('path');
const logger = require('../config/logger');

exports.getAllResources = async (req, res) => {
  try {
    const { search, course, semester, category, fileType, dateRange, sort, limit = 12, page = 1 } = req.query;

    // 1. Text Search (Primary Engine)
    let query = { isApproved: true };
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
      .populate('uploadedBy', 'name email role avatar')
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
        .populate('uploadedBy', 'name email role avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));
    }

    if (search && resources.length > 0) {
      const resourceIds = resources.map(r => r._id);
      await Resource.updateMany({ _id: { $in: resourceIds } }, { $inc: { searches: 1 } });
      trendingService.notifyActivity();
    }

    const total = await Resource.countDocuments(query);

    // Transform URLs for Frontend Preview (Generate Pre-signed URLs if stored in S3)
    const processedResources = await Promise.all(resources.map(async (doc) => {
      let obj = doc.toObject ? doc.toObject() : doc;
      if (obj.fileUrl && obj.fileUrl.startsWith('s3://')) {
        obj.fileUrl = await getPresignedDownloadUrl(obj.filePublicId);
      }
      return obj;
    }));

    const responseData = { 
      success: true, 
      resources: processedResources,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
    };

    res.json(responseData);
  } catch (err) {
    logger.error('❌ Error fetching resources:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTrendingResources = async (req, res) => {
  try {
    const resources = await Resource.find({ isArchived: false, isApproved: true })
      .sort({ downloads: -1, views: -1, createdAt: -1 })
      .limit(4)
      .populate('uploadedBy', 'name avatar');
    res.json({ success: true, resources });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    
    const user = await User.findById(req.user.id).populate('viewedResources');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Build user profile preference vectors based on history
    let preferredCourses = { [user.course]: 3 }; // Weight user's current course highest
    let preferredSubjects = {};
    
    user.viewedResources.forEach(r => {
      preferredCourses[r.course] = (preferredCourses[r.course] || 0) + 1;
      preferredSubjects[r.subject] = (preferredSubjects[r.subject] || 0) + 1;
    });

    const topCourses = Object.keys(preferredCourses).sort((a,b) => preferredCourses[b] - preferredCourses[a]).slice(0, 2);
    const topSubjects = Object.keys(preferredSubjects).sort((a,b) => preferredSubjects[b] - preferredSubjects[a]).slice(0, 3);

    // AI Query Aggregation Pipeline
    const recommendations = await Resource.aggregate([
      { 
        $match: { 
          isArchived: false,
          isApproved: true,
          _id: { $nin: user.viewedResources.map(r => r._id) }, // Don't recommend already viewed
          $or: [
            { course: { $in: topCourses } },
            { subject: { $in: topSubjects } },
            { semester: user.semester }
          ]
        }
      },
      // Scoring Phase
      {
        $addFields: {
          score: {
            $add: [
              { $cond: [{ $in: ['$course', topCourses] }, 5, 0] },
              { $cond: [{ $in: ['$subject', topSubjects] }, 8, 0] },
              { $cond: [{ $eq: ['$semester', user.semester] }, 3, 0] },
              { $multiply: ['$downloads', 0.1] }, // Boost by popularity
              { $multiply: ['$avgRating', 2] } // Boost by quality
            ]
          }
        }
      },
      { $sort: { score: -1 } },
      { $limit: 6 }
    ]);

    await Resource.populate(recommendations, { path: 'uploadedBy', select: 'name role avatar' });

    res.json({ success: true, resources: recommendations });
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

    let fileUrl = '';
    let filePublicId = '';
    let storageProvider = 'cloudinary';

    // Check if we should use Enterprise S3 Storage or fallback to Cloudinary
    if (process.env.USE_AWS_S3 === 'true') {
      try {
        const s3Key = `documents/${Date.now()}-${req.file.originalname}`;
        filePublicId = await uploadToS3(req.file.buffer, s3Key, req.file.mimetype);
        fileUrl = `s3://${process.env.S3_BUCKET_NAME}/${filePublicId}`; // Internal reference
        storageProvider = 's3';
      } catch (s3Err) {
        logger.error('S3 Upload failed, falling back to Cloudinary', s3Err);
        // Fallback handled below implicitly if needed, or we just throw
        return res.status(500).json({ success: false, message: 'Primary storage failure.' });
      }
    } else {
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
        return res.status(500).json({ success: false, message: 'Storage configuration is missing.' });
      }

      let resource_type = ['doc', 'docx', 'ppt', 'pptx', 'pdf', 'other'].includes(fileType) ? 'raw' : 'auto';
      const cloudinaryResult = await uploadStream(req.file.buffer, { folder: 'studyrepo', resource_type });
      fileUrl = cloudinaryResult.secure_url;
      filePublicId = cloudinaryResult.public_id;
    }

    // AI Intelligence tags (Simulated NLP keyword extraction from title & subject)
    const stopWords = ['the', 'and', 'for', 'with', 'intro', 'basics', 'of', 'in', 'part'];
    const autoTags = `${title} ${subject} ${category}`.toLowerCase().split(/[\s,-]+/)
      .filter(w => w.length > 3 && !stopWords.includes(w));
    
    const aiSummary = `This is a ${category} document covering topics on ${subject}. Automatically processed for ${course} students.`;

    const documentId = `DOC-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    const isTrustedRole = req.user.role === 'super_admin' || req.user.role === 'admin' || req.user.role === 'teacher';
    
    const resource = await Resource.create({
      title, description, subject, course, semester: Number(semester), category,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      fileUrl, filePublicId, fileType, fileSize: req.file.size, uploadedBy,
      fileHash, documentId,
      autoTags: [...new Set(autoTags)], aiSummary,
      isApproved: isTrustedRole
    });

    await User.findByIdAndUpdate(uploadedBy, { $inc: { totalUploads: 1 } });
    trendingService.notifyActivity();

    try {
      const notificationController = require('./notification.controller');
      await notificationController.notifyAdmins(
        `uploaded a new file: "${resource.title}"`,
        'activity',
        uploadedBy,
        `/resources/${resource._id}`
      );
    } catch (e) {
      console.warn('Failed to send upload notification to admins:', e);
    }

    res.status(201).json({ success: true, message: 'Resource created safely', resource });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('uploadedBy', 'name email avatar');
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    let resourceObj = resource.toObject();
    if (resourceObj.fileUrl && resourceObj.fileUrl.startsWith('s3://')) {
      resourceObj.fileUrl = await getPresignedDownloadUrl(resourceObj.filePublicId);
    }

    res.json({ success: true, resource: resourceObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    // Increment download count on the resource
    resource.downloads += 1;
    await resource.save();

    // Credit the uploader for the download
    if (resource.uploadedBy) {
      await User.findByIdAndUpdate(resource.uploadedBy, { $inc: { totalDownloads: 1 } });
    }

    trendingService.notifyActivity();

    let downloadUrl = resource.fileUrl;

    // Generate secure pre-signed URL for S3 objects
    if (resource.fileUrl.startsWith('s3://')) {
      downloadUrl = await getPresignedDownloadUrl(resource.filePublicId);
    } else if (resource.fileUrl.includes('cloudinary.com')) {
      // Add fl_attachment to force direct download instead of opening in browser
      const urlParts = resource.fileUrl.split('/upload/');
      if (urlParts.length === 2) {
        // Sanitize title for safe downloading and extract proper extension
        const safeTitle = resource.title.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 50);
        const extMatch = resource.fileUrl.match(/\.([a-zA-Z0-9]+)(?:[\?#]|$)/);
        let ext = extMatch ? extMatch[1] : '';
        
        // Fallback for older buffer uploads that lack extensions in fileUrl
        if (!ext) {
          if (resource.fileType === 'pdf') ext = 'pdf';
          else if (resource.fileType === 'doc') ext = 'docx';
          else if (resource.fileType === 'ppt') ext = 'pptx';
          else if (resource.fileType === 'image') ext = 'jpg';
          else if (resource.fileType === 'video') ext = 'mp4';
          else ext = 'pdf'; // Ultimate fallback
        }
        
        downloadUrl = `${urlParts[0]}/upload/fl_attachment:${safeTitle}.${ext}/${urlParts[1]}`;
      }
    }

    res.json({ success: true, fileUrl: downloadUrl });
  } catch (err) {
    logger.error('Download Error: %o', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.recordView = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    resource.views += 1;
    await resource.save();
    trendingService.notifyActivity();

    if (req.user) {
      await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { viewedResources: resource._id }
      });
    }

    res.json({ success: true, views: resource.views });
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
      
      // Notify uploader if it's a new like/dislike
      if (resource.uploadedBy.toString() !== req.user.id) {
        const notificationController = require('./notification.controller');
        if (likeDiff > 0) {
          await notificationController.createNotification(
            resource.uploadedBy,
            `liked your upload: "${resource.title}"`,
            'info',
            req.user.id,
            `/resources/${resource._id}`
          );
        } else if (dislikeDiff > 0) {
          await notificationController.createNotification(
            resource.uploadedBy,
            `disliked your upload: "${resource.title}"`,
            'alert',
            req.user.id,
            `/resources/${resource._id}`
          );
        }
      }
    }

    trendingService.notifyActivity();

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
    const isAdmin = req.user.role === 'super_admin' || req.user.role === 'admin' || req.user.role === 'teacher';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this resource. Insufficient permissions.' });
    }

    // Physical File Cleanup
    if (resource.filePublicId) {
      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        return res.status(500).json({ success: false, message: 'Cloudinary configuration is missing.' });
      }
      const { cloudinary } = require('../utils/cloudinary');
      await cloudinary.uploader.destroy(resource.filePublicId, { resource_type: resource.fileType === 'pdf' || resource.fileType === 'doc' || resource.fileType === 'ppt' || resource.fileType === 'other' ? 'raw' : 'image' });
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

    // Complete cascade delete for real-time data accuracy
    // 1. Subtract the stats of this document from the uploader's global profile
    if (resource.uploadedBy) {
      await User.findByIdAndUpdate(resource.uploadedBy, { 
        $inc: { 
          totalUploads: -1,
          totalDownloads: -(resource.downloads || 0),
          documentLikes: -(resource.likes?.length || 0),
          documentDislikes: -(resource.dislikes?.length || 0)
        } 
      });
    }

    // 2. Delete all comments and ratings associated with this document
    const Comment = require('../models/Comment');
    await Comment.deleteMany({ resource: resource._id });

    // 3. Remove the document from all users' saved and viewed lists
    await User.updateMany(
      { $or: [{ savedResources: resource._id }, { viewedResources: resource._id }] },
      { $pull: { savedResources: resource._id, viewedResources: resource._id } }
    );

    // 4. Finally delete the resource document itself
    await Resource.findByIdAndDelete(req.params.id);

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
        `rated your resource "${resource.title}" with ${rating} stars`,
        'activity',
        userId,
        `/resources/${resource._id}`
      );
    }

    // Notify admins if rating is low (1 or 2 stars) for moderation review
    if (Number(rating) <= 2) {
      try {
        await notificationController.notifyAdmins(
          `rated resource "${resource.title}" with a low score of ${rating} stars`,
          'alert',
          userId,
          `/resources/${resource._id}`
        );
      } catch (e) {
        console.warn('Failed to send low rating notification to admins:', e);
      }
    }

    trendingService.notifyActivity();

    res.status(201).json({ success: true, comment: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const resource = await Resource.findById(comment.resource);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    // Allow comment owner or admin to delete comment
    const isCommentOwner = comment.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'super_admin' || req.user.role === 'admin';

    if (!isCommentOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(req.params.commentId);

    // Update resource rating
    const stats = await Comment.aggregate([
      { $match: { resource: new mongoose.Types.ObjectId(resource._id) } },
      { $group: { _id: '$resource', avgRating: { $sum: '$rating' }, count: { $sum: 1 } } }
    ]);

    if (stats.length > 0) {
      await Resource.findByIdAndUpdate(resource._id, {
        avgRating: stats[0].avgRating / stats[0].count,
        ratingCount: stats[0].count
      });
    } else {
      await Resource.findByIdAndUpdate(resource._id, {
        avgRating: 0,
        ratingCount: 0
      });
    }

    res.json({ success: true, message: 'Comment deleted successfully' });
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
    const isAdmin = req.user.role === 'super_admin' || req.user.role === 'admin' || req.user.role === 'teacher';
    if (resource.uploadedBy.toString() !== req.user.id && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized manually version this document.' });
    }
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded for new version' });

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      return res.status(500).json({ success: false, message: 'Cloudinary configuration is missing.' });
    }

    const crypto = require('crypto');
    const newHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');

    if (newHash === resource.fileHash) {
      return res.status(400).json({ success: false, message: 'This exact file is already the latest version.' });
    }

    // Archive current file metadata, we keep the old file active on Cloudinary because version history might need it
    resource.previousVersions.push({
      version: resource.version,
      fileUrl: resource.fileUrl,
      filePublicId: resource.filePublicId,
      fileHash: resource.fileHash,
      uploadedAt: resource.updatedAt
    });

    // Handle Upload for new file to Cloudinary
    let fileType = resource.fileType;
    let resource_type = ['doc', 'docx', 'ppt', 'pptx', 'pdf', 'other'].includes(fileType) ? 'raw' : 'auto';
    const cloudinaryResult = await uploadStream(req.file.buffer, { folder: 'studyrepo', resource_type });

    resource.fileUrl = cloudinaryResult.secure_url;
    resource.filePublicId = cloudinaryResult.public_id;
    resource.fileHash = newHash;
    resource.version += 1;

    await resource.save();

    res.json({ success: true, message: `Upgraded to Version ${resource.version}`, resource });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateResourceStatus = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'super_admin' || req.user.role === 'admin' || req.user.role === 'teacher';
    if (!isAdmin) return res.status(403).json({ success: false, message: 'Not authorized to approve resources.' });

    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    if (req.body.isApproved !== undefined) {
      resource.isApproved = req.body.isApproved;
    }
    await resource.save();

    res.json({ success: true, message: 'Resource updated successfully', resource });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPendingResources = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'super_admin' || req.user.role === 'admin' || req.user.role === 'teacher';
    if (!isAdmin) return res.status(403).json({ success: false, message: 'Not authorized to view pending resources.' });

    const resources = await Resource.find({ isApproved: false })
      .populate('uploadedBy', 'name email role avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, resources });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
