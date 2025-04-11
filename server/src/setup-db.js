const sequelize = require('./config/database');
const models = require('./models');

console.log('Initializing database setup...');

// Function to sync all models with the database
const syncDatabase = async (force = false) => {
  try {
    console.log(`Syncing database with force=${force}...`);
    
    // Sync all models
    await sequelize.sync({ force });
    
    console.log('Database synchronized successfully');
    
    // If force is true, seed the database with initial data
    if (force) {
      await seedDatabase();
    }
    
    return true;
  } catch (error) {
    console.error('Error syncing database:', error);
    throw error;
  }
};

// Function to seed the database with initial data
const seedDatabase = async () => {
  console.log('Seeding database with initial data...');
  
  try {
    // Create admin user
    const adminUser = await models.User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@nettoria.com',
      phoneNumber: '09123456789',
      password: 'admin123',
      role: 'admin',
      isPhoneVerified: true,
      isEmailVerified: true
    });
    
    console.log(`Admin user created with ID: ${adminUser.id}`);
    
    // Create sample services
    const vmService = await models.Service.create({
      name: 'Virtual Server',
      description: 'High-performance virtual servers for all your computing needs',
      category: 'vm',
      baseSpecs: JSON.stringify({
        cpu: 1,
        memory: 1024,
        storage: 20,
        bandwidth: 1000
      }),
      plans: JSON.stringify([
        {
          name: 'Basic',
          specs: {
            cpu: 1,
            memory: 1024,
            storage: 20,
            bandwidth: 1000
          },
          hourlyPrice: 0.01,
          monthlyPrice: 7.2
        },
        {
          name: 'Standard',
          specs: {
            cpu: 2,
            memory: 2048,
            storage: 40,
            bandwidth: 2000
          },
          hourlyPrice: 0.02,
          monthlyPrice: 14.4
        },
        {
          name: 'Premium',
          specs: {
            cpu: 4,
            memory: 4096,
            storage: 80,
            bandwidth: 4000
          },
          hourlyPrice: 0.04,
          monthlyPrice: 28.8
        }
      ]),
      dataCenters: JSON.stringify([
        { id: 'dc1', name: 'Tehran (IR-THR)' },
        { id: 'dc2', name: 'Dubai (UAE-DXB)' },
        { id: 'dc3', name: 'Frankfurt (DE-FRA)' }
      ]),
      operatingSystems: JSON.stringify([
        { id: 'win-server-2019', name: 'Windows Server 2019' },
        { id: 'win-server-2022', name: 'Windows Server 2022' },
        { id: 'ubuntu-20.04', name: 'Ubuntu 20.04 LTS' },
        { id: 'ubuntu-22.04', name: 'Ubuntu 22.04 LTS' },
        { id: 'centos-7', name: 'CentOS 7' },
        { id: 'debian-11', name: 'Debian 11' }
      ]),
      configOptions: JSON.stringify({
        cpu: {
          min: 1,
          max: 16,
          step: 1,
          pricePerUnit: 0.005
        },
        memory: {
          min: 1024,
          max: 32768,
          step: 1024,
          pricePerUnit: 0.002
        },
        storage: {
          min: 20,
          max: 1000,
          step: 10,
          pricePerUnit: 0.0005
        },
        bandwidth: {
          min: 1000,
          max: 10000,
          step: 1000,
          pricePerUnit: 0.001
        }
      }),
      baseHourlyPrice: 0.01,
      isActive: true
    });
    
    console.log(`VM service created with ID: ${vmService.id}`);
    
    // Create wallet for admin
    const adminWallet = await models.Wallet.create({
      userId: adminUser.id,
      balance: 100.00,
      status: 'active'
    });
    
    console.log(`Admin wallet created with ID: ${adminWallet.id}`);
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// Run database setup
const setup = async () => {
  try {
    // Check command line arguments
    const args = process.argv.slice(2);
    const force = args.includes('--force');
    const clean = args.includes('--clean');
    
    if (clean) {
      // Drop all tables and recreate
      await sequelize.drop();
      console.log('Database cleaned successfully');
    }
    
    // Sync database
    await syncDatabase(force);
    
    console.log('Database setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  setup();
}

module.exports = {
  syncDatabase,
  seedDatabase
}; 