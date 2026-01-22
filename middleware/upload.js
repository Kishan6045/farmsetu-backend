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
    if (
      file.fieldname === 'images' ||
      file.fieldname === 'image' ||
      file.fieldname === 'images[]'
    ) {
      uploadPath = path.join(__dirname, '..', 'uploads', 'images');
    } else if (file.fieldname === 'video' || file.fieldname === 'videos') {
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

// File filter to accept images and videos
const fileFilter = (req, file, cb) => {
  // Allow images for image fields
  if (
    file.fieldname === 'images' ||
    file.fieldname === 'image' ||
    file.fieldname === 'images[]'
  ) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed for images field'), false);
    }
    return cb(null, true);
  }
  
  // Allow videos for video fields
  if (file.fieldname === 'video' || file.fieldname === 'videos') {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('Only video files are allowed for video field'), false);
    }
    return cb(null, true);
  }
  
  // Default: reject unknown field types
  return cb(new Error('Invalid file field'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB per file
  },
});

const getFirstFileFromFields = (files, fieldNames) => {
  if (!files) {
    return null;
  }
  for (const fieldName of fieldNames) {
    const fileList = files[fieldName];
    if (Array.isArray(fileList) && fileList.length > 0) {
      return fileList[0];
    }
  }
  return null;
};

const collectFilesFromFields = (files, fieldNames) => {
  if (!files) {
    return [];
  }
  return fieldNames.reduce((acc, fieldName) => {
    const fileList = files[fieldName];
    if (Array.isArray(fileList) && fileList.length > 0) {
      acc.push(...fileList);
    }
    return acc;
  }, []);
};

// Middleware for listing uploads: max 3 images, 1 video
const uploadListingMedia = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 3 },
  { name: 'images[]', maxCount: 3 },
  { name: 'video', maxCount: 1 },
  { name: 'videos', maxCount: 1 },
]);

// Wrapper to handle multer errors properly
const uploadListingMediaWithErrorHandling = (req, res, next) => {
  // Ensure req.body exists before multer processes
  if (!req.body) {
    req.body = {};
  }

  // Log all incoming fields for debugging
  console.log('📋 Incoming form fields (before multer):', Object.keys(req.body || {}));

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
    
    // Ensure req.body exists after multer (multer should populate it)
    if (!req.body) {
      req.body = {};
    }
    
    // Log after multer processing
    console.log('📋 Form fields (after multer):', Object.keys(req.body || {}));
    if (req.files) {
      console.log('📁 File fields:', Object.keys(req.files));
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

// Common image upload middleware (single image)
const uploadSingleImage = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 1 },
  { name: 'images[]', maxCount: 1 },
]);

// Common image upload middleware (multiple images)
const uploadMultipleImages = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'images[]', maxCount: 10 },
]); // Max 10 images for common upload

// Common video upload middleware (single video)
const uploadSingleVideo = upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'videos', maxCount: 1 },
]);

// Wrapper for single image upload with error handling
const uploadSingleImageWithErrorHandling = (req, res, next) => {
  uploadSingleImage(req, res, (err) => {
    if (err) {
      console.error('❌ Multer Error Details:', {
        code: err.code,
        message: err.message,
        name: err.name,
      });
      return handleUploadErrors(err, req, res, next);
    }
    const file = getFirstFileFromFields(req.files, ['image', 'images', 'images[]']);
    if (file) {
      req.file = file;
    }
    next();
  });
};

// Wrapper for multiple images upload with error handling
const uploadMultipleImagesWithErrorHandling = (req, res, next) => {
  uploadMultipleImages(req, res, (err) => {
    if (err) {
      console.error('❌ Multer Error Details:', {
        code: err.code,
        message: err.message,
        name: err.name,
      });
      return handleUploadErrors(err, req, res, next);
    }
    req.files = collectFilesFromFields(req.files, ['images', 'images[]']);
    next();
  });
};

// Wrapper for single video upload with error handling
const uploadSingleVideoWithErrorHandling = (req, res, next) => {
  uploadSingleVideo(req, res, (err) => {
    if (err) {
      console.error('❌ Multer Error Details:', {
        code: err.code,
        message: err.message,
        name: err.name,
      });
      return handleUploadErrors(err, req, res, next);
    }
    const file = getFirstFileFromFields(req.files, ['video', 'videos']);
    if (file) {
      req.file = file;
    }
    next();
  });
};

module.exports = {
  uploadListingMedia,
  uploadListingMediaWithErrorHandling,
  handleUploadErrors,
  uploadSingleImage,
  uploadMultipleImages,
  uploadSingleVideo,
  uploadSingleImageWithErrorHandling,
  uploadMultipleImagesWithErrorHandling,
  uploadSingleVideoWithErrorHandling,
};

