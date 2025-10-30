const express = require('express');
const router = express.Router();
const {
  createPaketBelajar,
  getAllPaketBelajar,
  updatePaketBelajar,
  deletePaketBelajar
} = require('../controllers/paketBelajarController');
const auth = require('../middleware/auth');

router.route('/')
  .get(getAllPaketBelajar)
  .post(auth, createPaketBelajar);

router.route('/:id')
  .patch(auth, updatePaketBelajar)
  .delete(auth, deletePaketBelajar);

module.exports = router;