import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManageInstructors.css'; // Pastikan file CSS ini ada di folder yang sama
const API_BACKEND = 'https://backendsja-890420967859.asia-southeast2.run.app/'

const initialState = {
  nama: '',
  jenisKelamin: 'Pria',
  usia: '',
  noTelepon: '',
  nopolKendaraan: '',
  tipeMobil: 'Manual',
};

const ManageInstructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentInstructor, setCurrentInstructor] = useState(initialState);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BACKEND}/api/instruktur`);
      setInstructors(response.data);
    } catch (err) {
      setError('Gagal memuat data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const openModal = (mode, instructor = null) => {
    setModalMode(mode);
    if (mode === 'edit' && instructor) {
      setCurrentInstructor(instructor);
    } else {
      setCurrentInstructor(initialState);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCurrentInstructor({ ...currentInstructor, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = modalMode === 'add'
      ? `${API_BACKEND}/api/instruktur`
      : `${API_BACKEND}/api/instruktur/${currentInstructor._id}`;
    const method = modalMode === 'add' ? 'post' : 'patch';

    try {
      await axios[method](url, currentInstructor, {
        headers: { 'x-auth-token': token },
      });
      alert(`Instruktur berhasil di-${modalMode === 'add' ? 'tambahkan' : 'perbarui'}!`);
      closeModal();
      fetchInstructors();
    } catch (err) {
      alert('Terjadi kesalahan. Pastikan semua data unik (seperti Nopol) tidak sama.');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus instruktur ini?')) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`${API_BACKEND}/api/instruktur/${id}`, {
          headers: { 'x-auth-token': token },
        });
        alert('Instruktur berhasil dihapus.');
        fetchInstructors();
      } catch (err) {
        setError('Gagal menghapus instruktur.');
        console.error(err);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <h1>Kelola Instruktur</h1>
        <button className="button button-primary" onClick={() => openModal('add')}>
          + Tambah Instruktur Baru
        </button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{modalMode === 'add' ? 'Tambah Instruktur Baru' : 'Edit Instruktur'}</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group-full">
                <input type="text" name="nama" value={currentInstructor.nama} onChange={handleFormChange} placeholder="Nama Lengkap" required />
              </div>
              <div>
                <input type="number" name="usia" value={currentInstructor.usia} onChange={handleFormChange} placeholder="Usia" required />
              </div>
              <div>
                <select name="jenisKelamin" value={currentInstructor.jenisKelamin} onChange={handleFormChange}>
                  <option value="Pria">Pria</option>
                  <option value="Wanita">Wanita</option>
                </select>
              </div>
              <div className="form-group-full">
                <input type="text" name="noTelepon" value={currentInstructor.noTelepon} onChange={handleFormChange} placeholder="No. Telepon" required />
              </div>
              <div>
                <input type="text" name="nopolKendaraan" value={currentInstructor.nopolKendaraan} onChange={handleFormChange} placeholder="Nopol Kendaraan" required />
              </div>
              <div>
                <select name="tipeMobil" value={currentInstructor.tipeMobil} onChange={handleFormChange}>
                  <option value="Manual">Manual</option>
                  <option value="Matic">Matic</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="button button-secondary" onClick={closeModal}>Batal</button>
                <button type="submit" className="button button-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-wrapper">
        {/* Kode Tabel di bawah ini sama persis dengan kode Anda */}
        <table className="styled-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Usia</th>
              <th>No. Telepon</th>
              <th>Tipe Mobil</th>
              <th>Nopol Kendaraan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {instructors.map((instructor) => (
              <tr key={instructor._id}>
                <td>{instructor.nama}</td>
                <td>{instructor.usia}</td>
                <td>{instructor.noTelepon}</td>
                <td>{instructor.tipeMobil}</td>
                <td>{instructor.nopolKendaraan}</td>
                <td className="action-cell">
                  <button className="button button-edit" onClick={() => openModal('edit', instructor)}>Edit</button>
                  <button className="button button-delete" onClick={() => handleDelete(instructor._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageInstructors;