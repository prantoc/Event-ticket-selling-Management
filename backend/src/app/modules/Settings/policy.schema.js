const mongoose = require("mongoose");

const PolicySchema = new mongoose.Schema({
  page: {
    type: String,
    required: true,
    unique: true, // Example: 'termsOfService', 'privacyPolicy', etc.
  },
  content: {
    type: String,
    required: true,
  },
  effectiveDate: {
    type: Date,
    required: true,
  },
}, { timestamps: true }); // adds createdAt and updatedAt

module.exports = mongoose.model("Policy", PolicySchema);
