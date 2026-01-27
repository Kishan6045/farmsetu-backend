const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  state: { type: String, required: true },
  district: { type: String, required: true },
  taluko: { type: String, required: true },
  village: { type: String, required: true },
  pincode: { type: String }
});

module.exports = mongoose.model("Location", locationSchema);
