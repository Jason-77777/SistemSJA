const express = require('express');
const router = express.Router();
const { uploadBuktiPembayaran } = require('../controllers/uploadController');
const { upload } = require('../config/Cloudinary'); // Impor middleware multer
const auth = require('../middleware/auth');

// Rute untuk upload bukti pembayaran
// Middleware 'upload.single('buktiBayar')' akan menangani file
router.post('/', auth, upload.single('buktiBayar'), uploadBuktiPembayaran);

module.exports = router;