// const express = require('express');
// const { register, login} = require('../controllers/authController');
// const router = express.Router();

// router.post('/register', register);
// router.post('/login', login);
// // router.post('/firebase', firebaseAuth);

// module.exports = router;

const express = require('express');
const router = express.Router();

const { register, login, logout } = require('../controllers/authController');

// Register a new user
router.post('/register', register);

// Login with email & password
router.post('/login', login);

// Optional: Firebase / Google Auth support (add later)
// router.post('/firebase', firebaseAuth);
// router.post('/google', googleAuth);

// router.post('/logout', authenticateToken, logout);

module.exports = router;
