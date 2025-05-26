const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    amount: Number,
    currency: String,
    paymentIntentId: String,
    status: { type: String, enum: ["success", "failed", "pending"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
