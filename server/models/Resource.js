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
  isApproved: { type: Boolean, default: true },
}, { timestamps: true });

resourceSchema.index({ title: 'text', description: 'text', subject: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);
