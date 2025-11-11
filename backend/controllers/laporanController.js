const Daftar = require('../models/Daftar');
const puppeteer = require('puppeteer'); 
const { generateReportHTML } = require('../utils/reportTemplate'); 

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
    if (currentDate.getDay() !== 0) { 
      daysAdded++;
    }
  }

  return currentDate;
};

exports.unduhLaporan = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Harap tentukan tanggal mulai dan tanggal akhir.' });
    }

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

    const dataLaporan = dataValid.map(p => {
      const tanggalSelesai = calculateEndDate(p.tanggalMulai, p.paketId.durasiKursus);
      
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

    const htmlContent = generateReportHTML(dataLaporan, startDate, endDate);

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ 
        format: 'A4', 
        printBackground: true,
        landscape: true, 
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="laporan-pendaftaran-${startDate}-sd-${endDate}.pdf"`,
    });
    res.send(pdfBuffer);

  } catch (error) {
    console.error("Error saat membuat laporan PDF:", error);
    res.status(500).json({ message: 'Gagal membuat laporan PDF.', error: error.message });
  }
};