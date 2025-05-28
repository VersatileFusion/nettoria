/**
 * Automated vCenter SOAP API Test Script
 * This script tests connection to vCenter SOAP API using credentials from vcenter-test.env
 */

require("dotenv").config({ path: "./vcenter-test.env" });
const fs = require("fs");
const path = require("path");
const https = require("https");
const { URL } = require("url");
const VsphereClient = require("node-vsphere-soap");

// Enable more detailed diagnostics
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
process.env.DEBUG = "node-vsphere-soap";

// Force using IPv4 - can help with connection issues
process.env.NODE_OPTIONS = "--dns-result-order=ipv4first";

// IP address bypass - use this if hostname resolution is causing problems
const IP_OVERRIDE = "192.168.120.246"; // Internal IP address via VPN

// Load environment variables from vcenter-test.env file if not loaded by dotenv
function loadEnvFile(filePath) {
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

        // Set environment variable if not set
        if (!process.env[key]) {
          process.env[key] = value;
        }

        envVars[key] = value;
      }
    });

    return envVars;
  } catch (error) {
    console.error(`Error loading env file ${filePath}:`, error.message);
    return {};
  }
}

/**
 * Wait for specified milliseconds
 * @param {number} ms - milliseconds to wait
 * @returns {Promise} resolves after delay
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Patch the node-vsphere-soap client to use a specific IP address
 * This is a workaround for DNS resolution issues
 */
function patchSoapClient(client, ipAddress, hostname) {
  // Save the original _sendRequest method
  const originalSendRequest = client._sendRequest;

  // Override the _sendRequest method to replace hostname with IP in URLs
  client._sendRequest = function (method, soapBody, callback) {
    // Add Host header with original hostname but use IP in URL
    if (
      this._connection &&
      this._connection._httpOptions &&
      this._connection._httpOptions.headers
    ) {
      this._connection._httpOptions.headers["Host"] = hostname;
    }

    // If the client has a connection URL that uses the hostname, replace it with the IP
    if (this._connection && this._connection._url) {
      const originalUrl = this._connection._url;
      if (originalUrl.includes(hostname)) {
        this._connection._url = originalUrl.replace(hostname, ipAddress);
        console.log(
          `Changed connection URL from ${originalUrl} to ${this._connection._url}`
        );
      }
    }

    // Call the original method
    return originalSendRequest.call(this, method, soapBody, callback);
  };

  // Also patch the connection object if it exists
  if (client._connection) {
    // Save original URL for later use
    const originalUrl = client._connection._url;

    // If IP address is provided, patch the connection URL
    if (ipAddress && hostname && originalUrl.includes(hostname)) {
      client._connection._url = originalUrl.replace(hostname, ipAddress);

      // Add Host header with original hostname to maintain proper vCenter routing
      if (!client._connection._httpOptions) {
        client._connection._httpOptions = {};
      }
      if (!client._connection._httpOptions.headers) {
        client._connection._httpOptions.headers = {};
      }
      client._connection._httpOptions.headers["Host"] = hostname;

      console.log(
        `Modified connection URL to use IP address directly: ${client._connection._url}`
      );
    }
  }

  return client;
}

/**
 * Test basic connectivity to a host
 */
async function testBasicConnectivity(hostname) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname,
        port: 443,
        path: "/",
        method: "GET",
        rejectUnauthorized: false,
        timeout: 5000,
        // Add custom headers that might help with firewalls
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) vCenter API Test",
          Connection: "keep-alive",
          Accept: "*/*",
          "Cache-Control": "no-cache",
        },
      },
      (res) => {
        console.log(`✅ Server responded with status code: ${res.statusCode}`);
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          console.log(`Response length: ${data.length} bytes`);
          resolve(true);
        });
      }
    );

    req.on("error", (error) => {
      console.warn(`⚠️ Basic connectivity test failed: ${error.message}`);
      resolve(false);
    });

    req.on("timeout", () => {
      req.destroy();
      console.warn("⚠️ Basic connectivity test timed out");
      resolve(false);
    });

    req.end();
  });
}

