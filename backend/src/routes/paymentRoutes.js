// const express = require('express');
// const { 
//   startSubscription, 
//   verifySubscription, 
//   handleWebhook 
// } = require('../controllers/paymentController');
// const { protect } = require('../middleware/auth');

// const router = express.Router();

// // Test routes
// router.get('/test', (req, res) => {
//   console.log("🚀 paymentRoutes working");
//   res.json({ 
//     success: true,
//     message: "Payments test route works",
//     timestamp: new Date().toISOString()
//   });
// });

// router.get('/ping', (req, res) => {
//   res.json({ 
//     success: true,
//     message: "✅ Payment route is working",
//     razorpay_configured: !!process.env.RAZORPAY_KEY_ID
//   });
// });

// // Subscription routes (protected)
// router.post('/subscription/start', protect, startSubscription);
// router.post('/subscription/verify', protect, verifySubscription);

// // Webhook route (unprotected - Razorpay will call this)
// router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// module.exports = router;

// const express = require('express');
// const { 
//   startSubscription,
//   verifySubscription,
//   testPlans,
//   testConfiguration,
//   testRazorpayConnection
// } = require('../controllers/paymentController');
// const { protect } = require('../middleware/auth');

// const router = express.Router();

// // Test routes
// router.get('/test', (req, res) => {
//   console.log("🚀 paymentRoutes working");
//   res.json({ 
//     success: true,
//     message: "Payments test route works",
//     timestamp: new Date().toISOString(),
//     env_check: {
//       razorpay_key_configured: !!process.env.RAZORPAY_KEY_ID,
//       razorpay_secret_configured: !!process.env.RAZORPAY_SECRET,
//       node_env: process.env.NODE_ENV
//     }
//   });
// });

// router.get('/ping', (req, res) => {
//   res.json({ 
//     success: true,
//     message: "✅ Payment route is working",
//     razorpay_configured: !!process.env.RAZORPAY_KEY_ID,
//     timestamp: new Date().toISOString()
//   });
// });

// // Debug configuration test (protected route)
// router.get('/test-config', protect, testPlans);
// router.get('/test-razorpay-connection', testRazorpayConnection);

// // Subscription routes (protected)
// router.post('/subscription/start', protect, startSubscription);
// router.post('/subscription/verify', protect, verifySubscription);

// module.exports = router;

// // Middleware to log all requests to payment routes
// router.use((req, res, next) => {
//   console.log(`🔔 Payment route accessed: ${req.method} ${req.path}`);
//   console.log('Headers:', req.headers);
//   console.log('Body:', req.body);
//   console.log('User from auth:', req.user);
//   next();
// });
// const express = require('express');
// const {
//   startSubscription,
//   verifySubscription,
//   testPlans,
//   testRazorpayConnection
// } = require('../controllers/paymentController');
// const { protect } = require('../middleware/auth');

// const router = express.Router();

// // Middleware to log all requests to payment routes (moved to top)
// router.use((req, res, next) => {
//   console.log(`🔔 Payment route accessed: ${req.method} ${req.path}`);
//   console.log('Headers:', req.headers);
//   console.log('Body:', req.body);
//   console.log('User from auth:', req.user);
//   next();
// });

// // Test routes
// router.get('/test', (req, res) => {
//   console.log("🚀 paymentRoutes working");
//   res.json({
//     success: true,
//     message: "Payments test route works",
//     timestamp: new Date().toISOString(),
//     env_check: {
//       razorpay_key_configured: !!process.env.RAZORPAY_KEY_ID,
//       razorpay_secret_configured: !!process.env.RAZORPAY_SECRET,
//       node_env: process.env.NODE_ENV
//     }
//   });
// });

// router.get('/ping', (req, res) => {
//   res.json({
//     success: true,
//     message: "✅ Payment route is working",
//     razorpay_configured: !!process.env.RAZORPAY_KEY_ID,
//     timestamp: new Date().toISOString()
//   });
// });

// // Debug configuration test (protected route)
// router.get('/test-config', protect, testPlans);
// router.get('/test-razorpay-connection', testRazorpayConnection);

// // Subscription routes (protected)
// router.post('/subscription/start', protect, startSubscription);
// router.post('/subscription/verify', protect, verifySubscription);

// module.exports = router;

// backend/routes/paymentRoutes.js

const express = require('express');
const {
  startSubscription,
  verifySubscription,
  testPlans,
  testRazorpayConnection,
  getUserPaymentHistory
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// 🔔 Middleware to log all payment-related requests
router.use((req, res, next) => {
  console.log(`🔔 Payment route accessed: ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('User from auth (if any):', req.user);
  next();
});

// ✅ Open Test Routes
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: "Payments test route works",
    timestamp: new Date().toISOString(),
    env_check: {
      razorpay_key_configured: !!process.env.RAZORPAY_KEY_ID,
      razorpay_secret_configured: !!process.env.RAZORPAY_SECRET,
      node_env: process.env.NODE_ENV
    }
  });
});

router.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: "✅ Payment route is working",
    razorpay_configured: !!process.env.RAZORPAY_KEY_ID,
    timestamp: new Date().toISOString()
  });
});

// ✅ Razorpay Configuration & Plan Debug (protected where needed)
router.get('/test-config', protect, testPlans); // DB + Razorpay plan sync check
router.get('/test-razorpay-connection', testRazorpayConnection); // Razorpay API check

// ✅ Main Subscription Flow
router.post('/subscription/start', protect, startSubscription);
router.post('/subscription/verify', protect, verifySubscription);

// ✅ User Payment History
router.get('/history', protect, getUserPaymentHistory);

module.exports = router;
