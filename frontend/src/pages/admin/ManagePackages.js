import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManagePackages.css'; // File CSS baru
const API_BACKEND = 'https://backendsja-890420967859.asia-southeast2.run.app/'

const initialState = {
  jenisKendaraan: 'Manual',
  jenisHari: 'Senin-Sabtu',
  paketKursus: 'Reguler',
  jumlahSiswaBelajar: '1 Siswa',
  durasiKursus: '',
  harga: '',
};

const ManagePackages = () => {
  // --- STATE MANAGEMENT ---
  const [allPackages, setAllPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [filter, setFilter] = useState('Semua'); // State untuk filter: 'Semua', 'Manual', 'Matic'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentPackage, setCurrentPackage] = useState(initialState);

  // --- DATA FETCHING & FILTERING ---
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BACKEND}/api/paket`);
      setAllPackages(response.data);
    } catch (err) {
      setError('Gagal memuat data paket.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    // Efek ini berjalan setiap kali filter atau data utama berubah
    if (filter === 'Semua') {
      setFilteredPackages(allPackages);
    } else {
      const filtered = allPackages.filter(p => p.jenisKendaraan === filter);
      setFilteredPackages(filtered);
    }
  }, [filter, allPackages]);

  // --- EVENT HANDLERS (MODAL, FORM, DELETE) ---
  const openModal = (mode, pkg = null) => {
    setModalMode(mode);
    if (mode === 'edit' && pkg) {
      setCurrentPackage(pkg);
    } else {
      setCurrentPackage(initialState);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCurrentPackage({ ...currentPackage, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = modalMode === 'add' ? `${API_BACKEND}/api/paket` : `${API_BACKEND}/api/paket/${currentPackage._id}`;
    const method = modalMode === 'add' ? 'post' : 'patch';

    try {
      await axios[method](url, currentPackage, { headers: { 'x-auth-token': token } });
      alert(`Paket berhasil di-${modalMode === 'add' ? 'tambahkan' : 'perbarui'}!`);
      closeModal();
      fetchPackages();
    } catch (err) {
      alert('Terjadi kesalahan saat menyimpan paket.');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus paket ini?')) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`${API_BACKEND}/api/paket/${id}`, { headers: { 'x-auth-token': token } });
        alert('Paket berhasil dihapus.');
        fetchPackages();
      } catch (err) {
        setError('Gagal menghapus paket.');
        console.error(err);
      }
    }
  };

  // --- RENDER ---
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <h1>Kelola Paket Belajar</h1>
        <button className="button button-primary" onClick={() => openModal('add')}>
          + Tambah Paket Baru
        </button>
      </div>

      <div className="filter-container">
        <button className={`filter-button ${filter === 'Semua' ? 'active' : ''}`} onClick={() => setFilter('Semua')}>Semua</button>
        <button className={`filter-button ${filter === 'Manual' ? 'active' : ''}`} onClick={() => setFilter('Manual')}>Manual</button>
        <button className={`filter-button ${filter === 'Matic' ? 'active' : ''}`} onClick={() => setFilter('Matic')}>Matic</button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{modalMode === 'add' ? 'Tambah Paket Baru' : 'Edit Paket'}</h2>
            <form onSubmit={handleFormSubmit} className="paket-form">
              <select name="paketKursus" value={currentPackage.paketKursus} onChange={handleFormChange}>
                <option value="Reguler">Reguler</option>
                <option value="Complete">Complete</option>
                {/* <option value="Duo Reguler">Duo Reguler</option>
                <option value="Duo Complete">Duo Complete</option> */}
              </select>
              <select name="jenisKendaraan" value={currentPackage.jenisKendaraan} onChange={handleFormChange}>
                <option value="Manual">Manual</option>
                <option value="Matic">Matic</option>
              </select>
              <select name="jenisHari" value={currentPackage.jenisHari} onChange={handleFormChange}>
                <option value="Senin-Sabtu">Senin-Sabtu</option>
                {/* <option value="Libur Umum">Libur Umum</option> */}
              </select>
              <select name="jumlahSiswaBelajar" value={currentPackage.jumlahSiswaBelajar} onChange={handleFormChange}>
                <option value="1 Siswa">1 Siswa</option>
                {/* <option value="2 Siswa">2 Siswa</option> */}
              </select>
              <input type="text" name="durasiKursus" value={currentPackage.durasiKursus} onChange={handleFormChange} placeholder="Durasi (cth: 18 Jam (9 Hari))" required />
              <input type="number" name="harga" value={currentPackage.harga} onChange={handleFormChange} placeholder="Harga (cth: 2800000)" required />
              <div className="modal-actions">
                <button type="button" className="button button-secondary" onClick={closeModal}>Batal Simpan</button>
                <button type="submit" className="button button-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-wrapper">
        <table className="styled-table">
          <thead>
            <tr>
              <th>Paket Kursus</th>
              <th>Jenis Kendaraan</th>
              <th>Durasi</th>
              <th>Harga</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredPackages.map((pkg) => (
              <tr key={pkg._id}>
                <td>{pkg.paketKursus}</td>
                <td>{pkg.jenisKendaraan}</td>
                <td>{pkg.durasiKursus}</td>
                <td>Rp {new Intl.NumberFormat('id-ID').format(pkg.harga)}</td>
                <td className="action-cell">
                  <button className="button button-edit" onClick={() => openModal('edit', pkg)}>Edit</button>
                  <button className="button button-delete" onClick={() => handleDelete(pkg._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagePackages;