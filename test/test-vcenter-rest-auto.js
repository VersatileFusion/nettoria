/**
 * Automated vCenter REST API Test Script
 * This script tests connection to vCenter REST API using credentials from vcenter-test.env
 */

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const https = require("https");
const { URL } = require("url");

// Enable more detailed diagnostics
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
process.env.DEBUG = "axios";

// Force using IPv4 - can help with connection issues
process.env.NODE_OPTIONS = "--dns-result-order=ipv4first";

// IP address bypass - use this if hostname resolution is causing problems
const IP_OVERRIDE = "192.168.120.246"; // Internal IP address via VPN

// Update IP address references
const DEFAULT_VCENTER_HOST = '192.168.120.246';

// Load environment variables from vcenter-test.env file
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

// Try different API endpoints with custom configuration to find the right one
async function tryApiEndpoints(
  axiosInstance,
  vcenterHost,
  username,
  password,
  useIpDirectly = false
) {
  // Use IP directly for hostname in URLs if specified
  const actualHost = useIpDirectly ? IP_OVERRIDE : vcenterHost;

  // Possible API endpoints to try in order
  const endpoints = [
    {
      name: "Modern REST API",
      sessionUrl: `https://${actualHost}/rest/com/vmware/cis/session`,
      versionUrl: `https://${actualHost}/rest/appliance/system/version`,
      vmUrl: `https://${actualHost}/rest/vcenter/vm`,
    },
    {
      name: "Legacy SOAP API",
      sessionUrl: `https://${actualHost}/sdk/vimService.wsdl`,
      versionUrl: `https://${actualHost}/sdk`,
      vmUrl: `https://${actualHost}/sdk`,
    },
    {
      name: "Alternative REST API",
      sessionUrl: `https://${actualHost}/api/session`,
      versionUrl: `https://${actualHost}/api/appliance/system/version`,
      vmUrl: `https://${actualHost}/api/vcenter/vm`,
    },
    {
      name: "Custom HTTP Port",
      sessionUrl: `https://${actualHost}:8443/rest/com/vmware/cis/session`,
      versionUrl: `https://${actualHost}:8443/rest/appliance/system/version`,
      vmUrl: `https://${actualHost}:8443/rest/vcenter/vm`,
    },
  ];

  for (const endpoint of endpoints) {
    console.log(`\nTrying ${endpoint.name} endpoint: ${endpoint.sessionUrl}`);

    try {
      // Test if endpoint exists
      try {
        const response = await axiosInstance.get(endpoint.sessionUrl, {
          timeout: 5000,
          validateStatus: () => true,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) vCenter API Test",
            Accept: "*/*",
          },
        });
        console.log(`Endpoint response: ${response.status}`);
      } catch (error) {
        console.log(`Endpoint not accessible: ${error.message}`);
        continue; // Try next endpoint
      }

      // Try authentication methods
      let sessionId = null;

      // Method 1: Basic auth headers
      try {
        console.log("Trying authentication with basic auth headers...");
        const authString = Buffer.from(`${username}:${password}`).toString(
          "base64"
        );

        const authResponse = await axiosInstance.post(
          endpoint.sessionUrl,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Basic ${authString}`,
            },
          }
        );

        if (authResponse.data && authResponse.data.value) {
          sessionId = authResponse.data.value;
          console.log("✅ Authentication successful with basic auth headers!");
          return {
            endpoint,
            sessionId,
            authMethod: "basic_headers",
          };
        }
      } catch (error) {
        console.log("Auth with basic headers failed:", error.message);
      }

      // Method 2: Auth parameter
      try {
        console.log("Trying authentication with auth parameter...");
        const authResponse = await axiosInstance.post(
          endpoint.sessionUrl,
          {},
          {
            auth: {
              username,
              password,
            },
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (authResponse.data && authResponse.data.value) {
          sessionId = authResponse.data.value;
          console.log("✅ Authentication successful with auth parameter!");
          return {
            endpoint,
            sessionId,
            authMethod: "auth_param",
          };
        }
      } catch (error) {
        console.log("Auth with auth parameter failed:", error.message);
      }

      // Method 3: Credentials in body
      try {
        console.log("Trying authentication with credentials in body...");
        const authResponse = await axiosInstance.post(
          endpoint.sessionUrl,
          {
            username,
            password,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (authResponse.data && authResponse.data.value) {
          sessionId = authResponse.data.value;
          console.log("✅ Authentication successful with credentials in body!");
          return {
            endpoint,
            sessionId,
            authMethod: "body_credentials",
          };
        }
      } catch (error) {
        console.log("Auth with credentials in body failed:", error.message);
      }
    } catch (error) {
      console.log(
        `Failed to authenticate using ${endpoint.name}:`,
        error.message
      );
    }
  }

  // No successful authentication
  return null;
}

// Main function to test vCenter REST API
async function testVCenterRestAPI() {
  try {
    console.log("=== Automated vCenter REST API Test (Internal IP) ===\n");

    // Load credentials from env file
    const envPath = path.resolve(__dirname, "vcenter-test.env");
    console.log(`Loading credentials from ${envPath}`);
    const env = loadEnvFile(envPath);

    if (!env.VCENTER_USER || !env.VCENTER_PASS) {
      console.error(
        "❌ Missing required credentials in vcenter-test.env file!"
      );
      console.log("Required variables: VCENTER_USER, VCENTER_PASS");
      process.exit(1);
    }

    // Use internal IP through VPN
    let vcenterHost = IP_OVERRIDE;
    console.log(`Using VPN internal IP: ${IP_OVERRIDE}`);

    const username = env.VCENTER_USER;
    const password = env.VCENTER_PASS;

    console.log(`vCenter Host: ${vcenterHost}`);
    console.log(`vCenter User: ${username}`);
    console.log(
      `\nAttempting to connect to vCenter REST API at ${vcenterHost}...\n`
    );

    // Test basic connectivity first
    console.log("Testing basic server connectivity...");
    await testBasicConnectivity(vcenterHost);

    // Create axios instance with SSL verification disabled and longer timeout
    const axiosInstance = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false, // Disable SSL verification for simplicity
        keepAlive: true,
        timeout: 15000, // 15 seconds
      }),
      timeout: 30000, // 30 seconds total timeout
      maxRedirects: 5,
      maxContentLength: 50 * 1024 * 1024, // 50 MB
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) vCenter API Test",
        Connection: "keep-alive",
      },
    });

    // Try API endpoints
    console.log("\nTrying API endpoints...");
    let authResult = await tryApiEndpoints(
      axiosInstance,
      vcenterHost,
      username,
      password,
      true
    );

    if (!authResult) {
      console.error("\n❌ All authentication attempts failed.");
      console.error("Possible reasons:");
      console.error(
        "1. The vCenter server doesn't allow API access from your current location"
      );
      console.error("2. Your credentials don't have API access permissions");
      console.error(
        "3. The vCenter API services are disabled or running on non-standard ports"
      );
      console.error("4. A firewall is blocking the API connections");
      console.error("\nActions to take:");
      console.error(
        "- Contact your vCenter administrator to confirm API access permissions"
      );
      console.error(
        "- Check if the VPN connection is active and routing properly"
      );
      console.error("- Verify the internal IP address is correct");
      process.exit(1);
    }

    const { endpoint, sessionId } = authResult;
    console.log("\nSuccessfully authenticated to vCenter API!");
    console.log(`Endpoint used: ${endpoint.name}`);
    console.log("Session ID:", sessionId);

    // Set default headers for subsequent requests
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "vmware-api-session-id": sessionId,
    };

    // Get system version information
    console.log("\nFetching vCenter system information...");

    try {
      const apiInfoResponse = await axiosInstance.get(endpoint.versionUrl, {
        headers,
      });

      // Handle response based on endpoint type
      if (apiInfoResponse.data && apiInfoResponse.data.value) {
        const versionInfo = apiInfoResponse.data.value;
        console.log("\nvCenter Version Information:");
        console.log(`- Version: ${versionInfo.version || "Unknown"}`);
        console.log(`- Build: ${versionInfo.build || "Unknown"}`);
        console.log(`- Product: ${versionInfo.product || "vCenter"}`);
      } else {
        console.log("System information available but in unexpected format");
        console.log("Response status code:", apiInfoResponse.status);
      }
    } catch (error) {
      console.error("Failed to get version information:", error.message);
      console.log("Continuing with other API tests...");
    }

    // Get VM information if REST endpoint is available
    if (endpoint.name.includes("REST")) {
      try {
        console.log("\nFetching VM information...");
        const vmsResponse = await axiosInstance.get(endpoint.vmUrl, {
          headers,
        });

        if (vmsResponse.data && vmsResponse.data.value) {
          const vms = vmsResponse.data.value;
          console.log(`\nFound ${vms.length} VMs:`);
          for (let i = 0; i < Math.min(vms.length, 10); i++) {
            const vm = vms[i];
            console.log(
              `- Name: ${vm.name}, Power State: ${
                vm.power_state || "Unknown"
              }, VM ID: ${vm.vm || "Unknown"}`
            );
          }

          if (vms.length > 10) {
            console.log(`  (and ${vms.length - 10} more...)`);
          }
        } else {
          console.log("VM information available but in unexpected format");
        }
      } catch (error) {
        console.error("Failed to get VM information:", error.message);
      }
    }

    console.log("\n✅ REST API test through VPN completed successfully!");
  } catch (error) {
    console.error("\n❌ Error during vCenter REST API test:");

    if (error.response) {
      console.error(`Status code: ${error.response.status}`);
      console.error(
        "Response data:",
        JSON.stringify(error.response.data, null, 2)
      );

      if (error.response.status === 401) {
        console.error("Authentication failed. Please check your credentials.");
      } else if (error.response.status === 503) {
        console.error(
          "Service unavailable. The vCenter Server might be starting up or under heavy load."
        );
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received from server.");
      console.error(
        "Request details:",
        error.request._currentUrl || error.request.path
      );

      if (error.code === "ECONNREFUSED") {
        console.error(
          "Connection refused. Please check if the vCenter host is correct and accessible."
        );
      } else if (error.code === "ENOTFOUND") {
        console.error(
          "Host not found. Please check the hostname or IP address."
        );
      } else if (error.code === "ETIMEDOUT") {
        console.error(
          "Connection timed out. The server might be down or the network connection is poor."
        );
      } else if (error.code === "ECONNRESET") {
        console.error("Connection reset by the server. This could be due to:");
        console.error(
          "- Firewall or security software blocking the connection"
        );
        console.error("- Server overloaded or restarting");
        console.error("- Invalid request format");
        console.error("- SSL/TLS handshake failure");
        console.error("- VPN connection issues");
      }
    } else {
      console.error(`Error: ${error.message}`);
      if (error.stack) {
        console.error("Stack trace:", error.stack);
      }
    }
  }
}

// Run the test
console.log("Starting vCenter REST API test with Internal IP...");
testVCenterRestAPI().catch((err) => {
  console.error("Unhandled error:", err);
});
