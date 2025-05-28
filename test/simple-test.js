/**
 * Simple vCenter Server Connectivity Test
 */

console.log("Script starting...");

const https = require("https");
const fs = require("fs");
const tls = require("tls");

// Host information
const host = "test.vahabstormzone.info";
const port = 443;

console.log(`Testing connection to ${host}:${port}`);

// Disable SSL verification
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Function to test HTTPS connection
function testHttpsConnection() {
  console.log("\nTesting HTTPS connection...");

  const options = {
    hostname: host,
    port: port,
    path: "/",
    method: "GET",
    timeout: 10000,
    rejectUnauthorized: false,
  };

  const req = https.request(options, (res) => {
    console.log(`HTTPS Status Code: ${res.statusCode}`);
    console.log(`HTTPS Headers: ${JSON.stringify(res.headers, null, 2)}`);

    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      console.log(`Response length: ${data.length} bytes`);
      console.log("HTTPS connection successful");
    });
  });

  req.on("error", (error) => {
    console.error(`HTTPS Error: ${error.message}`);
  });

  req.on("timeout", () => {
    console.error("HTTPS connection timeout");
    req.destroy();
  });

  req.end();
}

// Function to test TLS connection
function testTlsConnection() {
  console.log("\nTesting raw TLS connection...");

  const options = {
    host: host,
    port: port,
    rejectUnauthorized: false,
    timeout: 10000,
  };

  const socket = tls.connect(options, () => {
    console.log("TLS connection established");
    console.log(`Secure: ${socket.authorized ? "Yes" : "No"}`);
    console.log(`Protocol: ${socket.getProtocol()}`);

    const cert = socket.getPeerCertificate();
    console.log(`Certificate subject: ${JSON.stringify(cert.subject)}`);
    console.log(`Certificate issuer: ${JSON.stringify(cert.issuer)}`);

    socket.end();
  });

  socket.on("error", (error) => {
    console.error(`TLS Error: ${error.message}`);
  });

  socket.on("timeout", () => {
    console.error("TLS connection timeout");
    socket.destroy();
  });
}

// Run tests
testHttpsConnection();
testTlsConnection();
