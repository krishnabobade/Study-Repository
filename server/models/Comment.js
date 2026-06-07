const mongoose = require('mongoose');
const { censorText } = require('../utils/profanity');

const commentSchema = new mongoose.Schema({
  resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
}, { timestamps: true });

commentSchema.pre('save', function (next) {
  if (this.comment) {
    this.comment = censorText(this.comment);
  }
  next();
});

module.exports = mongoose.model('Comment', commentSchema);
