const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./user.model');
const Service = require('./service.model');

console.log('Initializing Order model...');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  serviceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Service,
      key: 'id'
    }
  },
  // Order details including service configuration
  orderDetails: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'JSON containing service configuration, selected plan, etc.'
  },
  // Selected billing period
  billingPeriod: {
    type: DataTypes.ENUM('hourly', 'monthly', 'quarterly', 'semiannual', 'annual'),
    allowNull: false,
    defaultValue: 'monthly'
  },
  // Prices
  subtotalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  // Discount code if applied
  discountCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Order status
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'cancelled', 'refunded', 'processing', 'completed'),
    allowNull: false,
    defaultValue: 'pending'
  },
  // Payment status
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    allowNull: false,
    defaultValue: 'pending'
  },
  // Payment method used
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Payment transaction ID
  paymentTransactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Service validity dates
  validFrom: {
    type: DataTypes.DATE,
    allowNull: true
  },
  validUntil: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Flag for auto-renewal
  autoRenew: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Notes or special instructions
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

// Define associations
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Service.hasMany(Order, { foreignKey: 'serviceId' });
Order.belongsTo(Service, { foreignKey: 'serviceId' });

console.log('Order model initialized successfully');

module.exports = Order; 