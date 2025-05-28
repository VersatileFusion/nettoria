/**
 * vCenter Security Test Script
 * Tests different TLS/SSL versions and security settings to diagnose connection issues
 */

// Add immediate console output to check if script is running
console.log("Script starting...");

const fs = require("fs");
const path = require("path");
const https = require("https");
const tls = require("tls");
const net = require("net");
const { URL } = require("url");

console.log("Modules loaded");

// Load environment variables from vcenter-test.env file
function loadEnvFile(filePath) {
  console.log(`Attempting to load env file from: ${filePath}`);
  try {
    const envContent = fs.readFileSync(filePath, "utf-8");
    const envVars = {};

    // Parse each line in the env file
    envContent.split("\n").forEach((line) => {
      line = line.trim();
      // Skip empty lines and comments
      if (!line || line.startsWith("#")) return;

      // Split by the first equals sign
      const index = line.indexOf("=");
      if (index !== -1) {
        const key = line.slice(0, index).trim();
        let value = line.slice(index + 1).trim();

        // Remove surrounding quotes if present
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        envVars[key] = value;
      }
    });

    console.log(
      `Loaded env file, found ${Object.keys(envVars).length} variables`
    );
    return envVars;
  } catch (error) {
    console.error(`Error loading env file ${filePath}:`, error.message);
    return {};
  }
}
