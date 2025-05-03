/**
 * Nettoria Server - Cloud Service Provider Platform
 */

console.log("Starting Nettoria server...");

// Function to ensure database is ready before starting the server
const prepareDatabase = async () => {
  try {
    // Import the database configuration
    const sequelize = require("./src/config/database");

    // Test connection
    await sequelize.authenticate();
    console.log("Database connection verified.");

    // Sync models if in development mode and sync flag is set
    if (
      process.env.NODE_ENV === "development" &&
      process.env.AUTO_SYNC_DB === "true"
    ) {
      console.log("Auto-syncing database in development mode");
      await sequelize.sync();
      console.log("Database models synchronized");
    }

    return true;
  } catch (error) {
    console.error("Database preparation failed:", error.message);
    return false;
  }
};

// Main startup sequence
const startServer = async () => {
  try {
    // Prepare database
    await prepareDatabase();

    // Import the main application
    const app = require("./src/app");
    console.log("App imported successfully");
  } catch (error) {
    console.error("Failed to start normally:", error.message);

    // Create a simple Express server as fallback
    const express = require("express");
    const app = express();

    // Basic routes
    app.get("/", (req, res) => {
      res.json({
        message: "Nettoria API - Fallback Mode",
        error: error.message,
      });
    });

    app.get("/health", (req, res) => {
      res.json({ status: "error", mode: "fallback", error: error.message });
    });

    // Start the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running in fallback mode on port ${PORT}`);
    });
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

// Start the server
startServer();

console.log("Nettoria server initialization process completed");
