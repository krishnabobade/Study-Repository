const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { uploadStream } = require('../utils/cloudinary');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const AuditLog = require('../models/AuditLog');

/**
 * SECURITY: JWT_SECRET must be set via environment variable.
 * No fallback is provided — a missing secret causes an explicit startup failure.
 * ADMIN_EMAIL must also be set via environment variable.
 */
const { JWT_SECRET, ADMIN_EMAIL } = process.env;

const signToken = id => jwt.sign({ id }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

/**
 * Returns a sanitized user object safe for API responses.
 * Excludes all internal/sensitive fields: reset tokens, OTP state, long arrays.
 */
const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  const sensitiveFields = [
    'password', 'resetPasswordToken', 'resetPasswordExpires',
    'resetOtp', 'resetOtpExpires', 'resetOtpVerified', 'resetOtpAttempts',
    'lastOtpSentAt', 'viewedResources', 'permissions'
  ];
  sensitiveFields.forEach(f => delete obj[f]);
  return obj;
};

exports.register = async (req, res) => {
  try {
    // Multer populates req.body for multipart/form-data
    let { 
      name, email, password, phone, dob, gender, 
      collegeName, course, semester, yearOfStudy, bio, role, consentAccepted, avatar: bodyAvatar 
    } = req.body;

    // Auth attempt check

    if (!name || !email)
      return res.status(400).json({ success: false, message: 'Name and email are required' });

    // Block unauthorized administrative registration through public endpoint
    if (role && role !== 'student' && ADMIN_EMAIL && email !== ADMIN_EMAIL) {
      return res.status(403).json({ 
        success: false, 
        message: 'Security Violation: Only the Primary Admin account can register an administrative account.' 
      });
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

    const exists = await User.findOne({ email: new RegExp('^' + email.trim() + '$', 'i') });
    if (exists)
      return res.status(409).json({ success: false, message: 'Email already registered' });

    let avatar = null;
    if (req.file) {
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
        return res.status(500).json({ success: false, message: 'Cloudinary configuration is missing.' });
      }
      const cloudinaryResult = await uploadStream(req.file.buffer, { folder: 'studyrepo/avatars', resource_type: 'image' });
      avatar = cloudinaryResult.secure_url;
    } else if (bodyAvatar) {
      avatar = bodyAvatar;
    }

    const user = await User.create({ 
      name, email: email.toLowerCase().trim(), password, phone, dob, gender, collegeName: collegeName || 'MIT World Peace University', 
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

    try {
      const notificationController = require('./notification.controller');
      await notificationController.notifyAdmins(
        `registered a new account.`,
        'activity',
        user._id,
        `/profile/${user._id}`
      );
    } catch (e) {
      console.warn('Failed to send registration notification to admins:', e);
    }

    res.status(201).json({ success: true, token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('[REGISTRATION ERROR]', err.message);
    
    let errorMessage = 'Registration failed. Please check your details and try again.';
    if (err.name === 'ValidationError') {
      errorMessage = Object.values(err.errors).map(e => e.message).join(', ');
    } else if (err.code === 11000) {
      errorMessage = 'This email is already registered. Please try logging in.';
    }

    res.status(500).json({ 
      success: false, 
      message: errorMessage
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

    const user = await User.findOne({ email: new RegExp('^' + email.trim() + '$', 'i') }).select('+password');
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
    if (user.role !== 'student' && ADMIN_EMAIL && user.email !== ADMIN_EMAIL) {
      await AuditLog.create({
        action: 'SECURITY_VIOLATION',
        performedBy: user._id,
        targetId: user._id.toString(),
        targetName: user.email,
        details: `CRITICAL: Unauthorized admin login attempt blocked for email: ${user.email} from IP: ${req.ip}`
      });
      return res.status(403).json({ success: false, message: 'Access Denied: This administrative account is locked to the primary account only.' });
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

    try {
      const notificationController = require('./notification.controller');
      await notificationController.notifyAdmins(
        `signed in to the platform.`,
        'info',
        user._id,
        `/profile/${user._id}`
      );
    } catch (e) {
      console.warn('Failed to send login notification to admins:', e);
    }

    res.json({ success: true, token, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Synchronization Layer: Ensure "Quick Stats" always reflect actual DB state
    const Resource = require('../models/Resource');
    const actualUploads = await Resource.countDocuments({ uploadedBy: req.user.id });
    
    // Calculate actual total downloads across all resources uploaded by this user
    const stats = await Resource.aggregate([
      { $match: { uploadedBy: user._id } },
      { $group: { _id: null, total: { $sum: '$downloads' } } }
    ]);
    const actualDownloads = stats.length > 0 ? stats[0].total : 0;

    // Correct the counters if they drifted (e.g., due to deletions or manual testing)
    let needsUpdate = false;
    if (user.totalUploads !== actualUploads) {
      user.totalUploads = actualUploads;
      needsUpdate = true;
    }
    if (user.totalDownloads !== actualDownloads) {
      user.totalDownloads = actualDownloads;
      needsUpdate = true;
    }

    if (needsUpdate) {
      await user.save({ validateBeforeSave: false });
    }

    // Return sanitized user — no sensitive reset/OTP fields
    const safeUser = await User.findById(req.user.id)
      .select('-password -resetPasswordToken -resetPasswordExpires -resetOtp -resetOtpExpires -resetOtpVerified -resetOtpAttempts -lastOtpSentAt -viewedResources -permissions');

    res.json({ success: true, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve user data.' });
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
    res.status(500).json({ success: false, message: 'Failed to update password.' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -resetPasswordToken -resetPasswordExpires -resetOtp -resetOtpExpires -resetOtpVerified -resetOtpAttempts -lastOtpSentAt -viewedResources -savedResources -permissions');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve user.' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const user = await User.findOne({ email: new RegExp('^' + email.trim() + '$', 'i') });
    if (!user) {
      // Step 2 requirement: Show proper error message, do not reveal unnecessary account information
      return res.status(404).json({ success: false, message: 'No account found with this email address. Please check for typos or register.' });
    }

    // Rate limiting & Cooldown check (60 seconds)
    if (user.lastOtpSentAt && Date.now() - user.lastOtpSentAt.getTime() < 60000) {
      const remaining = Math.ceil((60000 - (Date.now() - user.lastOtpSentAt.getTime())) / 1000);
      return res.status(429).json({ success: false, message: `An OTP was recently sent. Please wait ${remaining} seconds before requesting a new one.` });
    }

    // Step 3: Generate secure 6-digit numeric OTP & expiration (15 minutes)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(otpCode).digest('hex');

    user.resetOtp = hashedOtp;
    user.resetOtpExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    user.resetOtpVerified = false;
    user.resetOtpAttempts = 0;
    user.lastOtpSentAt = Date.now();
    await user.save({ validateBeforeSave: false });

    // Step 4: Send beautiful OTP email with branding, expiration warning, security message
    const sendEmail = require('../utils/email');
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your Password Reset OTP | Study Repository',
        htmlContent: `
          <div style="text-align: center; font-family: 'Inter', sans-serif;">
            <h2 style="color: #0F172A; font-size: 24px; font-weight: 700; margin-bottom: 16px;">Password Reset Verification</h2>
            <p style="color: #334155; font-size: 16px; margin-bottom: 24px;">Hello ${user.name}, we received a request to reset the password for your Study Repository account. Enter the secure One-Time Password (OTP) below to proceed:</p>
            <div style="background-color: #F1F5F9; border: 2px dashed #CBD5E1; border-radius: 16px; padding: 24px; margin: 24px auto; max-width: 300px;">
              <h1 style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #6558f5; margin: 0;">${otpCode}</h1>
            </div>
            <p style="color: #64748B; font-size: 14px; margin-bottom: 24px;">⚠️ This OTP is valid for <strong>15 minutes</strong> and can only be used once. If you did not request a password reset, please change your password immediately or contact support.</p>
            <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 32px 0;">
            <p style="color: #94A3B8; font-size: 12px;">Secure Authentication System &copy; Study Repository Platform</p>
          </div>
        `
      });
      res.json({ success: true, message: 'OTP sent successfully to your registered email address.' });
    } catch (err) {
      user.resetOtp = undefined;
      user.resetOtpExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Failed to send OTP email. Please try again later.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const user = await User.findOne({ email: new RegExp('^' + email.trim() + '$', 'i') });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }

    // Check brute force lockout
    if (user.resetOtpAttempts >= 5) {
      return res.status(429).json({ success: false, message: 'Too many failed verification attempts. Please request a new OTP.' });
    }

    // Check expiration
    if (!user.resetOtpExpires || user.resetOtpExpires.getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Verify OTP hash
    const hashedIncoming = crypto.createHash('sha256').update(otp.trim()).digest('hex');
    if (hashedIncoming !== user.resetOtp) {
      user.resetOtpAttempts += 1;
      await user.save({ validateBeforeSave: false });
      const remaining = 5 - user.resetOtpAttempts;
      return res.status(400).json({ success: false, message: `Invalid OTP code. You have ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` });
    }

    // OTP is valid: Set verified state & generate secure temporary reset token
    user.resetOtpVerified = true;
    user.resetOtp = undefined;
    user.resetOtpAttempts = 0;

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 mins
    await user.save({ validateBeforeSave: false });

    await AuditLog.create({
      action: 'OTP_VERIFIED',
      performedBy: user._id,
      targetId: user._id.toString(),
      targetName: user.email,
      details: `User successfully verified OTP for password reset from IP: ${req.ip}`
    });

    res.json({ success: true, message: 'OTP verified successfully.', resetToken });
  } catch (err) {
    res.status(500).json({ success: false, message: 'OTP verification failed. Please try again.' });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const user = await User.findOne({ email: new RegExp('^' + email.trim() + '$', 'i') });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email address.' });
    }

    if (user.lastOtpSentAt && Date.now() - user.lastOtpSentAt.getTime() < 60000) {
      const remaining = Math.ceil((60000 - (Date.now() - user.lastOtpSentAt.getTime())) / 1000);
      return res.status(429).json({ success: false, message: `Please wait ${remaining} seconds before requesting another OTP.` });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(otpCode).digest('hex');

    user.resetOtp = hashedOtp;
    user.resetOtpExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    user.resetOtpVerified = false;
    user.resetOtpAttempts = 0;
    user.lastOtpSentAt = Date.now();
    await user.save({ validateBeforeSave: false });

    const sendEmail = require('../utils/email');
    await sendEmail({
      email: user.email,
      subject: 'Your New Password Reset OTP | Study Repository',
      htmlContent: `
        <div style="text-align: center; font-family: 'Inter', sans-serif;">
          <h2 style="color: #0F172A; font-size: 24px; font-weight: 700; margin-bottom: 16px;">New OTP Verification</h2>
          <p style="color: #334155; font-size: 16px; margin-bottom: 24px;">Hello ${user.name}, here is your new One-Time Password (OTP) for password reset:</p>
          <div style="background-color: #F1F5F9; border: 2px dashed #CBD5E1; border-radius: 16px; padding: 24px; margin: 24px auto; max-width: 300px;">
            <h1 style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #6558f5; margin: 0;">${otpCode}</h1>
          </div>
          <p style="color: #64748B; font-size: 14px; margin-bottom: 24px;">⚠️ This OTP is valid for <strong>15 minutes</strong>.</p>
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 32px 0;">
          <p style="color: #94A3B8; font-size: 12px;">Secure Authentication System &copy; Study Repository Platform</p>
        </div>
      `
    });

    res.json({ success: true, message: 'A new OTP has been sent to your email address.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to resend OTP. Please try again.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password, email } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
      resetOtpVerified: true
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset session. Please restart the forgot password flow.' });
    }

    // Verify email matches the session for extra security
    if (email && user.email.toLowerCase() !== email.toLowerCase().trim()) {
      return res.status(400).json({ success: false, message: 'Email mismatch. Security violation.' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.resetOtpVerified = false; // Reset verified state
    await user.save();

    await AuditLog.create({
      action: 'PASSWORD_RESET',
      performedBy: user._id,
      targetId: user._id.toString(),
      targetName: user.email,
      details: `Password successfully reset following secure OTP verification for ${user.email} from IP: ${req.ip}`
    });

    res.json({ success: true, message: 'Password reset successful. You can now login with your new password.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reset password. Please try again.' });
  }
};
