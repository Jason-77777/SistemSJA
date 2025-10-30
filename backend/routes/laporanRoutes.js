const express = require('express');
const router = express.Router();
const { unduhLaporan } = require('../controllers/laporanController');
const auth = require('../middleware/auth');

router.get('/unduh', auth, unduhLaporan);

module.exports = router;