const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

console.log('Initializing Service model...');

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('vm', 'storage', 'network', 'other'),
    allowNull: false,
    defaultValue: 'vm'
  },
  // Base specs for the service
  baseSpecs: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'JSON containing base specifications like CPU, RAM, storage, etc.'
  },
  // Available plans (tiers) for this service
  plans: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'JSON array of available plans/tiers with specs and pricing'
  },
  // Available data centers
  dataCenters: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'JSON array of available data centers'
  },
  // Available operating systems
  operatingSystems: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'JSON array of available operating systems (for VM services)'
  },
  // Configuration options that can be customized
  configOptions: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'JSON array of customizable options (RAM, CPU, storage, etc.)'
  },
  // Price multipliers for different billing periods
  billingMultipliers: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: JSON.stringify({
      hourly: 1,
      monthly: 720, // 30 days * 24 hours
      quarterly: 2160, // 3 * 30 days * 24 hours
      semiannual: 4320, // 6 * 30 days * 24 hours
      annual: 8640 // 12 * 30 days * 24 hours
    }),
    comment: 'Multipliers for different billing periods'
  },
  // Base hourly price (lowest plan)
  baseHourlyPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

console.log('Service model initialized successfully');

module.exports = Service; 