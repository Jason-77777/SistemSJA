import React from 'react';
import { Link } from 'react-router-dom';
import './CourseInfo.css';
import { FaBookOpen, FaCar, FaSimCard, FaClock, FaShuttleVan, FaQuestionCircle } from 'react-icons/fa';

const CourseInfo = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1><FaBookOpen style={{ color: '#007bff' }} /> Informasi Kursus & Paket</h1>
        <p>Pahami layanan kami sebelum Anda memilih paket belajar.</p>
      </div>

      <div className="info-section">
        <h2>Memahami Pilihan Paket</h2>
        <div className="info-grid">
          <div className="info-card">
            <h3><FaCar style={{ color: '#fd7e14' }} /> Reguler</h3>
            <p>Paket kursus mengemudi standar hingga mahir.</p>
          </div>
          <div className="info-card">
            <h3><FaSimCard style={{ color: '#20c997' }} /> Complete</h3>
            <p>Paket kursus mengemudi lengkap dengan bantuan pengurusan SIM A.</p>
          </div>
          {/* <div className="info-card">
            <h3><FaUsers style={{ color: '#6f42c1' }} /> Duo</h3>
            <p>Paket hemat untuk 2 siswa yang belajar bersama dengan jadwal yang sama.</p>
          </div> */}
        </div>
        {/* <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#6c757d' }}>
          <strong>Catatan:</strong> Paket "Duo Reguler" berarti kursus untuk 2 siswa, sedangkan "Duo Complete" berarti kursus dan pengurusan SIM untuk 2 siswa.
        </p> */}
      </div>

      <div className="info-section">
        <h2>Informasi Penting & SOP</h2>
        <div className="info-grid">
          <div className="info-card">
            <h3><FaClock style={{ color: '#17a2b8' }} /> Durasi Belajar</h3>
            <p>Setiap sesi pertemuan berdurasi 2 jam. Total jam dan hari belajar bervariasi tergantung paket yang Anda pilih nanti.</p>
          </div>
          <div className="info-card">
            <h3><FaShuttleVan style={{ color: '#343a40' }} /> Sistem Antar-Jemput</h3>
            <p>Kami menyediakan layanan antar-jemput ke lokasi yang tertera di alamat pendaftaran Anda. Pastikan alamat sudah benar.</p>
          </div>
          <div className="info-card">
            <h3><FaQuestionCircle style={{ color: '#28a745' }} /> Bantuan & Pertanyaan</h3>
            <p>Jika ada kesalahan alamat atau pertanyaan lain, silakan langsung hubungi Admin kami (Nissa) di nomor 0895-3830-93463.</p>
          </div>
        </div>
      </div>
      
      <div className="action-footer">
        <h2>Siap Memulai?</h2>
        <p>Sekarang Anda sudah paham, mari lihat detail harga dan pilih paket yang paling cocok untuk Anda.</p>
        <Link to="/cek-jadwal" className="cta-button">
          Lihat Detail & Harga Paket
        </Link>
      </div>
    </div>
  );
};

export default CourseInfo;