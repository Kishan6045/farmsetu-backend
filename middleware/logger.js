// Request logging middleware
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip = req.ip || req.connection.remoteAddress;
  
  // Get request body (but hide password fields for security)
  let body = { ...req.body };
  if (body.password) {
    body.password = '***HIDDEN***';
  }
  if (body.oldPassword) {
    body.oldPassword = '***HIDDEN***';
  }
  if (body.newPassword) {
    body.newPassword = '***HIDDEN***';
  }

  // Log the request
  console.log('\n' + '='.repeat(60));
  console.log(`📥 INCOMING REQUEST - ${timestamp}`);
  console.log(`Method: ${method}`);
  console.log(`URL: ${url}`);
  console.log(`IP: ${ip}`);
  
  // Log body if present (and it's not empty)
  if (Object.keys(body).length > 0 && method !== 'GET') {
    console.log('Body:', JSON.stringify(body, null, 2));
  }
  
  // Log headers if Authorization is present
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    console.log('Auth Token:', token ? token.substring(0, 20) + '...' : 'None');
  }

  // Capture response status
  const originalSend = res.send;
  res.send = function (data) {
    console.log(`📤 RESPONSE STATUS: ${res.statusCode}`);
    if (res.statusCode >= 400) {
      console.log(`❌ Error Response:`, data);
    } else {
      console.log(`✅ Success Response`);
    }
    console.log('='.repeat(60) + '\n');
    return originalSend.call(this, data);
  };

  next();
};

module.exports = logger;
