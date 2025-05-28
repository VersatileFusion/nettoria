/**
 * Simple PostgreSQL connection test to verify if PostgreSQL is running and accessible
 */
const { Client } = require("pg");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from server/.env
dotenv.config({ path: path.resolve(__dirname, "../server/.env") });

console.log("Testing direct PostgreSQL connection...");
console.log("Connection details:");
console.log({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  database: process.env.DB_NAME || "nettoria_db",
  // Hiding password for security
  password: "********",
});

const client = new Client({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "postgres",
  database: process.env.DB_NAME || "nettoria_db",
});

async function testConnection() {
  try {
    await client.connect();
    console.log("✅ Successfully connected to PostgreSQL!");

    // Test query
    const res = await client.query("SELECT current_timestamp as now");
    console.log("Server time:", res.rows[0].now);

    console.log(
      "Connection test passed. PostgreSQL is running and accessible."
    );
    return true;
  } catch (err) {
    console.error("❌ PostgreSQL connection error:");
    console.error(err.message);

    if (err.code === "ECONNREFUSED") {
      console.error("\nPossible causes:");
      console.error(
        "1. PostgreSQL is not running. Check Services or Task Manager."
      );
      console.error(
        "2. PostgreSQL is not listening on the specified port (check postgresql.conf)."
      );
      console.error("3. Firewall is blocking connections.");
    }

    return false;
  } finally {
    await client.end();
  }
}

testConnection();
