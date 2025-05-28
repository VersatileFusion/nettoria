const { Pool } = require('pg');

// Database connection configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'nettoria',
  password: process.env.DB_PASSWORD || '', // Set via environment variable for security
  port: process.env.DB_PORT || 5432,
});

// Export a function to query the database
module.exports = {
  query: (text, params) => pool.query(text, params),
  getPool: () => pool,
  
  // Function to connect and return client
  connect: async () => {
    const client = await pool.connect();
    return client;
  }
}; 