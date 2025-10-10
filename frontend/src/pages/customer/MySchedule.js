import React, { useState, useEffect } from 'react';
import api from '../../api'; // --- DIUBAH: Menggunakan file api.js ---
import { Link } from 'react-router-dom';
import './MySchedule.css'; 

import CountdownTimer from '../../components/CountdownTimer';

const MySchedule = () => {
  const [mySchedules, setMySchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMySchedules = async () => {
      // Cek token dulu sebelum fetch
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Anda harus login untuk melihat halaman ini.');
        setLoading(false);
        return;
      }

      try {
        // --- DIUBAH: Menggunakan 'api' dan tanpa header manual ---
        const response = await api.get('/api/daftar/mine');
        
        if (Array.isArray(response.data)) {
          setMySchedules(response.data);
        } else {
          // Jika respons bukan array, anggap tidak ada jadwal
          setMySchedules([]);
        }
      } catch (err) {
        // Menangani error jika token tidak valid atau masalah server
        if (err.response && err.response.status === 401) {
            setError('Sesi Anda tidak valid. Silakan login kembali.');
        } else {
            setError('Gagal memuat jadwal Anda. Coba refresh halaman.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMySchedules();
    window.addEventListener('focus', fetchMySchedules);
    return () => {
      window.removeEventListener('focus', fetchMySchedules);
    };
  }, []);

  if (loading) return <div className="page-container">Memuat jadwal Anda...</div>;
  if (error) return <div className="page-container">{error}</div>;

  const getStatusClass = (status) => {
    switch (status) {
      case 'Lunas': return 'status-lunas';
      case 'Menunggu Verifikasi': return 'status-verifikasi';
      case 'Ditolak': return 'status-ditolak';
      case 'Belum Bayar': return 'status-belum-bayar';
      default: return '';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Jadwalku</h1>
      </div>

      {mySchedules.length === 0 ? (
        <p>Anda belum memiliki jadwal kursus yang terdaftar.</p>
      ) : (
        mySchedules.map((schedule) => (
          <div key={schedule._id} className="schedule-card">
            <div className="card-header">
              <h3>{schedule.paketId?.paketKursus ?? 'Paket Kursus'} - {schedule.paketId?.jenisKendaraan ?? ''}</h3>
            </div>
            <div className="card-body">
              <div className="detail-item">
                <strong>Tanggal Mulai:</strong>
                <p>{new Date(schedule.tanggalMulai).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="detail-item">
                <strong>Jam Default:</strong>
                <p>{schedule.jam}</p>
              </div>
              {schedule.instrukturId?.nama && (
                <div className="detail-item">
                  <strong>Instruktur:</strong>
                  <p>{schedule.instrukturId.nama}</p>
                </div>
              )}
              {schedule.instrukturId?.nopolKendaraan && (
                <div className="detail-item">
                  <strong>Plat Mobil:</strong>
                  <p>{schedule.instrukturId.nopolKendaraan}</p>
                </div>
              )}
              {schedule.customerId?.alamat && (
                <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                  <strong>Alamat Jemput:</strong>
                  <p>{schedule.customerId.alamat}</p>
                </div>
              )}
              <div className={`status-banner ${getStatusClass(schedule.statusPembayaran)}`}>
                <strong>Status Pembayaran:</strong> {schedule.statusPembayaran}
              </div>
              <div className="action-area">
                {schedule.statusPembayaran === 'Belum Bayar' && (
                  <>
                    {schedule.paymentDueDate && <CountdownTimer expiryDate={schedule.paymentDueDate} />}
                    <Link to={`/bayar/${schedule._id}`}>
                      <button className="action-button button-bayar">Bayar Sekarang</button>
                    </Link>
                  </>
                )}
                {schedule.statusPembayaran === 'Ditolak' && (
                  <>
                    {schedule.jumlahPenolakan >= 3 ? (
                      <>
                        <p style={{ color: 'red', margin: '0 0 10px 0' }}>Pendaftaran ini telah dibatalkan.</p>
                        <Link to="/cek-jadwal">
                          <button className="action-button button-daftar-baru">Daftar Kursus Baru</button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <p style={{ color: 'red', margin: '0 0 10px 0' }}>Pembayaran Anda ditolak (percobaan ke-{schedule.jumlahPenolakan} dari 3).</p>
                        <Link to={`/bayar/${schedule._id}`}>
                          <button className="action-button button-upload-ulang">Upload Ulang Bukti Bayar</button>
                        </Link>
                      </>
                    )}
                  </>
                )}
                {schedule.statusPembayaran === 'Menunggu Verifikasi' && (
                  <p style={{ color: '#6c757d' }}>Silakan tunggu, pembayaran Anda sedang kami periksa. Silakan Periksa Spam Gmail Anda untuk Konfirmasi </p>
                )}
              </div>
              {schedule.statusPembayaran === 'Lunas' && schedule.jadwalSesi && schedule.jadwalSesi.length > 0 && (
                <div className="session-table-wrapper">
                  <h4>Detail Sesi Belajar:</h4>
                  <p>Silakan menghubungi Admin untuk Perubahan Jadwal: <strong>Nissa 0895-3830-93463</strong></p>
                  <p>Jika Anda mengambil Paket Complete, Silakan menghubungi Admin untuk Pengurusan SIM</p>
                  <p>Invoice pembayaran Anda telah dikirimkan ke email. Silakan periksa folder utama Gmail atau spam.</p>
                  <table className="session-table">
                    <thead><tr><th>Sesi</th><th>Tanggal</th><th>Jam</th></tr></thead>
                    <tbody>
                      {schedule.jadwalSesi.map((sesi, index) => (
                        <tr key={sesi._id}>
                          <td className="session-number">{index + 1}</td>
                          <td>{new Date(sesi.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</td>
                          <td>{sesi.jam}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MySchedule;