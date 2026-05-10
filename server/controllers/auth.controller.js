const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { uploadStream } = require('../utils/cloudinary');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const AuditLog = require('../models/AuditLog');

const signToken = id => jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '7d' });

exports.register = async (req, res) => {
  try {
    // Multer populates req.body for multipart/form-data
    let { 
      name, email, password, phone, dob, gender, 
      collegeName, course, semester, yearOfStudy, bio, role, consentAccepted 
    } = req.body;

    console.log(`[AUTH] Registration attempt for: ${email}`);

    if (!name || !email)
      return res.status(400).json({ success: false, message: 'Name and email are required' });

    // Block administrative registration through public endpoint
    const forbiddenRoles = ['college_admin', 'department_admin', 'hod'];
    if (forbiddenRoles.includes(role)) {
      return res.status(403).json({ success: false, message: 'Administrative roles cannot be registered through this portal. Please contact institutional IT.' });
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number (10 digits required).' });
    }

    // Validate email domain
    if (!email.toLowerCase().endsWith('@mitwpu.edu.in')) {
      return res.status(403).json({ success: false, message: 'Unauthorized domain. Please use your @mitwpu.edu.in college email.' });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    // Strong password validation for students (no restrictions for admin)
    if (role !== 'super_admin') {
      const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;
      if (!passRegex.test(password)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.' 
        });
      }
    }

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ success: false, message: 'Email already registered' });

    let avatar = null;
    if (req.file) {
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
        return res.status(500).json({ success: false, message: 'Cloudinary configuration is missing.' });
      }
      const cloudinaryResult = await uploadStream(req.file.buffer, { folder: 'studyrepo/avatars', resource_type: 'image' });
      avatar = cloudinaryResult.secure_url;
    }

    const user = await User.create({ 
      name, email, password, phone, dob, gender, collegeName: collegeName || 'MIT World Peace University', 
      course, semester, yearOfStudy, bio, role: role || 'student', avatar 
    });
    
    const token = signToken(user._id);

    // Send Welcome Email
    try {
      const emailUtils = require('../utils/email');
      await emailUtils({
        email: user.email,
        subject: 'Welcome to Study Repository! 🚀',
        htmlContent: `
          <h2>Welcome aboard, ${user.name.split(' ')[0]}!</h2>
          <p>We're thrilled to have you join <strong>Study Repository</strong>, the premium academic platform designed for top-tier students and faculty.</p>
          <p>Here's what you can do right now to get started:</p>
          <ul>
            <li><strong>Browse Materials:</strong> Access thousands of notes, assignments, and past papers.</li>
            <li><strong>Share Knowledge:</strong> Upload your own materials to help your peers.</li>
            <li><strong>Engage:</strong> Rate, review, and bookmark your favorite resources.</li>
          </ul>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="btn">Go to your Dashboard</a>
          <p>If you have any questions, our support team is always here to help.</p>
        `
      });
    } catch (e) {
      console.warn('Failed to send welcome email (Continuing registration normally)');
    }

    res.status(201).json({ success: true, token, user });
  } catch (err) {
    console.error(' [REGISTRATION FATAL ERROR] ', {
      message: err.message,
      stack: err.stack,
      body: req.body
    });
    
    let errorMessage = err.message;
    if (err.name === 'ValidationError') {
      errorMessage = Object.values(err.errors).map(e => e.message).join(', ');
    } else if (err.code === 11000) {
      errorMessage = 'This email is already registered. Please try logging in.';
    }

    res.status(500).json({ 
      success: false, 
      message: errorMessage || 'Server-side registration error'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, consentAccepted } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    if (!consentAccepted) {
      return res.status(400).json({ success: false, message: 'Please accept Terms & Conditions and Privacy Policy to continue.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      // Log Unauthorized Access Attempt
      await AuditLog.create({
        action: 'FAILED_LOGIN_ATTEMPT',
        performedBy: null,
        targetId: email,
        targetName: 'Unknown Account',
        details: `Failed login attempt for non-existent email from IP: ${req.ip}`
      });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Strict Primary Admin check: Prevent any other email from logging in as ANY type of Admin
    if (user.role !== 'student' && user.email !== 'krishna.bobade@mitwpu.edu.in') {
      await AuditLog.create({
        action: 'SECURITY_VIOLATION',
        performedBy: user._id,
        targetId: user._id.toString(),
        targetName: user.email,
        details: `CRITICAL: Unauthorized admin login attempt blocked for email: ${user.email} from IP: ${req.ip}`
      });
      return res.status(403).json({ success: false, message: 'Access Denied: This administrative account is locked to the primary email only.' });
    }

    if (!(await user.comparePassword(password))) {
      await AuditLog.create({
        action: 'FAILED_LOGIN_ATTEMPT',
        performedBy: user._id,
        targetId: user._id.toString(),
        targetName: user.email,
        details: `Failed login attempt with incorrect password for ${user.email} from IP: ${req.ip}`
      });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(user._id);
    user.password = undefined;

    // Log Successful Login and Consent
    await AuditLog.create({
      action: 'SUCCESSFUL_LOGIN',
      performedBy: user._id,
      targetId: user._id.toString(),
      targetName: user.email,
      details: `Successful login for ${user.email} (${user.role}) from IP: ${req.ip}. Explicit consent granted for Terms v1.0, Privacy Policy, and Cookies.`
    });

    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: true, message: 'If an account exists, a reset link will be sent.' });
    }
    
    // Generate Reset Token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    
    const sendEmail = require('../utils/email');
    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request | Study Repository',
        htmlContent: `
          <h3>Hello ${user.name},</h3>
          <p>We received a request to reset your password. Please click the link below to securely update your credentials:</p>
          <a href="${resetUrl}" class="btn">Reset My Password</a>
          <p>This link is valid for <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>
          <p>Stay Secure,<br>Study Repository Team</p>
        `
      });
      res.json({ success: true, message: 'If an account exists, a reset link will be sent.' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Failed to send email. Please try again later.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token is invalid or has expired' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Log Password Reset
    await AuditLog.create({
      action: 'PASSWORD_RESET',
      performedBy: user._id,
      targetId: user._id.toString(),
      targetName: user.email,
      details: `Password successfully reset via email token for ${user.email} from IP: ${req.ip}`
    });

    res.json({ success: true, message: 'Password reset successful. You can now login with your new password.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
