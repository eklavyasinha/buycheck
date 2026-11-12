import multer from 'multer';

// Use memory storage for fast, safe buffer analysis with Gemini Vision without persisting raw images to disk indefinitely
const storage = multer.memoryStorage();

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE_BYTES || '10485760', 10), // 10MB default
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Please upload a JPG, PNG, or WEBP image.'));
    }
  },
});
