const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['global', 'organizer', 'event', 'category'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: function() {
      return this.type !== 'global';
    }
  },
  entityType: {
    type: String,
    enum: ['organizer', 'event', 'category'],
    required: function() {
      return this.type !== 'global';
    }
  },
  rate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  effectiveFrom: {
    type: Date,
    default: Date.now
  },
  effectiveTo: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Commission', commissionSchema);