import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api'; // Menggunakan file api.js
import './RegistrationForm.css';

const RegistrationForm = () => {
  const { date, time, jenisKendaraan } = useParams();
  const navigate = useNavigate();
  const [masterPackages, setMasterPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    jenisHari: '', paketKursus: '', jumlahSiswaBelajar: '', selectedPackageId: ''
  });

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        // --- DIUBAH: Menggunakan 'api' dan path tanpa '/' di depan ---
        const response = await api.get('api/paket');
        const filtered = response.data.filter(pkg => pkg.jenisKendaraan === jenisKendaraan);
        setMasterPackages(filtered);
      } catch (error) {
        console.error("Gagal memuat paket belajar:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, [jenisKendaraan]);

  const getUniqueOptions = (key) => {
    const options = masterPackages
      .filter(pkg =>
        (filters.jenisHari ? pkg.jenisHari === filters.jenisHari : true) &&
        (filters.paketKursus ? pkg.paketKursus === filters.paketKursus : true) &&
        (filters.jumlahSiswaBelajar ? pkg.jumlahSiswaBelajar === filters.jumlahSiswaBelajar : true)
      )
      .map(pkg => pkg[key]);
    return [...new Set(options)];
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    if (name === 'jenisHari') {
      newFilters.paketKursus = ''; newFilters.jumlahSiswaBelajar = ''; newFilters.selectedPackageId = '';
    }
    if (name === 'paketKursus') {
      newFilters.jumlahSiswaBelajar = ''; newFilters.selectedPackageId = '';
    }
    if (name === 'jumlahSiswaBelajar') {
      newFilters.selectedPackageId = '';
    }
    setFilters(newFilters);
  };
  
  const finalPackage = masterPackages.find(pkg => pkg._id === filters.selectedPackageId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!finalPackage) {
      alert("Silakan pilih paket hingga selesai.");
      return;
    }
    setIsSubmitting(true);
    try {
      // --- DIUBAH: Menggunakan 'api' dan path tanpa '/' di depan ---
      const checkRes = await api.post('api/jadwal/check-booking', {
        paketId: finalPackage._id, startDate: date, jam: time, jenisKendaraan: jenisKendaraan,
      });

      if (!checkRes.data.available) {
        alert(`Maaf, jadwal konflik: ${checkRes.data.message}`);
        setIsSubmitting(false);
        return;
      }
      
      // --- DIUBAH: Menggunakan 'api' dan path tanpa '/' di depan ---
      const daftarRes = await api.post('api/daftar', {
        paketId: finalPackage._id, startDate: date, jam: time, jenisKendaraan: jenisKendaraan,
      });

      alert(daftarRes.data.message);
      navigate('/jadwalku');
    } catch (error) {
      alert(error.response?.data?.message || 'Terjadi kesalahan saat mendaftar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="page-container">
      <div className="registration-header">
        <h1>Formulir Pendaftaran Kursus</h1>
        <div className="schedule-selection">
          <p>Jadwal Pilihan Anda:</p>
          <h2>{formattedDate}, Jam {time}</h2>
        </div>
      </div>

      {loading ? <p>Memuat paket belajar...</p> : (
        <form onSubmit={handleSubmit} className="package-selection-form">
          <div className="form-step">
            <label>1. Pilih Hari Belajar:</label>
            <select name="jenisHari" value={filters.jenisHari} onChange={handleFilterChange}>
              <option value="">-- Pilih Hari --</option>
              {getUniqueOptions('jenisHari').map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          {filters.jenisHari && (
            <div className="form-step">
              <label>2. Pilih Jenis Paket:</label>
              <select name="paketKursus" value={filters.paketKursus} onChange={handleFilterChange}>
                <option value="">-- Pilih Paket --</option>
                {getUniqueOptions('paketKursus').map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          )}

          {filters.paketKursus && (
            <div className="form-step">
              <label>3. Pilih Jumlah Siswa:</label>
              <select name="jumlahSiswaBelajar" value={filters.jumlahSiswaBelajar} onChange={handleFilterChange}>
                <option value="">-- Pilih Jumlah Siswa --</option>
                {getUniqueOptions('jumlahSiswaBelajar').map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          )}
          
          {filters.jumlahSiswaBelajar && (
            <div className="form-step">
              <label>4. Pilih Durasi & Harga:</label>
              <select name="selectedPackageId" value={filters.selectedPackageId} onChange={handleFilterChange}>
                <option value="">-- Pilih Durasi --</option>
                {masterPackages
                  .filter(pkg => 
                    pkg.jenisHari === filters.jenisHari && 
                    pkg.paketKursus === filters.paketKursus && 
                    pkg.jumlahSiswaBelajar === filters.jumlahSiswaBelajar
                  )
                  .map(pkg => (
                    <option key={pkg._id} value={pkg._id}>
                      {pkg.durasiKursus} (Rp {new Intl.NumberFormat('id-ID').format(pkg.harga)})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {finalPackage && (
            <div className="summary-card">
              <h3>Ringkasan Pendaftaran</h3>
              <p><strong>Jadwal:</strong> {formattedDate}, Jam {time}</p>
              <p><strong>Kendaraan:</strong> {jenisKendaraan}</p>
              <p><strong>Paket:</strong> {finalPackage.paketKursus} - {finalPackage.durasiKursus}</p>
              <p><strong>Total Bayar:</strong> Rp {new Intl.NumberFormat('id-ID').format(finalPackage.harga)}</p>
              <p>Pembayaran yang diunggah di luar jam kerja <strong>(Senin-sabtu jam 8.00-17.00)</strong> akan diverifikasi pada hari kerja berikutnya.</p>
              <button type="submit" className="submit-button" disabled={isSubmitting}>
                {isSubmitting ? 'Memproses...' : 'Daftar Sekarang & Pesan Jadwal'}
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default RegistrationForm;