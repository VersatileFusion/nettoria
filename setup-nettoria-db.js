const { Client } = require('pg');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get password from user
rl.question('Enter your PostgreSQL password: ', async (password) => {
  // Connect to the PostgreSQL server, using the postgres database to create our new DB
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres', // Connect to default database first
    password: password,
    port: 5432,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL server');
    
    // Check if the database already exists
    const checkDbResult = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'nettoria_db'"
    );

    if (checkDbResult.rows.length === 0) {
      // Create the database if it doesn't exist
      console.log('Creating nettoria_db database...');
      await client.query('CREATE DATABASE nettoria_db');
      console.log('Database nettoria_db created successfully');
    } else {
      console.log('Database nettoria_db already exists');
    }

    // Close the client connection to postgres database
    await client.end();
    console.log('Closed connection to postgres database');

    // Connect to the newly created database
    const nettoriaClient = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'nettoria_db', // Connect to our new database
      password: password,
      port: 5432,
    });

    await nettoriaClient.connect();
    console.log('Connected to nettoria_db database');

    // Check if the "Users" table exists (with capital U)
    const checkUsersTable = await nettoriaClient.query(`
      SELECT to_regclass('"Users"') as table_exists;
    `);
    
    if (checkUsersTable.rows[0].table_exists === null) {
      // Drop the lowercase "users" table if it exists (from previous runs)
      await nettoriaClient.query(`
        DROP TABLE IF EXISTS users;
      `);
    
      // Create the "Users" table with capital U
      console.log('Creating "Users" table with capital U...');
      await nettoriaClient.query(`
        CREATE TABLE "Users" (
          id SERIAL PRIMARY KEY,
          "firstName" VARCHAR(100),
          "lastName" VARCHAR(100),
          email VARCHAR(255) UNIQUE NOT NULL,
          "phoneNumber" VARCHAR(20),
          "nationalId" VARCHAR(20) UNIQUE,
          "phoneVerificationCode" VARCHAR(10),
          "phoneVerificationExpires" TIMESTAMP,
          "emailVerificationToken" VARCHAR(255),
          "passwordResetToken" VARCHAR(255),
          "passwordResetExpires" TIMESTAMP,
          "status" VARCHAR(20) DEFAULT 'active',
          "verificationCode" VARCHAR(10),
          "verificationCodeExpires" TIMESTAMP,
          password VARCHAR(255) NOT NULL,
          "isPhoneVerified" BOOLEAN DEFAULT false,
          "isEmailVerified" BOOLEAN DEFAULT false,
          role VARCHAR(20) DEFAULT 'user',
          "createdAt" TIMESTAMP DEFAULT NOW(),
          "updatedAt" TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('"Users" table created successfully');
    } else {
      console.log('"Users" table already exists');
      
      // Check if the nationalId column exists
      const checkNationalIdColumn = await nettoriaClient.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Users' AND column_name = 'nationalId';
      `);
      
      if (checkNationalIdColumn.rows.length === 0) {
        // Add the nationalId column if it doesn't exist
        console.log('Adding "nationalId" column to "Users" table...');
        await nettoriaClient.query(`
          ALTER TABLE "Users" 
          ADD COLUMN "nationalId" VARCHAR(20) UNIQUE;
        `);
        console.log('"nationalId" column added successfully');
      } else {
        console.log('"nationalId" column already exists');
      }
      
      // Check if the phoneVerificationCode column exists
      const checkVerificationCodeColumn = await nettoriaClient.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Users' AND column_name = 'phoneVerificationCode';
      `);
      
      if (checkVerificationCodeColumn.rows.length === 0) {
        // Add the phoneVerificationCode column if it doesn't exist
        console.log('Adding "phoneVerificationCode" column to "Users" table...');
        await nettoriaClient.query(`
          ALTER TABLE "Users" 
          ADD COLUMN "phoneVerificationCode" VARCHAR(10);
        `);
        console.log('"phoneVerificationCode" column added successfully');
      } else {
        console.log('"phoneVerificationCode" column already exists');
      }
      
      // Check if the phoneVerificationExpires column exists
      const checkVerificationExpiresColumn = await nettoriaClient.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Users' AND column_name = 'phoneVerificationExpires';
      `);
      
      if (checkVerificationExpiresColumn.rows.length === 0) {
        // Add the phoneVerificationExpires column if it doesn't exist
        console.log('Adding "phoneVerificationExpires" column to "Users" table...');
        await nettoriaClient.query(`
          ALTER TABLE "Users" 
          ADD COLUMN "phoneVerificationExpires" TIMESTAMP;
        `);
        console.log('"phoneVerificationExpires" column added successfully');
      } else {
        console.log('"phoneVerificationExpires" column already exists');
      }
      
      // Check if the emailVerificationToken column exists
      const checkEmailVerificationTokenColumn = await nettoriaClient.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Users' AND column_name = 'emailVerificationToken';
      `);
      
      if (checkEmailVerificationTokenColumn.rows.length === 0) {
        // Add the emailVerificationToken column if it doesn't exist
        console.log('Adding "emailVerificationToken" column to "Users" table...');
        await nettoriaClient.query(`
          ALTER TABLE "Users" 
          ADD COLUMN "emailVerificationToken" VARCHAR(255);
        `);
        console.log('"emailVerificationToken" column added successfully');
      } else {
        console.log('"emailVerificationToken" column already exists');
      }
      
      // Check if the passwordResetToken column exists
      const checkPasswordResetTokenColumn = await nettoriaClient.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Users' AND column_name = 'passwordResetToken';
      `);
      
      if (checkPasswordResetTokenColumn.rows.length === 0) {
        console.log('Adding "passwordResetToken" column to "Users" table...');
        await nettoriaClient.query(`
          ALTER TABLE "Users" 
          ADD COLUMN "passwordResetToken" VARCHAR(255);
        `);
        console.log('"passwordResetToken" column added successfully');
      } else {
        console.log('"passwordResetToken" column already exists');
      }
      
      // Check if the passwordResetExpires column exists
      const checkPasswordResetExpiresColumn = await nettoriaClient.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Users' AND column_name = 'passwordResetExpires';
      `);
      
      if (checkPasswordResetExpiresColumn.rows.length === 0) {
        console.log('Adding "passwordResetExpires" column to "Users" table...');
        await nettoriaClient.query(`
          ALTER TABLE "Users" 
          ADD COLUMN "passwordResetExpires" TIMESTAMP;
        `);
        console.log('"passwordResetExpires" column added successfully');
      } else {
        console.log('"passwordResetExpires" column already exists');
      }
      
      // Check if the status column exists
      const checkStatusColumn = await nettoriaClient.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Users' AND column_name = 'status';
      `);
      
      if (checkStatusColumn.rows.length === 0) {
        console.log('Adding "status" column to "Users" table...');
        await nettoriaClient.query(`
          ALTER TABLE "Users" 
          ADD COLUMN "status" VARCHAR(20) DEFAULT 'active';
        `);
        console.log('"status" column added successfully');
      } else {
        console.log('"status" column already exists');
      }
      
      // Check if the verificationCode column exists
      const checkVerificationCodeGenericColumn = await nettoriaClient.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Users' AND column_name = 'verificationCode';
      `);
      
      if (checkVerificationCodeGenericColumn.rows.length === 0) {
        console.log('Adding "verificationCode" column to "Users" table...');
        await nettoriaClient.query(`
          ALTER TABLE "Users" 
          ADD COLUMN "verificationCode" VARCHAR(10);
        `);
        console.log('"verificationCode" column added successfully');
      } else {
        console.log('"verificationCode" column already exists');
      }
      
      // Check if the verificationCodeExpires column exists
      const checkVerificationCodeExpiresColumn = await nettoriaClient.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Users' AND column_name = 'verificationCodeExpires';
      `);
      
      if (checkVerificationCodeExpiresColumn.rows.length === 0) {
        console.log('Adding "verificationCodeExpires" column to "Users" table...');
        await nettoriaClient.query(`
          ALTER TABLE "Users" 
          ADD COLUMN "verificationCodeExpires" TIMESTAMP;
        `);
        console.log('"verificationCodeExpires" column added successfully');
      } else {
        console.log('"verificationCodeExpires" column already exists');
      }
    }

    // Close the client connection
    await nettoriaClient.end();
    console.log('Setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error.message);
  } finally {
    // Close the readline interface
    rl.close();
  }
}); 