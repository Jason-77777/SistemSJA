// File: /data/paketSeeder.js

const mongoose = require('mongoose');
require('dotenv').config();

const paketData = require('./paketData.js');
const PaketBelajar = require('../models/PaketBelajar.js');

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Hapus data lama agar tidak duplikat
    await PaketBelajar.deleteMany();

    // Masukkan data baru dari paketData.js
    await PaketBelajar.insertMany(paketData);

    console.log('✅ Semua data paket belajar berhasil di-import!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Panggil fungsi untuk import data
importData();