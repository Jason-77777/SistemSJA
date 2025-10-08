import React, { useState, useEffect } from 'react';
import axios from 'axios';
const API_BACKEND = 'https://backendsja-890420967859.asia-southeast2.run.app/'

const VerifyPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      setMessage('');
      setError('');
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BACKEND}/api/daftar/admin/verifikasi`, {
        headers: { 'x-auth-token': token }
      });
      setPayments(res.data);
    } catch (err) {
      setError('Gagal memuat data pembayaran.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  // --- FUNGSI INI DIMODIFIKASI UNTUK MENGGABUNGKAN AKSI ---
  const handleVerification = async (pendaftaran, action) => {
    const actionText = action === 'setujui' ? 'MENYETUJUI' : 'MENOLAK';
    if (!window.confirm(`Anda yakin ingin ${actionText} pembayaran untuk ${pendaftaran.customerId?.namaLengkap}?`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      // Aksi untuk Menyetujui & Mengunduh
      if (action === 'setujui') {
        // 1. Setujui pembayaran
        await axios.patch(
          `${API_BACKEND}/api/daftar/admin/verifikasi/${pendaftaran._id}`,
          { action: 'setujui' },
          { headers: { 'x-auth-token': token } }
        );
        alert('Pembayaran berhasil disetujui! Invoice akan segera diunduh.');

        // 2. Unduh invoice
        const downloadRes = await axios.get(
          `${API_BACKEND}/api/daftar/admin/invoice/${pendaftaran._id}`,
          { 
            headers: { 'x-auth-token': token },
            responseType: 'blob'
          }
        );
        
        const url = window.URL.createObjectURL(new Blob([downloadRes.data]));
        const link = document.createElement('a');
        link.href = url;
        const fileName = `invoice-${pendaftaran.customerId?.namaLengkap}-${pendaftaran._id}.pdf`;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      
      // Aksi untuk Menolak (Tetap sama)
      } else {
        const res = await axios.patch(`${API_BACKEND}/api/daftar/admin/verifikasi/${pendaftaran._id}`, 
          { action: 'tolak' },
          { headers: { 'x-auth-token': token } }
        );
        setMessage(res.data.message);
      }
      
      // Muat ulang data di halaman setelah aksi selesai
      fetchPendingPayments();

    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memproses verifikasi.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="admin-page-container"> 
      <div className="page-header">
        <h1>Verifikasi Pembayaran</h1>
      </div>
      
      {message && <p style={{ color: 'green', fontWeight: 'bold' }}>{message}</p>}
      
      {payments.length === 0 ? (
        <div className="page-section">
            <p>Tidak ada pembayaran yang menunggu verifikasi saat ini.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Nama Customer</th>
                <th>Paket Kursus</th>
                <th>No. Rek Pengirim</th>
                <th>Bukti Bayar</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id}>
                  <td>{p.customerId?.namaLengkap || 'N/A'}</td>
                  <td>{p.paketId ? `${p.paketId.paketKursus} - ${p.paketId.jenisKendaraan}` : 'N/A'}</td>
                  <td>{p.nomorRekeningPengirim || 'Tidak ada'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <a href={p.buktiBayarURL} target="_blank" rel="noopener noreferrer" className="button button-secondary">
                      Lihat Bukti
                    </a>
                  </td>
                  <td className="action-cell">
                    {/* --- TOMBOL INI MEMANGGIL FUNGSI YANG SUDAH DIPERBARUI --- */}
                    <button onClick={() => handleVerification(p, 'setujui')} className="button button-primary">
                      Setujui & Unduh Invoice
                    </button>
                    <button onClick={() => handleVerification(p, 'tolak')} className="button button-delete">
                      Tolak
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VerifyPayments;