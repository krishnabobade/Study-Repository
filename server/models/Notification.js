const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['info', 'activity', 'alert'], default: 'info' },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  link: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
