const Jadwal = require('../models/Jadwal');
const PaketBelajar = require('../models/PaketBelajar');
const Instruktur = require('../models/Instruktur');
const Daftar = require('../models/Daftar');
const cleanupExpired = require('../utils/cleanup');

exports.getAvailableSchedules = async (req, res) => {
  try {
    const { jenisKendaraan, bulan, tahun } = req.query;
    if (!jenisKendaraan || !bulan || !tahun) { 
      return res.status(400).json({ message: 'Filter jenisKendaraan, bulan, dan tahun wajib diisi.' }); 
    }
    const startDate = new Date(Date.UTC(tahun, bulan - 1, 1));
    const endDate = new Date(Date.UTC(tahun, bulan, 0, 23, 59, 59, 999));
    const availableSchedules = await Jadwal.find({
      status: 'Tersedia', 
      jenisKendaraan: jenisKendaraan,
      tanggal: { $gte: startDate, $lte: endDate },
    }).populate('instrukturId', 'nama tipeMobil');
    res.json(availableSchedules);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.checkBookingAvailability = async (req, res) => {
  try {
    await cleanupExpired();
    const { paketId, startDate, jam, jenisKendaraan } = req.body;
    const paket = await PaketBelajar.findById(paketId);
    if (!paket) { return res.status(404).json({ message: 'Paket tidak ditemukan.' }); }
    const match = paket.durasiKursus.match(/\((\d+)\s*Hari\)/);
    if (!match) { return res.status(400).json({ message: 'Format durasi paket tidak valid.' }); }
    const jumlahHari = parseInt(match[1], 10);
    const requiredDates = [];
    const initialDate = new Date(startDate);
    initialDate.setHours(initialDate.getHours() + 7); 

    let currentDate = new Date(Date.UTC(initialDate.getUTCFullYear(), initialDate.getUTCMonth(), initialDate.getUTCDate()));

    while (requiredDates.length < jumlahHari) {
      if (currentDate.getUTCDay() !== 0) {
        requiredDates.push(new Date(currentDate));
      }
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    const totalInstructors = await Instruktur.countDocuments({ tipeMobil: jenisKendaraan });
    for (const date of requiredDates) {
      const bookedSlotsCount = await Jadwal.countDocuments({
        tanggal: date,
        jam: jam.trim(),
        jenisKendaraan: jenisKendaraan,
        status: { $in: ['Pending', 'Penuh'] },
      });
      if (bookedSlotsCount >= totalInstructors) {
        return res.json({
          available: false,
          message: `Maaf, semua slot penuh untuk tanggal ${date.toLocaleDateString('id-ID')}.`,
        });
      }
    }
    return res.json({ available: true, message: 'Jadwal tersedia!' });
  } catch (error) {
    console.error("Error di checkBookingAvailability:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


exports.generateBulkSchedules = async (req, res) => {
  try {
    const { instrukturId, startDate, endDate, timeSlots, skipDays } = req.body;
    const instruktur = await Instruktur.findById(instrukturId);
    if (!instruktur) { return res.status(404).json({ message: 'Instruktur tidak ditemukan.' }); }
    
    const newSchedules = [];

    const localStartDate = new Date(startDate);
    const localEndDate = new Date(endDate);
    
    let currentDate = new Date(Date.UTC(localStartDate.getUTCFullYear(), localStartDate.getUTCMonth(), localStartDate.getUTCDate()));
    const lastDate = new Date(Date.UTC(localEndDate.getUTCFullYear(), localEndDate.getUTCMonth(), localEndDate.getUTCDate()));

    console.log('--- BULK SCHEDULE GENERATION ---');
    console.log('Input Start Date (dari Admin):', startDate);
    console.log('Input End Date (dari Admin):', endDate);
    console.log('Tanggal Mulai Terkonversi (UTC):', currentDate.toISOString());
    console.log('Tanggal Selesai Terkonversi (UTC):', lastDate.toISOString());
    while (currentDate <= lastDate) {
      const dayOfWeek = currentDate.getUTCDay();
      if (!skipDays.includes(dayOfWeek)) {
        for (const jam of timeSlots) {
          newSchedules.push({
            instrukturId: instrukturId, jenisKendaraan: instruktur.tipeMobil,
            tanggal: new Date(currentDate), jam: jam.trim(), status: 'Tersedia',
          });
        }
      }
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    if (newSchedules.length > 0) {
      console.log('Contoh jadwal pertama yang akan disimpan:', newSchedules[0]);
    }
    console.log('------------------------------------');

    if (newSchedules.length === 0) { return res.status(400).json({ message: 'Tidak ada jadwal yang bisa digenerate.' }); }
    
    await Jadwal.insertMany(newSchedules, { ordered: false });
    res.status(201).json({ message: `Jadwal baru berhasil dibuat.` });
  } catch (error) {
    if (error.code === 11000) { return res.status(201).json({ message: `Jadwal berhasil dibuat/diperbarui.` }); }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.createJadwal = async (req, res) => {
  try {
    const newJadwal = new Jadwal(req.body);
    await newJadwal.save();
    res.status(201).json(newJadwal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllJadwal = async (req, res) => {
  try {
    const semuaJadwal = await Jadwal.find({}).populate({ 
      path: 'instrukturId', 
      select: 'nama tipeMobil' 
    }).sort({ tanggal: 1 });

    const pendaftaranTerkait = await Daftar.find({ 
      statusPembayaran: { $in: ['Lunas', 'Menunggu Verifikasi'] } 
    }).populate({
      path: 'customerId',
      select: 'namaLengkap alamat noTelepon'
    });

    const jadwalCustomerMap = new Map();
    pendaftaranTerkait.forEach(pendaftaran => {
      if (pendaftaran.jadwalSesi && pendaftaran.customerId) {
        pendaftaran.jadwalSesi.forEach(jadwalId => {
          jadwalCustomerMap.set(jadwalId.toString(), pendaftaran.customerId);
        });
      }
    });

    const jadwalDenganCustomer = semuaJadwal.map(jadwal => {
      const jadwalObj = jadwal.toObject();
      if (jadwalCustomerMap.has(jadwalObj._id.toString())) {
        jadwalObj.customer = jadwalCustomerMap.get(jadwalObj._id.toString());
      }
      return jadwalObj;
    });

    res.json(jadwalDenganCustomer);

  } catch (error) {
    console.error("--- ERROR DI getAllJadwal ---", error);
    res.status(500).json({ 
      message: 'Server Error saat mengambil data jadwal!',
      error: error.message 
    });
  }
};

exports.getJadwalById = async (req, res) => {
  try {
    const jadwal = await Jadwal.findById(req.params.id).populate('instrukturId');
    if (!jadwal) return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
    res.json(jadwal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateJadwal = async (req, res) => {
  try {
    const updatedJadwal = await Jadwal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedJadwal) return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
    res.json(updatedJadwal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteJadwal = async (req, res) => {
  try {
    const deletedJadwal = await Jadwal.findByIdAndDelete(req.params.id);
    if (!deletedJadwal) return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
    res.json({ message: 'Jadwal berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};