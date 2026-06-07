const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String, required: true },
  filePublicId: { type: String },
  status: { type: String, enum: ['Submitted', 'Late', 'Graded'], default: 'Submitted' },
  grade: { type: Number },
  feedback: { type: String },
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
