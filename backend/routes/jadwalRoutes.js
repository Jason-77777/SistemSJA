const express = require('express');
const router = express.Router();
const {
  getAvailableSchedules,
  checkBookingAvailability,
  generateBulkSchedules,
  createJadwal,
  getAllJadwal,
  getJadwalById,
  updateJadwal,
  deleteJadwal
} = require('../controllers/jadwalController');
const auth = require('../middleware/auth');

router.get('/available', getAvailableSchedules);
router.post('/check-booking', checkBookingAvailability);
router.post('/generate-bulk', auth, generateBulkSchedules);

router.route('/')
  .get(getAllJadwal)
  .post(auth, createJadwal);

router.route('/:id')
  .get(getJadwalById)
  .patch(auth, updateJadwal)
  .delete(auth, deleteJadwal);


module.exports = router;