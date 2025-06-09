const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'postgres' // Connect to default postgres database first
});

async function testConnection() {
  try {
    console.log('Attempting to connect to PostgreSQL...');
    await client.connect();
    console.log('Successfully connected to PostgreSQL!');

    // Check if test database exists
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'nettoria_test'"
    );

    if (result.rowCount === 0) {
      console.log('Creating test database...');
      await client.query('CREATE DATABASE nettoria_test');
      console.log('Test database created successfully!');
    } else {
      console.log('Test database already exists.');
    }

    // Try connecting to test database
    await client.end();
    const testClient = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'postgres',
      database: 'nettoria_test'
    });

    await testClient.connect();
    console.log('Successfully connected to test database!');
    await testClient.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testConnection(); 