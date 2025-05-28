const { Client } = require('pg');

/**
 * Reset the test database by removing test users
 * @param {Object} options Options for the database reset
 * @param {string} options.password PostgreSQL password (default: 'postgres')
 * @returns {Promise<void>}
 */
async function resetDatabase(options = {}) {
  const password = options.password || 'postgres';
  
  // Connect to the database with hardcoded password (same as test script)
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'nettoria_db',
    password: password,
    port: 5432,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');
    
    // Delete test users
    console.log('Deleting test users from database...');
    
    // Query to check if user exists
    const checkUserResult = await client.query(`
      SELECT id, email, "phoneNumber" FROM "Users" 
      WHERE email = 'test@example.com' OR "phoneNumber" = '+1234567890';
    `);
    
    if (checkUserResult.rows.length > 0) {
      console.log(`Found ${checkUserResult.rows.length} test user(s):`, checkUserResult.rows);
      
      // Delete the user
      const deleteResult = await client.query(`
        DELETE FROM "Users" 
        WHERE email = 'test@example.com' OR "phoneNumber" = '+1234567890';
      `);
      
      console.log(`Deleted ${deleteResult.rowCount} test user(s)`);
    } else {
      console.log('No test users found in the database');
    }
    
    console.log('Database reset completed successfully!');
    
    // Close the client connection
    await client.end();
    return true;
  } catch (error) {
    console.error('Error resetting database:', error);
    return false;
  }
}

// Run directly if this script is executed directly
if (require.main === module) {
  resetDatabase().catch(err => {
    console.error('Failed to reset database:', err);
    process.exit(1);
  });
}

module.exports = resetDatabase; 