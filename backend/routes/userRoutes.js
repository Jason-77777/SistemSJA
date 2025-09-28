const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUsers, deleteUser, updateUser } = require('../controllers/userController');
const auth = require('../middleware/auth');

// @route   POST /api/users/register
// @desc    Register a new user
router.post('/register', registerUser);

// @route   POST /api/users/login
// @desc    Authenticate user & get token
router.post('/login', loginUser);

// @route   GET /api/users
// @desc    Get all users
router.get('/', auth, getUsers);

// @route   PUT /api/users/:id
// @desc    Update a user by ID
router.put('/:id', updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete a user by ID
router.delete('/:id', deleteUser);

module.exports = router;