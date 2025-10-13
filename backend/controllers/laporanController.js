const Daftar = require('../models/Daftar');
const { Parser } = require('json2csv');

// --- FUNGSI BANTUAN INI TIDAK DIUBAH ---
const calculateEndDate = (startDate, durationString) => {
  if (!startDate || !durationString) {
    return 'N/A';
  }
  
  const match = durationString.match(/\((\d+)\s*Hari\)/);
  if (!match || !match[1]) {
    return 'Format Durasi Salah';
  }
  
  const totalDays = parseInt(match[1], 10);
  let currentDate = new Date(startDate);
  let daysAdded = 1;

  while (daysAdded < totalDays) {
    currentDate.setDate(currentDate.getDate() + 1);
    if (currentDate.getDay() !== 0) { // Lewati hari Minggu
      daysAdded++;
    }
  }

  return currentDate;
};
// ------------------------------------


exports.unduhLaporan = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Harap tentukan tanggal mulai dan tanggal akhir.' });
    }

    // --- KITA GUNAKAN KEMBALI LOGIKA LAMA ANDA UNTUK QUERY ---
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(start.getHours() - 7);
    end.setUTCHours(23, 59, 59, 999);
    
    const pendaftaranLunas = await Daftar.find({
      statusPembayaran: 'Lunas',
      tanggalMulai: { $gte: start, $lte: end },
    })
    .populate('customerId', 'namaLengkap alamat noTelepon')
    .populate('paketId')
    .populate('instrukturId', 'nama nopolKendaraan');

    const dataValid = pendaftaranLunas.filter(p => p.customerId && p.paketId && p.instrukturId);

    if (dataValid.length === 0) {
      return res.status(404).json({ message: 'Tidak ada data laporan yang valid ditemukan untuk periode ini.' });
    }

    // ================== PERUBAHAN UTAMA DI SINI ==================
    const dataLaporan = dataValid.map(p => {
      const tanggalSelesai = calculateEndDate(p.tanggalMulai, p.paketId.durasiKursus);
      
      // Buat tanggal baru dan tambahkan 7 jam untuk mengoreksi timezone
      const correctedStartDate = new Date(p.tanggalMulai);
      correctedStartDate.setHours(correctedStartDate.getHours() + 7);

      const correctedEndDate = tanggalSelesai instanceof Date ? new Date(tanggalSelesai) : null;
      if (correctedEndDate) {
        correctedEndDate.setHours(correctedEndDate.getHours() + 7);
      }

      return {
        'Tanggal Mulai Kursus': correctedStartDate.toLocaleDateString('id-ID'),
        'Tanggal Selesai Kursus': correctedEndDate ? correctedEndDate.toLocaleDateString('id-ID') : tanggalSelesai,
        'Nama Customer': p.customerId.namaLengkap,
        'Alamat Jemput': p.customerId.alamat,
        'No. Telepon': p.customerId.noTelepon,
        'Paket Kursus': `${p.paketId.paketKursus} ${p.paketId.jenisKendaraan} (${p.paketId.durasiKursus})`,
        'Harga': p.paketId.harga,
        'Instruktur': p.instrukturId.nama,
        'Nopol Kendaraan': p.instrukturId.nopolKendaraan,
        'Jam Belajar': p.jam,
      };
    });
    // =============================================================

    const fields = [
      'Tanggal Mulai Kursus', 'Tanggal Selesai Kursus', 'Nama Customer', 
      'Alamat Jemput', 'No. Telepon', 'Paket Kursus', 'Harga', 
      'Instruktur', 'Nopol Kendaraan', 'Jam Belajar'
    ];
    
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(dataLaporan);

    res.header('Content-Type', 'text/csv');
    res.attachment(`laporan-pendaftaran-${startDate}-sd-${endDate}.csv`);
    res.send(csv);

  } catch (error) {
    console.error("Error saat membuat laporan:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};