// File: /models/PaketBelajar.js

const mongoose = require('mongoose');

const paketBelajarSchema = new mongoose.Schema({
  jenisKendaraan: {
    type: String,
    enum: ['Manual', 'Matic'],
    required: [true, 'Jenis kendaraan wajib diisi'],
  },
  jenisHari: {
    type: String,
    enum: ['Senin-Sabtu'],
    required: [true, 'Jenis hari wajib diisi'],
  },
  paketKursus: {
    type: String,
    // DIUPDATE: Menambahkan semua variasi paket
    enum: ['Reguler', 'Complete', 'Duo Reguler', 'Duo Complete'], 
    required: [true, 'Paket kursus wajib diisi'],
  },
  jumlahSiswaBelajar: {
    type: String,
    // DIUPDATE: Menambahkan '2 Siswa' sebagai pilihan valid
    enum: ['1 Siswa', '2 Siswa'],
    required: [true, 'Jumlah siswa wajib diisi'],
  },
  durasiKursus: {
    type: String, 
    required: [true, 'Durasi kursus wajib diisi'],
  },
  harga: {
    type: String,
    required: [true, 'Harga wajib diisi'],
  },
}, { timestamps: true });

const PaketBelajar = mongoose.model('PaketBelajar', paketBelajarSchema);
module.exports = PaketBelajar;