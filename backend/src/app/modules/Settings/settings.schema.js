const mongoose = require('mongoose');
const contentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['faq', 'terms', 'privacy', 'about', 'help'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Content', contentSchema);