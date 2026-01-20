const express = require('express');
const router = express.Router();
const { createListing, getListings } = require('../controllers/listingController');
const { protect } = require('../middleware/auth');

// POST /api/listings
// Create a new listing (authenticated) - accepts only filenames in JSON, no file upload
router.post('/', protect, createListing);

// GET /api/listings
// Get listings visible to the authenticated user, honoring showOnlyInMyDistrict
router.get('/', protect, getListings);

module.exports = router;

