const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database');
const logger = require('./middleware/logger');

const locationRoutes = require('./routes/locationRoutes');
// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Middleware
// Configure CORS for mobile apps - allow all origins with credentials
// CORS middleware automatically handles OPTIONS preflight requests
app.use(cors({
  origin: '*', // Allow all origins for mobile apps
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  maxAge: 86400, // 24 hours
  preflightContinue: false, // Let CORS handle preflight
}));

// Note: express.json() and express.urlencoded() skip multipart/form-data automatically
// Multer will handle multipart/form-data and populate req.body
app.use(express.json({ limit: '50mb' })); // Increase limit for large payloads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware to handle slow uploads - keep connection alive
app.use((req, res, next) => {
  // For file uploads, set longer timeout
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    req.setTimeout(10 * 60 * 1000); // 10 minutes for file uploads
    res.setTimeout(10 * 60 * 1000);
  }
  next();
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware (should be after body parsers)
app.use(logger);


// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', {
    message: err.message,
    stack: err.stack,
    status: err.status,
    code: err.code,
    field: err.field,
  });

  // Handle multer errors specifically
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error',
      code: err.code,
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: err.message || 'Validation error',
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Please login again.',
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

// Increase timeout for file uploads - handle slow mobile connections
server.timeout = 10 * 60 * 1000; // 10 minutes for large/slow uploads
server.keepAliveTimeout = 120000; // 2 minutes - keep connection alive longer
server.headersTimeout = 121000; // 2 minutes 1 second - slightly more than keepAlive
server.requestTimeout = 10 * 60 * 1000; // 10 minutes request timeout

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server Error:', error);
});

// Handle client connection errors (timeouts, aborts, etc.)
server.on('clientError', (err, socket) => {
  console.error('❌ Client Error:', err.message);
  if (!socket.destroyed) {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  }
});

// Handle request timeout
server.on('timeout', (socket) => {
  console.warn('⚠️  Request timeout - connection kept alive too long');
  // Don't destroy immediately, let the request finish if it's close
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
