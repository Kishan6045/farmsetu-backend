const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Configure storage for images and videos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;
    if (file.fieldname === 'images') {
      uploadPath = path.join(__dirname, '..', 'uploads', 'images');
    } else if (file.fieldname === 'video') {
      uploadPath = path.join(__dirname, '..', 'uploads', 'videos');
    } else {
      uploadPath = path.join(__dirname, '..', 'uploads', 'others');
    }

    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

// File filter to accept only images for 'images' field and videos for 'video' field
// Note: When using upload.fields(), multer only processes the specified fields
// Text fields are automatically ignored and go to req.body
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'images') {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed for images field'), false);
    }
    return cb(null, true);
  }

  if (file.fieldname === 'video') {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('Only video files are allowed for video field'), false);
    }
    return cb(null, true);
  }

  // This should never be reached when using fields(), but just in case
  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB per file
  },
});

// Middleware for listing uploads: max 3 images, 1 video
const uploadListingMedia = upload.fields([
  { name: 'images', maxCount: 3 },
  { name: 'video', maxCount: 1 },
]);

// Wrapper to handle multer errors properly
const uploadListingMediaWithErrorHandling = (req, res, next) => {
  // Log all incoming fields for debugging
  console.log('📋 Incoming form fields:', Object.keys(req.body || {}));
  if (req.files) {
    console.log('📁 Incoming file fields:', Object.keys(req.files));
  }

  uploadListingMedia(req, res, (err) => {
    if (err) {
      // Log detailed error information
      console.error('❌ Multer Error Details:', {
        code: err.code,
        field: err.field,
        message: err.message,
        name: err.name,
      });
      return handleUploadErrors(err, req, res, next);
    }
    next();
  });
};

// Error handling wrapper for multer
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 3 images and 1 video allowed.',
      });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum file size is 20MB.',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      // Log the field name if available
      const fieldName = err.field || 'unknown';
      console.error('❌ Unexpected file field detected:', fieldName);
      console.error('💡 Tip: Check Postman - this field is set to "File" type but should be "Text" type');
      return res.status(400).json({
        success: false,
        message: `Unexpected file field "${fieldName}". Only "images" (max 3) and "video" (max 1) fields are allowed. Please check that all text fields in Postman are set to "Text" type, not "File" type.`,
        field: fieldName,
        hint: 'In Postman, go to Body → form-data and change the field type from "File" to "Text" for: ' + fieldName,
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error',
    });
  }
  next();
};

module.exports = {
  uploadListingMedia,
  uploadListingMediaWithErrorHandling,
  handleUploadErrors,
};

