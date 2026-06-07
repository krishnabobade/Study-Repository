const trendingService = require('../services/trending.service');

exports.getTrending = async (req, res) => {
  try {
    const trendingData = await trendingService.getTrendingData();
    res.json({
      success: true,
      trending: trendingData
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
