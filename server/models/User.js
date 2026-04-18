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
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  isVerified: { type: Boolean, default: true },
  totalUploads: { type: Number, default: 0 },
  totalDownloads: { type: Number, default: 0 },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
