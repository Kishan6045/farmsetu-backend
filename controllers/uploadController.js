const uploadMedia = (req, res) => {
  const uploadRoot = req.uploadRoot;
  const files = Array.isArray(req.files) ? req.files : [];

  if (!uploadRoot) {
    return res.status(400).json({
      success: false,
      message: 'Upload root is required.',
    });
  }

  if (!files.length) {
    return res.status(400).json({
      success: false,
      message: 'No files were uploaded.',
    });
  }

  const fileNames = files.map((file) => file.filename);
  const filePaths = files.map((file) => `/uploads/${uploadRoot}/${file.filename}`);

  return res.status(201).json({
    success: true,
    message: 'Files uploaded successfully',
    data: {
      root: uploadRoot,
      files: fileNames,
      paths: filePaths,
    },
  });
};

module.exports = {
  uploadMedia,
};
