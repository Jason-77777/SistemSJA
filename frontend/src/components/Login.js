import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/AuthForm.css'; // Pastikan path ini benar
import { FaUser, FaLock } from 'react-icons/fa';
import logoSJA from '../assets/logo-sja.png'; 

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { username, password } = formData;
  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/users/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);

      if (res.data.role === 'admin' || res.data.role === 'direktur') {
        navigate('/admin/dashboard');
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Login gagal. Periksa kembali username dan password.');
      console.error(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='auth-container'>
      <div className='auth-form-wrapper'>
        <div className='auth-header'>
          <img src={logoSJA} alt="Logo SJA" className="auth-logo" />
          <h1>Selamat Datang</h1>
          <p>Belum punya akun? <Link to="/register">Daftar di sini</Link></p>
        </div>
        
        {error && <div className="notification error">{error}</div>}

        <form onSubmit={onSubmit}>
          <div className='input-group'>
            <FaUser className="input-icon" />
            <input
              type='text'
              placeholder='Username'
              name='username'
              className='input-field'
              value={username}
              onChange={onChange}
              required
            />
          </div>
          <div className='input-group'>
            <FaLock className="input-icon" />
            <input
              type='password'
              placeholder='Password'
              name='password'
              className='input-field'
              value={password}
              onChange={onChange}
              required
            />
          </div>
          <button type='submit' className='auth-button' disabled={loading}>
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;