const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

console.log("Initializing database connection...");

// Determine which database configuration to use
const dialect = process.env.DB_DIALECT || "mysql";
let sequelize;

try {
  if (dialect === "sqlite") {
    console.log("Using SQLite database");
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: process.env.DB_STORAGE || ":memory:",
      logging: console.log,
    });
  } else if (dialect === "postgres") {
    console.log("Using PostgreSQL database");
    // Change from hardcoded 'postgres' to process.env.DB_NAME
    sequelize = new Sequelize(
      process.env.DB_NAME, // Use the database from .env
      process.env.DB_USER,
      process.env.DB_PASS,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "postgres",
        logging: console.log,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      }
    );
  } else if (dialect === "mssql") {
    console.log("Using SQL Server database");

    // Check if using trusted connection (Windows Authentication)
    const useTrustedConnection = process.env.DB_TRUSTED_CONNECTION === "true";

    if (useTrustedConnection) {
      console.log("Using Windows Authentication (trusted connection)");
      sequelize = new Sequelize(process.env.DB_NAME, "", "", {
        host: process.env.DB_HOST,
        dialect: "mssql",
        logging: console.log,
        dialectOptions: {
          options: {
            encrypt: true,
            trustServerCertificate: true,
            trustedConnection: true,
            integratedSecurity: true,
          },
        },
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      });
    } else {
      // Use SQL Authentication
      sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASS,
        {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          dialect: "mssql",
          logging: console.log,
          dialectOptions: {
            options: {
              encrypt: true,
              trustServerCertificate: true,
            },
          },
          pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
          },
        }
      );
    }
  } else {
    console.log("Using MySQL database");
    sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "mysql",
        logging: console.log,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      }
    );
  }

  console.log(`Database configured with ${dialect} dialect`);
} catch (error) {
  console.error("Error setting up database connection:", error.message);
  console.log("Using fallback in-memory database");

  // Fallback to a simple in-memory SQL database if there's an error
  sequelize = new Sequelize("sqlite::memory:", {
    logging: false, // Disable logging for fallback
  });
}

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    console.log("Will run in limited functionality mode.");
  }
};

testConnection();

module.exports = sequelize;
