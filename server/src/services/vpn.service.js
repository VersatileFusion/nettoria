const VPN = require("../models/vpn.model");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

class VPNService {
  constructor() {
    this.connectedUsers = new Map();
  }

  /**
   * Connect to VPN server
   * @param {string} userId - User ID
   * @param {string} serverId - Server ID
   * @returns {Promise<boolean>} - Connection status
   */
  async connect(userId, serverId) {
    try {
      const vpn = await VPN.findByUserId(userId);
      if (!vpn) {
        throw new Error("VPN configuration not found");
      }

      if (!vpn.isActive()) {
        throw new Error("VPN subscription is not active");
      }

      // Check if user is already connected
      if (this.connectedUsers.has(userId)) {
        throw new Error("User is already connected to VPN");
      }

      // TODO: Implement actual VPN connection using OpenVPN or other VPN software
      // This is a placeholder for the actual implementation
      const command = `openvpn --config /etc/openvpn/${serverId}.ovpn --auth-user-pass /etc/openvpn/${vpn.username}.auth`;
      await execPromise(command);

      // Update connection status
      this.connectedUsers.set(userId, {
        serverId,
        startTime: new Date(),
        dataUsage: { upload: 0, download: 0 },
      });

      // Update VPN record
      await vpn.connect(serverId);

      return true;
    } catch (error) {
      console.error("VPN connection error:", error);
      throw error;
    }
  }

  /**
   * Disconnect from VPN server
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - Disconnection status
   */
  async disconnect(userId) {
    try {
      const vpn = await VPN.findByUserId(userId);
      if (!vpn) {
        throw new Error("VPN configuration not found");
      }

      // Check if user is connected
      if (!this.connectedUsers.has(userId)) {
        throw new Error("User is not connected to VPN");
      }

      // TODO: Implement actual VPN disconnection
      const command = "pkill openvpn";
      await execPromise(command);

      // Get connection data
      const connectionData = this.connectedUsers.get(userId);
      const { dataUsage } = connectionData;

      // Update VPN record with usage data
      await vpn.updateDataUsage(dataUsage.upload, dataUsage.download);
      await vpn.disconnect();

      // Remove from connected users
      this.connectedUsers.delete(userId);

      return true;
    } catch (error) {
      console.error("VPN disconnection error:", error);
      throw error;
    }
  }

  /**
   * Get VPN server status
   * @param {string} serverId - Server ID
   * @returns {Promise<Object>} - Server status
   */
  async getServerStatus(serverId) {
    try {
      // TODO: Implement actual server status check
      // This is a placeholder for the actual implementation
      const command = `ping -c 1 ${serverId}.vpn.example.com`;
      const { stdout } = await execPromise(command);

      // Parse ping result
      const pingMatch = stdout.match(/time=(\d+\.?\d*) ms/);
      const ping = pingMatch ? parseFloat(pingMatch[1]) : null;

      // Get server load (placeholder)
      const load = Math.floor(Math.random() * 100);

      return {
        id: serverId,
        status: "online",
        load,
        ping,
      };
    } catch (error) {
      console.error("Server status check error:", error);
      throw error;
    }
  }

  /**
   * Update user's data usage
   * @param {string} userId - User ID
   * @param {number} upload - Upload bytes
   * @param {number} download - Download bytes
   */
  async updateDataUsage(userId, upload, download) {
    try {
      if (this.connectedUsers.has(userId)) {
        const connectionData = this.connectedUsers.get(userId);
        connectionData.dataUsage.upload += upload;
        connectionData.dataUsage.download += download;
        this.connectedUsers.set(userId, connectionData);
      }
    } catch (error) {
      console.error("Data usage update error:", error);
      throw error;
    }
  }

  /**
   * Get connected users count
   * @returns {number} - Number of connected users
   */
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  /**
   * Get server load
   * @param {string} serverId - Server ID
   * @returns {Promise<number>} - Server load percentage
   */
  async getServerLoad(serverId) {
    try {
      // TODO: Implement actual server load check
      // This is a placeholder for the actual implementation
      const connectedToServer = Array.from(this.connectedUsers.values()).filter(
        (data) => data.serverId === serverId
      ).length;

      // Assume max capacity is 1000 users
      return (connectedToServer / 1000) * 100;
    } catch (error) {
      console.error("Server load check error:", error);
      throw error;
    }
  }
}

module.exports = new VPNService(); 