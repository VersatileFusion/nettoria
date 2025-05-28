const axios = require('axios');

const API = 'http://localhost:5000/api/auth/register';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PHONE = '+1234567891';
const ADMIN_PASSWORD = 'AdminPassword123!';

async function registerAdminUser() {
  try {
    const res = await axios.post(API, {
      firstName: 'Admin',
      lastName: 'User',
      email: ADMIN_EMAIL,
      phoneNumber: ADMIN_PHONE,
      password: ADMIN_PASSWORD,
      role: 'admin'
    });
    console.log('Admin registration response:', res.data);
  } catch (err) {
    console.error('Error registering admin user:', err.response ? err.response.data : err.stack || err.message);
  }
}

registerAdminUser(); 