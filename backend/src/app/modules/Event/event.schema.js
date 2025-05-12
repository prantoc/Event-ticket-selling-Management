const mongoose = require('mongoose');
// const eventSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   description: { type: String },
//   category: { type: String, enum: ['music', 'comedy', 'workshop', 'other'], required: true },
//   dateTime: { type: Date, required: true },
//   location: {
//     address: String,
//     lat: Number,
//     lng: Number
//   },
//   media: [String],
//   organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   ticketTiers: [{
//     tierName: { type: String, required: true },
//     price: { type: Number, required: true },
//     quantity: { type: Number, required: true }
//   }],
//   refundPolicy: {
//     daysBefore: { type: Number, default: 7 },
//     refundPercent: { type: Number, default: 50 }
//   },
//   status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
// }, { timestamps: true });

const eventSchema = new mongoose.Schema({
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  category: {
    type: String,
    enum: ['music', 'comedy', 'workshops', 'sports', 'arts', 'education', 'business', 'technology', 'food', 'other'],
    required: true
  },
  images: [{
    url: String,
    isPrimary: Boolean,
    caption: String
  }],
  startDateTime: {
    type: Date,
    required: true
  },
  endDateTime: {
    type: Date,
    required: true
  },
  venue: {
    name: {
      type: String,
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    mapUrl: String
  },
  ticketTiers: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    price: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    totalQuantity: {
      type: Number,
      required: true
    },
    availableQuantity: {
      type: Number,
      required: true
    },
    maxPerOrder: {
      type: Number,
      default: 10
    },
    salesStartDate: Date,
    salesEndDate: Date,
    position: Number // For ordering (e.g., front-row, general)
  }],
  refundPolicy: {
    type: {
      type: String,
      enum: ['no-refunds', 'time-based', 'custom'],
      default: 'time-based'
    },
    rules: [{
      daysBeforeEvent: Number,
      refundPercentage: Number,
      description: String
    }],
    customPolicy: String
  },
  status: {
    type: String,
    enum: ['draft', 'pending-approval', 'approved', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  approvalStatus: {
    approved: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    rejectionReason: String
  },
  publishedAt: Date,
  tags: [String],
  isFeature: {
    type: Boolean,
    default: false
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    uniqueVisitors: {
      type: Number,
      default: 0
    }
  },
  revenue: {
    gross: {
      type: Number,
      default: 0
    },
    platformCommission: {
      type: Number,
      default: 0
    },
    net: {
      type: Number,
      default: 0
    },
    refunded: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
