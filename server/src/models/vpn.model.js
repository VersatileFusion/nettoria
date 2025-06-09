const mongoose = require("mongoose");

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

module.exports = VPN;
