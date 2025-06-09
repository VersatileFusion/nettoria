const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const bcrypt = require("bcryptjs");
const speakeasy = require("speakeasy");

class User extends Model {
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  async compareSuccessPassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.successPassword);
  }

  generate2FASecret() {
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `Nettoria:${this.email}`,
    });

    this.twoFactorSecret = secret.base32;
    return secret;
  }

  verify2FAToken(token) {
    return speakeasy.totp.verify({
      secret: this.twoFactorSecret,
      encoding: "base32",
      token: token,
    });
  }

  async addSession(sessionData) {
    const sessions = this.sessions || [];
    sessions.push(sessionData);
    this.sessions = sessions;
    await this.save();
  }

  async removeSession(token) {
    const sessions = this.sessions || [];
    this.sessions = sessions.filter((session) => session.token !== token);
    await this.save();
  }

  getActiveSessions() {
    return this.sessions || [];
  }

  async updateSecurityPreferences(preferences) {
    this.securityPreferences = {
      ...this.securityPreferences,
      ...preferences,
    };
    await this.save();
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    successPassword: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetCodeExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    twoFactorSecret: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    twoFactorEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      defaultValue: "user",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "suspended"),
      defaultValue: "active",
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sessions: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    securityPreferences: {
      type: DataTypes.JSONB,
      defaultValue: {
        require2FA: false,
        notifyOnLogin: true,
        notifyOnPasswordChange: true,
        notifyOnSuccessPasswordChange: true,
      },
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
        if (user.successPassword) {
          user.successPassword = await bcrypt.hash(user.successPassword, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 10);
        }
        if (user.changed("successPassword")) {
          user.successPassword = await bcrypt.hash(user.successPassword, 10);
        }
      },
    },
  }
);

module.exports = User;
