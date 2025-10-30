const Instruktur = require('../models/Instruktur');

exports.createInstruktur = async (req, res) => {
  try {
    const instruktur = new Instruktur(req.body);
    const createdInstruktur = await instruktur.save();
    res.status(201).json(createdInstruktur);
  } catch (err) {
    res.status(400).json({ message: 'Gagal membuat instruktur', error: err.message });
  }
};

exports.getAllInstruktur = async (req, res) => {
  try {
    const instruktur = await Instruktur.find({});
    res.json(instruktur);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

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

exports.updateInstruktur = async (req, res) => {
  try {
    const instruktur = await Instruktur.findByIdAndUpdate(req.params.id, req.body, {
      new: true, 
      runValidators: true, 
    });
    if (!instruktur) {
      return res.status(404).json({ message: 'Instruktur tidak ditemukan' });
    }
    res.json(instruktur);
  } catch (err) {
    res.status(400).json({ message: 'Gagal memperbarui instruktur', error: err.message });
  }
};

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