const express = require('express');
const router = express.Router();
const { createListing, getListings } = require('../controllers/listingController');
const { protect } = require('../middleware/auth');
const { uploadListingMediaWithErrorHandling } = require('../middleware/upload');
 
// POST /api/listings
// Create a new listing (authenticated) - supports multipart/form-data uploads
router.post('/', protect, uploadListingMediaWithErrorHandling, createListing);
 
// GET /api/listings
// Get listings visible to the authenticated user, honoring showOnlyInMyDistrict
router.get('/', protect, getListings);
 
module.exports = router;