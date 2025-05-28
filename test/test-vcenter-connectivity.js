/**
 * Simple vCenter Connectivity Test
 * Tests basic HTTPS connectivity to vCenter server
 */

const https = require("https");
const readline = require("readline");

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to prompt for user input
function promptUserInput(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Test HTTP connectivity to a given host
function testHttpsConnectivity(
  host,
  port = 443,
  path = "/",
  ignoreCert = false
) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: host,
      port: port,
      path: path,
      method: "GET",
      timeout: 10000, // 10 second timeout
      rejectUnauthorized: !ignoreCert,
    };

    console.log(`Testing HTTPS connectivity to ${host}:${port}${path}`);

    const req = https.request(options, (res) => {
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Headers: ${JSON.stringify(res.headers)}`);

      res.on("data", () => {
        // Just consuming the data, not storing it
      });

      res.on("end", () => {
        resolve({
          success: true,
          statusCode: res.statusCode,
          headers: res.headers,
        });
      });
    });

    req.on("error", (error) => {
      console.error(`Connection error: ${error.message}`);

      // Provide more detailed error information
      if (error.code === "ECONNREFUSED") {
        console.error(
          "Connection was refused. The server may be down or not accepting connections on that port."
        );
      } else if (error.code === "ENOTFOUND") {
        console.error(
          "Host not found. Check your DNS or try using an IP address instead."
        );
      } else if (error.code === "ETIMEDOUT") {
        console.error(
          "Connection timed out. The server might be behind a firewall or under heavy load."
        );
      } else if (
        error.code === "CERT_HAS_EXPIRED" ||
        error.code.includes("CERT") ||
        error.code.includes("TLS")
      ) {
        console.error(
          "SSL certificate issue. Try enabling the ignore SSL option."
        );
      }

      reject(error);
    });

    req.on("timeout", () => {
      req.destroy();
      console.error("Request timed out after 10 seconds");
      reject(new Error("Request timed out after 10 seconds"));
    });

    req.end();
  });
}

// Main function
async function runConnectivityTest() {
  try {
    console.log("=== vCenter Basic Connectivity Test ===\n");

    const host = await promptUserInput(
      "Enter vCenter hostname or IP (without https://): "
    );
    const port = (await promptUserInput("Enter port (default: 443): ")) || 443;
    const ignoreCert =
      (
        await promptUserInput("Ignore SSL certificate errors? (y/n): ")
      ).toLowerCase() === "y";

    console.log("\nRunning tests...\n");

    // Test main HTTPS endpoint
    try {
      await testHttpsConnectivity(host, port, "/", ignoreCert);
      console.log("✅ Basic HTTPS connectivity: SUCCESS");
    } catch (error) {
      console.error("❌ Basic HTTPS connectivity: FAILED");
    }

    // Test vCenter REST API endpoint
    try {
      await testHttpsConnectivity(host, port, "/rest", ignoreCert);
      console.log("✅ REST API endpoint: SUCCESS");
    } catch (error) {
      console.error("❌ REST API endpoint: FAILED");
    }

    // Test vCenter SOAP API endpoint
    try {
      await testHttpsConnectivity(host, port, "/sdk", ignoreCert);
      console.log("✅ SOAP API endpoint: SUCCESS");
    } catch (error) {
      console.error("❌ SOAP API endpoint: FAILED");
    }

    // Test vCenter UI endpoint
    try {
      await testHttpsConnectivity(host, port, "/ui", ignoreCert);
      console.log("✅ vCenter UI endpoint: SUCCESS");
    } catch (error) {
      console.error("❌ vCenter UI endpoint: FAILED");
    }

    console.log("\nConnectivity test completed.");
  } catch (error) {
    console.error("Test failed:", error.message);
  } finally {
    rl.close();
  }
}

runConnectivityTest();
