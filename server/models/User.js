const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { censorText } = require('../utils/profanity');

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
    enum: ['student', 'teacher', 'admin', 'college_admin', 'super_admin'], 
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
  profileVisits: { type: Number, default: 0 },
  credits: { type: Number, default: 0 },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  resetOtp: String,
  resetOtpExpires: Date,
  resetOtpVerified: { type: Boolean, default: false },
  resetOtpAttempts: { type: Number, default: 0 },
  lastOtpSentAt: Date
}, { timestamps: true });

// Advanced Indexing for Scale
userSchema.index({ institutionId: 1, role: 1 });
userSchema.index({ 'subscription.plan': 1 });

userSchema.pre('save', async function (next) {
  if (this.name) this.name = censorText(this.name);
  if (this.bio) this.bio = censorText(this.bio);
  if (this.collegeName) this.collegeName = censorText(this.collegeName);
  if (this.course) this.course = censorText(this.course);
  if (this.department) this.department = censorText(this.department);

  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const sanitizeUpdate = function(next) {
  const update = this.getUpdate();
  if (update) {
    if (update.name) update.name = censorText(update.name);
    if (update.bio) update.bio = censorText(update.bio);
    if (update.collegeName) update.collegeName = censorText(update.collegeName);
    if (update.course) update.course = censorText(update.course);
    if (update.department) update.department = censorText(update.department);
    
    if (update.$set) {
      if (update.$set.name) update.$set.name = censorText(update.$set.name);
      if (update.$set.bio) update.$set.bio = censorText(update.$set.bio);
      if (update.$set.collegeName) update.$set.collegeName = censorText(update.$set.collegeName);
      if (update.$set.course) update.$set.course = censorText(update.$set.course);
      if (update.$set.department) update.$set.department = censorText(update.$set.department);
    }
  }
  next();
};

userSchema.pre('findOneAndUpdate', sanitizeUpdate);
userSchema.pre('updateOne', sanitizeUpdate);
userSchema.pre('updateMany', sanitizeUpdate);

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