// Main function to test vCenter SOAP API
async function testVCenterSOAPAPI() {
  try {
    console.log("=== Automated vCenter SOAP API Test (Internal IP) ===\n");

    // Load credentials from env file
    const envPath = path.resolve(__dirname, "vcenter-test.env");
    console.log(`Loading credentials from ${envPath}`);
    const env = loadEnvFile(envPath);

    if (!process.env.VCENTER_USER || !process.env.VCENTER_PASS) {
      console.error(
        "❌ Missing required credentials in vcenter-test.env file or environment variables!"
      );
      console.log("Required variables: VCENTER_USER, VCENTER_PASS");
      process.exit(1);
    }

    // Use internal IP through VPN
    const internalHost = "vcenter.internal"; // Use a fake internal hostname for host header
    let vcenterHost = IP_OVERRIDE;
    console.log(`Using VPN internal IP: ${IP_OVERRIDE}`);

    // Print connection details
    console.log(`vCenter Host: ${vcenterHost}`);
    console.log(`vCenter User: ${process.env.VCENTER_USER}`);
    console.log(
      `\nAttempting to connect to vCenter SOAP API at ${vcenterHost}...`
    );

    // Test basic connectivity first
    console.log("Testing basic server connectivity...");
    await testBasicConnectivity(vcenterHost);

    // Create a client with VPN IP
    console.log("\nCreating vSphere client...");
    const actualUrl = `https://${vcenterHost}/sdk/vimService.wsdl`;
    console.log(`Using URL: ${actualUrl}`);

    // Create client with custom options
    const client = new VsphereClient(actualUrl, {
      username: process.env.VCENTER_USER,
      password: process.env.VCENTER_PASS,
      timeout: 30000, // 30 seconds
      ignoreCert: true,
      httpOptions: {
        rejectUnauthorized: false,
        // Add additional options that might help with connection issues
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) vCenter API Test",
          Connection: "keep-alive",
          "Cache-Control": "no-cache",
          // Set the host header to help with routing on the server side
          Host: internalHost,
        },
        timeout: 15000, // 15 seconds
        family: 4, // Force IPv4
      },
    });

    // Wait for client to connect
    await new Promise((resolve, reject) => {
      client.once("ready", () => {
        console.log("✅ Client reports ready!");
        resolve();
      });

      client.once("error", (err) => {
        console.log(`❌ Connection error: ${err.message}`);
        reject(err);
      });

      // Add timeout for connection
      const timeout = setTimeout(() => {
        reject(new Error("Connection timed out after 20 seconds"));
      }, 20000);

      client.once("ready", () => clearTimeout(timeout));
    });

    console.log("\nConnection to vCenter SOAP API established!");
    console.log(`Using URL: ${actualUrl}`);

    // Perform some simple operations to verify connection
    console.log("\nRetrieving vCenter details...");

    try {
      const serviceContent = await new Promise((resolve, reject) => {
        client.serviceContent((err, result) => {
          if (err) {
            return reject(err);
          }
          resolve(result);
        });
      });

      if (serviceContent && serviceContent.about) {
        console.log("\nvCenter Information:");
        console.log(`- Full Name: ${serviceContent.about.fullName}`);
        console.log(`- Version: ${serviceContent.about.version}`);
        console.log(`- Build: ${serviceContent.about.build}`);
        console.log(`- OS Type: ${serviceContent.about.osType}`);
        console.log(`- API Type: ${serviceContent.about.apiType}`);
        console.log(`- API Version: ${serviceContent.about.apiVersion}`);
      } else {
        console.log(
          "Service content available but missing 'about' information"
        );
      }
    } catch (error) {
      console.error("Error retrieving vCenter service content:", error.message);
      console.log("Continuing with other API tests...");
    }

    // Get VM inventory
    try {
      console.log("\nRetrieving VM inventory...");

      // Two-step process for getting VM inventory:
      // 1. Get datacenter references
      // 2. Get VM references within each datacenter

      // Get all datacenters
      const datacenters = await new Promise((resolve, reject) => {
        client.getDatacenters((err, result) => {
          if (err) {
            return reject(err);
          }
          resolve(result);
        });
      });

      if (!datacenters || datacenters.length === 0) {
        console.log("No datacenters found in inventory.");
        return;
      }

      console.log(`Found ${datacenters.length} datacenters`);

      // Get VMs for each datacenter
      let totalVMs = 0;
      let displayedVMs = 0;

      for (const dc of datacenters) {
        try {
          const vms = await new Promise((resolve, reject) => {
            client.getVms(dc, (err, result) => {
              if (err) {
                return reject(err);
              }
              resolve(result);
            });
          });

          totalVMs += vms.length;
          console.log(
            `\nFound ${vms.length} VMs in datacenter ${dc.name || "Unknown"}`
          );

          // Display first 10 VMs in this datacenter
          const displayCount = Math.min(10 - displayedVMs, vms.length);
          for (let i = 0; i < displayCount && displayedVMs < 10; i++) {
            const vm = vms[i];
            displayedVMs++;
            let vmName = "Unknown";
            let vmPowerState = "Unknown";

            // Try to get VM details if available
            try {
              const vmDetails = await new Promise((resolve, reject) => {
                client.getVmById(vm.id, (err, result) => {
                  if (err) {
                    return reject(err);
                  }
                  resolve(result);
                });
              });

              if (vmDetails) {
                vmName = vmDetails.name || vm.name || "Unknown";
                vmPowerState = vmDetails.runtime?.powerState || "Unknown";
              }
            } catch (error) {
              console.log(
                `Could not get details for VM ${vm.id}: ${error.message}`
              );
            }

            console.log(
              `- VM: ${vmName}, Power State: ${vmPowerState}, ID: ${vm.id}`
            );
          }
        } catch (error) {
          console.error(
            `Error getting VMs for datacenter ${dc.name || "Unknown"}:`,
            error.message
          );
        }
      }

      if (totalVMs > 10) {
        console.log(`  (and ${totalVMs - 10} more...)`);
      }
    } catch (error) {
      console.error("Error retrieving VM inventory:", error.message);
    }

    console.log("\n✅ SOAP API test through VPN completed successfully!");
  } catch (error) {
    console.error("\n❌ Error during vCenter SOAP API test:");

    if (error.message.includes("ECONNREFUSED")) {
      console.error("Connection refused. Please check if:");
      console.error("- The VPN connection is active");
      console.error("- The internal IP address is correct");
      console.error("- The vCenter service is running");
    } else if (error.message.includes("ENOTFOUND")) {
      console.error("Host not found. Please check if:");
      console.error("- The VPN connection is active and functioning");
      console.error("- DNS resolution through VPN is working");
      console.error("- The internal IP address is correct");
    } else if (error.message.includes("ETIMEDOUT")) {
      console.error("Connection timed out. Please check if:");
      console.error("- The VPN connection is stable");
      console.error("- Network latency through VPN is not too high");
      console.error("- The vCenter server is responsive");
    } else if (error.message.includes("ECONNRESET")) {
      console.error("Connection reset by the server. This could be due to:");
      console.error("- Internal network security settings");
      console.error("- Server overloaded or restarting");
      console.error("- VPN connection disruption");
    } else if (error.message.includes("certificate")) {
      console.error(
        "SSL/TLS certificate validation error. This could be due to:"
      );
      console.error("- Self-signed certificate on the internal vCenter server");
      console.error("- Certificate verification difficulties through VPN");
      console.error(
        "- Note: This script disables certificate validation for testing purposes"
      );
    }

    console.error("\nDetailed error information:");
    console.error(error.message);

    if (error.stack) {
      console.error("\nStack trace:");
      console.error(error.stack);
    }
  }
}

// Run the test
console.log("Starting vCenter SOAP API test with Internal IP...");
testVCenterSOAPAPI().catch((err) => {
  console.error("Unhandled error:", err);
});
