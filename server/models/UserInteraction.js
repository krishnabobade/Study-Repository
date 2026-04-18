const mongoose = require('mongoose');

const userInteractionSchema = new mongoose.Schema({
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['like', 'dislike', 'none'], default: 'none' },
  rating: { type: Number, min: 1, max: 5 }
}, { timestamps: true });

// Ensure exactly one interaction document per user-to-user pairing to prevent vote spam
userInteractionSchema.index({ targetUser: 1, fromUser: 1 }, { unique: true });

module.exports = mongoose.model('UserInteraction', userInteractionSchema);
