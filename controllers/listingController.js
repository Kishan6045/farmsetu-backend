const Listing = require('../models/Listing');

const parseBoolean = (value) => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') {
      return true;
    }
    if (value.toLowerCase() === 'false') {
      return false;
    }
  }
  return false;
};

// @desc    Create listing
// @route   POST /api/listings
// @access  Private
const createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      expectedPrice,
      images,
      video,
      address,
      showOnlyInMyDistrict,
    } = req.body;

    if (
      typeof title !== 'string' ||
      !title.trim() ||
      typeof description !== 'string' ||
      !description.trim() ||
      expectedPrice === undefined ||
      expectedPrice === null ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (
      typeof address !== 'object' ||
      !address.village ||
      !address.taluko ||
      !address.district ||
      !address.state
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all address fields (village, taluko, district, state)',
      });
    }

    const parsedExpectedPrice = Number(expectedPrice);
    if (Number.isNaN(parsedExpectedPrice) || parsedExpectedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Expected price must be a valid number',
      });
    }

    if (images !== undefined && !Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        message: 'Images must be an array',
      });
    }

    const sanitizedImages = Array.isArray(images)
      ? images
          .filter((image) => typeof image === 'string' && image.trim())
          .map((image) => image.trim())
      : [];

    if (sanitizedImages.length > 3) {
      return res.status(400).json({
        success: false,
        message: 'Images cannot exceed 3 items',
      });
    }

    const sanitizedVideo =
      typeof video === 'string' && video.trim() ? video.trim() : '';

    if (sanitizedImages.length === 0 && !sanitizedVideo) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one image or a video',
      });
    }

    const listing = await Listing.create({
      title: title.trim(),
      description: description.trim(),
      expectedPrice: parsedExpectedPrice,
      images: sanitizedImages,
      video: sanitizedVideo || undefined,
      address: {
        village: String(address.village).trim(),
        taluko: String(address.taluko).trim(),
        district: String(address.district).trim(),
        state: String(address.state).trim(),
      },
      showOnlyInMyDistrict: parseBoolean(showOnlyInMyDistrict),
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: {
        listing,
      },
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during listing creation',
    });
  }
};

module.exports = {
  createListing,
};
