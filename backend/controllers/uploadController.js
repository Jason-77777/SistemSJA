const { cloudinary } = require('../config/Cloudinary');

exports.uploadBuktiPembayaran = async (req, res) => {
  try {
    // Cek apakah ada file yang di-upload
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang di-upload.' });
    }

    // Ubah file buffer menjadi format base64
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    // Kirim ke Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "bukti_pembayaran", // Buat folder di Cloudinary agar rapi
    });

    // Kirim kembali URL gambar yang aman ke frontend
    res.status(200).json({
      message: "Upload berhasil!",
      url: result.secure_url,
    });

  } catch (error) {
    console.error("Error saat upload ke Cloudinary:", error);
    res.status(500).json({ message: "Upload gagal.", error: error.message });
  }
};