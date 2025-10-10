import React, { useState, useEffect } from 'react';
// import axios from 'axios'; // --- DIHAPUS ---
import api from '../../api'; // --- DIUBAH: Menggunakan file api.js ---
import Calendar from 'react-calendar';
import { useNavigate } from 'react-router-dom';
import 'react-calendar/dist/Calendar.css';
import './CheckSchedule.css'; // Pastikan path ini benar
import { FaCalendarAlt, FaCar, FaClock } from 'react-icons/fa'; // Import Ikon
import {Link } from 'react-router-dom';
// const API_BACKEND = 'https://backendsja-890420967859.asia-southeast2.run.app/' // --- DIHAPUS ---

const CheckSchedule = () => {
  const navigate = useNavigate();
  const [jenisKendaraan, setJenisKendaraan] = useState('Matic');
  const [activeDate, setActiveDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAvailableSchedules = async () => {
      setLoading(true);
      setSelectedDate(null);
      setTimeSlots([]);
      const bulan = activeDate.getMonth() + 1;
      const tahun = activeDate.getFullYear();
      try {
        // --- DIUBAH: Menggunakan 'api' dan path relatif ---
        const response = await api.get(
          '/api/jadwal/available',
          { params: { jenisKendaraan, bulan, tahun } }
        );
        setAvailableSlots(response.data);
      } catch (error) {
        console.error("Gagal mengambil jadwal:", error);
        setAvailableSlots([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailableSchedules();
  }, [jenisKendaraan, activeDate]);

  useEffect(() => {
    if (!selectedDate) {
      setTimeSlots([]);
      return;
    }
    const slotsForDate = availableSlots
      .filter(slot => new Date(slot.tanggal).toDateString() === selectedDate.toDateString())
      .map(slot => slot.jam)
      .filter((jam, index, self) => self.indexOf(jam) === index)
      .sort();
    setTimeSlots(slotsForDate);
  }, [selectedDate, availableSlots]);

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const isAvailable = availableSlots.some(
        (slot) => new Date(slot.tanggal).toDateString() === date.toDateString()
      );
      if (isAvailable) {
        return 'available';
      }
    }
    return null;
  };

  const handleDateClick = (date) => {
    if (date.getMonth() !== activeDate.getMonth()) {
      setActiveDate(date);
    }
    setSelectedDate(date);
  };
  
  const handleRegisterClick = (time) => {
    navigate(`/daftar/${selectedDate.toISOString()}/${time}/${jenisKendaraan}`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><FaCalendarAlt /> Cek Jadwal Kursus</h1>
        <p className="info-link">
          Belum mengetahui informasi tentang paket kursus?{' '}
        <Link to="/informasi-kursus">Klik di sini!</Link>
        </p>
        <p>Pilih tanggal yang tersedia untuk melihat slot jam yang bisa dipesan.</p>
      </div>
      
      <div className="controls-container">
        <label htmlFor="vehicle-type"><FaCar /> Pilih Jenis Kendaraan:</label>
        <select id="vehicle-type" value={jenisKendaraan} onChange={(e) => setJenisKendaraan(e.target.value)}>
          <option value="Matic">Matic</option>
          <option value="Manual">Manual</option>
        </select>
      </div>

      <div className="scheduler-container">
        <div className="calendar-wrapper">
          <Calendar
            onActiveStartDateChange={({ activeStartDate }) => setActiveDate(activeStartDate)}
            onClickDay={handleDateClick}
            tileClassName={tileClassName}
            value={selectedDate}
          />
        </div>
        
        <div className="slots-wrapper">
          {loading && <p>Memuat jadwal...</p>}
          
          {!loading && selectedDate && (
            <div>
              <h3>Slot Tersedia untuk {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}:</h3>
              {timeSlots.length > 0 ? (
                <div className="slots-list">
                  {timeSlots.map((time, index) => (
                    <div key={index} className="slot-card">
                      <span className="slot-time"><FaClock /> {time}</span>
                      <button className="slot-button" onClick={() => handleRegisterClick(time)}>Daftar</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Tidak ada slot yang tersedia pada tanggal ini.</p>
              )}
            </div>
          )}
          
          {!loading && !selectedDate && (
            <div>
              <h3>Pilih Tanggal</h3>
              <p>Silakan pilih tanggal di kalender untuk melihat slot yang tersedia.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckSchedule;