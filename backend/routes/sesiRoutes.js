const express = require('express');
const router = express.Router();
const { tukarSesi } = require('../controllers/sesiController');
const auth = require('../middleware/auth');

router.patch('/:pendaftaranId/tukar', auth, tukarSesi);
module.exports = router;