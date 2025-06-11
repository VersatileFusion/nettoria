const { VPNConnection, VPNServer, VPNLog, User } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { generateOpenVPNConfig, generateWireguardConfig } = require('../utils/vpn-config');
const { sendNotification } = require('./notification.service');

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

  // Get all VPN connections for a user
  static async getUserConnections(userId) {
    const connections = await VPNConnection.findAll({
      where: { userId },
      include: [
        {
          model: VPNServer,
          attributes: ['name', 'location', 'ipAddress', 'status']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    return connections;
  }

  // Get details of a specific VPN connection
  static async getConnectionDetails(userId, connectionId) {
    const connection = await VPNConnection.findOne({
      where: {
        id: connectionId,
        userId
      },
      include: [
        {
          model: VPNServer,
          attributes: ['name', 'location', 'ipAddress', 'status']
        }
      ]
    });

    if (!connection) {
      throw new Error('VPN connection not found');
    }

    return connection;
  }

  // Create a new VPN connection
  static async createConnection(userId, connectionData) {
    const { name, serverId, protocol, config } = connectionData;

    // Check if server exists and is available
    const server = await VPNServer.findOne({
      where: {
        id: serverId,
        status: 'active'
      }
    });

    if (!server) {
      throw new Error('VPN server not found or not available');
    }

    // Generate configuration based on protocol
    let generatedConfig;
    if (protocol === 'openvpn') {
      generatedConfig = await generateOpenVPNConfig(server, config);
    } else if (protocol === 'wireguard') {
      generatedConfig = await generateWireguardConfig(server, config);
    } else {
      throw new Error('Unsupported VPN protocol');
    }

    // Create connection
    const connection = await VPNConnection.create({
      id: uuidv4(),
      userId,
      serverId,
      name,
      protocol,
      config: generatedConfig,
      status: 'active'
    });

    // Send notification
    await sendNotification(userId, {
      type: 'vpn_connection_created',
      title: 'New VPN Connection Created',
      message: `Your VPN connection "${name}" has been created successfully.`
    });

    return connection;
  }

  // Update VPN connection
  static async updateConnection(userId, connectionId, updateData) {
    const connection = await VPNConnection.findOne({
      where: {
        id: connectionId,
        userId
      }
    });

    if (!connection) {
      throw new Error('VPN connection not found');
    }

    // Update connection
    await connection.update(updateData);

    // Send notification
    await sendNotification(userId, {
      type: 'vpn_connection_updated',
      title: 'VPN Connection Updated',
      message: `Your VPN connection "${connection.name}" has been updated.`
    });

    return connection;
  }

  // Get connection configuration
  static async getConnectionConfig(userId, connectionId) {
    const connection = await VPNConnection.findOne({
      where: {
        id: connectionId,
        userId
      }
    });

    if (!connection) {
      throw new Error('VPN connection not found');
    }

    return connection.config;
  }

  // Get available VPN servers
  static async getAvailableServers() {
    const servers = await VPNServer.findAll({
      where: {
        status: 'active'
      },
      attributes: ['id', 'name', 'location', 'ipAddress', 'status', 'load', 'capacity']
    });
    return servers;
  }

  // Get server status
  static async getServerStatus(serverId) {
    const server = await VPNServer.findOne({
      where: { id: serverId }
    });

    if (!server) {
      throw new Error('VPN server not found');
    }

    return {
      status: server.status,
      load: server.load,
      capacity: server.capacity,
      activeConnections: server.activeConnections
    };
  }

  // Get connection statistics
  static async getConnectionStats(userId, connectionId) {
    const connection = await VPNConnection.findOne({
      where: {
        id: connectionId,
        userId
      }
    });

    if (!connection) {
      throw new Error('VPN connection not found');
    }

    // Get logs for the last 24 hours
    const logs = await VPNLog.findAll({
      where: {
        connectionId,
        createdAt: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      order: [['createdAt', 'DESC']]
    });

    // Calculate statistics
    const stats = {
      totalBytesUp: logs.reduce((sum, log) => sum + log.bytesUp, 0),
      totalBytesDown: logs.reduce((sum, log) => sum + log.bytesDown, 0),
      totalDuration: logs.reduce((sum, log) => sum + log.duration, 0),
      averageSpeed: logs.length > 0 ? 
        (logs.reduce((sum, log) => sum + log.speed, 0) / logs.length) : 0,
      connectionCount: logs.length
    };

    return stats;
  }

  // Delete VPN connection
  static async deleteConnection(userId, connectionId) {
    const connection = await VPNConnection.findOne({
      where: {
        id: connectionId,
        userId
      }
    });

    if (!connection) {
      throw new Error('VPN connection not found');
    }

    // Delete all associated logs
    await VPNLog.destroy({
      where: { connectionId }
    });

    // Delete connection
    await connection.destroy();

    // Send notification
    await sendNotification(userId, {
      type: 'vpn_connection_deleted',
      title: 'VPN Connection Deleted',
      message: `Your VPN connection "${connection.name}" has been deleted.`
    });
  }

  // Get connection logs
  static async getConnectionLogs(userId, connectionId, page = 1, limit = 10) {
    const connection = await VPNConnection.findOne({
      where: {
        id: connectionId,
        userId
      }
    });

    if (!connection) {
      throw new Error('VPN connection not found');
    }

    const offset = (page - 1) * limit;

    const logs = await VPNLog.findAndCountAll({
      where: { connectionId },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return {
      logs: logs.rows,
      total: logs.count,
      page,
      totalPages: Math.ceil(logs.count / limit)
    };
  }

  // Get connection usage
  static async getConnectionUsage(userId, connectionId) {
    const connection = await VPNConnection.findOne({
      where: {
        id: connectionId,
        userId
      }
    });

    if (!connection) {
      throw new Error('VPN connection not found');
    }

    // Get usage for the last 30 days
    const logs = await VPNLog.findAll({
      where: {
        connectionId,
        createdAt: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      order: [['createdAt', 'ASC']]
    });

    // Group usage by day
    const usageByDay = logs.reduce((acc, log) => {
      const date = log.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          bytesUp: 0,
          bytesDown: 0,
          duration: 0
        };
      }
      acc[date].bytesUp += log.bytesUp;
      acc[date].bytesDown += log.bytesDown;
      acc[date].duration += log.duration;
      return acc;
    }, {});

    return usageByDay;
  }
}

module.exports = new VPNService(); 