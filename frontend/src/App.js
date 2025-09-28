import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Layouts
import AdminLayout from './layouts/AdminLayout';
import CustomerLayout from './layouts/CustomerLayout';

// Import Halaman Publik
import Login from './components/Login';
import Register from './components/Register';

// Import Halaman Admin
import Dashboard from './pages/admin/Dashboard';
import ManageInstructors from './pages/admin/manageInstructors';
import ManagePackages from './pages/admin/ManagePackages';
import ManageSchedules from './pages/admin/ManageSchedules';
import VerifyPayments from './pages/admin/VerifyPayments';

// Import Halaman Customer
import HomePage from './pages/customer/HomePage';
import CheckSchedule from './pages/customer/CheckSchedule';
import MySchedule from './pages/customer/MySchedule';
import CourseInfo from './pages/customer/CourseInfo';
import RegistrationForm from './pages/customer/RegistrationForm';
import PaymentPage from './pages/customer/PaymentPage'; // DITAMBAHKAN

function App() {
  return (
    <Router>
      <Routes>
        {/* RUTE PUBLIK (Tanpa Layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} />

        {/* GRUP RUTE ADMIN (Dibungkus dengan AdminLayout) */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/instruktur" element={<ManageInstructors />} />
          <Route path="/admin/paket" element={<ManagePackages />} />
          <Route path="/admin/jadwal" element={<ManageSchedules />} />
          <Route path="/admin/verifikasi" element={<VerifyPayments />} />
        </Route>

        {/* GRUP RUTE CUSTOMER (Dibungkus dengan CustomerLayout) */}
        <Route element={<CustomerLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/cek-jadwal" element={<CheckSchedule />} />
          <Route path="/jadwalku" element={<MySchedule />} />
          <Route path="/informasi-kursus" element={<CourseInfo />} />
          <Route path="/daftar/:date/:time/:jenisKendaraan" element={<RegistrationForm />} />
          <Route path="/bayar/:pendaftaranId" element={<PaymentPage />} /> {/* DITAMBAHKAN */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;