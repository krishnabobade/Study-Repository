const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  course: { type: String, default: '' }, // e.g. "BCA", "B.Tech"
  semester: { type: Number },
  isPrivate: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

roomSchema.index({ course: 1, semester: 1 });

module.exports = mongoose.model('Room', roomSchema);
