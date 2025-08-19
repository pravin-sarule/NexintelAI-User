const express = require('express');
console.log('Loading paymentRoutes.js');
const { protect } = require('../middleware/auth');
const { createOrder, handleWebhook } = require('../controllers/paymentController');

const router = express.Router();

// Route to create a Razorpay order/subscription
router.post('/order', protect, createOrder);

// Webhook route for Razorpay to send payment updates
// This route should be publicly accessible for Razorpay to hit it
router.post('/webhook', handleWebhook);

module.exports = router;