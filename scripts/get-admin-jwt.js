const axios = require('axios');

const API = 'http://localhost:5000/api/auth/login';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'AdminPassword123!';

async function getAdminJWT() {
  try {
    const res = await axios.post(API, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    if (res.data && res.data.token) {
      console.log('Admin JWT token:', res.data.token);
    } else if (res.data && res.data.data && res.data.data.token) {
      console.log('Admin JWT token:', res.data.data.token);
    } else {
      console.log('Login response:', res.data);
    }
  } catch (err) {
    console.error('Error logging in as admin:', err.response ? err.response.data : err.stack || err.message);
  }
}

getAdminJWT(); 