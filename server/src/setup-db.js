const sequelize = require('./config/database');
const User = require('./models/user.model');
const logger = require('./utils/logger');
const dotenv = require('dotenv');

dotenv.config();

const force = process.argv.includes('--force'); // Drop tables and recreate
const cleanOnly = process.argv.includes('--clean'); // Only clean the database

logger.info('Database setup script started');
logger.info(`Force mode: ${force}`);
logger.info(`Clean mode: ${cleanOnly}`);

// Create test user for development
const createTestUser = async () => {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({
      where: { email: 'test@example.com' }
    });

    if (existingUser) {
      logger.info('Test user already exists, skipping creation');
      return;
    }

    // Create test user
    const testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phoneNumber: '+1234567890',
      password: 'Password123!',
      isPhoneVerified: true,
      isEmailVerified: true,
      role: 'user'
    });

    logger.info(`Test user created with ID: ${testUser.id}`);
  } catch (error) {
    logger.error('Error creating test user:', error);
  }
};

// Sync database
const syncDatabase = async () => {
  try {
    if (cleanOnly) {
      logger.info('Dropping all tables (clean mode)');
      await sequelize.drop();
      logger.info('All tables dropped successfully');
      return;
    }

    logger.info(`Syncing database with force: ${force}`);
    await sequelize.sync({ force });
    logger.info('Database synced successfully');

    // Create test data if in development mode
    if (process.env.NODE_ENV === 'development') {
      logger.info('Creating development test data');
      await createTestUser();
    }

    logger.info('Database setup completed successfully');
  } catch (error) {
    logger.error('Error syncing database:', error);
  } finally {
    // Close database connection
    await sequelize.close();
  }
};

syncDatabase(); 