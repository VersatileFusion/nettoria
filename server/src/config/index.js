require('dotenv').config();

module.exports = {
  // Server configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  
  // Base URL for the application
  BASE_URL: process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`,
  
  // Database configuration
  DB_DIALECT: process.env.DB_DIALECT || 'postgres',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 4000,
  DB_NAME: process.env.DB_NAME || 'nettoria_db',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASS: process.env.DB_PASS || '1',
  
  // JWT secret
  JWT_SECRET: process.env.JWT_SECRET || 'nettoria-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  
  // ZarinPal payment gateway
  ZARINPAL_MERCHANT_ID: process.env.ZARINPAL_MERCHANT_ID || 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  
  // SMS.ir integration settings
  SMS_API_KEY: process.env.SMS_API_KEY || '',
  SMS_LINE_NUMBER: process.env.SMS_LINE_NUMBER || '',
  SMS_VERIFICATION_TEMPLATE_ID: process.env.SMS_VERIFICATION_TEMPLATE_ID || 100000,
  
  // VCenter integration
  VCENTER_HOST: process.env.VCENTER_HOST || 'vcenter.example.com',
  VCENTER_USER: process.env.VCENTER_USER || 'administrator@vsphere.local',
  VCENTER_PASS: process.env.VCENTER_PASS || 'password',
  
  // Email service
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.example.com',
  EMAIL_PORT: process.env.EMAIL_PORT || 587,
  EMAIL_USER: process.env.EMAIL_USER || 'noreply@example.com',
  EMAIL_PASS: process.env.EMAIL_PASS || 'password',
  EMAIL_FROM: process.env.EMAIL_FROM || 'Nettoria Cloud <noreply@example.com>',
}; 