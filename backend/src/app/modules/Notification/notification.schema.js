const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "booking_confirmation",
        "event_reminder",
        "refund_update",
        "payout_completed",
        "event_approved",
        "organizer_verified",
        "system_announcement",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
    },
    channel: {
      type: String,
      enum: ["in-app", "email", "both"],
      default: "both",
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = {
  Notification: mongoose.model("Notification", notificationSchema),
};
