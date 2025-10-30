const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUsers, deleteUser, updateUser } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', auth, getUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;