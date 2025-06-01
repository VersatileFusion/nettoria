const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

console.log("Starting app...");

// Initialize express app
const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "cdn.jsdelivr.net",
          "ajax.googleapis.com",
          "cdnjs.cloudflare.com",
          "unpkg.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "cdn.jsdelivr.net",
          "cdnjs.cloudflare.com",
          "unpkg.com",
          "db.onlinewebfonts.com",
        ],
        imgSrc: ["'self'", "data:", "cdn.jsdelivr.net", "unpkg.com"],
        connectSrc: ["'self'"],
        fontSrc: [
          "'self'",
          "cdn.jsdelivr.net",
          "cdnjs.cloudflare.com",
          "db.onlinewebfonts.com",
          "unpkg.com",
        ],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../../public")));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Nettoria API",
      version: "1.0.0",
      description: "Cloud Service Provider Platform API",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.js"], // Path to the API routes
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, { explorer: true })
);

// Database status endpoint
app.get("/api/status", (req, res) => {
  const dbStatus = {
    dialect: process.env.DB_DIALECT || "unknown",
    host: process.env.DB_HOST || "unknown",
    connectionAttempted: false,
    connected: false,
    error: null,
  };

  try {
    // Try to import database config
    const sequelize = require("./config/database");
    dbStatus.connectionAttempted = true;

    sequelize
      .authenticate()
      .then(() => {
        dbStatus.connected = true;
        res.json({
          status: "ok",
          database: dbStatus,
          message: "Server is running with full database connectivity",
        });
      })
      .catch((error) => {
        dbStatus.error = error.message;
        res.json({
          status: "limited",
          database: dbStatus,
          message:
            "Server is running with limited functionality (database connection issue)",
        });
      });
  } catch (error) {
    dbStatus.error = error.message;
    res.json({
      status: "limited",
      database: dbStatus,
      message:
        "Server is running with limited functionality (database import issue)",
    });
  }
});

// Check if we should try to load routes or just serve mock endpoints
try {
  // Check if routes directory exists
  const routesPath = path.join(__dirname, "routes");
  if (!fs.existsSync(routesPath)) {
    throw new Error("Routes directory not found");
  }

  console.log("Loading API routes...");

  // Import routes
  try {
    console.log("Loading auth routes...");
    const authRoutes = require("./routes/auth.routes");
    console.log("Auth routes loaded successfully!");

    console.log("Loading user routes...");
    const userRoutes = require("./routes/user.routes");
    console.log("User routes loaded successfully!");

    console.log("Loading service routes...");
    const serviceRoutes = require("./routes/service.routes");
    console.log("Service routes loaded successfully!");

    console.log("Loading order routes...");
    const orderRoutes = require("./routes/order.routes");
    console.log("Order routes loaded successfully!");

    console.log("Loading wallet routes...");
    const walletRoutes = require("./routes/wallet.routes");
    console.log("Wallet routes loaded successfully!");

    console.log("Loading ticket routes...");
    const ticketRoutes = require("./routes/ticket.routes");
    console.log("Ticket routes loaded successfully!");

    console.log("Loading vCenter routes...");
    const vCenterRoutes = require("./routes/vcenter.routes");
    console.log("vCenter routes loaded successfully!");

    console.log("Loading payment routes...");
    const paymentRoutes = require("./routes/payment.routes");
    console.log("Payment routes loaded successfully!");

    console.log("Loading SMS routes...");
    const smsRoutes = require("./routes/sms.routes");
    console.log("SMS routes loaded successfully!");

    console.log("All routes imported successfully, now mounting...");

    // Use routes
    app.use("/api/auth", authRoutes);
    console.log("Auth routes mounted at /api/auth");

    app.use("/api/users", userRoutes);
    console.log("User routes mounted at /api/users");

    app.use("/api/services", serviceRoutes);
    console.log("Service routes mounted at /api/services");

    app.use("/api/orders", orderRoutes);
    console.log("Order routes mounted at /api/orders");

    app.use("/api/wallet", walletRoutes);
    console.log("Wallet routes mounted at /api/wallet");

    app.use("/api/tickets", ticketRoutes);
    console.log("Ticket routes mounted at /api/tickets");

    app.use("/api/vcenter", vCenterRoutes);
    console.log("vCenter routes mounted at /api/vcenter");

    app.use("/api/payments", paymentRoutes);
    console.log("Payment routes mounted at /api/payments");

    app.use("/api/sms", smsRoutes);
    console.log("SMS routes mounted at /api/sms");

    console.log("API routes loaded and mounted successfully");
  } catch (routeError) {
    console.error("Error loading specific route:", routeError.message);
    console.error(routeError.stack);
    throw routeError;
  }
} catch (error) {
  console.warn("Error loading routes:", error.message);
  console.log("Setting up mock endpoints instead");

  // Mock endpoints for demonstration
  app.get("/api/auth/demo", (req, res) => {
    res.json({ message: "Auth API is working (mock mode)" });
  });

  app.get("/api/services/demo", (req, res) => {
    res.json({
      message: "Services API is working (mock mode)",
      services: [
        { id: 1, name: "Demo VM", description: "Demo virtual machine service" },
        { id: 2, name: "Demo Storage", description: "Demo storage service" },
      ],
    });
  });

  app.get("/api/user/demo", (req, res) => {
    res.json({
      message: "User API is working (mock mode)",
      user: {
        id: 1,
        name: "Demo User",
        email: "demo@example.com",
        role: "user",
      },
    });
  });
}

// Add diagnostic route
app.get("/api/debug", (req, res) => {
  // Check if auth routes are loaded
  const routes = app._router.stack
    .filter((r) => r.route)
    .map((r) => ({
      path: r.route.path,
      methods: Object.keys(r.route.methods).join(","),
    }));

  // Check mounted routers
  const routers = app._router.stack
    .filter((r) => r.name === "router")
    .map((r) => ({
      path: r.regexp.toString(),
    }));

  res.json({
    status: "ok",
    mockMode: false,
    routes: routes,
    routers: routers,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT,
    },
  });
});

// Default route
app.get("/", (req, res) => {
  console.log("Homepage accessed");
  res.json({
    message: "Welcome to Nettoria API",
    version: "1.0.0",
    documentation: "/api-docs",
    status: "/api/status",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// Set port and start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(
    `Swagger documentation available at http://localhost:${PORT}/api-docs`
  );
  console.log(`API status available at http://localhost:${PORT}/api/status`);
});

module.exports = app;
