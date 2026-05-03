const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  fileUrl: { type: String, required: true },
  filePublicId: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'doc', 'ppt', 'image', 'video', 'other'], required: true },
  fileSize: { type: Number, default: 0 },
  subject: { type: String, required: true },
  course: { type: String, required: true },
  semester: { type: Number, required: true },
  category: { type: String, enum: ['notes', 'qpaper', 'assignment', 'lab', 'formula', 'project', 'other'], required: true },
  tags: [{ type: String }],
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  downloads: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isApproved: { type: Boolean, default: true },
  
  // Advanced Organization & Multi-Tenancy
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
  department: { type: String },

  // Archival and Expiration
  isArchived: { type: Boolean, default: false },
  expiresAt: { type: Date },

  // High-Security & Auth System
  documentId: { type: String, unique: true, sparse: true },
  fileHash: { type: String },
  version: { type: Number, default: 1 },
  previousVersions: [{
    version: Number,
    fileUrl: String,
    filePublicId: String,
    fileHash: String,
    uploadedAt: Date
  }],

  // AI Content Intelligence
  aiSummary: { type: String },
  autoTags: [{ type: String }]
}, { timestamps: true });

// Advanced Indexing for Scale
resourceSchema.index({ title: 'text', description: 'text', subject: 'text', autoTags: 'text' });
resourceSchema.index({ fileHash: 1 });
resourceSchema.index({ institutionId: 1, department: 1, category: 1 });
resourceSchema.index({ downloads: -1, ratingCount: -1 }); // Trending queries
resourceSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
