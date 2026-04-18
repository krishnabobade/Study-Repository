const mongoose = require('mongoose');

const userReviewSchema = new mongoose.Schema({
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

// Prevent duplicate reviews from the same user
userReviewSchema.index({ targetUser: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('UserReview', userReviewSchema);
