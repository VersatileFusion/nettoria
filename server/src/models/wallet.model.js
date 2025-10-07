const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./user.model');

console.log('Initializing Wallet model...');

// Wallet model to store user balance
const Wallet = sequelize.define('Wallet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  lastTopupDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'suspended'),
    defaultValue: 'active'
  }
}, {
  timestamps: true
});

// WalletTransaction model to track deposits, withdrawals, and service payments
const WalletTransaction = sequelize.define('WalletTransaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  walletId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Wallet,
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('topup', 'payment', 'refund', 'adjustment'),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  balanceBefore: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  balanceAfter: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Reference ID (order ID, payment ID, etc.)'
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true
  },
  transactionDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true
});

// Define associations
User.hasOne(Wallet, { foreignKey: 'userId' });
Wallet.belongsTo(User, { foreignKey: 'userId' });

Wallet.hasMany(WalletTransaction, { foreignKey: 'walletId' });
WalletTransaction.belongsTo(Wallet, { foreignKey: 'walletId' });

console.log('Wallet models initialized successfully');

module.exports = {
  Wallet,
  WalletTransaction
}; 