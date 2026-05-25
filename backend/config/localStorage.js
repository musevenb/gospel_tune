const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'audio-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'audio/mpeg', 'audio/mp3', 'audio/wav', 
    'audio/flac', 'audio/ogg', 'audio/m4a', 'audio/aac'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio files are allowed (MP3, WAV, FLAC, OGG, M4A, AAC).'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

// Export the upload middleware functions
const uploadSingle = upload.single('audio');
const uploadArray = upload.array('audio', 5);

// Get file URL
const getFileUrl = (filename, req) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/api/audio/file/${filename}`;
};

// Delete file
const deleteFile = (filename) => {
  const filePath = path.join(uploadDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
};

// Get file path
const getFilePath = (filename) => {
  return path.join(uploadDir, filename);
};

module.exports = {
  upload,
  uploadSingle,
  uploadArray,
  getFileUrl,
  deleteFile,
  getFilePath
};