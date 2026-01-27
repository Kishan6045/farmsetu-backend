const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  officename: String,
  pincode: Number,

  Taluk: String,
  Districtname: String,
  statename: String,

  RelatedSuboffice: String,
  RelatedHeadoffice: String
});

// ⚠️ exact collection name as MongoDB
module.exports = mongoose.model(
  "Location",
  locationSchema,
  "locations"
);
