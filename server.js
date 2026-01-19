const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const logger = require('./middleware/logger');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (should be after body parsers)
// This will log ALL requests from mobile app - EVERY REQUEST WILL BE LOGGED
app.use(logger);


// Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Health check route
app.get('/health', (req, res) => {
  console.log('✅ Health check requested');
  res.status(200).json({
    success: true,
    message: 'Server is running',
  });
});

// Test route to verify logging
app.get('/test', (req, res) => {
  console.log('🧪 Test endpoint called');
  res.status(200).json({
    success: true,
    message: 'Test endpoint - Logging is working!',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler - Log all unmatched routes
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.method, req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(70));
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📍 Network: http://0.0.0.0:${PORT}`);
  console.log(`📝 Request logging: ENABLED`);
  console.log('='.repeat(70) + '\n');
});
