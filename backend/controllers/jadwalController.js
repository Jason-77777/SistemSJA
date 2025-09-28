const Jadwal = require('../models/Jadwal');
const PaketBelajar = require('../models/PaketBelajar');
const Instruktur = require('../models/Instruktur');
const Daftar = require('../models/Daftar');
const cleanupExpired = require('../utils/cleanup');
// --- FUNGSI UNTUK CUSTOMER ---

// Mencari jadwal yang tersedia berdasarkan filter
exports.getAvailableSchedules = async (req, res) => {
  try {
    const { jenisKendaraan, bulan, tahun } = req.query;
    if (!jenisKendaraan || !bulan || !tahun) { 
      return res.status(400).json({ message: 'Filter jenisKendaraan, bulan, dan tahun wajib diisi.' }); 
    }

    // Menggunakan UTC untuk konsistensi dengan data yang disimpan
    const startDate = new Date(Date.UTC(tahun, bulan - 1, 1));
    const endDate = new Date(Date.UTC(tahun, bulan, 0, 23, 59, 59, 999));

    const availableSchedules = await Jadwal.find({
      // Kueri ini memastikan HANYA jadwal yang benar-benar kosong yang diambil
      status: 'Tersedia', 
      jenisKendaraan: jenisKendaraan,
      tanggal: { $gte: startDate, $lte: endDate },
    }).populate('instrukturId', 'nama tipeMobil');
    
    res.json(availableSchedules);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// ... (sisa fungsi Anda: checkBookingAvailability, createJadwal, dll. tidak perlu diubah)
// Salin sisa fungsi dari file Anda yang sudah ada

// exports.checkBookingAvailability = async (req, res) => {
//   try {
//     const { paketId, startDate, jam, jenisKendaraan } = req.body;
//     const paket = await PaketBelajar.findById(paketId);
//     if (!paket) { return res.status(404).json({ message: 'Paket tidak ditemukan.' }); }
//     const match = paket.durasiKursus.match(/\((\d+)\s*Hari\)/);
//     if (!match) { return res.status(400).json({ message: 'Format durasi paket tidak valid.' }); }
//     const jumlahHari = parseInt(match[1], 10);

//     const requiredDates = [];
//     const localStartDate = new Date(startDate);
//     let currentDate = new Date(Date.UTC(localStartDate.getFullYear(), localStartDate.getMonth(), localStartDate.getDate()));

//     while (requiredDates.length < jumlahHari) {
//       const dayOfWeek = currentDate.getUTCDay();
//       if (dayOfWeek !== 0) { requiredDates.push(new Date(currentDate)); }
//       currentDate.setUTCDate(currentDate.getUTCDate() + 1);
//     }

//     const conflict = await Jadwal.findOne({
//       status: { $in: ['Pending', 'Penuh'] }, jam: jam.trim(), jenisKendaraan: jenisKendaraan, tanggal: { $in: requiredDates },
//     });
//     if (conflict) {
//       return res.status(200).json({
//         available: false, message: `Jadwal tidak tersedia. Ada konflik pada tanggal ${conflict.tanggal.toLocaleDateString('id-ID')}.`,
//         conflictDate: conflict.tanggal,
//       });
//     } else {
//       return res.status(200).json({ available: true, message: 'Semua slot jadwal tersedia untuk paket ini.' });
//     }
//   } catch (error) {
//     res.status(500).json({ message: 'Server Error', error: error.message });
//   }
// };

exports.checkBookingAvailability = async (req, res) => {
  try {
    //ADA PENAMBAHAN DISINI
    await cleanupExpired();
    const { paketId, startDate, jam, jenisKendaraan } = req.body;

    // 1. Hitung jumlah hari yang dibutuhkan oleh paket
    const paket = await PaketBelajar.findById(paketId);
    if (!paket) { return res.status(404).json({ message: 'Paket tidak ditemukan.' }); }
    
    const match = paket.durasiKursus.match(/\((\d+)\s*Hari\)/);
    if (!match) { return res.status(400).json({ message: 'Format durasi paket tidak valid.' }); }
    const jumlahHari = parseInt(match[1], 10);

    // 2. Buat daftar tanggal yang diperlukan (sama seperti sebelumnya)
    const requiredDates = [];
    const localStartDate = new Date(startDate);
    let currentDate = new Date(Date.UTC(localStartDate.getFullYear(), localStartDate.getMonth(), localStartDate.getDate()));

    while (requiredDates.length < jumlahHari) {
      if (currentDate.getUTCDay() !== 0) { // Lewati Minggu
        requiredDates.push(new Date(currentDate));
      }
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    // --- LOGIKA BARU YANG LEBIH CERDAS ---

    // 3. Hitung berapa total instruktur yang tersedia untuk tipe mobil ini
    const totalInstructors = await Instruktur.countDocuments({ tipeMobil: jenisKendaraan });

    // 4. Periksa setiap tanggal yang dibutuhkan
    for (const date of requiredDates) {
      // Untuk tanggal ini, hitung berapa banyak slot yang sudah terisi (Penuh atau Pending)
      const bookedSlotsCount = await Jadwal.countDocuments({
        tanggal: date,
        jam: jam.trim(),
        jenisKendaraan: jenisKendaraan,
        status: { $in: ['Pending', 'Penuh'] },
      });

      // 5. Jika jumlah slot yang terisi sama atau lebih dari total instruktur, maka jadwal penuh
      if (bookedSlotsCount >= totalInstructors) {
        return res.json({
          available: false,
          message: `Maaf, semua slot penuh untuk tanggal ${date.toLocaleDateString('id-ID')}.`,
        });
      }
    }
    
    // Jika loop selesai tanpa menemukan konflik, berarti jadwal tersedia
    return res.json({ available: true, message: 'Jadwal tersedia!' });

  } catch (error) {
    console.error("Error di checkBookingAvailability:", error);
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

// exports.getAllJadwal = async (req, res) => {
//   try {
//     const jadwal = await Jadwal.find().populate('instrukturId');
//     res.json(jadwal);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// Di dalam file: controllers/jadwalController.js
exports.getAllJadwal = async (req, res) => {
  try {
    // 1. Ambil semua jadwal, sertakan detail instruktur
    // populate() menerima objek untuk path dan select fields
    const semuaJadwal = await Jadwal.find({}).populate({ 
      path: 'instrukturId', 
      select: 'nama tipeMobil' 
    }).sort({ tanggal: 1 });

    // 2. Cari semua pendaftaran yang relevan
    const pendaftaranTerkait = await Daftar.find({ 
      statusPembayaran: { $in: ['Lunas', 'Menunggu Verifikasi'] } 
    }).populate({
      path: 'customerId',
      select: 'namaLengkap alamat noTelepon'
    });

    // 3. Buat "peta" untuk pencarian cepat
    const jadwalCustomerMap = new Map();
    pendaftaranTerkait.forEach(pendaftaran => {
      if (pendaftaran.jadwalSesi && pendaftaran.customerId) {
        pendaftaran.jadwalSesi.forEach(jadwalId => {
          jadwalCustomerMap.set(jadwalId.toString(), pendaftaran.customerId);
        });
      }
    });

    // 4. Gabungkan data
    const jadwalDenganCustomer = semuaJadwal.map(jadwal => {
      const jadwalObj = jadwal.toObject();
      if (jadwalCustomerMap.has(jadwalObj._id.toString())) {
        jadwalObj.customer = jadwalCustomerMap.get(jadwalObj._id.toString());
      }
      return jadwalObj;
    });

    res.json(jadwalDenganCustomer);

  } catch (error) {
    console.error("--- ERROR DI getAllJadwal ---", error); // Log ini akan muncul di terminal backend
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

exports.generateBulkSchedules = async (req, res) => {
  try {
    const { instrukturId, startDate, endDate, timeSlots, skipDays } = req.body;
    const instruktur = await Instruktur.findById(instrukturId);
    if (!instruktur) { return res.status(404).json({ message: 'Instruktur tidak ditemukan.' }); }
    
    const newSchedules = [];
    const localStartDate = new Date(startDate);
    const localEndDate = new Date(endDate);
    let currentDate = new Date(Date.UTC(localStartDate.getFullYear(), localStartDate.getMonth(), localStartDate.getDate()));
    const lastDate = new Date(Date.UTC(localEndDate.getFullYear(), localEndDate.getMonth(), localEndDate.getDate()));

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
    if (newSchedules.length === 0) { return res.status(400).json({ message: 'Tidak ada jadwal yang bisa digenerate.' }); }
    
    await Jadwal.insertMany(newSchedules, { ordered: false });
    res.status(201).json({ message: `Jadwal baru berhasil dibuat.` });
  } catch (error) {
    if (error.code === 11000) { return res.status(201).json({ message: `Jadwal berhasil dibuat/diperbarui.` }); }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
