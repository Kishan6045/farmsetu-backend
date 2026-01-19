const express = require('express');
const router = express.Router();
const { createListing } = require('../controllers/listingController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createListing);

module.exports = router;
