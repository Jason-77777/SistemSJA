import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaCalendarAlt, FaUserTie, FaBoxOpen, FaCreditCard, FaSignOutAlt, FaPrint} from 'react-icons/fa'; // Menambahkan ikon
import '../index.css';

  const styles = {
    adminLayout: {
      display: 'flex',
      backgroundColor: '#f8f9fa', 
    },
    sidebar: {
      width: '250px',
      background: '#808b96ff', 
      color: '#ecf0f1', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 10px',
    },
    sidebarHeader: {
      padding: '0 10px 20px 10px',
      fontSize: '24px',
      fontWeight: 'bold',
      textAlign: 'center',
      borderBottom: '1px solid #34495e',
    },
    nav: {
      flexGrow: 1, 
      marginTop: '20px',
    },
    navList: {
      listStyleType: 'none',
      padding: 0,
      margin: 0,
    },
    navLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: '#ecf0f1',
      textDecoration: 'none',
      padding: '12px 20px',
      borderRadius: '6px',
      marginBottom: '8px',
      transition: 'background-color 0.2s',
    },
    navLinkActive: {
      backgroundColor: '#3498db', 
      color: '#ffffff',
      fontWeight: '500',
    },
    logoutButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: 'none',
      border: 'none',
      color: '#ecf0f1',
      padding: '12px 20px',
      width: '100%',
      textAlign: 'left',
      cursor: 'pointer',
      fontSize: '16px',
      borderRadius: '6px',
      marginTop: '20px',
    },
    mainContent: {
      flex: 1,
      padding: '24px',
      overflowY: 'auto', 
    },
  };

  const AdminLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      alert('Anda telah logout.');
      navigate('/login');
    };

    return (
      <div style={styles.adminLayout}>
        {/* Sidebar Navigasi Admin */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            Admin Panel
          </div>
          <nav style={styles.nav}>
            <ul style={styles.navList}>
              <li><NavLink to="/admin/dashboard" style={({ isActive }) => ({ ...styles.navLink, ...(isActive && styles.navLinkActive) })}><FaTachometerAlt /> Dashboard</NavLink></li>
              <li><NavLink to="/admin/jadwal" style={({ isActive }) => ({ ...styles.navLink, ...(isActive && styles.navLinkActive) })}><FaCalendarAlt /> Kelola Jadwal</NavLink></li>
              <li><NavLink to="/admin/instruktur" style={({ isActive }) => ({ ...styles.navLink, ...(isActive && styles.navLinkActive) })}><FaUserTie /> Kelola Instruktur</NavLink></li>
              <li><NavLink to="/admin/paket" style={({ isActive }) => ({ ...styles.navLink, ...(isActive && styles.navLinkActive) })}><FaBoxOpen /> Kelola Paket</NavLink></li>
              <li><NavLink to="/admin/verifikasi" style={({ isActive }) => ({ ...styles.navLink, ...(isActive && styles.navLinkActive) })}><FaCreditCard /> Verifikasi Bayar</NavLink></li>
              <li><NavLink to="/admin/laporan" style={({ isActive }) => ({ ...styles.navLink, ...(isActive && styles.navLinkActive) })}><FaPrint /> Cetak Laporan</NavLink></li>
            </ul>
          </nav>
          <button style={styles.logoutButton} onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
        <main style={styles.mainContent}>
          <Outlet />
        </main>
      </div>
    );
  };

  export default AdminLayout;