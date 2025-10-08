import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PaymentPage.css';
const API_BACKEND = 'https://backendsja-890420967859.asia-southeast2.run.app/'

const PaymentPage = () => {
  const { pendaftaranId } = useParams();
  const navigate = useNavigate();

  const [pendaftaran, setPendaftaran] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [nomorRekening, setNomorRekening] = useState('');
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchPendaftaran = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${API_BACKEND}/api/daftar/${pendaftaranId}`, {
          headers: { 'x-auth-token': token }
        });
        setPendaftaran(res.data);
      } catch (error) {
        console.error("Gagal memuat detail pendaftaran:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPendaftaran();
  }, [pendaftaranId]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !nomorRekening) {
      alert('Silakan isi nomor rekening dan pilih file bukti pembayaran.');
      return;
    }
    setIsUploading(true);
    const token = localStorage.getItem('token');
    
    const formData = new FormData();
    formData.append('buktiBayar', selectedFile);

    try {
      const uploadRes = await axios.post(`${API_BACKEND}/api/uploads`, formData, {
        headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' }
      });
      const buktiBayarURL = uploadRes.data.url;

      await axios.patch(`${API_BACKEND}/api/daftar/${pendaftaranId}/upload-bukti`, 
        { buktiBayarURL: buktiBayarURL, nomorRekeningPengirim: nomorRekening },
        { headers: { 'x-auth-token': token } }
      );

      alert('Upload bukti pembayaran berhasil! Mohon tunggu verifikasi dari admin.');
      navigate('/jadwalku');
    } catch (error) {
      console.error("Upload gagal:", error);
      alert('Upload bukti pembayaran gagal.');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <p style={{ textAlign: 'center', padding: '40px' }}>Memuat...</p>;
  if (!pendaftaran) return <p style={{ textAlign: 'center', padding: '40px' }}>Data pendaftaran tidak ditemukan.</p>;

  return (
    <div className="payment-page-container">
      <div className="payment-header">
        <h1>Konfirmasi Pembayaran</h1>
      </div>

      <div className="payment-instruction">
        <p>Silakan lakukan pembayaran sejumlah:</p>
        <h2 className="payment-amount">Rp {new Intl.NumberFormat('id-ID').format(pendaftaran.paketId?.harga ?? 0)}</h2>
        <p className="bank-details">Ke nomor rekening BCA: <strong>8371068686</strong> a/n CV Sumatera Jaya Abadi</p>
        <p className="bank-details">Dengan Subjek: <strong>Nama+Paket+Tanggal</strong></p>
        <p className="work-hours-note">
          Verifikasi dilakukan pada jam kerja (Senin-Sabtu, 08:00-17:00).
        </p>
      </div>
      
      <div className="upload-section">
        <h3>Unggah Bukti Pembayaran</h3>
        <p className="work-hours-note" style={{ textAlign: 'center', marginBottom: '24px', display: 'block' }}>
          Pembayaran yang diunggah di luar jam kerja akan diverifikasi pada hari kerja berikutnya.
        </p>
        
        <div className="form-group">
          <label htmlFor="nomorRekening">Nomor Rekening Pengirim:</label>
          <input 
            id="nomorRekening"
            type="text" 
            value={nomorRekening} 
            onChange={(e) => setNomorRekening(e.target.value)} 
            placeholder="Contoh: 1234567890"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="fileBukti">Pilih File Bukti Transfer:</label>
          <input 
            id="fileBukti"
            type="file" 
            onChange={handleFileChange} 
            accept="image/png, image/jpeg, image/jpg" 
          />
        </div>

        <button className="submit-button" onClick={handleUpload} disabled={isUploading}>
          {isUploading ? 'Mengunggah...' : 'Konfirmasi & Unggah Bukti'}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;