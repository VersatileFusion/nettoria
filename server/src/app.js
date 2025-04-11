const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

console.log('Starting app...');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Nettoria API',
      version: '1.0.0',
      description: 'Cloud Service Provider Platform API',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Database status endpoint
app.get('/api/status', (req, res) => {
  const dbStatus = {
    dialect: process.env.DB_DIALECT || 'unknown',
    host: process.env.DB_HOST || 'unknown',
    connectionAttempted: false,
    connected: false,
    error: null
  };
  
  try {
    // Try to import database config
    const sequelize = require('./config/database');
    dbStatus.connectionAttempted = true;
    
    sequelize.authenticate()
      .then(() => {
        dbStatus.connected = true;
        res.json({
          status: 'ok',
          database: dbStatus,
          message: 'Server is running with full database connectivity'
        });
      })
      .catch(error => {
        dbStatus.error = error.message;
        res.json({
          status: 'limited',
          database: dbStatus,
          message: 'Server is running with limited functionality (database connection issue)'
        });
      });
  } catch (error) {
    dbStatus.error = error.message;
    res.json({
      status: 'limited',
      database: dbStatus,
      message: 'Server is running with limited functionality (database import issue)'
    });
  }
});

// Check if we should try to load routes or just serve mock endpoints
try {
  // Check if routes directory exists
  const routesPath = path.join(__dirname, 'routes');
  if (!fs.existsSync(routesPath)) {
    throw new Error('Routes directory not found');
  }
  
  console.log('Loading API routes...');
  
  // Import routes
  const authRoutes = require('./routes/auth.routes');
  const userRoutes = require('./routes/user.routes');
  const serviceRoutes = require('./routes/service.routes');
  const orderRoutes = require('./routes/order.routes');
  const walletRoutes = require('./routes/wallet.routes');
  const ticketRoutes = require('./routes/ticket.routes');
  const vCenterRoutes = require('./routes/vcenter.routes');

  // Use routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/wallet', walletRoutes);
  app.use('/api/tickets', ticketRoutes);
  app.use('/api/vcenter', vCenterRoutes);
  
  console.log('API routes loaded successfully');
} catch (error) {
  console.warn('Error loading routes:', error.message);
  console.log('Setting up mock endpoints instead');
  
  // Mock endpoints for demonstration
  app.get('/api/auth/demo', (req, res) => {
    res.json({ message: 'Auth API is working (mock mode)' });
  });
  
  app.get('/api/services/demo', (req, res) => {
    res.json({
      message: 'Services API is working (mock mode)',
      services: [
        { id: 1, name: 'Demo VM', description: 'Demo virtual machine service' },
        { id: 2, name: 'Demo Storage', description: 'Demo storage service' }
      ]
    });
  });
  
  app.get('/api/user/demo', (req, res) => {
    res.json({
      message: 'User API is working (mock mode)',
      user: {
        id: 1,
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'user'
      }
    });
  });
}

// Default route
app.get('/', (req, res) => {
  console.log('Homepage accessed');
  res.json({ 
    message: 'Welcome to Nettoria API',
    version: '1.0.0',
    documentation: '/api-docs',
    status: '/api/status'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

// Set port and start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
  console.log(`API status available at http://localhost:${PORT}/api/status`);
});

module.exports = app; 