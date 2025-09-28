// File: utils/cleanup.js

const Daftar = require('../models/Daftar');
const Jadwal = require('../models/Jadwal');

const cleanupExpired = async () => {
  try {
    // Cari pendaftaran yang statusnya 'Belum Bayar' dan sudah lewat batas waktu
    const expired = await Daftar.find({
      statusPembayaran: 'Belum Bayar',
      paymentDueDate: { $lt: new Date() } 
    });

    if (expired.length > 0) {
      console.log(`Ditemukan ${expired.length} pendaftaran kedaluwarsa. Membersihkan...`);
      for (const p of expired) {
        // Kembalikan slot jadwal menjadi 'Tersedia'
        await Jadwal.updateMany({ _id: { $in: p.jadwalSesi } }, { $set: { status: 'Tersedia' } });
        // Hapus pendaftaran yang kedaluwarsa
        await Daftar.findByIdAndDelete(p._id);
      }
    }
  } catch (error) {
    console.error("Gagal menjalankan cleanup:", error);
  }
};

module.exports = cleanupExpired;