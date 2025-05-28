const { Client } = require('pg');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get password from user
rl.question('Enter your PostgreSQL password: ', async (password) => {
  // Connect to the database
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
    
    // Get all columns from the Users table
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'Users'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n=== Current "Users" Table Schema ===');
    columnsResult.rows.forEach(column => {
      console.log(`${column.column_name}: ${column.data_type} | Nullable: ${column.is_nullable} | Default: ${column.column_default || 'none'}`);
    });

    // Define expected columns for our application
    const expectedColumns = [
      'id',
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'nationalId',
      'phoneVerificationCode',
      'phoneVerificationExpires',
      'emailVerificationToken',
      'password',
      'isPhoneVerified',
      'isEmailVerified',
      'role',
      'createdAt',
      'updatedAt'
    ];

    // Check if any expected columns are missing
    console.log('\n=== Missing Columns Check ===');
    const existingColumns = columnsResult.rows.map(col => col.column_name);
    const missingColumns = expectedColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('Missing columns:');
      missingColumns.forEach(col => console.log(`- ${col}`));
    } else {
      console.log('All expected columns are present in the table.');
    }

    // Close the client connection
    await client.end();
  } catch (error) {
    console.error('Error checking schema:', error.message);
  } finally {
    // Close the readline interface
    rl.close();
  }
}); 