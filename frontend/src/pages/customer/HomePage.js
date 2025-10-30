import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; 
import heroImage from '../../assets/hero-background.jpg';
import carImage from '../../assets/adi.jpg';
import officeImage from '../../assets/feature-office.jpg';

const HomePage = () => {
  return (
    <div>
      <section 
        className="hero-section" 
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="hero-content">
          <h1>Belajar Mengemudi dengan Percaya Diri</h1>
          <p>Instruktur berpengalaman, handal, dan layanan antar-jemput untuk kenyamanan Anda.</p>
          <Link to="/informasi-kursus" className="hero-cta-button">
            Lihat Paket Kursus
          </Link>
        </div>
      </section>

      <section className="features-section">
        <h2>Kenapa Memilih SJA Kursus?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-image-container">
              <img src={carImage} alt="Mobil Kursus" className="feature-image" />
            </div>
            <h3>Armada Modern & Terawat</h3>
            <p>Semua mobil kami (Manual & Matic) dalam kondisi prima untuk menjamin keamanan dan kenyamanan Anda selama belajar.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-image-container">
              <img src={officeImage} alt="Kantor SJA" className="feature-image" />
            </div>
            <h3>Instruktur Profesional</h3>
            <p>Instruktur kami sabar dan berpengalaman untuk memandu Anda hingga mahir dengan metode yang efektif.</p>
          </div>

          <div className="feature-card">
             <div className="feature-image-container">
               <img src={heroImage} alt="Suasana Belajar" className="feature-image" />
            </div>
            <h3>Jadwal Fleksibel</h3>
            <p>Pilih jadwal belajar Anda sendiri. Kami siap melayani dari hari Senin hingga Sabtu sesuai ketersediaan.</p>
          </div>
        </div>
      </section>

      <section className="final-cta-section">
        <h2>Siap Memulai Perjalanan Anda?</h2>
        <p>Ratusan siswa telah berhasil mahir mengemudi bersama kami. Kini giliran Anda!</p>
        <Link to="/informasi-kursus" className="hero-cta-button">
          Daftar Sekarang
        </Link>
      </section>
    </div>
  );
};

export default HomePage;