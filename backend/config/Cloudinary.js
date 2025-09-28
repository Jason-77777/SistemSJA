const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Konfigurasi Cloudinary dengan kredensial dari file .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Konfigurasi Multer untuk menyimpan file sementara di memori
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };