import React, { useState } from 'react';
import axios from 'axios';
import './ReportPage.css';
const API_BACKEND = 'https://backendsja-890420967859.asia-southeast2.run.app/'

const ReportPage = () => {
  const [startDateLaporan, setStartDateLaporan] = useState('');
  const [endDateLaporan, setEndDateLaporan] = useState('');
  const [laporanError, setLaporanError] = useState('');
  const [laporanLoading, setLaporanLoading] = useState(false);

  const handleDownloadLaporan = async () => {
    if (!startDateLaporan || !endDateLaporan) {
      setLaporanError('Harap pilih tanggal mulai dan tanggal akhir untuk laporan.');
      return;
    }
    setLaporanError('');
    setLaporanLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BACKEND}/api/laporan/unduh`, {
        params: { startDate: startDateLaporan, endDate: endDateLaporan },
        headers: { 'x-auth-token': token },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      // --- PERUBAHAN 1: Ganti ekstensi file menjadi .pdf ---
      const fileName = `laporan-pendaftaran-${startDateLaporan}-sampai-${endDateLaporan}.pdf`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      alert('Laporan berhasil diunduh!');
    } catch (err) {
      setLaporanError('Terjadi kesalahan saat mengunduh laporan.');
    } finally {
      setLaporanLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <h1>Cetak Laporan</h1>
      </div>

      <div className="page-section report-section">
        <h3>Unduh Laporan Pendaftaran</h3>
        <div className="date-inputs">
          <div>
            <label htmlFor="startDateLaporan">Dari Tanggal:</label><br />
            <input type="date" id="startDateLaporan" value={startDateLaporan} onChange={(e) => setStartDateLaporan(e.target.value)} />
          </div>
          <div>
            <label htmlFor="endDateLaporan">Sampai Tanggal:</label><br />
            <input type="date" id="endDateLaporan" value={endDateLaporan} onChange={(e) => setEndDateLaporan(e.target.value)} />
          </div>
        </div>
        {/* --- PERUBAHAN 2: Ganti teks tombol --- */}
        <button className="primary-button" onClick={handleDownloadLaporan} disabled={laporanLoading}>
          {laporanLoading ? 'Memproses...' : 'Unduh Laporan PDF'}
        </button>
        {laporanError && <p style={{ color: 'red', marginTop: '10px' }}>{laporanError}</p>}
      </div>
    </div>
  );
};

export default ReportPage;