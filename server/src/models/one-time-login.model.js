const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class OneTimeLogin extends Model {}

OneTimeLogin.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "OneTimeLogin",
    tableName: "one_time_logins",
    timestamps: true,
  }
);

module.exports = OneTimeLogin;
