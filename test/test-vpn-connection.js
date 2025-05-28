/**
 * VPN Connection Diagnostic Tool
 * Tests connectivity to vCenter server through VPN
 */

const { exec } = require("child_process");
const dns = require("dns");
const http = require("http");
const https = require("https");
const net = require("net");

// Configuration
const VCENTER_HOST = "192.168.120.246";
const VCENTER_HOSTNAME = "vcenter.local";
const VCENTER_REST_PORT = 443;
const VCENTER_SOAP_PORT = 443;
const PING_COUNT = 4;
const TIMEOUT = 5000; // 5 seconds

// Results storage
const results = {
  ping: false,
  dnsLookup: false,
  tcpRest: false,
  tcpSoap: false,
  httpGet: false,
  httpsGet: false,
};

/**
 * Run ping test to vCenter
 */
function testPing() {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing ping to ${VCENTER_HOST}...`);

    // Windows ping command
    const pingCmd = `ping -n ${PING_COUNT} ${VCENTER_HOST}`;

    exec(pingCmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Ping failed: ${error.message}`);
        results.ping = false;
        resolve(false);
        return;
      }

      if (stderr) {
        console.error(`❌ Ping error: ${stderr}`);
        results.ping = false;
        resolve(false);
        return;
      }

      // Check if ping was successful (contains "Reply from")
      if (stdout.includes("Reply from")) {
        console.log("✅ Ping successful!");

        // Extract statistics
        const match = stdout.match(
          /Packets: Sent = (\d+), Received = (\d+), Lost = (\d+)/
        );
        if (match) {
          const [, sent, received, lost] = match;
          console.log(
            `   Packets: Sent = ${sent}, Received = ${received}, Lost = ${lost}`
          );
        }

        results.ping = true;
        resolve(true);
      } else {
        console.error("❌ Ping failed - no reply received");
        results.ping = false;
        resolve(false);
      }
    });
  });
}

/**
 * Test DNS lookup
 */
function testDnsLookup() {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing DNS lookup for ${VCENTER_HOSTNAME}...`);

    dns.lookup(VCENTER_HOSTNAME, (err, address, family) => {
      if (err) {
        console.error(`❌ DNS lookup failed: ${err.message}`);
        results.dnsLookup = false;
        resolve(false);
        return;
      }

      console.log(
        `✅ DNS lookup successful! Resolved to ${address} (IPv${family})`
      );
      results.dnsLookup = true;
      resolve(true);
    });
  });
}

/**
 * Test TCP connection to REST API port
 */
function testTcpRest() {
  return new Promise((resolve) => {
    console.log(
      `\n🔍 Testing TCP connection to ${VCENTER_HOST}:${VCENTER_REST_PORT} (REST API)...`
    );

    const socket = new net.Socket();
    let connected = false;

    socket.setTimeout(TIMEOUT);

    socket.on("connect", () => {
      console.log("✅ TCP connection to REST API port successful!");
      connected = true;
      results.tcpRest = true;
      socket.end();
    });

    socket.on("timeout", () => {
      console.error("❌ TCP connection to REST API port timed out");
      if (!connected) {
        results.tcpRest = false;
        resolve(false);
      }
      socket.destroy();
    });

    socket.on("error", (err) => {
      console.error(
        `❌ TCP connection to REST API port failed: ${err.message}`
      );
      results.tcpRest = false;
      resolve(false);
    });

    socket.on("close", () => {
      if (connected) {
        resolve(true);
      }
    });

    socket.connect(VCENTER_REST_PORT, VCENTER_HOST);
  });
}

/**
 * Test TCP connection to SOAP API port
 */
function testTcpSoap() {
  return new Promise((resolve) => {
    console.log(
      `\n🔍 Testing TCP connection to ${VCENTER_HOST}:${VCENTER_SOAP_PORT} (SOAP API)...`
    );

    const socket = new net.Socket();
    let connected = false;

    socket.setTimeout(TIMEOUT);

    socket.on("connect", () => {
      console.log("✅ TCP connection to SOAP API port successful!");
      connected = true;
      results.tcpSoap = true;
      socket.end();
    });

    socket.on("timeout", () => {
      console.error("❌ TCP connection to SOAP API port timed out");
      if (!connected) {
        results.tcpSoap = false;
        resolve(false);
      }
      socket.destroy();
    });

    socket.on("error", (err) => {
      console.error(
        `❌ TCP connection to SOAP API port failed: ${err.message}`
      );
      results.tcpSoap = false;
      resolve(false);
    });

    socket.on("close", () => {
      if (connected) {
        resolve(true);
      }
    });

    socket.connect(VCENTER_SOAP_PORT, VCENTER_HOST);
  });
}

/**
 * Test HTTP GET request
 */
function testHttpGet() {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing HTTP GET request to ${VCENTER_HOST}...`);

    const req = http.get(
      `http://${VCENTER_HOST}`,
      { timeout: TIMEOUT },
      (res) => {
        console.log(`✅ HTTP GET successful! Status code: ${res.statusCode}`);
        results.httpGet = true;

        // Consume response data to free up memory
        res.resume();
        resolve(true);
      }
    );

    req.on("error", (err) => {
      console.error(`❌ HTTP GET failed: ${err.message}`);
      results.httpGet = false;
      resolve(false);
    });

    req.on("timeout", () => {
      console.error("❌ HTTP GET timed out");
      req.destroy();
      results.httpGet = false;
      resolve(false);
    });
  });
}

/**
 * Test HTTPS GET request
 */
function testHttpsGet() {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing HTTPS GET request to ${VCENTER_HOST}...`);

    const req = https.get(
      `https://${VCENTER_HOST}`,
      {
        timeout: TIMEOUT,
        rejectUnauthorized: false, // Accept self-signed certificates
      },
      (res) => {
        console.log(`✅ HTTPS GET successful! Status code: ${res.statusCode}`);
        results.httpsGet = true;

        // Consume response data to free up memory
        res.resume();
        resolve(true);
      }
    );

    req.on("error", (err) => {
      console.error(`❌ HTTPS GET failed: ${err.message}`);
      results.httpsGet = false;
      resolve(false);
    });

    req.on("timeout", () => {
      console.error("❌ HTTPS GET timed out");
      req.destroy();
      results.httpsGet = false;
      resolve(false);
    });
  });
}

/**
 * Display summary of test results
 */
function displaySummary() {
  console.log("\n=== VPN Connection Diagnostic Summary ===");
  console.log(`Ping test: ${results.ping ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`DNS lookup: ${results.dnsLookup ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`TCP REST API port: ${results.tcpRest ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`TCP SOAP API port: ${results.tcpSoap ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`HTTP GET: ${results.httpGet ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`HTTPS GET: ${results.httpsGet ? "✅ PASS" : "❌ FAIL"}`);

  const passCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  const passRate = Math.round((passCount / totalTests) * 100);

  console.log(
    `\nOverall: ${passCount}/${totalTests} tests passed (${passRate}%)`
  );

  if (passRate === 100) {
    console.log("\n✅ VPN connection is working properly!");
  } else if (passRate >= 50) {
    console.log(
      "\n⚠️ VPN connection is partially working. Some services may be unavailable."
    );
  } else {
    console.log(
      "\n❌ VPN connection is not working properly. Please check your connection."
    );
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log("=== Starting VPN Connection Diagnostic Tests ===");

  await testPing();
  await testDnsLookup();
  await testTcpRest();
  await testTcpSoap();
  await testHttpGet();
  await testHttpsGet();

  displaySummary();
}

// Start the tests
runAllTests();
