const mongoose = require("mongoose");
const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    tickets: [
      {
        ticketTierId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        tierName: String,
        price: Number,
        quantity: Number,
        totalPrice: Number,
      },
    ],
    paymentDetails: {
      method: {
        type: String,
        enum: ["stripe", "paypal"],
        default: "stripe",
      },
      stripePaymentIntentId: String,
      stripeChargeId: String,
      status: {
        type: String,
        enum: [
          "pending",
          "processing",
          "succeeded",
          "failed",
          "refunded",
          "partially_refunded",
        ],
        default: "pending",
      },
      totalAmount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: "USD",
      },
      platformFee: Number,
      organizerRevenue: Number,
    },
    ticketDetails: [
      {
        ticketId: {
          type: String,
          unique: true,
          required: true,
        },
        tierName: String,
        qrCode: String,
        qrCodeUrl: String,
        status: {
          type: String,
          enum: ["active", "used", "cancelled"],
          default: "active",
        },
        usedAt: Date,
        cancelledAt: Date,
      },
    ],
    refundDetails: {
      status: {
        type: String,
        enum: ["none", "requested", "processing", "completed", "rejected"],
        default: "none",
      },
      requestedAt: Date,
      processedAt: Date,
      amount: Number,
      reason: String,
      adminNotes: String,
    },
    confirmationEmailSent: {
      type: Boolean,
      default: false,
    },
    reminderEmailSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Booking", bookingSchema);
