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
    const fieldName = file.fieldname || '';
    
    // Check if field name matches image patterns (flexible for mobile apps)
    const isImageField = 
      fieldName === 'image' ||
      fieldName === 'images' ||
      fieldName === 'images[]' ||
      fieldName.startsWith('images[') ||
      fieldName.startsWith('image_') ||
      /^images?\[/.test(fieldName) ||
      file.mimetype.startsWith('image/'); // Fallback: check mimetype
    
    // Check if field name matches video patterns
    const isVideoField = 
      fieldName === 'video' ||
      fieldName === 'videos' ||
      fieldName.startsWith('video[') ||
      fieldName.startsWith('video_') ||
      file.mimetype.startsWith('video/'); // Fallback: check mimetype
    
    if (isImageField) {
      uploadPath = path.join(__dirname, '..', 'uploads', 'images');
    } else if (isVideoField) {
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
// More flexible to handle various mobile app field name patterns
const fileFilter = (req, file, cb) => {
  const fieldName = file.fieldname || '';
  
  // Check if field name matches image patterns (flexible for mobile apps)
  // Supports: 'image', 'images', 'images[]', 'images[0]', 'image_0', etc.
  const isImageField = 
    fieldName === 'image' ||
    fieldName === 'images' ||
    fieldName === 'images[]' ||
    fieldName.startsWith('images[') ||
    fieldName.startsWith('image_') ||
    /^images?\[/.test(fieldName);
  
  // Check if field name matches video patterns
  const isVideoField = 
    fieldName === 'video' ||
    fieldName === 'videos' ||
    fieldName.startsWith('video[') ||
    fieldName.startsWith('video_');
  
  // Allow images for image fields
  if (isImageField) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error(`Only image files are allowed for field "${fieldName}"`), false);
    }
    return cb(null, true);
  }

  // Allow videos for video fields
  if (isVideoField) {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error(`Only video files are allowed for field "${fieldName}"`), false);
    }
    return cb(null, true);
  }

  // For unknown fields, try to detect by mimetype as fallback
  // This helps with mobile apps that might use unexpected field names
  if (file.mimetype.startsWith('image/')) {
    console.log(`⚠️  Unknown image field "${fieldName}" - accepting based on mimetype`);
    return cb(null, true);
  }
  
  if (file.mimetype.startsWith('video/')) {
    console.log(`⚠️  Unknown video field "${fieldName}" - accepting based on mimetype`);
    return cb(null, true);
  }

  // Default: reject unknown field types
  return cb(new Error(`Invalid file field "${fieldName}". Expected image or video field.`), false);
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
// Accept various field name patterns for mobile app compatibility
const uploadListingMedia = upload.any(); // Use .any() to accept any field name, then filter in fileFilter

// Wrapper to handle multer errors properly
const uploadListingMediaWithErrorHandling = (req, res, next) => {
  // Ensure req.body exists before multer processes
  if (!req.body) {
    req.body = {};
  }

  // Log all incoming fields for debugging
  console.log('📋 Incoming form fields (before multer):', Object.keys(req.body || {}));
  console.log('📋 Content-Type:', req.headers['content-type']);

  uploadListingMedia(req, res, (err) => {
    if (err) {
      // Log detailed error information
      console.error('❌ Multer Error Details:', {
        code: err.code,
        field: err.field,
        message: err.message,
        name: err.name,
        stack: err.stack,
      });
      return handleUploadErrors(err, req, res, next);
    }

    // Ensure req.body exists after multer (multer should populate it)
    if (!req.body) {
      req.body = {};
    }

    // Log after multer processing
    console.log('✅ Multer processing successful');
    console.log('📋 Form fields (after multer):', Object.keys(req.body || {}));
    if (req.files && req.files.length > 0) {
      console.log(`📁 Total files uploaded: ${req.files.length}`);
      
      // Separate images and videos
      const imageFiles = req.files.filter(file => file.mimetype.startsWith('image/'));
      const videoFiles = req.files.filter(file => file.mimetype.startsWith('video/'));
      
      // Validate limits: max 3 images, max 1 video
      if (imageFiles.length > 3) {
        return res.status(400).json({
          success: false,
          message: `Too many images. Maximum 3 images allowed, but ${imageFiles.length} were provided.`,
        });
      }
      
      if (videoFiles.length > 1) {
        return res.status(400).json({
          success: false,
          message: `Too many videos. Maximum 1 video allowed, but ${videoFiles.length} were provided.`,
        });
      }
      
      req.files.forEach((file, index) => {
        console.log(`  - File ${index + 1}: field="${file.fieldname}", name="${file.originalname}", type="${file.mimetype}"`);
      });
      
      // Organize files by field name for easier access in controllers
      const filesByField = {};
      req.files.forEach(file => {
        const fieldName = file.fieldname;
        if (!filesByField[fieldName]) {
          filesByField[fieldName] = [];
        }
        filesByField[fieldName].push(file);
      });
      req.filesByField = filesByField;
      
      console.log(`📊 Summary: ${imageFiles.length} image(s), ${videoFiles.length} video(s)`);
    } else {
      console.log('📁 No files uploaded');
    }

    next();
  });
};

// Error handling wrapper for multer
const handleUploadErrors = (err, req, res, next) => {
  // Ensure response hasn't been sent
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 3 images and 1 video allowed.',
        code: 'LIMIT_FILE_COUNT',
      });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum file size is 20MB.',
        code: 'LIMIT_FILE_SIZE',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      // Log the field name if available
      const fieldName = err.field || 'unknown';
      console.error('❌ Unexpected file field detected:', fieldName);
      console.error('💡 Tip: Check Postman - this field is set to "File" type but should be "Text" type');
      return res.status(400).json({
        success: false,
        message: `Unexpected file field "${fieldName}". Only "images" (max 3) and "video" (max 1) fields are allowed.`,
        code: 'LIMIT_UNEXPECTED_FILE',
        field: fieldName,
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
      code: err.code,
    });
  }

  // Handle other errors (file filter errors, etc.)
  if (err) {
    console.error('❌ Upload Error:', err.message);
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error',
      error: err.name || 'UploadError',
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