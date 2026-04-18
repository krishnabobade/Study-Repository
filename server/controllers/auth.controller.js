const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { uploadStream } = require('../utils/cloudinary');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const signToken = id => jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '7d' });

exports.register = async (req, res) => {
  try {
    const { 
      name, email, password, phone, dob, gender, 
      collegeName, course, semester, yearOfStudy, bio, role 
    } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });

    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number (10 digits required).' });
    }

    // Validate email domain
    if (!email.toLowerCase().endsWith('@mitwpu.edu.in')) {
      return res.status(403).json({ success: false, message: 'Unauthorized domain. Please use your @mitwpu.edu.in college email.' });
    }

    // Role-Based Password Access Control
    if (role === 'teacher') {
      if (password !== '12345678') {
        return res.status(403).json({ success: false, message: 'Teacher registration requires the designated faculty system password.' });
      }
    } else {
      if (password === '12345678') {
        return res.status(403).json({ success: false, message: 'Students cannot use the assigned faculty password.' });
      }
      // Strong password validation for students
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
      const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase() || 'jpg';
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        const cloudinaryResult = await uploadStream(req.file.buffer, { folder: 'studyrepo/avatars', resource_type: 'image' });
        avatar = cloudinaryResult.secure_url;
      } else {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        const filename = `avatar-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
        fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
        const baseUrl = req.protocol + '://' + req.get('host');
        avatar = `${baseUrl}/uploads/${filename}`;
      }
    }

    const user = await User.create({ 
      name, email, password, phone, dob, gender, collegeName: collegeName || 'MIT World Peace University', 
      course, semester, yearOfStudy, bio, role: role || 'student', avatar 
    });
    
    const token = signToken(user._id);

    res.status(201).json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // Enforce strict Teacher vs Student authentications
    if (user.role === 'teacher') {
      if (password !== '12345678') {
        return res.status(403).json({ success: false, message: 'Unauthorized teacher access. Invalid faculty password.' });
      }
      // System overrides standard hash check if faculty password matches strictly
    } else {
      if (password === '12345678') {
        return res.status(403).json({ success: false, message: 'Students cannot use the faculty override password.' });
      }
      if (!(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    }

    const token = signToken(user._id);
    user.password = undefined;

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
