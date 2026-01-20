const express = require('express');
const router = express.Router();
const { uploadImage, uploadImages, uploadVideo } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const {
  uploadSingleImageWithErrorHandling,
  uploadMultipleImagesWithErrorHandling,
  uploadSingleVideoWithErrorHandling,
} = require('../middleware/upload');

// POST /api/upload/image - Upload single image (authenticated)
router.post('/image', protect, uploadSingleImageWithErrorHandling, uploadImage);

// POST /api/upload/images - Upload multiple images (authenticated)
router.post('/images', protect, uploadMultipleImagesWithErrorHandling, uploadImages);

// POST /api/upload/video - Upload single video (authenticated)
router.post('/video', protect, uploadSingleVideoWithErrorHandling, uploadVideo);

module.exports = router;
