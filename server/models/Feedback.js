const mongoose = require('mongoose');
const { censorText } = require('../utils/profanity');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'open', 'in-progress', 'resolved'],
    default: 'unread'
  }
}, { timestamps: true });

feedbackSchema.pre('save', function (next) {
  if (this.message) {
    this.message = censorText(this.message);
  }
  next();
});

module.exports = mongoose.model('Feedback', feedbackSchema);
