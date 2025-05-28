const sequelize = require('../server/src/config/database');
const User = require('../server/src/models/user.model');

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PHONE = '+1234567891';

async function promoteAdminUser() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

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

promoteAdminUser(); 