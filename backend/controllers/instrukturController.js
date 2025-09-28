// File: /controllers/instrukturController.js

const Instruktur = require('../models/Instruktur');

// @desc    Membuat instruktur baru
// @route   POST /api/instruktur
// @access  Private/Admin
exports.createInstruktur = async (req, res) => {
  try {
    const instruktur = new Instruktur(req.body);
    const createdInstruktur = await instruktur.save();
    res.status(201).json(createdInstruktur);
  } catch (err) {
    res.status(400).json({ message: 'Gagal membuat instruktur', error: err.message });
  }
};

// @desc    Mendapatkan semua instruktur
// @route   GET /api/instruktur
// @access  Public (atau Private/Admin sesuai kebutuhan)
exports.getAllInstruktur = async (req, res) => {
  try {
    const instruktur = await Instruktur.find({});
    res.json(instruktur);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Mendapatkan instruktur berdasarkan ID
// @route   GET /api/instruktur/:id
// @access  Public (atau Private/Admin)
exports.getInstrukturById = async (req, res) => {
  try {
    const instruktur = await Instruktur.findById(req.params.id);
    if (!instruktur) {
      return res.status(404).json({ message: 'Instruktur tidak ditemukan' });
    }
    res.json(instruktur);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Memperbarui data instruktur
// @route   PATCH /api/instruktur/:id
// @access  Private/Admin
exports.updateInstruktur = async (req, res) => {
  try {
    const instruktur = await Instruktur.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Mengembalikan dokumen yang sudah diupdate
      runValidators: true, // Menjalankan validator dari schema
    });
    if (!instruktur) {
      return res.status(404).json({ message: 'Instruktur tidak ditemukan' });
    }
    res.json(instruktur);
  } catch (err) {
    res.status(400).json({ message: 'Gagal memperbarui instruktur', error: err.message });
  }
};

// @desc    Menghapus instruktur
// @route   DELETE /api/instruktur/:id
// @access  Private/Admin
exports.deleteInstruktur = async (req, res) => {
  try {
    const instruktur = await Instruktur.findByIdAndDelete(req.params.id);
    if (!instruktur) {
      return res.status(404).json({ message: 'Instruktur tidak ditemukan' });
    }
    res.json({ message: 'Instruktur berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};