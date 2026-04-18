const Resource = require('../models/Resource');
const User = require('../models/User');

let CACHE = { data: null, timestamp: 0 };

exports.getStats = async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    const now = Date.now();
    
    // Serve from cache if less than 30s old (only non-admin as admin needs live counts)
    if (!isAdmin && CACHE.data && now - CACHE.timestamp < 30000) {
      return res.json(CACHE.data);
    }

    const totalResources = await Resource.countDocuments();
    const totalUsers = await User.countDocuments();
    
    const resourceStats = await Resource.aggregate([
      { $group: { _id: null, totalDownloads: { $sum: '$downloads' }, totalViews: { $sum: '$views' } } }
    ]);
    const totalDownloads = resourceStats.length > 0 ? resourceStats[0].totalDownloads : 0;
    const totalViews = resourceStats.length > 0 ? resourceStats[0].totalViews : 0;

    let detailedStats = {};
    if (isAdmin) {
      const activeStudents = await User.countDocuments({ role: 'student' });
      const activeTeachers = await User.countDocuments({ role: 'teacher' });
      
      const CategoryBreakdown = await Resource.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);
      detailedStats = { activeStudents, activeTeachers, CategoryBreakdown };
    }

    const payload = {
      success: true,
      stats: {
        totalResources,
        totalUsers,
        totalDownloads,
        totalViews,
        ...detailedStats
      }
    };

    if (!isAdmin) {
      CACHE = { data: payload, timestamp: now };
    }

    res.json(payload);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTeacherAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    // Teacher should only see their own stats unless admin
    if (req.user.role !== 'admin' && req.user.id !== id) return res.status(403).json({ success: false, message: 'Forbidden' });

    const totalUploads = await Resource.countDocuments({ uploadedBy: id });
    const resources = await Resource.find({ uploadedBy: id });
    
    let totalViews = 0;
    let totalDownloads = 0;
    resources.forEach(r => {
      totalViews += r.views;
      totalDownloads += r.downloads;
    });

    // Simulated engagement: views + (downloads * 3)
    const overallEngagementScore = totalViews + (totalDownloads * 3);

    res.json({
      success: true,
      teacherId: id,
      stats: { totalUploads, totalViews, totalDownloads, overallEngagementScore }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStudentAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'admin' && req.user.id !== id) return res.status(403).json({ success: false, message: 'Forbidden' });

    const user = await User.findById(id).populate('viewedResources');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Deduce active subjects based on viewed resources
    const subjectFrequency = {};
    user.viewedResources.forEach(r => {
      subjectFrequency[r.subject] = (subjectFrequency[r.subject] || 0) + 1;
    });
    
    const mostActiveSubjects = Object.entries(subjectFrequency)
      .sort((a,b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 3);

    const studyActivityScore = user.viewedResources.length + (user.totalDownloads * 2);

    res.json({
      success: true,
      studentId: id,
      stats: {
        totalDownloads: user.totalDownloads,
        totalResourcesViewed: user.viewedResources.length,
        mostActiveSubjects,
        studyActivityScore
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
