// File: /data/adminSeeder.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Customer = require('../models/Customer'); // Sesuaikan path jika perlu

// Data Admin yang akan dibuat
const adminData = {
  username: 'admin',
  email: 'admin@sja.com',
  password: 'adminpassword', // Ganti dengan password yang aman
  namaLengkap: 'Nissa',
  usia: 30,
  jenisKelamin: 'Wanita',
  noTelepon: '0895383093463',
  alamat: 'Kantor Pusat',
  role: 'admin',
};

const importData = async () => {
  try {
    // 1. Hubungkan ke MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Terkoneksi ke MongoDB untuk seeding...');

    // 2. Cek apakah admin sudah ada
    const adminExists = await Customer.findOne({ email: adminData.email });

    if (adminExists) {
      console.log('Akun admin sudah ada di database.');
    } else {
      // 3. Jika belum ada, buat admin baru
      
      // Enkripsi password sebelum disimpan
      const salt = await bcrypt.genSalt(10);
      adminData.password = await bcrypt.hash(adminData.password, salt);
      
      await Customer.create(adminData);
      console.log('✅ Akun admin berhasil dibuat!');
    }

    process.exit();

  } catch (error) {
    console.error(`Error saat seeding: ${error.message}`);
    process.exit(1);
  }
};

importData();