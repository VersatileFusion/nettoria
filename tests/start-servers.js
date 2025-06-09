const { spawn } = require("child_process");
const path = require("path");

// Start backend server
const backend = spawn("node", ["server/src/app.js"], {
  cwd: path.join(__dirname, ".."),
  stdio: "inherit",
});

// Start frontend server (using a simple HTTP server)
const frontend = spawn("npx", ["http-server", "public", "-p", "3000"], {
  cwd: path.join(__dirname, ".."),
  stdio: "inherit",
});

// Handle process termination
process.on("SIGINT", () => {
  backend.kill();
  frontend.kill();
  process.exit();
});

// Log server status
console.log("Starting servers...");
backend.on("error", (err) => console.error("Backend server error:", err));
frontend.on("error", (err) => console.error("Frontend server error:", err));

// Wait for servers to start
setTimeout(() => {
  console.log("Servers started successfully!");
}, 5000);
