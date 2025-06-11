const mongoose = require("mongoose");
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const vpnSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    currentServer: {
      type: String,
      default: null,
    },
    lastConnected: {
      type: Date,
      default: null,
    },
    dataUsage: {
      upload: {
        type: Number,
        default: 0,
      },
      download: {
        type: Number,
        default: 0,
      },
    },
    dailyUsage: [
      {
        date: {
          type: Date,
          required: true,
        },
        upload: {
          type: Number,
          default: 0,
        },
        download: {
          type: Number,
          default: 0,
        },
      },
    ],
    subscription: {
      plan: {
        type: String,
        enum: ["basic", "premium", "enterprise"],
        default: "basic",
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: {
        type: Date,
        required: true,
      },
      autoRenew: {
        type: Boolean,
        default: true,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
vpnSchema.index({ userId: 1 });
vpnSchema.index({ username: 1 });
vpnSchema.index({ status: 1 });

// Methods
vpnSchema.methods.isActive = function () {
  return this.status === "active" && this.subscription.endDate > new Date();
};

vpnSchema.methods.updateDataUsage = async function (upload, download) {
  this.dataUsage.upload += upload;
  this.dataUsage.download += download;

  const today = new Date().toISOString().split("T")[0];
  const dailyUsage = this.dailyUsage.find(
    (usage) => usage.date.toISOString().split("T")[0] === today
  );

  if (dailyUsage) {
    dailyUsage.upload += upload;
    dailyUsage.download += download;
  } else {
    this.dailyUsage.push({
      date: new Date(),
      upload,
      download,
    });
  }

  return this.save();
};

vpnSchema.methods.connect = async function (server) {
  this.currentServer = server;
  this.lastConnected = new Date();
  return this.save();
};

vpnSchema.methods.disconnect = async function () {
  this.currentServer = null;
  return this.save();
};

// Static methods
vpnSchema.statics.findByUserId = function (userId) {
  return this.findOne({ userId });
};

vpnSchema.statics.findByUsername = function (username) {
  return this.findOne({ username });
};

const VPN = mongoose.model("VPN", vpnSchema);

// VPN Server Model
const VPNServer = sequelize.define('VPNServer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIP: true
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'maintenance', 'offline'),
    defaultValue: 'active'
  },
  load: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  activeConnections: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  supportedProtocols: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: ['openvpn', 'wireguard']
  },
  configuration: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
});

// VPN Connection Model
const VPNConnection = sequelize.define('VPNConnection', {
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
  serverId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'VPNServers',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  protocol: {
    type: DataTypes.ENUM('openvpn', 'wireguard'),
    allowNull: false
  },
  config: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'error'),
    defaultValue: 'active'
  },
  lastConnected: {
    type: DataTypes.DATE
  },
  lastDisconnected: {
    type: DataTypes.DATE
  },
  totalBytesUp: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  totalBytesDown: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  totalDuration: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

// VPN Log Model
const VPNLog = sequelize.define('VPNLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  connectionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'VPNConnections',
      key: 'id'
    }
  },
  event: {
    type: DataTypes.ENUM('connect', 'disconnect', 'error'),
    allowNull: false
  },
  bytesUp: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  bytesDown: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  speed: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  error: {
    type: DataTypes.STRING
  },
  ipAddress: {
    type: DataTypes.STRING,
    validate: {
      isIP: true
    }
  },
  userAgent: {
    type: DataTypes.STRING
  }
});

// Define relationships
VPNServer.hasMany(VPNConnection, {
  foreignKey: 'serverId',
  as: 'connections'
});

VPNConnection.belongsTo(VPNServer, {
  foreignKey: 'serverId',
  as: 'server'
});

VPNConnection.hasMany(VPNLog, {
  foreignKey: 'connectionId',
  as: 'logs'
});

VPNLog.belongsTo(VPNConnection, {
  foreignKey: 'connectionId',
  as: 'connection'
});

// Add indexes
VPNServer.addIndex(['status', 'location']);
VPNConnection.addIndex(['userId', 'status']);
VPNLog.addIndex(['connectionId', 'createdAt']);

module.exports = {
  VPNServer,
  VPNConnection,
  VPNLog
};
