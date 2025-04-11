const User = require('../models/user.model');
const authUtils = require('../utils/auth.utils');
const { Sequelize } = require('sequelize');

console.log('Initializing Auth Controller...');

// Register new user
exports.register = async (req, res) => {
  console.log('Processing registration request', req.body);
  
  try {
    const { firstName, lastName, email, phoneNumber, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Sequelize.Op.or]: [
          { email },
          { phoneNumber }
        ]
      }
    });
    
    if (existingUser) {
      console.log(`Registration failed: User with email ${email} or phone ${phoneNumber} already exists`);
      return res.status(400).json({
        status: 'error',
        message: 'User with this email or phone number already exists'
      });
    }
    
    // Create new user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password
    });
    
    console.log(`User created with ID: ${newUser.id}`);
    
    // Generate verification code for phone
    const verificationCode = newUser.generateVerificationCode();
    await newUser.save();
    
    // Send SMS verification
    await authUtils.sendSmsVerification(phoneNumber, verificationCode);
    
    // Generate token
    const token = authUtils.generateToken(newUser);
    
    console.log(`Registration successful for ${email}`);
    
    // Return user data and token
    res.status(201).json({
      status: 'success',
      message: 'Registration successful. Please verify your phone number.',
      data: {
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
          isPhoneVerified: newUser.isPhoneVerified,
          isEmailVerified: newUser.isEmailVerified
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Verify phone number
exports.verifyPhone = async (req, res) => {
  console.log('Processing phone verification request', req.body);
  
  try {
    const { phoneNumber, verificationCode } = req.body;
    
    // Find user by phone number
    const user = await User.findOne({
      where: { phoneNumber }
    });
    
    if (!user) {
      console.log(`Phone verification failed: User with phone ${phoneNumber} not found`);
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Check verification code
    if (user.phoneVerificationCode !== verificationCode) {
      console.log(`Phone verification failed: Invalid code for ${phoneNumber}`);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid verification code'
      });
    }
    
    // Update user
    user.isPhoneVerified = true;
    user.phoneVerificationCode = null;
    await user.save();
    
    console.log(`Phone verification successful for ${phoneNumber}`);
    
    // Generate email verification token and send email
    const emailVerificationToken = authUtils.generateRandomToken();
    user.emailVerificationToken = emailVerificationToken;
    await user.save();
    
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${emailVerificationToken}`;
    await authUtils.sendVerificationEmail(user, verificationUrl);
    
    res.status(200).json({
      status: 'success',
      message: 'Phone verified successfully. Please check your email to verify your email address.'
    });
  } catch (error) {
    console.error('Phone verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Phone verification failed',
      error: error.message
    });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  console.log('Processing email verification request', req.params);
  
  try {
    const { token } = req.params;
    
    // Find user by email verification token
    const user = await User.findOne({
      where: { emailVerificationToken: token }
    });
    
    if (!user) {
      console.log(`Email verification failed: Invalid token ${token}`);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired token'
      });
    }
    
    // Update user
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    await user.save();
    
    console.log(`Email verification successful for ${user.email}`);
    
    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Email verification failed',
      error: error.message
    });
  }
};

// Login with email/phone and password
exports.login = async (req, res) => {
  console.log('Processing login request', req.body);
  
  try {
    const { identifier, password } = req.body;
    
    if (!identifier || !password) {
      console.log('Login failed: Missing identifier or password');
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email/phone and password'
      });
    }
    
    // Find user by email or phone
    const user = await User.findOne({
      where: {
        [Sequelize.Op.or]: [
          { email: identifier },
          { phoneNumber: identifier }
        ]
      }
    });
    
    if (!user || !(await user.comparePassword(password))) {
      console.log(`Login failed: Invalid credentials for ${identifier}`);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = authUtils.generateToken(user);
    
    console.log(`Login successful for ${identifier}`);
    
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          isPhoneVerified: user.isPhoneVerified,
          isEmailVerified: user.isEmailVerified,
          nationalId: user.nationalId,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      error: error.message
    });
  }
};

// Login with OTP
exports.requestOTPLogin = async (req, res) => {
  console.log('Processing OTP login request', req.body);
  
  try {
    const { phoneNumber } = req.body;
    
    // Find user by phone
    const user = await User.findOne({
      where: { phoneNumber }
    });
    
    if (!user) {
      console.log(`OTP request failed: User with phone ${phoneNumber} not found`);
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Generate verification code
    const verificationCode = user.generateVerificationCode();
    await user.save();
    
    // Send SMS verification
    await authUtils.sendSmsVerification(phoneNumber, verificationCode);
    
    console.log(`OTP sent to ${phoneNumber}`);
    
    res.status(200).json({
      status: 'success',
      message: 'OTP sent to your phone number'
    });
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send OTP',
      error: error.message
    });
  }
};

// Verify OTP and login
exports.verifyOTPLogin = async (req, res) => {
  console.log('Processing OTP verification for login', req.body);
  
  try {
    const { phoneNumber, verificationCode } = req.body;
    
    // Find user by phone
    const user = await User.findOne({
      where: { phoneNumber }
    });
    
    if (!user) {
      console.log(`OTP verification failed: User with phone ${phoneNumber} not found`);
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Check verification code
    if (user.phoneVerificationCode !== verificationCode) {
      console.log(`OTP verification failed: Invalid code for ${phoneNumber}`);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid verification code'
      });
    }
    
    // Reset verification code
    user.phoneVerificationCode = null;
    await user.save();
    
    // Generate token
    const token = authUtils.generateToken(user);
    
    console.log(`OTP login successful for ${phoneNumber}`);
    
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          isPhoneVerified: user.isPhoneVerified,
          isEmailVerified: user.isEmailVerified,
          nationalId: user.nationalId,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'OTP verification failed',
      error: error.message
    });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  console.log('Processing forgot password request', req.body);
  
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({
      where: { email }
    });
    
    if (!user) {
      console.log(`Forgot password failed: User with email ${email} not found`);
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Generate password reset token
    const resetToken = authUtils.generateRandomToken();
    user.passwordResetToken = resetToken;
    
    // Set expiration time (10 minutes)
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    
    // Send password reset email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
    await authUtils.sendPasswordResetEmail(user, resetUrl);
    
    console.log(`Password reset email sent to ${email}`);
    
    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to your email'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send password reset email',
      error: error.message
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  console.log('Processing reset password request', req.params, req.body);
  
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    // Find user by reset token and check if token is expired
    const user = await User.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { [Sequelize.Op.gt]: new Date() }
      }
    });
    
    if (!user) {
      console.log(`Reset password failed: Invalid or expired token ${token}`);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired token'
      });
    }
    
    // Update password and reset token fields
    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();
    
    console.log(`Password reset successful for ${user.email}`);
    
    // Generate token for automatic login
    const authToken = authUtils.generateToken(user);
    
    res.status(200).json({
      status: 'success',
      message: 'Password reset successful',
      data: {
        token: authToken
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reset password',
      error: error.message
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  console.log('Processing profile update request', req.user.id, req.body);
  
  try {
    // Fields that can be updated
    const { firstName, lastName, nationalId } = req.body;
    
    // Find user by ID (from JWT)
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      console.log(`Profile update failed: User with ID ${req.user.id} not found`);
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Update user fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (nationalId) user.nationalId = nationalId;
    
    await user.save();
    
    console.log(`Profile updated for user ${user.email}`);
    
    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          isPhoneVerified: user.isPhoneVerified,
          isEmailVerified: user.isEmailVerified,
          nationalId: user.nationalId
        }
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

console.log('Auth Controller initialized successfully'); 