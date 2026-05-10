const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
  type: { type: String, enum: ['info', 'activity', 'alert', 'upload', 'download', 'like', 'rating', 'comment', 'admin'], default: 'info' },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ userId: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
