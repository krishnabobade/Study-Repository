const Resource = require('../models/Resource');

exports.getMyUploads = async (req, res) => {
  try {
    const resources = await Resource.find({ uploadedBy: req.user.id }).sort('-createdAt');
    res.json({ success: true, resources });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { uploadStream } = require('../utils/cloudinary');

const User = require('../models/User');

exports.updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    const allowedFields = ['name', 'phone', 'dob', 'gender', 'course', 'semester', 'yearOfStudy', 'bio'];
    Object.keys(updates).forEach(key => {
      if (!allowedFields.includes(key)) delete updates[key];
    });

    if (req.file) {
      const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase() || 'jpg';
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        const cloudinaryResult = await uploadStream(req.file.buffer, { folder: 'studyrepo/avatars', resource_type: 'image' });
        updates.avatar = cloudinaryResult.secure_url;
      } else {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        const filename = `avatar-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
        fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
        updates.avatar = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
