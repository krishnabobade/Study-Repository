const UserReview = require('../models/UserReview');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.addUserReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { targetUserId } = req.params;
    const reviewerId = req.user.id;

    if (targetUserId === reviewerId) {
      return res.status(400).json({ success: false, message: "You cannot review yourself" });
    }

    const review = await UserReview.create({
      targetUser: targetUserId,
      reviewer: reviewerId,
      rating: Number(rating),
      comment
    });

    // Award credits: rating * 10
    const creditBounty = Number(rating) * 10;

    // Recalculate User Average Rating and Credits
    const stats = await UserReview.aggregate([
      { $match: { targetUser: new mongoose.Types.ObjectId(targetUserId) } },
      { $group: { _id: '$targetUser', avgRating: { $sum: '$rating' }, count: { $sum: 1 } } }
    ]);

    if (stats.length > 0) {
      await User.findByIdAndUpdate(targetUserId, {
        $inc: { credits: creditBounty },
        avgRating: stats[0].avgRating / stats[0].count,
        ratingCount: stats[0].count
      });
    }

    const populatedReview = await review.populate('reviewer', 'name avatar');
    res.status(201).json({ success: true, review: populatedReview });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "You have already reviewed this student" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await UserReview.find({ targetUser: userId })
      .populate('reviewer', 'name avatar')
      .sort('-createdAt');
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
