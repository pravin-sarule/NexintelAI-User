const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: './.env' });

const pool = require('./src/config/db');
const { createSubscriptionPlansTable, createUserSubscriptionsTable, createPaymentsTable, createTokenUsageLogsTable } = require('./src/models/subscriptionPlanModel');
const authRoutes = require('./src/routes/authRoutes');
const fileRoutes = require('./src/routes/fileRoutes');
const documentRoutes = require('./src/routes/documentRoutes');
const templateRoutes = require('./src/routes/templateRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const { startCronJobs } = require('./src/utils/cronJobs');
const paymentRoutes = require('./src/routes/paymentRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const userPlanRoutes = require('./src/routes/userPlan.routes');
const supportRoutes = require("./src/routes/supportRoutes");
const dashboardRoutes =require('./src/routes/dashboardRoutes');

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(morgan('dev')); 

// CORS
app.use(cors({
  origin: (origin, callback) => {
    callback(null, origin);
  },
  credentials: true
}));

// CORS Headers for preflight (OPTIONS) requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/doc', documentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/draft', templateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/plans', userPlanRoutes);
app.use("/api/support", supportRoutes);
app.use('/api/dashboard',dashboardRoutes);
console.log('Registering payment routes at /api/payments'); // Added for debugging
// Temporary test route - keep this for testing
app.get('/api/test-route', (req, res) => {
  res.send('Test route is working!');
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  // Initialize database tables
  (async () => {
      try {
          await createSubscriptionPlansTable();
          await createUserSubscriptionsTable();
          await createPaymentsTable();
          await createTokenUsageLogsTable();
          startCronJobs(); // Start cron jobs after tables are ensured
      } catch (error) {
          console.error('Error initializing database tables or starting cron jobs:', error);
          process.exit(1);
      }
  })();
});

// Graceful shutdown
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// const express = require('express');
// const cors = require('cors');
// const cookieParser = require('cookie-parser');
// require('dotenv').config({ path: './.env' });

// const pool = require('./src/config/db');
// const { createSubscriptionPlansTable, createUserSubscriptionsTable, createPaymentsTable, createTokenUsageLogsTable } = require('./src/models/subscriptionPlanModel');
// const authRoutes = require('./src/routes/authRoutes');
// const fileRoutes = require('./src/routes/fileRoutes');
// const documentRoutes = require('./src/routes/documentRoutes');
// const templateRoutes = require('./src/routes/templateRoutes');
// const chatRoutes = require('./src/routes/chatRoutes');
// const { startCronJobs } = require('./src/utils/cronJobs');
// const paymentRoutes = require('./src/routes/paymentRoutes');
// const adminRoutes = require('./src/routes/adminRoutes');
// const userPlanRoutes = require('./src/routes/userPlan.routes');

// const app = express();

// // Middleware
// app.use(cookieParser());
// app.use(express.json());

// // --- CORS Fix Start ---
// const allowedOrigins = [
//   'http://localhost:3001',
//   'https://nexinteluser.netlify.app'
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true
// }));

// // app.options('*', cors()); // Preflight
// // --- CORS Fix End ---

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/files', fileRoutes);
// app.use('/api/doc', documentRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/draft', templateRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/chat', chatRoutes);
// app.use('/api/plans', userPlanRoutes);

// // Test Route
// app.get('/api/test-route', (req, res) => {
//   res.send('Test route is working!');
// });

// // Start Server
// const PORT = process.env.PORT || 3000;
// const server = app.listen(PORT, () => {
//   console.log(`✅ Server running on port ${PORT}`);
//   (async () => {
//     try {
//       await createSubscriptionPlansTable();
//       await createUserSubscriptionsTable();
//       await createPaymentsTable();
//       await createTokenUsageLogsTable();
//       startCronJobs();
//     } catch (error) {
//       console.error('Error initializing DB:', error);
//       process.exit(1);
//     }
//   })();
// });

// // Graceful Shutdown
// process.on('unhandledRejection', (err) => {
//   console.error(`❌ Unhandled Rejection: ${err.message}`);
//   server.close(() => process.exit(1));
// });
