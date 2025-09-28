const mongoose = require('mongoose');

const jadwalSchema = new mongoose.Schema({
  tanggal: {
    type: Date,
    required: true,
  },
  jam: {
    type: String,
    required: true,
  },
  jenisKendaraan: {
    type: String,
    enum: ['Manual', 'Matic'],
    required: true,
  },
  instrukturId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instruktur',
    required: true,
  },
  status: {
    type: String,
    enum: ['Tersedia', 'Pending', 'Penuh'],
    default: 'Tersedia',
  },
});

jadwalSchema.index({ tanggal: 1, jam: 1, instrukturId: 1 }, { unique: true });

const Jadwal = mongoose.model('Jadwal', jadwalSchema);
module.exports = Jadwal;