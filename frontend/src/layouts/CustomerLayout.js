import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

import logoSJA from '../assets/logo-sja.png'; 

const styles = {
  pageWrapper: {
    fontFamily: "'Montserrat', sans-serif",
    backgroundColor: '#ffffff',
  },
  header: {
    padding: '0 24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    backgroundColor: 'white',
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  navContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: '1200px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
  },
  logoImage: {
    height: '40px', 
    width: '40px',
    borderRadius: '50%', 
  },
  logoText: {
    fontWeight: '700',
    fontSize: '24px',
    color: '#2c3e50',
  },
  navLinks: {
    display: 'flex',
    gap: '8px', 
  },
  navLink: {
    color: '#6c757d',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '16px',
    padding: '10px 20px', 
    borderRadius: '6px', 
    transition: 'background-color 0.2s, color 0.2s',
  },
  navLinkActive: {
    backgroundColor: '#007bff', 
    color: '#ffffff',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  mainContent: {
    backgroundColor: '#f8f9fa',
    minHeight: 'calc(100vh - 70px)',
  },
};

const CustomerLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    alert('Anda telah logout.');
    navigate('/login');
  };

  return (
    <div style={styles.pageWrapper}>
      <header style={styles.header}>
        <div style={styles.navContainer}>
          <NavLink to="/home" style={styles.logoContainer}>
            <img src={logoSJA} alt="Logo SJA" style={styles.logoImage} />
            <span style={styles.logoText}>SJA Kursus</span>
          </NavLink>
          <nav style={styles.navLinks}>
            <NavLink to="/home" style={({ isActive }) => ({ ...styles.navLink, ...(isActive && styles.navLinkActive) })}>Home</NavLink>
            <NavLink to="/cek-jadwal" style={({ isActive }) => ({ ...styles.navLink, ...(isActive && styles.navLinkActive) })}>Cek Jadwal</NavLink>
            <NavLink to="/jadwalku" style={({ isActive }) => ({ ...styles.navLink, ...(isActive && styles.navLinkActive) })}>Jadwalku</NavLink>
            <NavLink to="/informasi-kursus" style={({ isActive }) => ({ ...styles.navLink, ...(isActive && styles.navLinkActive) })}>Informasi Kursus</NavLink>
          </nav>
          <button style={styles.logoutButton} onClick={handleLogout}>Logout</button>
        </div>
      </header>
      
      <main style={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;