const { chromium } = require("@playwright/test");
const { spawn } = require("child_process");
const path = require("path");
const express = require("express");
const http = require("http");
const { Client } = require("pg");

// Global variables for test setup
global.BASE_URL = "http://localhost:5000";
global.FRONTEND_URL = "http://localhost:3000";

// Database configuration
const DB_CONFIG = {
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "nettoria_test",
};

// Create Express app for frontend
const frontendApp = express();

// Serve static files with proper MIME types
frontendApp.use(
  express.static(path.join(__dirname, "../public"), {
    setHeaders: (res, path) => {
      if (path.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);

// Helper function to check if port is in use
const isPortInUse = (port) => {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.once("error", () => resolve(true));
    server.once("listening", () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
};

// Helper function to kill process on port
const killProcessOnPort = async (port) => {
  if (process.platform === "win32") {
    const { execSync } = require("child_process");
    try {
      const pid = execSync(`netstat -ano | findstr :${port}`)
        .toString()
        .split(/\s+/)[5];
      if (pid) {
        execSync(`taskkill /F /PID ${pid}`);
        console.log(`Killed process ${pid} on port ${port}`);
      }
    } catch (error) {
      console.log(`No process found on port ${port}`);
    }
  } else {
    const { execSync } = require("child_process");
    try {
      const pid = execSync(`lsof -i :${port} -t`).toString().trim();
      if (pid) {
        execSync(`kill -9 ${pid}`);
        console.log(`Killed process ${pid} on port ${port}`);
      }
    } catch (error) {
      console.log(`No process found on port ${port}`);
    }
  }
};

// Helper function to wait for server to be ready
const waitForServer = async (port, timeout = 10000) => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(`http://localhost:${port}/api/status`);
      if (response.ok) {
        return true;
      }
    } catch (error) {
      // Server not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
};

// Helper function to initialize database
const initializeDatabase = async () => {
  try {
    // Create connection to postgres database
    const client = new Client({
      ...DB_CONFIG,
      database: "postgres", // Connect to default postgres database first
    });

    await client.connect();

    // Check if database exists
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [DB_CONFIG.database]
    );

    // Create database if it doesn't exist
    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE ${DB_CONFIG.database}`);
      console.log(`Database ${DB_CONFIG.database} created`);
    } else {
      console.log(`Database ${DB_CONFIG.database} already exists`);
    }

    // Close the connection
    await client.end();

    // Connect to the test database to verify it works
    const testClient = new Client(DB_CONFIG);
    await testClient.connect();
    await testClient.end();

    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    return false;
  }
};

// Start servers before all tests
beforeAll(async () => {
  try {
    // Initialize database
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      throw new Error("Failed to initialize database");
    }

    // Kill any existing processes on ports 5000 and 3000
    await killProcessOnPort(5000);
    await killProcessOnPort(3000);

    // Wait for ports to be free
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Start backend server with PostgreSQL configuration
    global.backend = spawn("node", ["server/src/app.js"], {
      cwd: path.join(__dirname, ".."),
      stdio: "inherit",
      env: {
        ...process.env,
        NODE_ENV: "test",
        DB_DIALECT: "postgres",
        DB_HOST: DB_CONFIG.host,
        DB_PORT: DB_CONFIG.port,
        DB_NAME: DB_CONFIG.database,
        DB_USER: DB_CONFIG.user,
        DB_PASS: DB_CONFIG.password,
      },
    });

    // Start frontend server
    global.frontend = frontendApp.listen(3000, () => {
      console.log("Frontend server running on port 3000");
    });

    // Wait for servers to start
    const backendReady = await waitForServer(5000);
    if (!backendReady) {
      throw new Error("Backend server failed to start");
    }

    // Launch browser with specific settings
    global.browser = await chromium.launch({
      headless: false, // Set to true in CI environment
      slowMo: 50, // Slow down operations by 50ms
      args: [
        "--disable-web-security",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--allow-file-access-from-files",
        "--disable-site-isolation-trials",
      ],
    });
  } catch (error) {
    console.error("Error during test setup:", error);
    // Cleanup on error
    if (global.backend) {
      global.backend.kill();
    }
    if (global.frontend) {
      global.frontend.close();
    }
    if (global.browser) {
      await global.browser.close();
    }
    throw error;
  }
});

// Helper function to create a new page for each test
beforeEach(async () => {
  if (!global.browser) {
    throw new Error("Browser not initialized");
  }

  console.log("Creating new browser context...");

  // Create a new context with specific settings
  global.context = await global.browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    permissions: ["geolocation"],
    acceptDownloads: true,
    ignoreHTTPSErrors: true,
    bypassCSP: true,
    javaScriptEnabled: true,
    storageState: {
      origins: [
        {
          origin: global.FRONTEND_URL,
          localStorage: [],
        },
      ],
    },
  });

  console.log("Browser context created successfully");

  // Create a new page
  global.page = await global.context.newPage();
  console.log("New page created successfully");

  // Set up storage state with proper localStorage implementation
  console.log("Setting up storage implementation...");

  // First, navigate to the frontend URL to establish origin
  await global.page.goto(global.FRONTEND_URL);
  console.log("Navigated to frontend URL");

  // Now inject the storage implementation
  await global.page.addInitScript(() => {
    console.log("Running init script...");
    try {
      // Create a storage object
      const storage = new Map();

      // Define localStorage methods
      const localStorage = {
        getItem: function (key) {
          console.log("localStorage.getItem called with key:", key);
          return storage.get(key);
        },
        setItem: function (key, value) {
          console.log(
            "localStorage.setItem called with key:",
            key,
            "value:",
            value
          );
          storage.set(key, value);
        },
        removeItem: function (key) {
          console.log("localStorage.removeItem called with key:", key);
          storage.delete(key);
        },
        clear: function () {
          console.log("localStorage.clear called");
          storage.clear();
        },
        key: function (index) {
          console.log("localStorage.key called with index:", index);
          return Array.from(storage.keys())[index];
        },
        get length() {
          console.log("localStorage.length accessed");
          return storage.size;
        },
      };

      // Define sessionStorage methods
      const sessionStorage = {
        getItem: function (key) {
          console.log("sessionStorage.getItem called with key:", key);
          return storage.get(key);
        },
        setItem: function (key, value) {
          console.log(
            "sessionStorage.setItem called with key:",
            key,
            "value:",
            value
          );
          storage.set(key, value);
        },
        removeItem: function (key) {
          console.log("sessionStorage.removeItem called with key:", key);
          storage.delete(key);
        },
        clear: function () {
          console.log("sessionStorage.clear called");
          storage.clear();
        },
        key: function (index) {
          console.log("sessionStorage.key called with index:", index);
          return Array.from(storage.keys())[index];
        },
        get length() {
          console.log("sessionStorage.length accessed");
          return storage.size;
        },
      };

      // Override the storage objects
      Object.defineProperty(window, "localStorage", {
        value: localStorage,
        writable: true,
        configurable: true,
      });

      Object.defineProperty(window, "sessionStorage", {
        value: sessionStorage,
        writable: true,
        configurable: true,
      });

      // Test the implementation
      try {
        window.localStorage.setItem("test", "value");
        const testValue = window.localStorage.getItem("test");
        console.log("localStorage test successful, test value:", testValue);
      } catch (error) {
        console.error("localStorage test failed:", error);
      }
    } catch (error) {
      console.error("Error in init script:", error);
    }
  });

  console.log("Init script added successfully");

  // Enable request interception
  console.log("Request interception enabled");
  await global.page.route("**/*", async (route) => {
    const url = route.request().url();
    // Only intercept script URLs to add cache-busting
    if (url.endsWith(".js")) {
      const newUrl = `${url}?t=${Date.now()}`;
      console.log(`Intercepting script URL: ${url} -> ${newUrl}`);
      await route.continue({ url: newUrl });
    } else {
      // Let all other requests pass through
      await route.continue();
    }
  });

  // Test storage access
  console.log("Testing storage access...");
  try {
    await global.page.evaluate(() => {
      console.log("Testing localStorage access...");
      window.localStorage.setItem("test", "value");
      const value = window.localStorage.getItem("test");
      console.log("localStorage test value:", value);
    });
    console.log("Storage access test successful");
  } catch (error) {
    console.error("Storage access test failed:", error);
    throw error;
  }
});

// Cleanup function to close the page and context after each test
afterEach(async () => {
  if (global.page) {
    await global.page.close();
  }
  if (global.context) {
    await global.context.close();
  }
});

// Cleanup function to run after all tests
afterAll(async () => {
  try {
    if (global.browser) {
      await global.browser.close();
    }
    if (global.backend) {
      global.backend.kill();
    }
    if (global.frontend) {
      global.frontend.close();
    }
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
});
