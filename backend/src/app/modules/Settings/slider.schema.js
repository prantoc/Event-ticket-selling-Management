// models/Setting.js
const mongoose = require("mongoose");

const sliderSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    position: {
      type: Number,
      default: 0,
    },
    title: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Slider", sliderSchema);
