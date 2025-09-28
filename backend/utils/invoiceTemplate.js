// File: backend/utils/invoiceTemplate.js

const generateInvoiceHTML = (pendaftaran) => {
  const { customerId, paketId, tanggalMulai, jam, instrukturId } = pendaftaran;
  const harga = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(paketId.harga);
  const tanggalMulaiFormatted = new Date(tanggalMulai).toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const logoUrl = "https://res.cloudinary.com/dxwxmdqdp/image/upload/v1758978696/LOGO_SJA_PNG_ispo8e.png";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
        .header img { max-width: 100px; margin-bottom: 10px; }
        .header h1 { margin: 0; color: #0056b3; }
        .details { margin-bottom: 20px; }
        .details table { width: 100%; border-collapse: collapse; }
        .details th, .details td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .details th { background-color: #f2f2f2; width: 40%; }
        .closing { margin-top: 30px; }
        .footer { text-align: center; margin-top: 20px; font-size: 0.9em; color: #777; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoUrl}" alt="Logo SJA">
          <h1>Invoice Pembayaran Lunas</h1>
          <p>CV. Sumatera Jaya Abadi</p>
        </div>
        <p>Halo <strong>${customerId.namaLengkap}</strong>,</p>
        <p>Terima kasih! Pembayaran Anda telah kami verifikasi dan status pendaftaran Anda sudah lunas. Berikut adalah detail kursus Anda:</p>
        <div class="details">
          <table>
            <tr>
              <th>Paket Kursus</th>
              <td>${paketId.paketKursus} - ${paketId.jenisKendaraan} (${paketId.durasiKursus})</td>
            </tr>
            <tr>
              <th>Tanggal Mulai</th>
              <td>${tanggalMulaiFormatted}</td>
            </tr>
            <tr>
              <th>Jam Belajar</th>
              <td>${jam}</td>
            </tr>
            <tr>
              <th>Instruktur</th>
              <td>${instrukturId.nama}</td>
            </tr>
            
            
            <tr>
              <th>No. Telepon Instruktur</th>
              <td>${instrukturId.noTelepon}</td>
            </tr>
            <tr>
              <th>Nopol Kendaraan</th>
              <td>${instrukturId.nopolKendaraan}</td>
            </tr>
            

            <tr>
              <th>Total Pembayaran</th>
              <td><strong>${harga}</strong></td>
            </tr>
          </table>
        </div>
        <p>Kami akan segera menghubungi Anda untuk informasi lebih lanjut. Selamat belajar mengemudi bersama kami!</p>
        <div class="closing">
          <p>Salam hormat,</p>
          <p><strong>CV. Sumatera Jaya Abadi</strong></p>
        </div>
        <div class="footer">
          <p>Ini adalah email otomatis, mohon untuk tidak membalas email ini.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { generateInvoiceHTML };