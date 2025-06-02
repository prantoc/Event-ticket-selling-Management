const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const stateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cities: [String],
});

const countrySchema = new mongoose.Schema({
  country: { type: String, required: true },
  iso2: { type: String, required: true, unique: true },
  states: [stateSchema],
});

module.exports = mongoose.model("Country", countrySchema);
