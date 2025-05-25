const mongoose = require('mongoose');
const organizerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  organizationName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  logo: {
    type: String,
    default: null
  },
  website: String,
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  // verificationDocuments: [{
  //   documentType: String,
  //   documentUrl: String,
  //   uploadedAt: Date
  // }],
  rejectionReason: String,
  stripeConnectAccountId: {
    type: String,
    default: null
  },
  commissionRate: {
    type: Number,
    default: 5,
    min: 0,
    max: 100
  },
  payoutSchedule: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'weekly'
  },
  earnings: {
    total: {
      type: Number,
      default: 0
    },
    available: {
      type: Number,
      default: 0
    },
    pending: {
      type: Number,
      default: 0
    }
  },
  reviewedAt: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Organizer', organizerProfileSchema);