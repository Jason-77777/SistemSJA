const mongoose = require('mongoose');

const instrukturSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: [true, 'Nama instruktur wajib diisi'],
  },
  jenisKelamin: {
    type: String,
    enum: ['Pria', 'Wanita'],
    required: [true, 'Jenis kelamin wajib diisi'],
  },
  usia: {
    type: Number,
    required: [true, 'Usia wajib diisi'],
  },
  noTelepon: {
    type: String,
    required: [true, 'Nomor telepon wajib diisi'],
  },
  nopolKendaraan: {
    type: String,
    required: [true, 'Nomor polisi kendaraan wajib diisi'],
    unique: true, 
  },
  tipeMobil: {
    type: String,
    enum: ['Manual', 'Matic'],
    required: [true, 'Tipe mobil yang diajar wajib diisi'],
  }
}, { timestamps: true });

const Instruktur = mongoose.model('Instruktur', instrukturSchema);
module.exports = Instruktur;