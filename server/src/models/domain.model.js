const mongoose = require("mongoose");

const domainSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "active",
        "expired",
        "transfer_pending",
        "transferring",
      ],
      default: "pending",
    },
    period: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    expiryDate: {
      type: Date,
    },
    transferCode: {
      type: String,
    },
    dnsRecords: [
      {
        type: {
          type: String,
          enum: ["A", "AAAA", "CNAME", "MX", "TXT"],
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        value: {
          type: String,
          required: true,
        },
        ttl: {
          type: Number,
          default: 3600,
          min: 60,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
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
domainSchema.index({ name: 1 });
domainSchema.index({ userId: 1 });
domainSchema.index({ status: 1 });

// Methods
domainSchema.methods.isExpired = function () {
  return (
    this.status === "expired" ||
    (this.expiryDate && this.expiryDate < new Date())
  );
};

domainSchema.methods.canTransfer = function () {
  return this.status === "active" && !this.isExpired();
};

domainSchema.methods.addDNSRecord = async function (record) {
  this.dnsRecords.push(record);
  return this.save();
};

domainSchema.methods.removeDNSRecord = async function (recordId) {
  this.dnsRecords = this.dnsRecords.filter(
    (record) => record._id.toString() !== recordId
  );
  return this.save();
};

// Static methods
domainSchema.statics.findByUserId = function (userId, page = 1, limit = 10) {
  return this.find({ userId })
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });
};

domainSchema.statics.countByUserId = function (userId) {
  return this.countDocuments({ userId });
};

const Domain = mongoose.model("Domain", domainSchema);

module.exports = Domain;
