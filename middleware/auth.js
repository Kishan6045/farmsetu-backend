const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route. No token provided.',
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found with this token.',
            });
        }

        next();
    } catch (error) {
        console.error('❌ Auth Error:', {
            message: error.message,
            name: error.name,
        });
        
        // Ensure response hasn't been sent
        if (res.headersSent) {
            return;
        }
        
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route. Invalid token.',
        });
    }
};

module.exports = { protect };
