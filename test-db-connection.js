const { Pool } = require('pg');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get password from user
rl.question('Enter your PostgreSQL password: ', async (password) => {
  // Database connection configuration
  const pool = new Pool({
    user: 'postgres',      // default PostgreSQL user
    host: 'localhost',     // database host
    database: 'nettoria',  // database name
    password: 'postgres',    // use the password entered by user
    port: 5432,            // default PostgreSQL port
  });

  try {
    // Connect to the database
    const client = await pool.connect();
    console.log('Successfully connected to the nettoria database!');
    
    // Run a simple query to test the connection
    const result = await client.query('SELECT NOW()');
    console.log('Database time:', result.rows[0].now);
    
    // Release the connection
    client.release();
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
  } finally {
    // End the pool
    await pool.end();
    // Close the readline interface
    rl.close();
  }
}); 