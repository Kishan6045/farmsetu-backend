const path = require('path');

// Common image upload handler
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    // Return only the filename
    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename: req.file.filename,
      },
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message,
    });
  }
};

// Multiple images upload handler
const uploadImages = async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided',
      });
    }

    // Return only the filenames
    const filenames = req.files.map((file) => file.filename);

    return res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        filenames,
      },
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message,
    });
  }
};

// Common video upload handler
const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided',
      });
    }

    // Return only the filename
    return res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        filename: req.file.filename,
      },
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload video',
      error: error.message,
    });
  }
};

module.exports = {
  uploadImage,
  uploadImages,
  uploadVideo,
};
