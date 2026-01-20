const path = require('path');
const Listing = require('../models/Listing');

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
      images = [],   // Array of filenames: ["img1.jpg", "img2.jpg"]
      video = null,  // Single filename: "vid1.mp4"
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

    // Ensure images is an array
    const imagesArray = Array.isArray(images) ? images : [];

    const listing = await Listing.create({
      user: req.user._id,
      title,
      description,
      expectedPrice: numericPrice,
      images: imagesArray,
      video: video || null,
      address: {
        village,
        taluko,
        district,
        state,
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

