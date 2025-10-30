const express = require('express');
const router = express.Router();
const {
  createInstruktur,
  getAllInstruktur,
  getInstrukturById,
  updateInstruktur,
  deleteInstruktur,
} = require('../controllers/instrukturController');

const auth = require('../middleware/auth'); 

router.route('/')
  .get(getAllInstruktur) 
  .post(auth, createInstruktur); 
  
router.route('/:id')
  .get(getInstrukturById)
  .patch(auth, updateInstruktur) 
  .delete(auth, deleteInstruktur); 

module.exports = router;