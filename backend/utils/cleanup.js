const Daftar = require('../models/Daftar');
const Jadwal = require('../models/Jadwal');

const cleanupExpired = async () => {
  try {
    const expired = await Daftar.find({
      statusPembayaran: 'Belum Bayar',
      paymentDueDate: { $lt: new Date() } 
    });

    if (expired.length > 0) {
      console.log(`Ditemukan ${expired.length} pendaftaran kedaluwarsa. Membersihkan...`);
      for (const p of expired) {
        await Jadwal.updateMany({ _id: { $in: p.jadwalSesi } }, { $set: { status: 'Tersedia' } });
        await Daftar.findByIdAndDelete(p._id);
      }
    }
  } catch (error) {
    console.error("Gagal menjalankan cleanup:", error);
  }
};

module.exports = cleanupExpired;