// models/Setting.js
const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    globalCommissionRate: { type: Number, default: 5 },
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
    navbarColor: String,

    infoFirstImage: String,
    infoSecondImage: String,
    marqueeImage: String,

    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String,
    youtube: String,
    whatsapp: String,
    email: String,
    phone: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
