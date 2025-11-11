const Daftar = require('../models/Daftar');
const Jadwal = require('../models/Jadwal');
exports.tukarSesi = async (req, res) => {
  const { pendaftaranId } = req.params;
  const { jadwalLamaId, jadwalBaruId } = req.body;

  try {
    const jadwalBaru = await Jadwal.findById(jadwalBaruId);
    if (!jadwalBaru || jadwalBaru.status !== 'Tersedia') {
      return res.status(400).json({ message: 'Jadwal baru tidak tersedia atau tidak ditemukan.' });
    }

    const pendaftaran = await Daftar.findById(pendaftaranId);
    if (!pendaftaran) {
      return res.status(404).json({ message: 'Pendaftaran tidak ditemukan.' });
    }

    await Jadwal.findByIdAndUpdate(jadwalLamaId, { status: 'Tersedia' });

    await Jadwal.findByIdAndUpdate(jadwalBaruId, { status: 'Penuh' });

    const indexJadwalLama = pendaftaran.jadwalSesi.findIndex(id => id.toString() === jadwalLamaId);
    if (indexJadwalLama > -1) {
      pendaftaran.jadwalSesi[indexJadwalLama] = jadwalBaruId;
    } else {
      await Jadwal.findByIdAndUpdate(jadwalLamaId, { status: 'Penuh' }); 
      await Jadwal.findByIdAndUpdate(jadwalBaruId, { status: 'Tersedia' });
      return res.status(400).json({ message: 'Jadwal lama tidak ditemukan di data pendaftaran ini.' });
    }
    
    pendaftaran.markModified('jadwalSesi');
    await pendaftaran.save();

    res.json({ message: 'Sesi jadwal berhasil ditukar!' });

  } catch (error) {
    console.error("Error saat tukar sesi:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};