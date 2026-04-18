const Resource = require('../models/Resource');
const User = require('../models/User');

exports.getStats = async (req, res) => {
  try {
    const totalResources = await Resource.countDocuments();
    const totalUsers = await User.countDocuments();
    
    const resourceStats = await Resource.aggregate([
      { $group: { _id: null, totalDownloads: { $sum: '$downloads' } } }
    ]);
    const totalDownloads = resourceStats.length > 0 ? resourceStats[0].totalDownloads : 0;

    res.json({
      success: true,
      stats: {
        totalResources,
        totalUsers,
        totalDownloads
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
