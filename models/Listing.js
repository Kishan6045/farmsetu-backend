const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
    {
        village: {
            type: String,
            required: [true, 'Village is required'],
            trim: true,
        },
        taluko: {
            type: String,
            required: [true, 'Taluko is required'],
            trim: true,
        },
        district: {
            type: String,
            required: [true, 'District is required'],
            trim: true,
        },
        state: {
            type: String,
            required: [true, 'State is required'],
            trim: true,
        },
    },
    { _id: false }
);

const listingSchema = new mongoose.Schema(
    {
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
            min: [0, 'Expected price must be a positive number'],
        },
        images: {
            type: [String],
            validate: {
                validator: (value) => !value || value.length <= 3,
                message: 'Images cannot exceed 3 items',
            },
        },
        video: {
            type: String,
            trim: true,
        },
        address: {
            type: addressSchema,
            required: [true, 'Address is required'],
        },
        showOnlyInMyDistrict: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Listing', listingSchema);
