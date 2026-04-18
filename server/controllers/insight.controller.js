const Resource = require('../models/Resource');
const Comment = require('../models/Comment');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.getUserInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // 1. Upload Activity Analysis
    const [recentUploads, prevUploads] = await Promise.all([
      Resource.countDocuments({ uploadedBy: userId, createdAt: { $gte: oneWeekAgo } }),
      Resource.countDocuments({ uploadedBy: userId, createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo } })
    ]);

    // 2. Timing Analysis (Weekend vs Weekday)
    const userResources = await Resource.find({ uploadedBy: userId }).select('createdAt');
    let weekendCount = 0;
    userResources.forEach(r => {
      const day = new Date(r.createdAt).getDay();
      if (day === 0 || day === 6) weekendCount++;
    });
    const weekendPref = userResources.length > 0 ? (weekendCount / userResources.length) > 0.5 : false;

    // 3. Performance Analysis (Best Subject)
    const bestSubject = await Resource.aggregate([
      { $match: { uploadedBy: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$subject', avg: { $avg: '$avgRating' }, count: { $sum: 1 } } },
      { $sort: { avg: -1, count: -1 } },
      { $limit: 1 }
    ]);

    // 4. Rating Trend
    const recentRatings = await Comment.aggregate([
      { $match: { resource: { $in: await Resource.find({ uploadedBy: userId }).distinct('_id') }, createdAt: { $gte: oneWeekAgo } } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);

    const insights = [];

    // Volume Insight
    if (recentUploads > prevUploads) {
      insights.push({
        type: 'performance',
        title: 'Activity Surge',
        message: `You uploaded ${recentUploads} resources this week, up from ${prevUploads} last week!`,
        trend: 'up',
        color: 'text-green-400'
      });
    } else if (recentUploads < prevUploads && recentUploads > 0) {
      insights.push({
        type: 'activity',
        title: 'Slow Week',
        message: 'Your upload activity is slightly lower than last week. Keep the momentum going!',
        trend: 'down',
        color: 'text-yellow-400'
      });
    }

    // Timing Insight
    if (weekendPref) {
      insights.push({
        type: 'activity',
        title: 'Weekend Warrior',
        message: 'The majority of your contributions happen on weekends. Great use of free time!',
        icon: 'calendar',
        color: 'text-ink-400'
      });
    }

    // Subject Insight
    if (bestSubject.length > 0 && bestSubject[0].avg > 0) {
      insights.push({
        type: 'performance',
        title: 'Subject Expertise',
        message: `Your resources in "${bestSubject[0]._id}" are highly rated by your peers.`,
        trend: 'up',
        color: 'text-cyan-400'
      });
    }

    // Growth Insight
    const user = await User.findById(userId);
    if (user.credits > 200) {
      insights.push({
        type: 'engagement',
        title: 'Rising Credibility',
        message: `Your credit score of ${user.credits} puts you in the top tier of contributors.`,
        trend: 'up',
        color: 'text-purple-400'
      });
    }

    // Fallback if no data
    if (insights.length === 0) {
      insights.push({
        type: 'suggestion',
        title: 'Get Started',
        message: 'Upload your first study resource to see AI-powered insights here!',
        trend: 'neutral',
        color: 'text-white/40'
      });
    }

    res.json({ success: true, insights });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
