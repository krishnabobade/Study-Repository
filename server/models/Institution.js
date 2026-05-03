const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  domain: { type: String, required: true, unique: true }, // e.g. 'mitwpu.edu.in'
  branding: {
    logoUrl: { type: String },
    primaryColor: { type: String, default: '#6558f5' }
  },
  departments: [{ type: String }],
  isActive: { type: Boolean, default: true },
  plan: { type: String, enum: ['free', 'standard', 'enterprise'], default: 'free' },
  storageLimit: { type: Number, default: 5368709120 }, // Default 5GB in bytes
  storageUsed: { type: Number, default: 0 },
  adminContacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

institutionSchema.index({ domain: 1 });

module.exports = mongoose.model('Institution', institutionSchema);
