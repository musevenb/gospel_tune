const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');

let gfs, gridfsBucket;

// Initialize GridFS
const initGridFS = () => {
  const conn = mongoose.connection;
  
  conn.once('open', () => {
    // Initialize GridFS bucket
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: 'audioFiles'
    });
    
    console.log('✅ GridFS initialized for audio storage');
  });
};

// Create storage engine
const createStorage = () => {
  const storage = new GridFsStorage({
    url: process.env.MONGO_URI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'audioFiles',
            metadata: {
              originalName: file.originalname,
              userId: req.user?._id?.toString() || 'unknown',
              songId: req.body.songId || null,
              uploadDate: new Date(),
              fileSize: file.size,
              mimeType: file.mimetype
            }
          };
          resolve(fileInfo);
        });
      });
    }
  });
  
  return storage;
};

// File filter - only allow audio files
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'audio/mpeg',      // mp3
    'audio/mp3',       // mp3
    'audio/wav',       // wav
    'audio/flac',      // flac
    'audio/ogg',       // ogg
    'audio/m4a',       // m4a
    'audio/aac',       // aac
    'audio/x-m4a',     // m4a
    'audio/mp4'        // mp4 audio
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio files are allowed.'), false);
  }
};

// Configure multer upload
let upload = null;

const getUpload = () => {
  if (!upload) {
    const storage = createStorage();
    upload = multer({
      storage: storage,
      fileFilter: fileFilter,
      limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
      }
    });
  }
  return upload;
};

// Get audio file by filename
const getAudioFile = async (filename, res) => {
  try {
    if (!gridfsBucket) {
      const conn = mongoose.connection;
      gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'audioFiles'
      });
    }
    
    const files = await mongoose.connection.db.collection('audioFiles.files').find({ filename }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    const readStream = gridfsBucket.openDownloadStreamByName(filename);
    readStream.pipe(res);
  } catch (error) {
    console.error('Error getting file:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete audio file
const deleteAudioFile = async (filename) => {
  try {
    if (!gridfsBucket) {
      const conn = mongoose.connection;
      gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'audioFiles'
      });
    }
    
    const files = await mongoose.connection.db.collection('audioFiles.files').find({ filename }).toArray();
    
    if (files && files.length > 0) {
      await gridfsBucket.delete(files[0]._id);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Get audio file info
const getAudioFileInfo = async (filename) => {
  try {
    const files = await mongoose.connection.db.collection('audioFiles.files').find({ filename }).toArray();
    if (files && files.length > 0) {
      return files[0];
    }
    return null;
  } catch (error) {
    console.error('Error getting file info:', error);
    return null;
  }
};

module.exports = {
  initGridFS,
  getUpload,
  upload: (fields) => getUpload().single('audio'),
  getAudioFile,
  deleteAudioFile,
  getAudioFileInfo
};