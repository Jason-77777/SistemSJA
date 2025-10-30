const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const jadwalRoutes = require('./routes/jadwalRoutes');
const instrukturRoutes = require('./routes/instrukturRoutes');
const paketBelajarRoutes = require('./routes/paketBelajarRoutes');
const daftarRoutes = require('./routes/daftarRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const laporanRoutes = require('./routes/laporanRoutes');
const sesiRoutes = require('./routes/sesiRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: 'https://sjadrivingcourse-890420967859.asia-southeast2.run.app',
    credentials: true,
}));

app.use(express.json());
app.use((req, res, next) => {
  console.log(`>> Request Diterima: ${req.method} ${req.originalUrl}`);
  next();
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Terkoneksi ke MongoDB'))
  .catch(err => console.error('Gagal terhubung ke MongoDB:', err));

app.use('/api/users', userRoutes);
app.use('/api/jadwal', jadwalRoutes);
app.use('/api/instruktur', instrukturRoutes);
app.use('/api/paket', paketBelajarRoutes);
app.use('/api/daftar', daftarRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/sesi', sesiRoutes);

app.get('/', (req, res) => {
  res.send('Backend running OK ✅');
});

app.listen(port, () => {
  console.log(`Server berjalan di http://0.0.0.0:${port}`);
});