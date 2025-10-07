const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Ticket = sequelize.define(
  "Ticket",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    subject: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    status: {
      type: DataTypes.ENUM("open", "in-progress", "resolved", "closed"),
      defaultValue: "open",
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high", "critical"),
      defaultValue: "medium",
      allowNull: false,
    },
    attachments: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    lastActivity: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
  }
);

// Define associations in index.js

module.exports = Ticket;
