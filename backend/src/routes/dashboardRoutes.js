// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { getDashboardSummary, getTokenUsage } = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.get('/summary', auth.protect, getDashboardSummary);
router.get('/token-usage', auth.protect, getTokenUsage);

module.exports = router;
