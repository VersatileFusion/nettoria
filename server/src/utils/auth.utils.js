const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

console.log('Initializing auth utilities...');

// Generate JWT Token
const generateToken = (user) => {
  console.log(`Generating JWT token for user ID: ${user.id}`);
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  );
};

// Generate random token for email verification or password reset
const generateRandomToken = () => {
  console.log('Generating random token');
  return crypto.randomBytes(32).toString('hex');
};

// Create email transporter
const createEmailTransporter = () => {
  console.log('Creating email transporter');
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send verification email
const sendVerificationEmail = async (user, verificationUrl) => {
  console.log(`Sending verification email to ${user.email}`);
  
  const transporter = createEmailTransporter();
  
  const mailOptions = {
    from: `Nettoria <${process.env.EMAIL_USERNAME}>`,
    to: user.email,
    subject: 'Email Verification',
    html: `
      <h2>Hello ${user.firstName} ${user.lastName},</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}" target="_blank">Verify Email</a>
      <p>If you did not request this, please ignore this email.</p>
    `
  };
  
  await transporter.sendMail(mailOptions);
  console.log(`Verification email sent to ${user.email}`);
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetUrl) => {
  console.log(`Sending password reset email to ${user.email}`);
  
  const transporter = createEmailTransporter();
  
  const mailOptions = {
    from: `Nettoria <${process.env.EMAIL_USERNAME}>`,
    to: user.email,
    subject: 'Password Reset',
    html: `
      <h2>Hello ${user.firstName} ${user.lastName},</h2>
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
      <p>This link will expire in 10 minutes.</p>
    `
  };
  
  await transporter.sendMail(mailOptions);
  console.log(`Password reset email sent to ${user.email}`);
};

// Send SMS verification
const sendSmsVerification = async (phoneNumber, code) => {
  console.log(`Sending SMS verification to ${phoneNumber} with code ${code}`);
  
  // Implementation depends on the SMS provider API
  // For now, we'll simulate it with a console log
  console.log(`SMS verification code ${code} sent to ${phoneNumber}`);
  
  return true;
};

console.log('Auth utilities initialized successfully');

module.exports = {
  generateToken,
  generateRandomToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendSmsVerification
}; 