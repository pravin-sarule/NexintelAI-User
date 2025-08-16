const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: './.env' });

const pool = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const fileRoutes = require('./src/routes/fileRoutes');
const documentRoutes = require('./src/routes/documentRoutes');
const templateRoutes = require('./src/routes/templateRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());

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
app.use('/api/draft', templateRoutes);
app.use('/api/chat', chatRoutes);
// Temporary test route - keep this for testing
app.get('/api/test-route', (req, res) => {
  res.send('Test route is working!');
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
