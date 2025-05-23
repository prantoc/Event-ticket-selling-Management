// models/Setting.js
const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  globalCommissionRate: { type: Number, default: 0 },
  organizerCommissionRates: [
    {
      organizerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      commissionRate: Number,
    },
  ],
  companyName: String,
  currencySymbol: String,
  taxAlias: String,
  taxPercentage: Number,
  daysBeforeProductExpiry: Number,
  address: String,
  companyLogo: String,
}, { timestamps: true });

module.exports = mongoose.model("Setting", settingSchema);
