const User = require('../models/User');

const ROLE_HIERARCHY = {
  student: 1,
  super_admin: 6
};

// Check if user has a minimum role level
exports.requireRole = (minRole) => {
  return async (req, res, next) => {
    try {
      const user = req.user; // Set by protect auth middleware
      if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });

      const userRoleLevel = ROLE_HIERARCHY[user.role] || 0;
      const requiredRoleLevel = ROLE_HIERARCHY[minRole] || 99;

      // Hardcoded strict security for the Primary Admin account
      if (minRole !== 'student' && user.email !== 'krishna.bobade@mitwpu.edu.in') {
        return res.status(403).json({ 
          success: false, 
          message: 'Access Denied: High-level admin features are restricted to the Primary Admin email only.' 
        });
      }

      if (userRoleLevel < requiredRoleLevel) {
        return res.status(403).json({ 
          success: false, 
          message: `Access Denied: Requires ${minRole} level or higher. You are ${user.role}.` 
        });
      }
      
      next();
    } catch (err) {
      next(err);
    }
  };
};

// Check if user has specific granular permissions
exports.requirePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });

      // super_admins bypass all permission checks
      if (user.role === 'super_admin') return next();

      if (!user.permissions || !user.permissions.includes(requiredPermission)) {
        return res.status(403).json({ 
          success: false, 
          message: `Access Denied: Missing '${requiredPermission}' permission.` 
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

// Enforce multi-tenant department access
exports.restrictToDepartment = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });

    // super_admin can access all departments
    if (user.role === 'super_admin') return next();

    // Check if the requested department matches the user's department
    const targetDept = req.params.department || req.body.department;
    
    if (targetDept && user.department !== targetDept) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access Denied: You do not have jurisdiction over this department.' 
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};
