const express = require('express');
const router = express.Router();
const { uploadBuktiPembayaran } = require('../controllers/uploadController');
const { upload } = require('../config/Cloudinary'); 
const auth = require('../middleware/auth');

router.post('/', auth, upload.single('buktiBayar'), uploadBuktiPembayaran);

module.exports = router;