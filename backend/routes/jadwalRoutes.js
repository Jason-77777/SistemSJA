const express = require('express');
const router = express.Router();
const {
  getAvailableSchedules,
  checkBookingAvailability,
  generateBulkSchedules, // DITAMBAHKAN
  createJadwal,
  getAllJadwal,
  getJadwalById,
  updateJadwal,
  deleteJadwal
} = require('../controllers/jadwalController');
const auth = require('../middleware/auth');

// Rute untuk customer mencari jadwal
router.get('/available', getAvailableSchedules);
// DITAMBAHKAN: Rute untuk mengecek ketersediaan booking paket
router.post('/check-booking', checkBookingAvailability);
router.post('/generate-bulk', auth, generateBulkSchedules);

// Rute untuk Admin (CRUD)
router.route('/')
  .get(getAllJadwal)
  .post(auth, createJadwal);

// Rute dinamis (/:id)
router.route('/:id')
  .get(getJadwalById)
  .patch(auth, updateJadwal)
  .delete(auth, deleteJadwal);


module.exports = router;