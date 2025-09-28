// File: routes/daftarRoutes.js

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
  //PENAMBAHAN INI
  unduhInvoice
} = require('../controllers/daftarController');
const auth = require('../middleware/auth');

// --- RUTE ADMIN (YANG SPESIFIK) DITARUH DI ATAS ---
router.get('/admin/verifikasi', auth, getPendingVerifications); 
router.get('/all-for-admin', auth, getAllPendaftaranForAdmin); // INI DIA PEMINDAHANNYA
router.patch('/admin/verifikasi/:pendaftaranId', auth, verifyPayment);
//PENAMBAHAN INI
router.get('/admin/invoice/:pendaftaranId', auth, unduhInvoice); 


// --- RUTE CUSTOMER (BOLEH DI BAWAH KARENA PATH-NYA UNIK) ---
router.get('/mine', auth, getMyPendaftaran); 
router.post('/', auth, createPendaftaran);


// --- RUTE DENGAN PARAMETER UMUM (/:id) DITARUH PALING BAWAH ---
router.get('/:id', auth, getPendaftaranById);
router.patch('/:id/upload-bukti', auth, updateBuktiBayar);


module.exports = router;