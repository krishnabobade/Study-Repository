const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  phone: { type: String },
  dob: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'], default: 'Prefer not to say' },
  collegeName: { type: String, default: 'MIT World Peace University' },
  course: { type: String },
  semester: { type: Number },
  yearOfStudy: { type: Number },
  bio: { type: String },
  avatar: { type: String },
  role: { 
    type: String, 
    enum: ['student', 'super_admin'], 
    default: 'student' 
  },
  permissions: [{ type: String }], // e.g. ['MANAGE_USERS', 'APPROVE_UPLOADS', 'VIEW_ANALYTICS']
  
  // Multi-Institution Support
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' }, // Null for super_admins or global accounts
  department: { type: String }, // e.g. 'Computer Engineering'
  
  // Business Readiness
  subscription: {
    plan: { type: String, enum: ['free', 'premium', 'pro'], default: 'free' },
    status: { type: String, enum: ['active', 'canceled', 'past_due'], default: 'active' },
    validUntil: { type: Date }
  },

  isVerified: { type: Boolean, default: true },
  totalUploads: { type: Number, default: 0 },
  totalDownloads: { type: Number, default: 0 },
  savedResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  viewedResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  totalLikes: { type: Number, default: 0 },
  totalDislikes: { type: Number, default: 0 },
  documentLikes: { type: Number, default: 0 },
  documentDislikes: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

// Advanced Indexing for Scale
userSchema.index({ institutionId: 1, role: 1 });
userSchema.index({ 'subscription.plan': 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
