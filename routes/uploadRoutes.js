const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  uploadCommonMediaWithErrorHandling,
  validateUploadRoot,
} = require('../middleware/upload');
const { uploadMedia } = require('../controllers/uploadController');

// POST /api/uploads/:root
// Upload images/videos to a specific root folder
router.post(
  '/:root',
  protect,
  validateUploadRoot,
  uploadCommonMediaWithErrorHandling,
  uploadMedia
);

module.exports = router;
