const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  subject: { type: String, required: true },
  course: { type: String, required: true },
  semester: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  attachments: [{ type: String }], // URLs to attached files if any
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

assignmentSchema.index({ subject: 1, course: 1, semester: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
