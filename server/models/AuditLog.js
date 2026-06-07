const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' }, // For multi-tenant log segregation
  targetId: { type: String }, // Can be resource ID, user ID, etc.
  targetName: { type: String }, // Title or name for quick reference
  details: { type: String },
  createdAt: { type: Date, default: Date.now, expires: 7776000 } // Auto-delete documents after 90 days
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
