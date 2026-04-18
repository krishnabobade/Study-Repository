const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetCourses: [{ type: String }], // e.g. ['B.Tech Computer Science']
  targetSemesters: [{ type: Number }],
  isGlobal: { type: Boolean, default: false }, // If true, applies to all
}, { timestamps: true });

announcementSchema.index({ isGlobal: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
