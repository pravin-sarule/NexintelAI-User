

const express = require('express');
const router = express.Router();

const { register, login, logout } = require('../controllers/authController');

// Register a new user
router.post('/register', register);

// Login with email & password
router.post('/login', login);



module.exports = router;
