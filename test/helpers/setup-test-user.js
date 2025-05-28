/**
 * Setup Test User
 * Creates and verifies a test user for API testing
 */

const { Client } = require("pg");

// Standard test user credentials
const testUser = {
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
  phoneNumber: "+1234567890",
  password: "Password123!",
};

/**
 * Creates or updates a test user in the database and ensures they are verified
 * @returns {Promise<Object>} The test user information
 */
async function setupTestUser() {
  // Connect to the database
  const client = new Client({
    user: "postgres",
    host: "localhost",
    database: "nettoria_db",
    password: "postgres",
    port: 5432,
  });

  try {
    await client.connect();
    console.log("Connected to database for test user setup...");

    // Check if test user exists
    const checkUser = await client.query(
      `
      SELECT id, email, "phoneNumber", "isPhoneVerified", "isEmailVerified", "status" 
      FROM "Users" 
      WHERE email = $1 OR "phoneNumber" = $2
    `,
      [testUser.email, testUser.phoneNumber]
    );

    let userId;

    if (checkUser.rows.length > 0) {
      // User exists, update to ensure verification
      userId = checkUser.rows[0].id;
      console.log(
        `Test user already exists with ID: ${userId}, updating verification status...`
      );

      await client.query(
        `
        UPDATE "Users"
        SET "isPhoneVerified" = true,
            "isEmailVerified" = true,
            "status" = 'active',
            "phoneVerificationCode" = NULL,
            "phoneVerificationExpires" = NULL,
            "verificationCode" = NULL,
            "verificationCodeExpires" = NULL,
            "updatedAt" = NOW()
        WHERE id = $1
      `,
        [userId]
      );
    } else {
      // User doesn't exist, create a new one
      console.log("Creating new test user...");

      // Use bcrypt for password hashing like the real system would
      const bcrypt = require("bcrypt");
      const hashedPassword = await bcrypt.hash(testUser.password, 10);

      const result = await client.query(
        `
        INSERT INTO "Users" (
          "firstName", 
          "lastName", 
          "email", 
          "phoneNumber",
          "password", 
          "isPhoneVerified", 
          "isEmailVerified", 
          "status", 
          "role",
          "createdAt", 
          "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, true, true, 'active', 'user', NOW(), NOW())
        RETURNING id
      `,
        [
          testUser.firstName,
          testUser.lastName,
          testUser.email,
          testUser.phoneNumber,
          hashedPassword,
        ]
      );

      userId = result.rows[0].id;
      console.log(`New test user created with ID: ${userId}`);
    }

    // Verify current state
    const verifiedUser = await client.query(
      `
      SELECT id, email, "phoneNumber", "isPhoneVerified", "isEmailVerified", "status" 
      FROM "Users" 
      WHERE id = $1
    `,
      [userId]
    );

    console.log("Test user ready:", verifiedUser.rows[0]);

    // Return test user info with ID
    return {
      ...testUser,
      id: userId,
      isVerified: true,
    };
  } catch (error) {
    console.error("Error setting up test user:", error);
    throw error;
  } finally {
    await client.end();
  }
}

module.exports = setupTestUser;
