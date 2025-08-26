// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.get('/summary', auth.protect, getDashboardSummary);

module.exports = router;
