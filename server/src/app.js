const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const rateLimit = require("express-rate-limit");
const swaggerDocument = require("./swagger.json");
const { errorHandler } = require("./middleware/error-handler");

// Add error handling for uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  process.exit(1);
});

dotenv.config();

console.log("Starting app...");
console.log("Environment variables:", {
  NODE_ENV: process.env.NODE_ENV,
  DB_DIALECT: process.env.DB_DIALECT,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  // Don't log the password
});

// Initialize express app
const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
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

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

    // Import new routes
    const cartRoutes = require("./routes/cart.routes");
    const withdrawalRoutes = require("./routes/withdrawal.routes");
    const oneTimeLoginRoutes = require("./routes/one-time-login.routes");
    const successPasswordRoutes = require("./routes/success-password.routes");
    const securityRoutes = require("./routes/security");

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

    // Add new routes
    app.use("/api/cart", cartRoutes);
    app.use("/api/withdrawals", withdrawalRoutes);
    app.use("/api/one-time-login", oneTimeLoginRoutes);
    app.use("/api/success-password", successPasswordRoutes);
    app.use("/api/security", securityRoutes);
    console.log("Security routes mounted at /api/security");

    console.log("API routes loaded and mounted successfully");
  } catch (error) {
    console.error("Error loading routes:", error);
    throw error;
  }
} catch (error) {
  console.error("Error in route setup:", error);
  throw error;
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

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: {
    success: false,
    error: {
      message: "Too many requests, please try again later",
      code: "RATE_LIMIT_EXCEEDED",
    },
  },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: {
    success: false,
    error: {
      message: "Too many requests, please try again later",
      code: "RATE_LIMIT_EXCEEDED",
    },
  },
});

// Apply rate limiting
app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(
    `Swagger documentation available at http://localhost:${PORT}/api-docs`
  );
  console.log(`API status available at http://localhost:${PORT}/api/status`);
});

module.exports = app;
