const axios = require('axios');
const sequelize = require('../server/src/config/database');
const User = require('../server/src/models/user.model');
const dotenv = require('dotenv');

dotenv.config({ path: require('path').resolve(__dirname, '../server/.env') });

console.log('Using DB config:', {
  dialect: process.env.DB_DIALECT,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  db: process.env.DB_NAME
});

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PHONE = '+1234567891';
const ADMIN_PASSWORD = 'AdminPassword123!';

async function registerAdminUser() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/register', {
      firstName: 'Admin',
      lastName: 'User',
      email: ADMIN_EMAIL,
      phoneNumber: ADMIN_PHONE,
      password: ADMIN_PASSWORD,
      role: 'admin'
    });
    console.log('Admin registration response:', res.data);
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message && err.response.data.message.includes('already exists')) {
      console.log('Admin user already exists, continuing...');
    } else {
      console.error('Error registering admin user:', err.response ? err.response.data : err.stack || err.message);
    }
  }
}

async function promoteAdminUser() {
  try {
    await sequelize.authenticate();
    const [updated] = await User.update(
      {
        role: 'admin',
        isPhoneVerified: true,
        isEmailVerified: true,
        status: 'active',
        phoneVerificationCode: null,
        phoneVerificationExpires: null,
        verificationCode: null,
        verificationCodeExpires: null
      },
      {
        where: {
          email: ADMIN_EMAIL,
          phoneNumber: ADMIN_PHONE
        }
      }
    );
    if (updated > 0) {
      console.log('User promoted to admin and fully verified.');
    } else {
      console.log('Admin user not found. Please register the user first.');
    }
  } catch (err) {
    console.error('Error updating admin user:', err);
  } finally {
    await sequelize.close();
  }
}

async function getAdminJWT() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
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

async function main() {
  await registerAdminUser();
  await promoteAdminUser();
  await getAdminJWT();
}

main(); 