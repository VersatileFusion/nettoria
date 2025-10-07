const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

class CloudHost extends Model {}

CloudHost.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    plan: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["Basic", "Standard", "Premium", "Enterprise"]],
      },
    },
    cpu: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Number of CPU cores",
    },
    ram: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "RAM in GB",
    },
    storage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Storage in GB",
    },
    bandwidth: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Bandwidth in Mbps",
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "suspended"),
      defaultValue: "active",
    },
    cpuUsage: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      comment: "CPU usage percentage",
    },
    ramUsage: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      comment: "RAM usage percentage",
    },
    storageUsage: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      comment: "Storage usage percentage",
    },
    bandwidthUsage: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
      comment: "Bandwidth used in bytes",
    },
    uptime: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Uptime in seconds",
    },
    lastRestart: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    operatingSystem: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Ubuntu 20.04 LTS",
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    backupEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    backupFrequency: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [["daily", "weekly", "monthly", null]],
      },
    },
    lastBackup: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "CloudHost",
    tableName: "cloud_hosts",
    timestamps: true,
  }
);

module.exports = CloudHost;
