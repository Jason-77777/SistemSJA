const express = require('express');
const router = express.Router();
const { unduhLaporan } = require('../controllers/laporanController');
const auth = require('../middleware/auth');

// Rute untuk mengunduh laporan, hanya bisa diakses oleh user yang sudah login (admin/direktur)
router.get('/unduh', auth, unduhLaporan);

module.exports = router;