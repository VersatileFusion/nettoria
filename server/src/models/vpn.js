const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class VPN extends Model {}

VPN.init(
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
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    protocol: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["OpenVPN", "WireGuard", "L2TP", "PPTP", "SSTP"]],
      },
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
    bandwidthUsed: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
      comment: "Total bandwidth used in bytes",
    },
    lastConnected: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    totalConnections: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    averageSpeed: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      comment: "Average speed in Mbps",
    },
    configuration: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "VPN configuration details",
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "VPN",
    tableName: "vpns",
    timestamps: true,
  }
);

module.exports = VPN;
