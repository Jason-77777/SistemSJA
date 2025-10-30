const PaketBelajar = require('../models/PaketBelajar');

exports.createPaketBelajar = async (req, res) => {
  try {
    const paket = new PaketBelajar(req.body);
    await paket.save();
    res.status(201).json(paket);
  } catch (err) {
    res.status(400).json({ message: 'Gagal membuat paket', error: err.message });
  }
};

exports.getAllPaketBelajar = async (req, res) => {
  try {
    const paket = await PaketBelajar.find({});
    res.json(paket);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.updatePaketBelajar = async (req, res) => {
  try {
    const paket = await PaketBelajar.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!paket) {
      return res.status(404).json({ message: 'Paket tidak ditemukan' });
    }
    res.json(paket);
  } catch (err) {
    res.status(400).json({ message: 'Gagal memperbarui paket', error: err.message });
  }
};

exports.deletePaketBelajar = async (req, res) => {
  try {
    const paket = await PaketBelajar.findByIdAndDelete(req.params.id);
    if (!paket) {
      return res.status(404).json({ message: 'Paket tidak ditemukan' });
    }
    res.json({ message: 'Paket berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};