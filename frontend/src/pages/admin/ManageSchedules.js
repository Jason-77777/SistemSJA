import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './ManageSchedules.css';
const API_BACKEND = 'https://backendsja-890420967859.asia-southeast2.run.app/'

const timeSlotsOptions = [
  "08:00-10:00", "10:00-12:00", "12:00-14:00",
  "14:00-16:00", "16:00-18:00", "18:00-20:00"
];

const initialFormState = {
  instrukturId: '',
  startDate: '',
  endDate: '',
  timeSlots: [],
  skipDays: [0],
};

const ManageSchedules = () => {
  const [allSchedules, setAllSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [groupedSchedules, setGroupedSchedules] = useState({});
  const [instructors, setInstructors] = useState([]);
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatorForm, setGeneratorForm] = useState(initialFormState);
  const [showTukarModal, setShowTukarModal] = useState(false);
  const [selectedFullSchedule, setSelectedFullSchedule] = useState(null);
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const fetchAllSchedules = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BACKEND}/api/jadwal`, {
        headers: { 'x-auth-token': token }
      });
      setAllSchedules(response.data);
    } catch (err) {
      setError('Gagal memuat data jadwal.');
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BACKEND}/api/instruktur`);
        setInstructors(res.data);
        if (res.data.length > 0) {
          const defaultId = res.data[0]._id;
          setGeneratorForm(prev => ({ ...prev, instrukturId: defaultId }));
          initialFormState.instrukturId = defaultId;
        }
        await fetchAllSchedules();
      } catch (err) {
        setError("Gagal memuat data awal.");
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const filtered = allSchedules.filter(
      (schedule) => new Date(schedule.tanggal).toDateString() === selectedDate.toDateString()
    );
    const grouped = filtered.reduce((acc, schedule) => {
      const instructorName = schedule.instrukturId ? schedule.instrukturId.nama : 'Tanpa Instruktur';
      if (!acc[instructorName]) acc[instructorName] = [];
      acc[instructorName].push(schedule);
      return acc;
    }, {});
    setGroupedSchedules(grouped);
  }, [allSchedules, selectedDate]);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchAllSchedules();
    setGroupedSchedules({});
    setLoading(false);
    alert("Data jadwal telah diperbarui.");
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleStatusChange = async (scheduleId, newStatus) => {
    if (!window.confirm(`Anda yakin ingin mengubah status jadwal ini menjadi "${newStatus}"?`)) {
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BACKEND}/api/jadwal/${scheduleId}`, { status: newStatus }, { headers: { 'x-auth-token': token } });
      await fetchAllSchedules();
      alert('Status jadwal berhasil diperbarui!');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memperbarui status.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scheduleId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus jadwal ini secara permanen?')) {
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BACKEND}/api/jadwal/${scheduleId}`, {
        headers: { 'x-auth-token': token }
      });
      alert('Jadwal berhasil dihapus!');
      await fetchAllSchedules(); 
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus jadwal.');
    } finally {
      setLoading(false);
    }
  };
 
  const handleGeneratorChange = (e) => {
    setGeneratorForm({ ...generatorForm, [e.target.name]: e.target.value });
  };

  const handleTimeSlotChange = (e) => {
    const { value, checked } = e.target;
    let newTimeSlots = [...generatorForm.timeSlots];
    if (checked) { newTimeSlots.push(value); } else { newTimeSlots = newTimeSlots.filter(slot => slot !== value); }
    setGeneratorForm({ ...generatorForm, timeSlots: newTimeSlots });
  };

  const handleGeneratorSubmit = async (e) => {
    e.preventDefault();
    if (!generatorForm.instrukturId || !generatorForm.startDate || !generatorForm.endDate || generatorForm.timeSlots.length === 0) {
      alert('Semua field wajib diisi!');
      return;
    }
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const response = await axios.post(`${API_BACKEND}/api/jadwal/generate-bulk`, generatorForm, { headers: { 'x-auth-token': token } });
      alert(response.data.message);
      setShowGenerator(false);
      setGeneratorForm(initialFormState);
      document.querySelectorAll('input[type=checkbox]').forEach(el => el.checked = false);
      await fetchAllSchedules();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membuat jadwal.');
    } finally {
      setLoading(false);
    }
  };

  const handleKelolaClick = (schedule) => {
    setSelectedFullSchedule(schedule);
    setShowTukarModal(true);
    setAvailableSchedules([]);
    setCalendarDate(new Date());
  };

  const handleCalendarPick = (date) => {
    setCalendarDate(date);
    if (!selectedFullSchedule?.instrukturId?._id) {
      alert("Data instruktur pada jadwal yang dipilih tidak valid.");
      return;
    }
    const filtered = allSchedules.filter((s) =>
      s.instrukturId?._id === selectedFullSchedule.instrukturId._id &&
      s.status === 'Tersedia' &&
      new Date(s.tanggal).toDateString() === date.toDateString()
    );
    setAvailableSchedules(filtered);
  };

  const handleKelolaPickSlot = async (newSchedule) => {
    try {
      if (!newSchedule || !newSchedule._id) {
        alert("Jadwal baru yang dipilih tidak valid.");
        return;
      }
      const token = localStorage.getItem('token');
      const resp = await axios.get(`${API_BACKEND}/api/daftar/all-for-admin`, { headers: { 'x-auth-token': token } });
      const daftarList = resp.data;
      const found = daftarList.find(d => d.jadwalSesi?.some(id => id._id.toString() === selectedFullSchedule._id));
      if (!found) {
        alert('Pendaftaran terkait tidak ditemukan. Tidak dapat melanjutkan proses tukar.');
        return;
      }
      const pendaftaranId = found._id;
      const payload = {
        jadwalLamaId: selectedFullSchedule._id,
        jadwalBaruId: newSchedule._id
      };
      if (!pendaftaranId || !payload.jadwalLamaId || !payload.jadwalBaruId) {
        alert("FATAL: Ada data ID yang kosong sebelum dikirim. Proses dibatalkan. Cek console log.");
        console.error({ pendaftaranId, ...payload });
        return;
      }
      await axios.patch(`${API_BACKEND}/api/sesi/${pendaftaranId}/tukar`, payload, { headers: { 'x-auth-token': token } });
      alert('Sesi berhasil ditukar!');
      setShowTukarModal(false);
      await fetchAllSchedules();
    } catch (err) {
      console.error("Error detail saat menukar sesi:", err);
      if (err.response) {
        alert(`Server Error: ${err.response.data.message || 'Terjadi kesalahan di server.'}`);
      } else {
        alert('Terjadi kesalahan di aplikasi. Cek console log untuk detail.');
      }
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month' && allSchedules.some((schedule) => new Date(schedule.tanggal).toDateString() === date.toDateString())) {
      return 'has-schedule';
    }
    return null;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <h1>Kelola Jadwal</h1>
        <button className="primary-button" onClick={handleRefresh}>Refresh Data</button>
      </div>

      <button className="primary-button" onClick={() => setShowGenerator(!showGenerator)} style={{ marginBottom: '24px' }}>
        {showGenerator ? 'Tutup Form' : 'Tambah Jadwal Baru'}
      </button>

      {showGenerator && (
        <div className="page-section">
          <h3>Generate Jadwal Massal</h3>
          <form onSubmit={handleGeneratorSubmit} style={{ display: 'grid', gap: '10px' }}>
            <label>Pilih Instruktur:
              <select name="instrukturId" value={generatorForm.instrukturId} onChange={handleGeneratorChange}>
                {instructors.map(inst => <option key={inst._id} value={inst._id}>{inst.nama} ({inst.tipeMobil})</option>)}
              </select>
            </label>
            <label>Tanggal Mulai: <input type="date" name="startDate" onChange={handleGeneratorChange} required /></label>
            <label>Tanggal Selesai: <input type="date" name="endDate" onChange={handleGeneratorChange} required /></label>
            <div>
              <p>Pilih Slot Jam:</p>
              {timeSlotsOptions.map(slot => (
                <label key={slot} style={{ marginRight: '15px' }}>
                  <input type="checkbox" value={slot} onChange={handleTimeSlotChange} /> {slot}
                </label>
              ))}
            </div>
            <button type="submit" className="primary-button">Generate Jadwal</button>
          </form>
        </div>
      )}
      
      <div className="page-section">
        <div className="admin-calendar-container">
          <Calendar
            onClickDay={handleDateClick}
            value={selectedDate}
            tileClassName={tileClassName}
          />
        </div>
      </div>

      {Object.keys(groupedSchedules).length > 0 && (
        <div className="page-section schedule-table-wrapper">
          <h3>Detail Jadwal untuk {selectedDate.toLocaleDateString('id-ID')}</h3>
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Instruktur</th>
                <th>Jam</th>
                <th>Kendaraan</th>
                <th>Nama Customer</th>
                <th>Alamat Jemput</th>
                <th>No Telepon</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedSchedules).map(([instructorName, schedules]) => (
                schedules.map((schedule, index) => (
                  <tr key={schedule._id}>
                    {index === 0 && <td rowSpan={schedules.length}>{instructorName}</td>}
                    <td>{schedule.jam}</td>
                    <td>{schedule.jenisKendaraan}</td>
                    <td>{schedule.customer ? schedule.customer.namaLengkap : '-'}</td>
                    <td>{schedule.customer ? schedule.customer.alamat : '-'}</td>
                    <td>{schedule.customer ? schedule.customer.noTelepon : '-'}</td>
                    <td className="status-cell">
                      <span className={
                        schedule.status === 'Tersedia' ? 'status-tersedia' :
                        schedule.status === 'Penuh' ? 'status-penuh' : 'status-pending'
                      }>
                        {schedule.status}
                      </span>
                    </td>
                    <td>
                      {schedule.status === 'Penuh' || schedule.status === 'Pending' ? (
                        <button onClick={() => handleKelolaClick(schedule)}>Kelola</button>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <select
                            defaultValue={schedule.status}
                            onChange={(e) => handleStatusChange(schedule._id, e.target.value)}
                            style={{ padding: '5px', cursor: 'pointer' }}
                          >
                            <option value="Tersedia">Tersedia</option>
                            <option value="Pending">Pending</option>
                            <option value="Penuh">Penuh</option>
                          </select>
                          <button
                            onClick={() => handleDelete(schedule._id)}
                            style={{
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '5px 10px',
                              cursor: 'pointer'
                            }}
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showTukarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowTukarModal(false)}>X</button>
            <h3>Pilih Jadwal Baru untuk {selectedFullSchedule.jam} ({new Date(selectedFullSchedule.tanggal).toLocaleDateString('id-ID')})</h3>
            <Calendar onClickDay={handleCalendarPick} value={calendarDate} />
            <h4 style={{marginTop: '20px'}}>Jadwal Tersedia:</h4>
            {availableSchedules.length === 0 && <p>Tidak ada jadwal tersedia di tanggal ini.</p>}
            <ul>
              {availableSchedules.map((s) => (
                <li key={s._id} style={{ cursor: 'pointer', padding: '8px', border: '1px solid #ccc', margin: '5px 0', borderRadius: '4px' }}
                  onClick={() => handleKelolaPickSlot(s)}
                >
                  {s.jam} - {s.jenisKendaraan}
                </li>
              ))}
            </ul>
            <button onClick={() => setShowTukarModal(false)} style={{marginTop: '15px', padding: '10px', width: '100%'}}>Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSchedules;