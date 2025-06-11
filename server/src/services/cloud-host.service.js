const { CloudServer, CloudBackup, FirewallRule, User } = require('../models');
const { Op } = require('sequelize');
const { createNotification } = require('../utils/notifications');
const { calculateServerPrice } = require('../utils/pricing');
const { cloudAPI } = require('../utils/cloud-api');

class CloudHostService {
    static async getUserServers(userId) {
        return await CloudServer.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
    }

    static async getServerDetails(userId, serverId) {
        const server = await CloudServer.findOne({
            where: {
                id: serverId,
                userId
            },
            include: [FirewallRule]
        });

        if (!server) {
            throw new Error('Server not found');
        }

        // Get real-time status from cloud provider
        const cloudStatus = await cloudAPI.getServerStatus(server.cloudId);
        return { ...server.toJSON(), status: cloudStatus };
    }

    static async createServer(userId, serverData) {
        const { name, region, plan, image, sshKeys, tags, backups, monitoring } = serverData;

        // Calculate price
        const price = calculateServerPrice({ plan, region, backups, monitoring });

        // Check user's balance
        const user = await User.findByPk(userId);
        if (!user || user.balance < price) {
            throw new Error('Insufficient balance');
        }

        // Create server in cloud provider
        const cloudServer = await cloudAPI.createServer({
            name,
            region,
            plan,
            image,
            sshKeys,
            tags,
            backups,
            monitoring
        });

        // Create server record
        const server = await CloudServer.create({
            userId,
            name,
            region,
            plan,
            image,
            cloudId: cloudServer.id,
            ipAddress: cloudServer.ipAddress,
            status: 'creating',
            price,
            backups,
            monitoring,
            tags: tags || []
        });

        // Deduct balance
        await user.update({
            balance: user.balance - price
        });

        // Create notification
        await createNotification({
            userId,
            type: 'server_created',
            title: 'Server Created',
            message: `Your server "${name}" is being created`,
            data: { serverId: server.id }
        });

        return server;
    }

    static async updateServer(userId, serverId, updateData) {
        const server = await CloudServer.findOne({
            where: {
                id: serverId,
                userId
            }
        });

        if (!server) {
            throw new Error('Server not found');
        }

        // Calculate price difference
        const newPrice = calculateServerPrice({
            plan: server.plan,
            region: server.region,
            backups: updateData.backups !== undefined ? updateData.backups : server.backups,
            monitoring: updateData.monitoring !== undefined ? updateData.monitoring : server.monitoring
        });

        const priceDifference = newPrice - server.price;

        if (priceDifference > 0) {
            // Check user's balance
            const user = await User.findByPk(userId);
            if (!user || user.balance < priceDifference) {
                throw new Error('Insufficient balance for upgrade');
            }

            // Deduct balance
            await user.update({
                balance: user.balance - priceDifference
            });
        }

        // Update server in cloud provider
        await cloudAPI.updateServer(server.cloudId, updateData);

        // Update server record
        await server.update({
            ...updateData,
            price: newPrice
        });

        return server;
    }

    static async controlServer(userId, serverId, action) {
        const server = await CloudServer.findOne({
            where: {
                id: serverId,
                userId
            }
        });

        if (!server) {
            throw new Error('Server not found');
        }

        // Perform action in cloud provider
        await cloudAPI.controlServer(server.cloudId, action);

        // Update status
        await server.update({ status: action });

        return { message: `Server ${action} successful` };
    }

    static async getServerMetrics(userId, serverId) {
        const server = await CloudServer.findOne({
            where: {
                id: serverId,
                userId
            }
        });

        if (!server) {
            throw new Error('Server not found');
        }

        // Get metrics from cloud provider
        return await cloudAPI.getServerMetrics(server.cloudId);
    }

    static async getAvailableRegions() {
        return await cloudAPI.getRegions();
    }

    static async getAvailablePlans() {
        return await cloudAPI.getPlans();
    }

    static async getAvailableImages() {
        return await cloudAPI.getImages();
    }

    static async createBackup(userId, serverId, backupData) {
        const server = await CloudServer.findOne({
            where: {
                id: serverId,
                userId
            }
        });

        if (!server) {
            throw new Error('Server not found');
        }

        // Create backup in cloud provider
        const cloudBackup = await cloudAPI.createBackup(server.cloudId, backupData);

        // Create backup record
        const backup = await CloudBackup.create({
            serverId,
            name: backupData.name || `Backup ${new Date().toISOString()}`,
            description: backupData.description,
            cloudBackupId: cloudBackup.id,
            size: cloudBackup.size
        });

        return backup;
    }

    static async getBackups(userId, serverId) {
        const server = await CloudServer.findOne({
            where: {
                id: serverId,
                userId
            }
        });

        if (!server) {
            throw new Error('Server not found');
        }

        return await CloudBackup.findAll({
            where: { serverId },
            order: [['createdAt', 'DESC']]
        });
    }

    static async restoreFromBackup(userId, serverId, backupId) {
        const server = await CloudServer.findOne({
            where: {
                id: serverId,
                userId
            }
        });

        if (!server) {
            throw new Error('Server not found');
        }

        const backup = await CloudBackup.findOne({
            where: {
                id: backupId,
                serverId
            }
        });

        if (!backup) {
            throw new Error('Backup not found');
        }

        // Restore from backup in cloud provider
        await cloudAPI.restoreFromBackup(server.cloudId, backup.cloudBackupId);

        return { message: 'Server restored successfully' };
    }

    static async deleteServer(userId, serverId) {
        const server = await CloudServer.findOne({
            where: {
                id: serverId,
                userId
            }
        });

        if (!server) {
            throw new Error('Server not found');
        }

        // Delete server in cloud provider
        await cloudAPI.deleteServer(server.cloudId);

        // Delete all backups
        await CloudBackup.destroy({
            where: { serverId }
        });

        // Delete all firewall rules
        await FirewallRule.destroy({
            where: { serverId }
        });

        // Delete server record
        await server.destroy();

        // Create notification
        await createNotification({
            userId,
            type: 'server_deleted',
            title: 'Server Deleted',
            message: `Your server "${server.name}" has been deleted`,
            data: { serverId }
        });
    }

    static async getServerConsole(userId, serverId) {
        const server = await CloudServer.findOne({
            where: {
                id: serverId,
                userId
            }
        });

        if (!server) {
            throw new Error('Server not found');
        }

        // Get console URL from cloud provider
        return await cloudAPI.getConsoleURL(server.cloudId);
    }

    static async getFirewallRules(userId, serverId) {
        const server = await CloudServer.findOne({
            where: {
                id: serverId,
                userId
            }
        });

        if (!server) {
            throw new Error('Server not found');
        }

        return await FirewallRule.findAll({
            where: { serverId },
            order: [['createdAt', 'ASC']]
        });
    }

    static async addFirewallRule(userId, serverId, ruleData) {
        const server = await CloudServer.findOne({
            where: {
                id: serverId,
                userId
            }
        });

        if (!server) {
            throw new Error('Server not found');
        }

        // Add firewall rule in cloud provider
        const cloudRule = await cloudAPI.addFirewallRule(server.cloudId, ruleData);

        // Create firewall rule record
        const rule = await FirewallRule.create({
            serverId,
            ...ruleData,
            cloudRuleId: cloudRule.id
        });

        return rule;
    }

    static async deleteFirewallRule(userId, serverId, ruleId) {
        const server = await CloudServer.findOne({
            where: {
                id: serverId,
                userId
            }
        });

        if (!server) {
            throw new Error('Server not found');
        }

        const rule = await FirewallRule.findOne({
            where: {
                id: ruleId,
                serverId
            }
        });

        if (!rule) {
            throw new Error('Firewall rule not found');
        }

        // Delete firewall rule in cloud provider
        await cloudAPI.deleteFirewallRule(server.cloudId, rule.cloudRuleId);

        // Delete firewall rule record
        await rule.destroy();
    }
}

module.exports = CloudHostService; 