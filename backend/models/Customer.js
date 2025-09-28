  const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  namaLengkap: {
    type: String,
    required: true,
  },
  usia: {
    type: Number,
    required: true,
  },
  jenisKelamin: {
    type: String,
    enum: ['Pria', 'Wanita'],
    required: true,
  },
  noTelepon: {
    type: String,
    required: true,
  },
  alamat: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'direktur'],
    default: 'customer',
  },
}, {
  timestamps: true
});

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;