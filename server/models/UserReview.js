const mongoose = require('mongoose');
const { censorText } = require('../utils/profanity');

const userReviewSchema = new mongoose.Schema({
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

// Prevent duplicate reviews from the same user
userReviewSchema.index({ targetUser: 1, reviewer: 1 }, { unique: true });

userReviewSchema.pre('save', function (next) {
  if (this.comment) {
    this.comment = censorText(this.comment);
  }
  next();
});

module.exports = mongoose.model('UserReview', userReviewSchema);
