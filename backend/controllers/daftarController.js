const Daftar = require('../models/Daftar');
const Jadwal = require('../models/Jadwal');
const PaketBelajar = require('../models/PaketBelajar');
const Instruktur = require('../models/Instruktur');
const { sendSuccessEmail } = require('../utils/emailService');
const { generateInvoiceHTML } = require('../utils/invoiceTemplate');
const puppeteer = require('puppeteer');

const cleanupExpired = async () => {
  try {
    const expired = await Daftar.find({
      statusPembayaran: 'Belum Bayar',
      paymentDueDate: { $lt: new Date() }
    });
    if (expired.length > 0) {
      console.log(`Ditemukan ${expired.length} pendaftaran kedaluwarsa. Membersihkan...`);
      for (const p of expired) {
        await Jadwal.updateMany({ _id: { $in: p.jadwalSesi } }, { $set: { status: 'Tersedia' } });
        await Daftar.findByIdAndDelete(p._id);
      }
    }
  } catch (error) {
    console.error("Gagal menjalankan cleanup:", error);
  }
};

exports.createPendaftaran = async (req, res) => {
  const { paketId, startDate, jenisKendaraan, jam } = req.body;
  const customerId = req.user.id;
  try {
    await cleanupExpired();
    const paket = await PaketBelajar.findById(paketId);
    if (!paket) { return res.status(404).json({ message: 'Paket tidak ditemukan.' }); }
    const match = paket.durasiKursus.match(/\((\d+)\s*Hari\)/);
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
    
    console.log('-------------------------------------------');
    console.log('MEMULAI PROSES PENDAFTARAN BARU');
    console.log('Request Body Diterima:', req.body);
    console.log('Jumlah Hari Paket:', jumlahHari);
    console.log('Tanggal yang Dibutuhkan (UTC) SETELAH +7 JAM:', requiredDates);
    
    const availableInstructors = await Instruktur.find({ tipeMobil: jenisKendaraan });
    if (!availableInstructors.length) { return res.status(404).json({ message: `Tidak ada instruktur untuk mobil ${jenisKendaraan}.` }); }
    
    let designatedInstructorId = null;
    let slotsToUpdate = [];
    
    for (const instructor of availableInstructors) {
      console.log(`Mencari jadwal untuk Instruktur: ${instructor.nama}`);
      
      const instructorSlots = await Jadwal.find({
        instrukturId: instructor._id,
        jam: jam.trim(),
        status: 'Tersedia',
        tanggal: { $in: requiredDates }
      }).sort({ tanggal: 'asc' });

      console.log(`Ditemukan ${instructorSlots.length} slot dari ${jumlahHari} yang dibutuhkan.`);

      if (instructorSlots.length === jumlahHari) {
        designatedInstructorId = instructor._id;
        slotsToUpdate = instructorSlots;
        console.log(`SUKSES! Instruktur ${instructor.nama} dipilih.`);
        break;
      }
    }

    if (!designatedInstructorId) {
      console.log('GAGAL: Tidak ada instruktur yang memenuhi syarat setelah semua dicek.');
      console.log('-------------------------------------------');
      return res.status(400).json({ message: `Maaf, tidak ada instruktur yang memiliki jadwal lengkap untuk paket ini.` });
    }
    
    const slotIds = slotsToUpdate.map(slot => slot._id);
    const pendaftaran = new Daftar({
      customerId,
      paketId,
      instrukturId: designatedInstructorId,
      tanggalMulai: new Date(startDate),
      jam: jam.trim(),
      jadwalSesi: slotIds,
      paymentDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await pendaftaran.save();
    await Jadwal.updateMany({ _id: { $in: slotIds } }, { $set: { status: 'Pending' } });
    
    res.status(201).json({ message: 'Pendaftaran berhasil!', pendaftaran });
  } catch (error) {
    console.error("Error saat pendaftaran:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  const { pendaftaranId } = req.params;
  const { action } = req.body;
  try {
    const pendaftaran = await Daftar.findById(pendaftaranId)
      .populate('paketId')
      .populate('customerId', 'namaLengkap email')
      .populate('instrukturId', 'nama noTelepon nopolKendaraan');

    if (!pendaftaran) { return res.status(404).json({ message: 'Pendaftaran tidak ditemukan.' }); }

    const updateQuery = { _id: { $in: pendaftaran.jadwalSesi } };

    if (action === 'setujui') {
      pendaftaran.statusPembayaran = 'Lunas';
      await pendaftaran.save();
      await Jadwal.updateMany(updateQuery, { $set: { status: 'Penuh' } });
      await sendSuccessEmail(pendaftaran);
      return res.json({ message: 'Pembayaran berhasil disetujui dan konfirmasi email telah dikirim.' });
    } else if (action === 'tolak') {
      pendaftaran.jumlahPenolakan += 1;
      pendaftaran.statusPembayaran = 'Ditolak';
      pendaftaran.buktiBayarURL = undefined;
      pendaftaran.nomorRekeningPengirim = undefined;
      await pendaftaran.save();

      if (pendaftaran.jumlahPenolakan >= 3) {
        await Jadwal.updateMany(updateQuery, { $set: { status: 'Tersedia' } });
        return res.json({ message: 'Pembayaran ditolak. Batas percobaan habis, jadwal telah dibatalkan.' });
      } else {
        return res.json({ message: `Pembayaran ditolak. Customer dapat mengupload ulang. Percobaan ke-${pendaftaran.jumlahPenolakan} dari 3.` });
      }
    } else {
      return res.status(400).json({ message: 'Aksi tidak valid.' });
    }
  } catch (error) {
    console.error("Error saat verifikasi pembayaran:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getMyPendaftaran = async (req, res) => {
  try {
    const pendaftaranList = await Daftar.find({ customerId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('paketId')
      .populate('instrukturId', 'nama nopolKendaraan')
       .populate('customerId', 'alamat')
      .populate({
          path: 'jadwalSesi',
          model: 'Jadwal',
          populate: {
             path: 'instrukturId',
             model: 'Instruktur',
             select: 'nama'
          }
      });
    res.json(pendaftaranList);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.reschedulePendaftaran = async (req, res) => {
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

exports.getPendingVerifications = async (req, res) => {
    try {
        const pending = await Daftar.find({ statusPembayaran: 'Menunggu Verifikasi' })
            .populate('customerId', 'namaLengkap email alamat')
            .populate('paketId');
        res.json(pending);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getPendaftaranById = async (req, res) => {
    try {
        const pendaftaran = await Daftar.findById(req.params.id).populate('paketId');
        if (!pendaftaran) { return res.status(404).json({ message: 'Pendaftaran tidak ditemukan.' }); }
        if (pendaftaran.customerId.toString() !== req.user.id) { return res.status(401).json({ message: 'Tidak diizinkan.' }); }
        res.json(pendaftaran);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.updateBuktiBayar = async (req, res) => {
    try {
        const { buktiBayarURL, nomorRekeningPengirim } = req.body;
        const pendaftaran = await Daftar.findById(req.params.id);
        if (!pendaftaran) { return res.status(404).json({ message: 'Pendaftaran tidak ditemukan.' }); }
        if (pendaftaran.customerId.toString() !== req.user.id) { return res.status(401).json({ message: 'Tidak diizinkan.' }); }
        pendaftaran.buktiBayarURL = buktiBayarURL;
        pendaftaran.nomorRekeningPengirim = nomorRekeningPengirim;
        pendaftaran.statusPembayaran = 'Menunggu Verifikasi';
        await pendaftaran.save();
        res.json(pendaftaran);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getAllPendaftaranForAdmin = async (req, res) => {
  try {
    const pendaftaran = await Daftar.find({})
      .sort({ createdAt: -1 })
      .populate('customerId', 'namaLengkap alamat')
      .populate('paketId')
      .populate({
          path: 'jadwalSesi',
          model: 'Jadwal',
          populate: {
              path: 'instrukturId',
              model: 'Instruktur',
              select: 'nama'
          }
      });
    res.json(pendaftaran);
  } catch (error) {
    console.error("Error saat mengambil semua pendaftaran:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.unduhInvoice = async (req, res) => {
  try {
    const { pendaftaranId } = req.params;
    const pendaftaran = await Daftar.findById(pendaftaranId)
      .populate('customerId', 'namaLengkap')
      .populate('paketId')
      .populate('instrukturId');

    if (!pendaftaran) {
      return res.status(404).json({ message: 'Data pendaftaran tidak ditemukan.' });
    }

    const htmlContent = generateInvoiceHTML(pendaftaran);
   
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${pendaftaran.customerId.namaLengkap}-${pendaftaranId}.pdf"`,
    });
    res.send(pdfBuffer);

  } catch (error) {
    console.error("Error saat membuat invoice PDF:", error);
    res.status(500).json({ message: 'Gagal membuat invoice PDF.' });
  }
};