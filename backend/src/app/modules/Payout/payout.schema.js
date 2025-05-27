const mongoose = require('mongoose');
const payoutSchema = new mongoose.Schema({
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stripeTransferId: {
    type: String,
    unique: true,
    sparse: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['automatic', 'manual'],
    default: 'automatic'
  },
  failureReason: String,
  completedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Payout', payoutSchema);