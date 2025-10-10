import React, { useState } from 'react';
import api from '../api'; // DIUBAH: Menggunakan file api.js
import { useNavigate, Link } from 'react-router-dom';
import '../styles/AuthForm.css';
import logoSJA from '../assets/logo-sja.png'; 

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '', password: '', email: '', namaLengkap: '', 
    usia: '', jenisKelamin: '', noTelepon: '', alamat: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { username, password, email, namaLengkap, usia, jenisKelamin, noTelepon, alamat } = formData;
  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // DIUBAH: Menggunakan 'api' bukan 'axios'
      await api.post('/api/users/register', formData);
      
      setSuccess('Registrasi berhasil! Anda akan dialihkan ke halaman login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Registrasi gagal. Pastikan semua data benar.');
      console.error(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-wrapper">
        <div className='auth-header'>
          <img src={logoSJA} alt="Logo SJA" className="auth-logo" />
          <h1>Buat Akun Baru</h1>
          <p>Sudah punya akun? <Link to="/login">Login di sini</Link></p>
        </div>

        {error && <div className="notification error">{error}</div>}
        {success && <div className="notification success">{success}</div>}

        <form onSubmit={onSubmit}>
          <div className="input-group">
            <input type="text" placeholder="Username" name="username" className="input-field" value={username} onChange={onChange} required />
          </div>
          <div className="input-group">
            <input type="password" placeholder="Password" name="password" className="input-field" value={password} onChange={onChange} required />
          </div>
          <div className="input-group">
            <input type="email" placeholder="Email" name="email" className="input-field" value={email} onChange={onChange} required />
          </div>
          <div className="input-group">
            <input type="text" placeholder="Nama Lengkap" name="namaLengkap" className="input-field" value={namaLengkap} onChange={onChange} required />
          </div>
          <div className="input-group">
            <input type="number" placeholder="Usia" name="usia" className="input-field" value={usia} onChange={onChange} required />
          </div>
          <div className="input-group">
            <select name="jenisKelamin" className="auth-select-field" value={jenisKelamin} onChange={onChange} required>
              <option value="">Pilih Jenis Kelamin</option>
              <option value="Pria">Pria</option>
              <option value="Wanita">Wanita</option>
            </select>
          </div>
          <div className="input-group">
            <input type="text" placeholder="No. Telepon" name="noTelepon" className="input-field" value={noTelepon} onChange={onChange} required />
          </div>
          <div className="input-group">
            <input type="text" placeholder="Alamat Jemput" name="alamat" className="input-field" value={alamat} onChange={onChange} required />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Memproses...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;