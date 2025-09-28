// File: data/instrukturSeeder.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Instruktur = require('../models/Instruktur'); // Sesuaikan path jika perlu

// Load env vars
dotenv.config({ path: './.env' }); // Sesuaikan path ke file .env Anda

// Data Instruktur Awal
const instrukturs = [
  {
    nama: 'Agus',
    jenisKelamin: 'Pria',
    usia: 45,
    noTelepon: '085361353104',
    nopolKendaraan: 'BK 1609 AEM',
    tipeMobil: 'Manual',
  },
  {
    nama: 'Edi Sutrisno',
    jenisKelamin: 'Pria',
    usia: 50,
    noTelepon: '081362205195',
    nopolKendaraan: 'BK 1980 ADE',
    tipeMobil: 'Manual',
  },
  {
    nama: 'Rudi Andika',
    jenisKelamin: 'Pria',
    usia: 32,
    noTelepon: '081370767666',
    nopolKendaraan: 'BK 1466 AS',
    tipeMobil: 'Manual',
  },
  {
    nama: 'Adi Nofrianto',
    jenisKelamin: 'Pria',
    usia: 50,
    noTelepon: '0852276035859',
    nopolKendaraan: 'BK 1684 GV',
    tipeMobil: 'Matic',
  },
  {
    nama: 'Indra',
    jenisKelamin: 'Pria',
    usia: 50,
    noTelepon: '081376459527',
    nopolKendaraan: 'BK 1504 UH',
    tipeMobil: 'Matic',
  },
];

// Fungsi untuk menghubungkan ke DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Terkoneksi ke MongoDB...');
  } catch (err) {
    console.error(`Gagal terhubung ke MongoDB: ${err.message}`);
    process.exit(1);
  }
};

// Fungsi untuk import data
const importData = async () => {
  try {
    await Instruktur.deleteMany(); // Hapus data lama
    await Instruktur.insertMany(instrukturs); // Masukkan data baru
    console.log('✅ Data Instruktur berhasil di-import!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error saat import data: ${error}`);
    process.exit(1);
  }
};

// Fungsi untuk destroy data
const destroyData = async () => {
  try {
    await Instruktur.deleteMany();
    console.log('✅ Data Instruktur berhasil di-destroy!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error saat destroy data: ${error}`);
    process.exit(1);
  }
};

// Logika untuk menjalankan fungsi via command line
const run = async () => {
    await connectDB();
    if (process.argv[2] === '-d') {
        await destroyData();
    } else {
        await importData();
    }
};

run();