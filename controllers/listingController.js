const fs = require('fs');
const path = require('path');
const Listing = require('../models/Listing');

// Utility to ensure upload directories exist
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const parseFilenameList = (value) => {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value !== 'string') {
    return [];
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    return trimmed
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return trimmed
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const parseFirstFilename = (value) => {
  const list = parseFilenameList(value);
  return list.length ? list[0] : null;
};

const normalizeMediaPath = (value, root) => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.startsWith('/uploads/')) {
    return trimmed;
  }
  return `/uploads/${root}/${trimmed}`;
};

const normalizeMediaArray = (values, root) => {
  return values
    .map((value) => normalizeMediaPath(value, root))
    .filter(Boolean);
};

// Create a new listing
const createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      expectedPrice,
      village,
      taluko,
      district,
      state,
      showOnlyInMyDistrict,
    } = req.body;

    // Basic validation for required fields
    if (!title || !description || !expectedPrice) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and expectedPrice are required.',
      });
    }

    if (!village || !taluko || !district || !state) {
      return res.status(400).json({
        success: false,
        message: 'Address fields (village, taluko, district, state) are required.',
      });
    }

    const numericPrice = Number(expectedPrice);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'expectedPrice must be a positive number.',
      });
    }

    // Check if user already has a listing with the same title (case-insensitive, exact match)
    const trimmedTitle = title.trim();

    // Escape special regex characters in title
    const escapedTitle = trimmedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const existingListing = await Listing.findOne({
      user: req.user._id,
      title: { $regex: new RegExp(`^${escapedTitle}$`, 'i') }, // Case-insensitive exact match
    });

    if (existingListing) {
      console.log('❌ Duplicate listing detected:', {
        userId: req.user._id,
        title: trimmedTitle,
        existingListingId: existingListing._id,
      });
      return res.status(400).json({
        success: false,
        message: 'You have already created a listing with this title. Please use a different title or update your existing listing.',
        existingListingId: existingListing._id,
      });
    }

    console.log('✅ No duplicate found, creating new listing:', {
      userId: req.user._id,
      title: trimmedTitle,
    });

    // Build media URLs from uploaded files
    const images = [];
    let video = null;

    if (req.files && Array.isArray(req.files.images) && req.files.images.length > 0) {
      req.files.images.forEach((file) => {
        images.push(`/uploads/images/${file.filename}`);
      });
    } else {
      const imageNames = parseFilenameList(req.body.images);
      images.push(...normalizeMediaArray(imageNames, 'images'));
    }

    if (req.files && Array.isArray(req.files.video) && req.files.video[0]) {
      video = `/uploads/videos/${req.files.video[0].filename}`;
    } else {
      const videoName = parseFirstFilename(req.body.video);
      if (videoName) {
        video = normalizeMediaPath(videoName, 'videos');
      }
    }

    // Ensure upload directories exist (in case they were missing)
    ensureDirExists(path.join(__dirname, '..', 'uploads', 'images'));
    ensureDirExists(path.join(__dirname, '..', 'uploads', 'videos'));

    const listing = await Listing.create({
      user: req.user._id,
      title,
      description,
      expectedPrice: numericPrice,
      images,
      video,
      address: {
        village,
        taluko,
        district,
        state,
      },
      showOnlyInMyDistrict: showOnlyInMyDistrict === 'true' || showOnlyInMyDistrict === true,
    });

    return res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: listing,
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create listing',
      error: error.message,
    });
  }
};

// Example: Get listings visible to the current user,
// respecting the showOnlyInMyDistrict flag.
const getListings = async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user.address || !user.address.district) {
      return res.status(400).json({
        success: false,
        message: 'User address with district is required to fetch listings.',
      });
    }

    const userDistrict = user.address.district;

    // Listings are visible if:
    // - status is 'active' (only show active listings)
    // - showOnlyInMyDistrict is false (public), OR
    // - showOnlyInMyDistrict is true AND listing.address.district == user.address.district
    const listings = await Listing.find({
      status: 'active', // Only show active listings
      $or: [
        { showOnlyInMyDistrict: false },
        { showOnlyInMyDistrict: true, 'address.district': userDistrict },
      ],
    }).populate('user', 'firstName lastName address district');

    return res.status(200).json({
      success: true,
      data: listings,
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch listings',
      error: error.message,
    });
  }
};

module.exports = {
  createListing,
  getListings,
};

