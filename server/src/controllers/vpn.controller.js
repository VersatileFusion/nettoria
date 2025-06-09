const VPN = require("../models/vpn.model");
const vpnService = require("../services/vpn.service");
const { validationResult } = require("express-validator");

class VPNController {
  /**
   * Get VPN configuration
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getConfig(req, res) {
    try {
      const vpn = await VPN.findByUserId(req.user.id);
      if (!vpn) {
        return res.status(404).json({ message: "VPN configuration not found" });
      }

      res.json({
        server: vpn.currentServer,
        port: 1194, // Default OpenVPN port
        protocol: "udp",
        username: vpn.username,
        status: vpn.status,
      });
    } catch (error) {
      console.error("Get config error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  /**
   * Get VPN status
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getStatus(req, res) {
    try {
      const vpn = await VPN.findByUserId(req.user.id);
      if (!vpn) {
        return res.status(404).json({ message: "VPN configuration not found" });
      }

      const isConnected = vpnService.connectedUsers.has(req.user.id);
      const connectionData = isConnected
        ? vpnService.connectedUsers.get(req.user.id)
        : null;

      res.json({
        connected: isConnected,
        lastConnected: vpn.lastConnected,
        currentServer: vpn.currentServer,
        dataUsage: vpn.dataUsage,
        dailyUsage: vpn.dailyUsage,
        connectionTime: connectionData
          ? Math.floor((new Date() - connectionData.startTime) / 1000)
          : 0,
      });
    } catch (error) {
      console.error("Get status error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  /**
   * Connect to VPN
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async connect(req, res) {
    try {
      const { serverId } = req.body;
      if (!serverId) {
        return res.status(400).json({ message: "Server ID is required" });
      }

      await vpnService.connect(req.user.id, serverId);
      res.json({ message: "Connected to VPN successfully" });
    } catch (error) {
      console.error("Connect error:", error);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Disconnect from VPN
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async disconnect(req, res) {
    try {
      await vpnService.disconnect(req.user.id);
      res.json({ message: "Disconnected from VPN successfully" });
    } catch (error) {
      console.error("Disconnect error:", error);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Get available servers
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getServers(req, res) {
    try {
      const servers = [
        {
          id: "us1",
          name: "US Server 1",
          location: "United States",
          load: await vpnService.getServerLoad("us1"),
          ping: (await vpnService.getServerStatus("us1")).ping,
        },
        {
          id: "eu1",
          name: "EU Server 1",
          location: "Europe",
          load: await vpnService.getServerLoad("eu1"),
          ping: (await vpnService.getServerStatus("eu1")).ping,
        },
        // Add more servers as needed
      ];

      res.json(servers);
    } catch (error) {
      console.error("Get servers error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  /**
   * Get VPN usage
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getUsage(req, res) {
    try {
      const vpn = await VPN.findByUserId(req.user.id);
      if (!vpn) {
        return res.status(404).json({ message: "VPN configuration not found" });
      }

      res.json({
        total: vpn.dataUsage,
        daily: vpn.dailyUsage,
      });
    } catch (error) {
      console.error("Get usage error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  /**
   * Update VPN usage
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateUsage(req, res) {
    try {
      const { upload, download } = req.body;
      if (typeof upload !== "number" || typeof download !== "number") {
        return res.status(400).json({
          message: "Upload and download values must be numbers",
        });
      }

      await vpnService.updateDataUsage(req.user.id, upload, download);
      res.json({ message: "Usage updated successfully" });
    } catch (error) {
      console.error("Update usage error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  /**
   * Create VPN configuration
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async create(req, res) {
    try {
      const { username, password, plan } = req.body;

      // Check if user already has a VPN configuration
      const existingVpn = await VPN.findByUserId(req.user.id);
      if (existingVpn) {
        return res.status(400).json({
          message: "VPN configuration already exists",
        });
      }

      // Create new VPN configuration
      const vpn = new VPN({
        userId: req.user.id,
        username,
        password,
        subscription: {
          plan,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          autoRenew: true,
        },
      });

      await vpn.save();
      res.status(201).json({
        message: "VPN configuration created successfully",
        vpn,
      });
    } catch (error) {
      console.error("Create VPN error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  /**
   * Update VPN configuration
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async update(req, res) {
    try {
      const { password, plan, autoRenew } = req.body;

      const vpn = await VPN.findByUserId(req.user.id);
      if (!vpn) {
        return res.status(404).json({ message: "VPN configuration not found" });
      }

      // Update fields if provided
      if (password) vpn.password = password;
      if (plan) vpn.subscription.plan = plan;
      if (typeof autoRenew === "boolean")
        vpn.subscription.autoRenew = autoRenew;

      await vpn.save();
      res.json({
        message: "VPN configuration updated successfully",
        vpn,
      });
    } catch (error) {
      console.error("Update VPN error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

module.exports = new VPNController(); 