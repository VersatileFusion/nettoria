const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Comment = sequelize.define(
  "Comment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    attachments: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    isStaff: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isInternal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  }
);

// Define associations in index.js

module.exports = Comment;
