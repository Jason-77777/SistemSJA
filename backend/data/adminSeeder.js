// File: /data/adminSeeder.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Customer = require('../models/Customer'); // Sesuaikan path jika perlu

// --- KITA BUAT SEBUAH ARRAY UNTUK MENAMPUNG SEMUA AKUN ---
const usersToSeed = [
  {
    username: 'admin',
    email: 'sjadrivinglesson@gmail.com',
    password: 'sja123', // Ganti dengan password yang aman
    namaLengkap: 'Nissa',
    usia: 30,
    jenisKelamin: 'Wanita',
    noTelepon: '0895383093463',
    alamat: 'Kantor Pusat',
    role: 'admin',
  },
  // --- TAMBAHKAN DATA DIREKTUR DI SINI ---
  {
    username: 'DM123',
    email: 'direktur@sja.com',
    password: '182838', // Ganti dengan password yang aman
    namaLengkap: 'Darta',
    usia: 38,
    jenisKelamin: 'Pria',
    noTelepon: '085371154326',
    alamat: 'Kantor Pusat',
    role: 'direktur',
  }
];
// ------------------------------------------

const importData = async () => {
  try {
    // 1. Hubungkan ke MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Terkoneksi ke MongoDB untuk seeding...');

    // --- LOGIKA BARU MENGGUNAKAN LOOPING ---
    for (const userData of usersToSeed) {
      // 2. Cek apakah user (admin/direktur) sudah ada
      const userExists = await Customer.findOne({ email: userData.email });

      if (userExists) {
        console.log(`Akun untuk ${userData.email} sudah ada.`);
      } else {
        // 3. Jika belum ada, buat user baru
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
        
        await Customer.create(userData);
        console.log(`✅ Akun untuk ${userData.email} berhasil dibuat!`);
      }
    }
    // ----------------------------------------

    process.exit();

  } catch (error) {
    console.error(`Error saat seeding: ${error.message}`);
    process.exit(1);
  }
};

importData();