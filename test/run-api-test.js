/**
 * vCenter API Test Runner
 * Manages VPN connection and runs API tests
 */

const { spawn, execSync } = require("child_process");
const readline = require("readline");
const path = require("path");
const fs = require("fs");

// Configuration
const INTERNAL_IP = "192.168.120.246";
const VPN_HOST = "test.vahabstormzone.info";
const VPN_USER = "ahmadvand";
const VPN_PASS = "224451";

// Available test scripts
const TEST_SCRIPTS = {
  basic: "test-internal-ip.js",
  rest: "test-vcenter-rest-auto.js",
  soap: "test-vcenter-auto.js",
  diagnostic: "test-vpn-connection.js",
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Check if VPN is connected
 */
function checkVpnConnection() {
  try {
    console.log("Checking VPN connection status...");

    // On Windows, use rasdial to check VPN connections
    const output = execSync("rasdial", { encoding: "utf8" });

    if (output.includes(VPN_HOST) || output.includes("VMware vCenter VPN")) {
      console.log("✅ VPN is connected!");
      return true;
    } else {
      console.log("❌ VPN is not connected.");
      return false;
    }
  } catch (error) {
    console.error(`Error checking VPN status: ${error.message}`);
    return false;
  }
}

/**
 * Connect to VPN
 */
function connectVpn() {
  return new Promise((resolve, reject) => {
    console.log(`Connecting to VPN: ${VPN_HOST}...`);

    try {
      // On Windows, use rasdial to connect
      const vpnProcess = spawn("rasdial", [
        "VMware vCenter VPN",
        VPN_USER,
        VPN_PASS,
      ]);

      let output = "";

      vpnProcess.stdout.on("data", (data) => {
        output += data.toString();
        console.log(data.toString().trim());
      });

      vpnProcess.stderr.on("data", (data) => {
        console.error(data.toString().trim());
      });

      vpnProcess.on("close", (code) => {
        if (code === 0 || output.includes("Successfully connected")) {
          console.log("✅ VPN connected successfully!");
          resolve(true);
        } else {
          console.error(`❌ VPN connection failed with code: ${code}`);
          resolve(false);
        }
      });
    } catch (error) {
      console.error(`Error connecting to VPN: ${error.message}`);
      resolve(false);
    }
  });
}

/**
 * Run a test script
 */
function runTest(scriptName) {
  return new Promise((resolve) => {
    console.log(`\nRunning test script: ${scriptName}`);

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
      if (code === 0) {
        console.log(`\n✅ Test script ${scriptName} completed successfully!`);
        resolve(true);
      } else {
        console.error(
          `\n❌ Test script ${scriptName} failed with code: ${code}`
        );
        resolve(false);
      }
    });
  });
}

/**
 * Show menu and handle user selection
 */
async function showMenu() {
  console.log("\n=== vCenter API Test Runner ===");
  console.log("1. Check VPN connection");
  console.log("2. Connect to VPN");
  console.log("3. Run Basic API test");
  console.log("4. Run REST API test");
  console.log("5. Run SOAP API test");
  console.log("6. Run Diagnostic test");
  console.log("7. Run all tests");
  console.log("8. Exit");

  rl.question("\nEnter your choice (1-8): ", async (choice) => {
    switch (choice) {
      case "1":
        checkVpnConnection();
        break;

      case "2":
        await connectVpn();
        break;

      case "3":
        await runTest(TEST_SCRIPTS.basic);
        break;

      case "4":
        await runTest(TEST_SCRIPTS.rest);
        break;

      case "5":
        await runTest(TEST_SCRIPTS.soap);
        break;

      case "6":
        await runTest(TEST_SCRIPTS.diagnostic);
        break;

      case "7":
        console.log("\n=== Running all tests ===");

        // First check VPN
        const isConnected = checkVpnConnection();

        // Connect if needed
        if (!isConnected) {
          const connected = await connectVpn();
          if (!connected) {
            console.error("❌ Cannot proceed without VPN connection.");
            break;
          }
        }

        // Run all tests in sequence
        await runTest(TEST_SCRIPTS.diagnostic);
        await runTest(TEST_SCRIPTS.basic);
        await runTest(TEST_SCRIPTS.rest);
        await runTest(TEST_SCRIPTS.soap);

        console.log("\n=== All tests completed ===");
        break;

      case "8":
        console.log("Exiting...");
        rl.close();
        process.exit(0);
        break;

      default:
        console.log("Invalid choice. Please try again.");
    }

    // Show menu again
    setTimeout(showMenu, 500);
  });
}

// Start the program
console.log("Starting vCenter API Test Runner...");
showMenu();
