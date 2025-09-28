const mongoose = require('mongoose');

const daftarSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  paketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaketBelajar',
    required: true,
  },
  // --- [PERUBAHAN]: Ganti jadwalId dengan jadwalSesi ---
  // jadwalId kita hapus karena hanya bisa menyimpan satu ID.
  // jadwalSesi bisa menyimpan BANYAK ID, membuatnya lebih fleksibel.
  jadwalSesi: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Jadwal',
  }],
  // ----------------------------------------------------
  instrukturId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instruktur',
    required: true,
  },
  tanggalMulai: {
    type: Date,
    required: true,
  },
  jam: {
    type: String,
    required: true,
  },
  statusPembayaran: {
    type: String,
    enum: ['Belum Bayar', 'Menunggu Verifikasi', 'Lunas', 'Ditolak'],
    default: 'Belum Bayar',
  },
  buktiBayarURL: {
    type: String,
  },
  nomorRekeningPengirim: {
    type: String,
  },
  jumlahPenolakan: {
    type: Number,
    default: 0,
  },
  //PENAMBAHAN DISINI
  paymentDueDate: {
    type: Date,
  },
}, { timestamps: true });

const Daftar = mongoose.model('Daftar', daftarSchema);
module.exports = Daftar;