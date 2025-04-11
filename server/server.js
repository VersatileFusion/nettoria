/**
 * Nettoria Server - Cloud Service Provider Platform
 */

console.log("Starting Nettoria server...");

// Wrap app import in try/catch to handle potential errors
try {
  // Import the main application
  const app = require("./src/app");
  console.log("App imported successfully");
} catch (error) {
  console.error("Failed to import app:", error.message);

  // Create a simple Express server as fallback
  const express = require("express");
  const app = express();

  // Basic routes
  app.get("/", (req, res) => {
    res.json({ message: "Nettoria API - Fallback Mode" });
  });

  app.get("/health", (req, res) => {
    res.json({ status: "ok", mode: "fallback" });
  });

  // Start the server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running in fallback mode on port ${PORT}`);
  });
}

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

console.log("Nettoria server initialization process completed");
