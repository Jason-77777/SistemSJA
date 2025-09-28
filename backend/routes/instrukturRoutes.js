// File: /routes/instrukturRoutes.js

const express = require('express');
const router = express.Router();
const {
  createInstruktur,
  getAllInstruktur,
  getInstrukturById,
  updateInstruktur,
  deleteInstruktur,
} = require('../controllers/instrukturController');

// Impor middleware otentikasi
const auth = require('../middleware/auth'); 
// Nanti kita bisa tambahkan middleware khusus admin jika perlu

// Rute untuk mendapatkan semua instruktur dan membuat instruktur baru
router.route('/')
  .get(getAllInstruktur) // Siapa saja bisa lihat daftar instruktur
  .post(auth, createInstruktur); // Hanya user terotentikasi (admin) yang bisa buat

// Rute untuk mendapatkan, mengupdate, dan menghapus instruktur berdasarkan ID
router.route('/:id')
  .get(getInstrukturById)
  .patch(auth, updateInstruktur) // Seharusnya hanya admin
  .delete(auth, deleteInstruktur); // Seharusnya hanya admin

module.exports = router;