const fs = require('fs');
const path = require('path');

// Logs directory
const logsDir = path.join(__dirname, '..', 'logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Get log file path (daily rotation)
const getLogFilePath = () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return path.join(logsDir, `app-${today}.log`);
};

// File logger function
const fileLogger = (level, message, data = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level,
        message,
        ...data,
    };

    const logLine = JSON.stringify(logEntry) + '\n';

    try {
        fs.appendFileSync(getLogFilePath(), logLine);
    } catch (error) {
        console.error('Error writing to log file:', error);
    }
};

// Export logger functions
module.exports = {
    info: (message, data) => fileLogger('INFO', message, data),
    error: (message, data) => fileLogger('ERROR', message, data),
    warn: (message, data) => fileLogger('WARN', message, data),
    debug: (message, data) => fileLogger('DEBUG', message, data),
};
