const express = require('express');
const router = express.Router();
const { 
  createPendaftaran, 
  getMyPendaftaran, 
  getPendaftaranById, 
  updateBuktiBayar,
  getPendingVerifications,
  verifyPayment,
  getAllPendaftaranForAdmin,
  unduhInvoice
} = require('../controllers/daftarController');
const auth = require('../middleware/auth');

router.get('/admin/verifikasi', auth, getPendingVerifications); 
router.get('/all-for-admin', auth, getAllPendaftaranForAdmin); 
router.patch('/admin/verifikasi/:pendaftaranId', auth, verifyPayment);
router.get('/admin/invoice/:pendaftaranId', auth, unduhInvoice); 

router.get('/mine', auth, getMyPendaftaran); 
router.post('/', auth, createPendaftaran);

router.get('/:id', auth, getPendaftaranById);
router.patch('/:id/upload-bukti', auth, updateBuktiBayar);


module.exports = router;