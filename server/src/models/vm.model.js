const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');
const Order = require('./order.model');

console.log('Initializing VirtualMachine model...');

const VirtualMachine = sequelize.define('VirtualMachine', {
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
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Order,
      key: 'id'
    }
  },
  // vCenter VM ID
  vCenterId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'VM ID in vCenter'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  hostname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // VM status
  status: {
    type: DataTypes.ENUM('provisioning', 'running', 'stopped', 'suspended', 'error', 'deleted'),
    allowNull: false,
    defaultValue: 'provisioning'
  },
  // VM specifications
  specifications: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'VM specifications (CPU, RAM, storage, etc.)'
  },
  // Operating system
  operatingSystem: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // IP addresses
  ipAddresses: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'JSON array of IP addresses'
  },
  // Data center
  dataCenter: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Creation and expiration dates
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Last power action (on, off, restart, rebuild)
  lastPowerAction: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastPowerActionTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Bandwidth usage
  bandwidthUsage: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  // Is hourly billed
  isHourlyBilled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Notes
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

// Define associations
User.hasMany(VirtualMachine, { foreignKey: 'userId' });
VirtualMachine.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(VirtualMachine, { foreignKey: 'orderId' });
VirtualMachine.belongsTo(Order, { foreignKey: 'orderId' });

console.log('VirtualMachine model initialized successfully');

module.exports = VirtualMachine; 