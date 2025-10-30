const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Customer = require('../models/Customer');

const usersToSeed = [
  {
    username: 'admin',
    email: 'sjadrivinglesson@gmail.com',
    password: 'sja123', 
    namaLengkap: 'Nissa',
    usia: 30,
    jenisKelamin: 'Wanita',
    noTelepon: '0895383093463',
    alamat: 'Kantor Pusat',
    role: 'admin',
  },
  {
    username: 'DM123',
    email: 'dartamartok88@gmail.com',
    password: '182838', 
    namaLengkap: 'Darta',
    usia: 38,
    jenisKelamin: 'Pria',
    noTelepon: '085371154326',
    alamat: 'Kantor Pusat',
    role: 'direktur',
  }
];


const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Terkoneksi ke MongoDB untuk seeding...');

    for (const userData of usersToSeed) {
      const userExists = await Customer.findOne({ email: userData.email });

      if (userExists) {
        console.log(`Akun untuk ${userData.email} sudah ada.`);
      } else {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
        
        await Customer.create(userData);
        console.log(`✅ Akun untuk ${userData.email} berhasil dibuat!`);
      }
    }

    process.exit();

  } catch (error) {
    console.error(`Error saat seeding: ${error.message}`);
    process.exit(1);
  }
};

importData();