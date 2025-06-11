const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CloudServer = sequelize.define('CloudServer', {
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
      allowNull: false
    },
    region: {
      type: DataTypes.STRING,
      allowNull: false
    },
    plan: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cloudId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('creating', 'running', 'stopped', 'restarting', 'error'),
      defaultValue: 'creating'
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    backups: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    monitoring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    lastStarted: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lastStopped: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
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
        fields: ['cloudId']
      }
    ]
  });

  const CloudBackup = sequelize.define('CloudBackup', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    serverId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'CloudServers',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cloudBackupId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Size in MB'
    },
    status: {
      type: DataTypes.ENUM('creating', 'completed', 'failed'),
      defaultValue: 'creating'
    }
  }, {
    indexes: [
      {
        fields: ['serverId']
      },
      {
        fields: ['status']
      }
    ]
  });

  const FirewallRule = sequelize.define('FirewallRule', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    serverId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'CloudServers',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    protocol: {
      type: DataTypes.ENUM('tcp', 'udp', 'icmp'),
      allowNull: false
    },
    port: {
      type: DataTypes.STRING,
      allowNull: false
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '0.0.0.0/0'
    },
    action: {
      type: DataTypes.ENUM('allow', 'deny'),
      defaultValue: 'allow'
    },
    cloudRuleId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    indexes: [
      {
        fields: ['serverId']
      },
      {
        fields: ['protocol']
      }
    ]
  });

  // Define relationships
  CloudServer.hasMany(CloudBackup, {
    foreignKey: 'serverId',
    as: 'backups'
  });
  CloudBackup.belongsTo(CloudServer, {
    foreignKey: 'serverId',
    as: 'server'
  });

  CloudServer.hasMany(FirewallRule, {
    foreignKey: 'serverId',
    as: 'firewallRules'
  });
  FirewallRule.belongsTo(CloudServer, {
    foreignKey: 'serverId',
    as: 'server'
  });

  return {
    CloudServer,
    CloudBackup,
    FirewallRule
  };
}; 