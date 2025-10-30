const generateReportHTML = (dataLaporan, startDate, endDate) => {
  const periodeMulai = new Date(startDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  const periodeSelesai = new Date(endDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  const logoUrl = "https://res.cloudinary.com/dxwxmdqdp/image/upload/v1758978696/LOGO_SJA_PNG_ispo8e.png";

  const createTableRows = () => {
    if (!dataLaporan || dataLaporan.length === 0) {
      return '<tr><td colspan="10" style="text-align:center;">Tidak ada data untuk periode ini.</td></tr>';
    }
    return dataLaporan.map(item => `
      <tr>
        <td>${item['Tanggal Mulai Kursus']}</td>
        <td>${item['Tanggal Selesai Kursus']}</td>
        <td>${item['Nama Customer']}</td>
        <td>${item['Alamat Jemput']}</td>
        <td>${item['No. Telepon']}</td>
        <td>${item['Paket Kursus']}</td>
        <td>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item['Harga'])}</td>
        <td>${item['Instruktur']}</td>
        <td>${item['Nopol Kendaraan']}</td>
        <td>${item['Jam Belajar']}</td>
      </tr>
    `).join('');
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; font-size: 10px; }
        .container { width: 100%; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 25px; }
        .header img { max-width: 80px; margin-bottom: 10px; }
        .header h1 { margin: 0; color: #0056b3; font-size: 20px; }
        .header h2 { margin: 5px 0 0 0; font-size: 16px; font-weight: normal; }
        .header p { margin: 5px 0 0 0; font-size: 12px; color: #555; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 6px; text-align: left; border: 1px solid #ddd; }
        thead { background-color: #f2f2f2; }
        .footer { text-align: center; margin-top: 20px; font-size: 9px; color: #777; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoUrl}" alt="Logo SJA">
          <h1>CV. SUMATERA JAYA ABADI</h1>
          <h2>Laporan Pendaftaran Kursus</h2>
          <p>Periode: ${periodeMulai} - ${periodeSelesai}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Tgl Mulai</th>
              <th>Tgl Selesai</th>
              <th>Customer</th>
              <th>Alamat</th>
              <th>No. Telepon</th>
              <th>Paket</th>
              <th>Harga</th>
              <th>Instruktur</th>
              <th>Nopol</th>
              <th>Jam</th>
            </tr>
          </thead>
          <tbody>
            ${createTableRows()}
          </tbody>
        </table>
        <div class="footer">
          <p>Laporan ini dibuat secara otomatis oleh sistem pada ${new Date().toLocaleString('id-ID')}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { generateReportHTML };