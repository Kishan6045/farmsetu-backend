const path = require('path');
const Listing = require('../models/Listing');

// Allowed category enums from mobile app
const ALLOWED_CATEGORIES = [
  // Row 1
  'FARM_PRODUCE',
  'BUFFALO',
  'COW',
  // Row 2
  'HORSE',
  'DOGS',
  'BULL_OX',
  'CAMEL',
  // Row 3
  'THRESHER',
  'ROTAVATOR',
  'SEED_DRILL',
  'FARM_TOOLS',
  // Row 4
  'DRIP_SPRINKLER',
  'TRACTOR',
  'MINI_TRACTOR',
  'TROLLEY',
  // Row 5
  'BULLOCK_CART',
  'POWER_TILLER',
  'TWO_WHEELER',
  'FOUR_WHEELER',
  // Row 6
  'SHEEP_GOAT',
  'POULTRY',
  'SEEDS_MEDICINE',
  'AUTO_RICKSHAW',
  // Row 7
  'CHAFF_CUTTER',
  'OTHER_VEHICLE',
  'ORGANIC_FARMING',
  'NURSERY_PLANTS',
  // Row 8
  'SCRAP',
  'MOBILE',
  'JOB',
  'AGRICULTURAL_LAND',
  // Row 9
  'VEGETABLES_FRUITS',
  'CATERING',
  'FARM_TOOLS_RENT',
  'HOUSE_SHOP_PLOT',
  // Row 10
  'JCB_POCLAIN',
  'SCHOOL_COLLEGE',
  'AC_ELECTRIC',
  'OTHER',
];

// Create a new listing
const createListing = async (req, res) => {
  try {
    const body = req.body || {};
    const {
      title,
      description,
      expectedPrice,
      category,
      village,
      taluko,
      district,
      state,
      showOnlyInMyDistrict,
      images, // Array of filenames or JSON string
      video, // Single filename
    } = body;

    const parsedAddress =
      typeof body.address === 'string'
        ? (() => {
          try {
            return JSON.parse(body.address);
          } catch (error) {
            return {};
          }
        })()
        : body.address || {};

    const userAddress = req.user && req.user.address ? req.user.address : {};
    const resolvedVillage =
      village ||
      body.villageName ||
      parsedAddress.village ||
      parsedAddress.villageName ||
      userAddress.village ||
      userAddress.villageName;
    const resolvedTaluko = taluko || parsedAddress.taluko || userAddress.taluko;
    const resolvedDistrict = district || parsedAddress.district || userAddress.district;
    const resolvedState = state || parsedAddress.state || userAddress.state;

    // Handle files - support both array format (from upload.any()) and object format
    let allFiles = [];
    if (Array.isArray(req.files)) {
      // Files are in array format (from upload.any())
      allFiles = req.files;
    } else if (req.files && typeof req.files === 'object') {
      // Files are organized by field name (old format)
      Object.values(req.files).forEach(fileArray => {
        if (Array.isArray(fileArray)) {
          allFiles.push(...fileArray);
        } else {
          allFiles.push(fileArray);
        }
      });
    }
    
    // Separate images and videos based on mimetype and field name
    const imageFiles = allFiles.filter(file => {
      const fieldName = file.fieldname || '';
      const isImageField = 
        fieldName === 'image' ||
        fieldName === 'images' ||
        fieldName === 'images[]' ||
        fieldName.startsWith('images[') ||
        fieldName.startsWith('image_') ||
        /^images?\[/.test(fieldName) ||
        file.mimetype.startsWith('image/');
      return isImageField;
    });
    
    const imagesFromFiles = imageFiles.map((file) => file.filename);

    const parseImagesFromBody = (value) => {
      if (!value) {
        return [];
      }
      if (Array.isArray(value)) {
        return value.filter(Boolean);
      }
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
          return [];
        }
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return parsed.filter(Boolean);
          }
        } catch (error) {
          // Fallback to comma-separated parsing
        }
        return trimmed
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
      }
      return [];
    };

    const imagesFromBody = parseImagesFromBody(images);
    const imagesArray = imagesFromFiles.length > 0 ? imagesFromFiles : imagesFromBody;

    // Get video files
    const videoFiles = allFiles.filter(file => {
      const fieldName = file.fieldname || '';
      const isVideoField = 
        fieldName === 'video' ||
        fieldName === 'videos' ||
        fieldName.startsWith('video[') ||
        fieldName.startsWith('video_') ||
        file.mimetype.startsWith('video/');
      return isVideoField;
    });
    const videoFromFiles = videoFiles.length > 0 ? videoFiles[0].filename : null;
    const videoFromBody =
      typeof video === 'string' ? (video.trim() ? video.trim() : null) : video || null;
    const resolvedVideo = videoFromFiles || videoFromBody;

    // Normalize and validate category
    const normalizedCategory =
      typeof category === 'string' ? category.trim().toUpperCase() : '';

    // Basic validation for required fields
    if (!title || !description || !expectedPrice || !normalizedCategory) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, expectedPrice, and category are required.',
      });
    }

    // Validate category is one of allowed enums
    if (!ALLOWED_CATEGORIES.includes(normalizedCategory)) {
      console.warn('❌ Invalid category received:', {
        rawCategory: category,
        normalizedCategory,
      });
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Please select a valid category.',
      });
    }

    if (!resolvedVillage || !resolvedTaluko || !resolvedDistrict || !resolvedState) {
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

    const listing = await Listing.create({
      user: req.user._id,
      category: normalizedCategory,
      title,
      description,
      expectedPrice: numericPrice,
      images: imagesArray,
      video: resolvedVideo || null,
      address: {
        village: resolvedVillage,
        taluko: resolvedTaluko,
        district: resolvedDistrict,
        state: resolvedState,
      },
      showOnlyInMyDistrict: showOnlyInMyDistrict === 'true' || showOnlyInMyDistrict === true,
    });

    // Transform listing to return only filenames in images array and video
    const listingObj = listing.toObject();

    // Ensure images array contains only filenames (extract filename from path if needed)
    if (listingObj.images && Array.isArray(listingObj.images)) {
      listingObj.images = listingObj.images.map((img) => {
        if (!img) return img;
        // Extract just the filename (remove any path)
        return path.basename(img);
      });
    }

    // Ensure video contains only filename (extract filename from path if needed)
    if (listingObj.video) {
      listingObj.video = path.basename(listingObj.video);
    }

    return res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: listingObj,
    });
  } catch (error) {
    console.error('❌ Error creating listing:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    // Ensure response hasn't been sent
    if (res.headersSent) {
      return;
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create listing',
      error: error.message || 'Internal server error',
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

    // Transform listings to return only filenames in images array and video
    const transformedListings = listings.map((listing) => {
      const listingObj = listing.toObject();

      // Ensure images array contains only filenames (extract filename from path if needed)
      if (listingObj.images && Array.isArray(listingObj.images)) {
        listingObj.images = listingObj.images.map((img) => {
          if (!img) return img;
          // Extract just the filename (remove any path)
          return path.basename(img);
        });
      }

      // Ensure video contains only filename (extract filename from path if needed)
      if (listingObj.video) {
        listingObj.video = path.basename(listingObj.video);
      }

      return listingObj;
    });

    return res.status(200).json({
      success: true,
      data: transformedListings,
    });
  } catch (error) {
    console.error('❌ Error fetching listings:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    // Ensure response hasn't been sent
    if (res.headersSent) {
      return;
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch listings',
      error: error.message || 'Internal server error',
    });
  }
};

module.exports = {
  createListing,
  getListings,
};