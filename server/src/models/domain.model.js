const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Domain = sequelize.define('Domain', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  registrar: {
    type: DataTypes.STRING,
    allowNull: false
  },
  registrationPeriod: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10
    }
  },
  autoRenew: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  nameservers: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  contacts: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'transfer_pending', 'suspended'),
    defaultValue: 'active'
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  newRegistrar: {
    type: DataTypes.STRING
  },
  transferDate: {
    type: DataTypes.DATE
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['expiryDate']
    }
  ]
});

const DNSRecord = sequelize.define('DNSRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  domainId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Domains',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV', 'NS'),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ttl: {
    type: DataTypes.INTEGER,
    defaultValue: 3600,
    validate: {
      min: 60
    }
  },
  priority: {
    type: DataTypes.INTEGER,
    validate: {
      min: 0
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  indexes: [
    {
      fields: ['domainId']
    },
    {
      fields: ['type']
    },
    {
      fields: ['name']
    }
  ]
});

// Define relationships
Domain.hasMany(DNSRecord, { foreignKey: 'domainId' });
DNSRecord.belongsTo(Domain, { foreignKey: 'domainId' });

module.exports = {
  Domain,
  DNSRecord
};
