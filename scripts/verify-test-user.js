const sequelize = require('../server/src/config/database');
const User = require('../server/src/models/user.model');

async function verifyTestUser() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    const [updated] = await User.update(
      {
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
          email: 'test@example.com',
          phoneNumber: '+1234567890'
        }
      }
    );

    if (updated > 0) {
      console.log('Test user updated to fully verified and active.');
    } else {
      console.log('Test user not found or already verified.');
    }
  } catch (err) {
    console.error('Error updating test user:', err);
  } finally {
    await sequelize.close();
  }
}

verifyTestUser(); 