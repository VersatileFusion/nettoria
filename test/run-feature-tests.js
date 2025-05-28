/**
 * Nettoria Feature Tests Runner
 * Runs all main feature tests in sequence
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const setupTestUser = require("./helpers/setup-test-user");

// Main feature test scripts
const FEATURE_TESTS = [
  "test-auth-feature.js",
  "test-vm-feature.js",
  "test-billing-feature.js",
  "test-dashboard-feature.js",
  "test-support-feature.js",
  "test-admin-feature.js",
  "test-vcenter-suite-feature.js",
];

/**
 * Run a test script
 */
function runTest(scriptName) {
  return new Promise((resolve) => {
    console.log(`\n=== Running ${scriptName} ===`);
    console.log("---------------------------------------------------");

    const scriptPath = path.resolve(__dirname, scriptName);

    if (!fs.existsSync(scriptPath)) {
      console.error(`❌ Test script not found: ${scriptPath}`);
      resolve(false);
      return;
    }

    const testProcess = spawn("node", [scriptPath], {
      stdio: "inherit",
    });

    testProcess.on("close", (code) => {
      console.log("---------------------------------------------------");
      if (code === 0) {
        console.log(`✅ ${scriptName} completed successfully!`);
        resolve(true);
      } else {
        console.error(`⚠️ ${scriptName} exited with code: ${code}`);
        resolve(false);
      }
      console.log("---------------------------------------------------\n");
    });
  });
}

/**
 * Run all tests in sequence
 */
async function runAllTests() {
  console.log("\n=== NETTORIA FEATURE TESTS ===\n");

  // Reset the database before tests
  console.log("Resetting database...");
  try {
    const resetDbPath = path.resolve(__dirname, "../reset-test-db.js");
    if (fs.existsSync(resetDbPath)) {
      const resetDatabase = require("../reset-test-db");
      await resetDatabase();
      console.log("Database reset complete");
    } else {
      console.warn("⚠️ reset-test-db.js not found, skipping database reset");
    }
  } catch (err) {
    console.error("Error resetting database:", err.message);
  }

  // Setup verified test user for all tests
  console.log("\n=== Creating Verified Test User ===");
  try {
    const testUser = await setupTestUser();
    console.log(
      `Successfully created verified test user with ID: ${testUser.id}`
    );
    console.log("User credentials:");
    console.log(`- Email: ${testUser.email}`);
    console.log(`- Phone: ${testUser.phoneNumber}`);
    console.log(`- First name: ${testUser.firstName}`);
    console.log(`- Last name: ${testUser.lastName}`);
  } catch (error) {
    console.error("Failed to create test user:", error.message);
    process.exit(1);
  }

  let passedCount = 0;
  let failedCount = 0;

  // Run all tests in sequence
  for (const test of FEATURE_TESTS) {
    const success = await runTest(test);
    if (success) {
      passedCount++;
    } else {
      failedCount++;
    }
  }

  // Print summary
  console.log("\n=== TEST SUMMARY ===");
  console.log(`Total Tests: ${FEATURE_TESTS.length}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${failedCount}`);
  console.log("=====================\n");
}

// Run all tests
runAllTests().catch((err) => {
  console.error("Error running tests:", err);
  process.exit(1);
});
