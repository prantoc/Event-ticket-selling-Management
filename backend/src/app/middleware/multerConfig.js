const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Base folder where files are physically stored
const BASE_DIR = path.join(__dirname, "../local/store");

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subfolder = file.mimetype.startsWith("image") ? "images" : "videos";
    const uploadDir = path.join(BASE_DIR, subfolder);

    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const fileName = `${file.fieldname}-${uniqueSuffix}${ext}`;

    // Set req._relativePath so we can reassign it below
    const subfolder = file.mimetype.startsWith("image") ? "images" : "videos";
    req._relativePath = `store/${subfolder}/${fileName}`;

    cb(null, fileName);
  },
});

// Middleware to override req.file.path with relative path
const setRelativePath = (req, res, next) => {
  const processFile = (file) => {
    const subfolder = file.mimetype.startsWith("image") ? "images" : "videos";
    file.path = `store/${subfolder}/${file.filename}`;
  };

  if (req.file) {
    processFile(req.file);
  }

  if (req.files && Array.isArray(req.files)) {
    req.files.forEach(processFile);
  }

  next();
};

const uploadMedia = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

module.exports = {
  uploadMedia,
  setRelativePath,
};
