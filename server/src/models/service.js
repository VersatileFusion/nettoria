const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

class Service extends Model {}

Service.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    features: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    type: {
      type: DataTypes.ENUM("vm", "database", "storage", "network"),
      allowNull: false,
    },
    plan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "pending", "suspended", "terminated"),
      defaultValue: "pending",
    },
    resources: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Service",
    tableName: "services",
    timestamps: true,
  }
);

module.exports = Service;
