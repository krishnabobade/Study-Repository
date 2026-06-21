const User = require('../models/User');
const Resource = require('../models/Resource');
const socket = require('../socket');
const logger = require('../config/logger');

// Cache to store calculated trending data
let TRENDING_CACHE = {
  daily: { creators: [], resources: [] },
  weekly: { creators: [], resources: [] },
  monthly: { creators: [], resources: [] },
  all: { creators: [], resources: [] },
  updatedAt: null
};

// Throttle/debounce timer for updates
let updateTimer = null;
const DEBOUNCE_INTERVAL = 5000; // Recalculate at most once every 5 seconds

/**
 * Get date threshold based on timeframe filter
 */
function getDateThreshold(filter) {
  const now = new Date();
  switch (filter) {
    case 'daily':
      return new Date(now.setDate(now.getDate() - 1));
    case 'weekly':
      return new Date(now.setDate(now.getDate() - 7));
    case 'monthly':
      return new Date(now.setMonth(now.getMonth() - 1));
    case 'all':
    default:
      return null;
  }
}

/**
 * Recalculate trending stats for all filters and broadcast to connected sockets
 */
async function recalculateAndBroadcast() {
  try {
    const filters = ['daily', 'weekly', 'monthly', 'all'];
    const newCache = { updatedAt: new Date() };

    for (const filter of filters) {
      const threshold = getDateThreshold(filter);
      
      // 1. Calculate Trending Resources
      const resourceQuery = { isApproved: true, isArchived: false };
      if (threshold) {
        resourceQuery.createdAt = { $gte: threshold };
      }

      const rawResources = await Resource.find(resourceQuery)
        .populate('uploadedBy', 'name avatar email collegeName department')
        .lean();

      const resources = rawResources.map(r => {
        const likesCount = Array.isArray(r.likes) ? r.likes.length : 0;
        const downloads = Number(r.downloads) || 0;
        const views = Number(r.views) || 0;
        const searches = Number(r.searches) || 0;
        
        // Calculate weighted resource score
        const score = (likesCount * 12) + (downloads * 10) + (views * 3) + (searches * 5);
        return { ...r, likesCount, score };
      })
      .sort((a, b) => b.score - a.score || b.downloads - a.downloads)
      .slice(0, 10);

      // 2. Calculate Trending Creators
      const creatorMatch = { isApproved: true, isArchived: false };
      if (threshold) {
        creatorMatch.createdAt = { $gte: threshold };
      }

      // Group resources in timeframe to get aggregated metrics per user
      const resourceAgg = await Resource.aggregate([
        { $match: creatorMatch },
        {
          $group: {
            _id: '$uploadedBy',
            uploadedCount: { $sum: 1 },
            downloads: { $sum: '$downloads' },
            views: { $sum: '$views' },
            searches: { $sum: { $ifNull: ['$searches', 0] } },
            likes: { $sum: { $size: { $ifNull: ['$likes', []] } } }
          }
        }
      ]);

      const creatorDetails = await User.find({
        _id: { $in: resourceAgg.map(item => item._id) }
      }).select('name email avatar collegeName department totalLikes profileVisits totalUploads totalDownloads').lean();

      const creatorsMap = new Map(creatorDetails.map(u => [u._id.toString(), u]));

      const creatorsList = resourceAgg.map(agg => {
        const user = creatorsMap.get(agg._id.toString());
        if (!user) return null;

        const uploadedCount = agg.uploadedCount || 0;
        const downloads = agg.downloads || 0;
        const views = agg.views || 0;
        const searches = agg.searches || 0;
        const likes = agg.likes || 0;
        const profileVisits = Number(user.profileVisits) || 0;
        const profileLikes = Number(user.totalLikes) || 0;

        // Calculate weighted creator score
        const score = (uploadedCount * 15) + (downloads * 8) + (likes * 10) + (views * 3) + (searches * 4) + (profileVisits * 2) + (profileLikes * 12);

        return {
          user: {
            _id: user._id,
            name: user.name,
            avatar: user.avatar,
            collegeName: user.collegeName,
            department: user.department,
            totalUploads: user.totalUploads,
            totalDownloads: user.totalDownloads
          },
          stats: {
            uploadedCount,
            downloads,
            likes,
            views,
            searches,
            profileVisits,
            profileLikes
          },
          score
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score || b.stats.downloads - a.stats.downloads)
      .slice(0, 10);

      newCache[filter] = { resources, creators: creatorsList };
    }

    TRENDING_CACHE = { ...newCache, updatedAt: new Date() };

    // Broadcast to Socket.IO clients
    try {
      const io = socket.getIo();
      if (io) {
        io.emit('trending_update', TRENDING_CACHE);
      }
    } catch (err) {
      // Sockets not initialized yet, skip broadcast
    }

  } catch (err) {
    logger.error('❌ Error calculating trending: %o', err);
  }
}

module.exports = {
  /**
   * Fetch current cached trending data
   */
  getTrendingData: async () => {
    // If cache is empty, trigger immediate recalculation
    if (!TRENDING_CACHE.updatedAt) {
      await recalculateAndBroadcast();
    }
    return TRENDING_CACHE;
  },

  /**
   * Notify the trending system of activity to trigger debounced recalculation and broadcast
   */
  notifyActivity: () => {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    if (updateTimer) return;

    updateTimer = setTimeout(async () => {
      updateTimer = null;
      await recalculateAndBroadcast();
    }, DEBOUNCE_INTERVAL);
  }
};
