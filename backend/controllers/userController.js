const Customer = require('../models/Customer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Tambahkan ini

// Fungsi untuk mendaftarkan pengguna baru
exports.registerUser = async (req, res) => {
  try {
    const { username, password, email, namaLengkap, usia, jenisKelamin, noTelepon, alamat } = req.body;

    // Cek apakah user dengan email yang sama sudah ada
    let customer = await Customer.findOne({ email });
    if (customer) {
      return res.status(400).json({ msg: 'Email sudah terdaftar' });
    }

    // Buat instance customer baru
    customer = new Customer({
      username,
      password,
      email,
      namaLengkap,
      usia,
      jenisKelamin,
      noTelepon,
      alamat,
    });

    // Enkripsi password
    const salt = await bcrypt.genSalt(10);
    customer.password = await bcrypt.hash(password, salt);

    // Simpan customer ke database
    await customer.save();

    res.status(201).json({ msg: 'Registrasi berhasil' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Fungsi untuk login pengguna
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    let customer = await Customer.findOne({ username });

    if (!customer) {
      return res.status(400).json({ msg: 'Username atau password salah' });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Username atau password salah' });
    }

    // Login berhasil, buat JWT
    const payload = {
      user: {
        id: customer.id,
        role: customer.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, role: customer.role });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Fungsi untuk mendapatkan semua pengguna (GET)
exports.getUsers = async (req, res) => {
  try {
    const customers = await Customer.find().select('-password');
    res.status(200).json(customers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Fungsi untuk menghapus pengguna berdasarkan ID (DELETE)
exports.deleteUser = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ msg: 'Pengguna tidak ditemukan' });
    }

    await customer.deleteOne();
    res.status(200).json({ msg: 'Pengguna berhasil dihapus' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Fungsi untuk memperbarui pengguna berdasarkan ID (UPDATE)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    
    const customer = await Customer.findByIdAndUpdate(id, updatedData, { new: true });

    if (!customer) {
      return res.status(404).json({ msg: 'Pengguna tidak ditemukan' });
    }

    res.status(200).json({ msg: 'Pengguna berhasil diperbarui', customer });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};