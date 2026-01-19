const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      countryCode,
      address,
      pincode,
      password,
    } = req.body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !countryCode ||
      !address ||
      !pincode ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Validate address object
    if (
      !address.state ||
      !address.district ||
      !address.taluko ||
      !address.villageName
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all address fields (state, district, taluko, villageName)',
      });
    }

    // Check if user already exists
    console.log(`🔍 Checking if user exists with email: ${email}`);
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      console.log(`❌ User already exists with email: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    console.log(`🔍 Checking if user exists with phone: ${phoneNumber}`);
    const existingUserByPhone = await User.findOne({ phoneNumber });
    if (existingUserByPhone) {
      console.log(`❌ User already exists with phone: ${phoneNumber}`);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this phone number',
      });
    }

    // Create user
    console.log(`📝 Creating new user: ${firstName} ${lastName} (${email})`);
    const user = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      countryCode,
      address,
      pincode,
      password,
    });

    console.log(`✅ User created successfully! ID: ${user._id}`);

    // Generate token
    const token = generateToken(user._id);
    console.log(`🎫 JWT token generated for user: ${user._id}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          countryCode: user.countryCode,
          address: user.address,
          pincode: user.pincode,
        },
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    // Validate required fields
    if (!phoneNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone number and password',
      });
    }

    // Find user by phone number and include password
    console.log(`🔐 Login attempt for phone: ${phoneNumber}`);
    const user = await User.findOne({ phoneNumber }).select('+password');

    if (!user) {
      console.log(`❌ Login failed: User not found with phone: ${phoneNumber}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    console.log(`✅ User found: ${user.firstName} ${user.lastName} (${user.email})`);

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      console.log(`❌ Login failed: Incorrect password for user: ${user.email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    console.log(`✅ Password verified successfully for user: ${user.email}`);

    // Generate token
    const token = generateToken(user._id);
    console.log(`🎫 JWT token generated for user: ${user._id}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          countryCode: user.countryCode,
          address: user.address,
          pincode: user.pincode,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    console.log(`🔑 Password change request for user ID: ${userId}`);

    // Validate required fields
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both old password and new password',
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      console.log(`❌ Password change failed: New password too short`);
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    // Get user with password field
    const user = await User.findById(userId).select('+password');

    if (!user) {
      console.log(`❌ Password change failed: User not found with ID: ${userId}`);
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    console.log(`✅ User found: ${user.firstName} ${user.lastName} (${user.email})`);

    // Check if old password matches
    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
      console.log(`❌ Password change failed: Old password incorrect for user: ${user.email}`);
      return res.status(401).json({
        success: false,
        message: 'Old password is incorrect',
      });
    }

    console.log(`✅ Old password verified successfully`);

    // Update password
    user.password = newPassword;
    await user.save();
    console.log(`✅ Password changed successfully for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during password change',
    });
  }
};

module.exports = {
  register,
  login,
  changePassword,
};
