const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    village: {
      type: String,
      required: true,
      trim: true,
    },
    taluko: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const listingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Category enum from mobile app (e.g. 'FARM_PRODUCE', 'BUFFALO', etc.)
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    expectedPrice: {
      type: Number,
      required: [true, 'Expected price is required'],
      min: [0, 'Expected price must be positive'],
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    video: {
      type: String,
      trim: true,
    },
    address: {
      type: addressSchema,
      required: true,
    },
    showOnlyInMyDistrict: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Listing', listingSchema);

