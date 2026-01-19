// Request logging middleware
const fileLogger = require('../utils/fileLogger');

const logger = (req, res, next) => {
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'Unknown';

  // Get request body (but hide password fields for security)
  let body = {};
  try {
    body = req.body ? { ...req.body } : {};
    if (body.password) {
      body.password = '***HIDDEN***';
    }
    if (body.oldPassword) {
      body.oldPassword = '***HIDDEN***';
    }
    if (body.newPassword) {
      body.newPassword = '***HIDDEN***';
    }
  } catch (e) {
    // Body parsing error
  }

  // Prepare log data
  const logData = {
    method,
    url,
    ip,
    userAgent: req.headers['user-agent'] || 'Unknown',
    body: Object.keys(body).length > 0 && method !== 'GET' ? body : undefined,
    hasAuth: !!req.headers.authorization,
  };

  // Log the request - ALWAYS log to console (for development)
  console.log('\n' + '='.repeat(70));
  console.log(`📥 INCOMING REQUEST - ${timestamp}`);
  console.log(`Method: ${method}`);
  console.log(`URL: ${url}`);
  console.log(`IP: ${ip}`);
  console.log(`User-Agent: ${req.headers['user-agent'] || 'Unknown'}`);

  // Log body if present (and it's not empty)
  if (Object.keys(body).length > 0 && method !== 'GET') {
    console.log('Body:', JSON.stringify(body, null, 2));
  }

  // Log headers if Authorization is present
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    console.log('Auth Token:', token ? token.substring(0, 20) + '...' : 'None');
  }

  // Also log to file (for production)
  fileLogger.info('Incoming Request', logData);

  // Capture response status - LOG EVERYTHING
  const originalSend = res.send;
  res.send = function (data) {
    console.log(`📤 RESPONSE STATUS: ${res.statusCode}`);

    // Prepare response log
    const responseLog = {
      statusCode: res.statusCode,
      url,
      method,
      ip,
    };

    if (res.statusCode >= 400) {
      try {
        const errorData = typeof data === 'string' ? JSON.parse(data) : data;
        console.log(`❌ Error Response:`, JSON.stringify(errorData, null, 2));
        fileLogger.error('Request Failed', { ...responseLog, error: errorData });
      } catch (e) {
        console.log(`❌ Error Response:`, data);
        fileLogger.error('Request Failed', { ...responseLog, error: data });
      }
    } else {
      console.log(`✅ Success Response`);

      // Log response data for debugging (optional - can be removed in production)
      try {
        if (typeof data === 'string' && data.length < 500) {
          const responseData = JSON.parse(data);
          if (responseData.data && responseData.data.token) {
            console.log(`🎫 Token generated: ${responseData.data.token.substring(0, 30)}...`);
          }
        }
      } catch (e) {
        // Not JSON, skip
      }

      // Log success to file
      fileLogger.info('Request Success', responseLog);
    }
    console.log('='.repeat(70) + '\n');
    return originalSend.call(this, data);
  };

  // Ensure next() is always called
  try {
    next();
  } catch (error) {
    console.error('Logger middleware error:', error);
    next();
  }
};

module.exports = logger;
