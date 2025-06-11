const axios = require('axios');
const config = require('../config');

class CloudAPI {
    static async initialize() {
        try {
            const response = await axios.post(`${config.cloud.apiUrl}/auth`, {
                apiKey: config.cloud.apiKey,
                apiSecret: config.cloud.apiSecret
            });

            this.sessionToken = response.data.token;
            return true;
        } catch (error) {
            console.error('Failed to initialize cloud API:', error);
            throw new Error('Failed to connect to cloud provider');
        }
    }

    static getHeaders() {
        if (!this.sessionToken) {
            throw new Error('Cloud API not initialized');
        }

        return {
            'Authorization': `Bearer ${this.sessionToken}`,
            'Content-Type': 'application/json'
        };
    }

    static async createServer({ name, region, plan, image, sshKeys, tags, backups, monitoring }) {
        try {
            const response = await axios.post(
                `${config.cloud.apiUrl}/servers`,
                {
                    name,
                    region,
                    plan,
                    image,
                    sshKeys,
                    tags,
                    backups,
                    monitoring
                },
                { headers: this.getHeaders() }
            );

            return response.data;
        } catch (error) {
            console.error('Failed to create server:', error);
            throw new Error('Failed to create server in cloud provider');
        }
    }

    static async updateServer(serverId, updateData) {
        try {
            const response = await axios.put(
                `${config.cloud.apiUrl}/servers/${serverId}`,
                updateData,
                { headers: this.getHeaders() }
            );

            return response.data;
        } catch (error) {
            console.error('Failed to update server:', error);
            throw new Error('Failed to update server in cloud provider');
        }
    }

    static async controlServer(serverId, action) {
        try {
            const response = await axios.post(
                `${config.cloud.apiUrl}/servers/${serverId}/actions`,
                { action },
                { headers: this.getHeaders() }
            );

            return response.data;
        } catch (error) {
            console.error('Failed to control server:', error);
            throw new Error('Failed to control server in cloud provider');
        }
    }

    static async getServerStatus(serverId) {
        try {
            const response = await axios.get(
                `${config.cloud.apiUrl}/servers/${serverId}/status`,
                { headers: this.getHeaders() }
            );

            return response.data.status;
        } catch (error) {
            console.error('Failed to get server status:', error);
            throw new Error('Failed to get server status from cloud provider');
        }
    }

    static async getServerMetrics(serverId) {
        try {
            const response = await axios.get(
                `${config.cloud.apiUrl}/servers/${serverId}/metrics`,
                { headers: this.getHeaders() }
            );

            return response.data;
        } catch (error) {
            console.error('Failed to get server metrics:', error);
            throw new Error('Failed to get server metrics from cloud provider');
        }
    }

    static async getRegions() {
        try {
            const response = await axios.get(
                `${config.cloud.apiUrl}/regions`,
                { headers: this.getHeaders() }
            );

            return response.data;
        } catch (error) {
            console.error('Failed to get regions:', error);
            throw new Error('Failed to get regions from cloud provider');
        }
    }

    static async getPlans() {
        try {
            const response = await axios.get(
                `${config.cloud.apiUrl}/plans`,
                { headers: this.getHeaders() }
            );

            return response.data;
        } catch (error) {
            console.error('Failed to get plans:', error);
            throw new Error('Failed to get plans from cloud provider');
        }
    }

    static async getImages() {
        try {
            const response = await axios.get(
                `${config.cloud.apiUrl}/images`,
                { headers: this.getHeaders() }
            );

            return response.data;
        } catch (error) {
            console.error('Failed to get images:', error);
            throw new Error('Failed to get images from cloud provider');
        }
    }

    static async createBackup(serverId, backupData) {
        try {
            const response = await axios.post(
                `${config.cloud.apiUrl}/servers/${serverId}/backups`,
                backupData,
                { headers: this.getHeaders() }
            );

            return response.data;
        } catch (error) {
            console.error('Failed to create backup:', error);
            throw new Error('Failed to create backup in cloud provider');
        }
    }

    static async restoreFromBackup(serverId, backupId) {
        try {
            const response = await axios.post(
                `${config.cloud.apiUrl}/servers/${serverId}/restore`,
                { backupId },
                { headers: this.getHeaders() }
            );

            return response.data;
        } catch (error) {
            console.error('Failed to restore from backup:', error);
            throw new Error('Failed to restore from backup in cloud provider');
        }
    }

    static async deleteServer(serverId) {
        try {
            await axios.delete(
                `${config.cloud.apiUrl}/servers/${serverId}`,
                { headers: this.getHeaders() }
            );

            return true;
        } catch (error) {
            console.error('Failed to delete server:', error);
            throw new Error('Failed to delete server in cloud provider');
        }
    }

    static async getConsoleURL(serverId) {
        try {
            const response = await axios.get(
                `${config.cloud.apiUrl}/servers/${serverId}/console`,
                { headers: this.getHeaders() }
            );

            return response.data.url;
        } catch (error) {
            console.error('Failed to get console URL:', error);
            throw new Error('Failed to get console URL from cloud provider');
        }
    }

    static async addFirewallRule(serverId, ruleData) {
        try {
            const response = await axios.post(
                `${config.cloud.apiUrl}/servers/${serverId}/firewall`,
                ruleData,
                { headers: this.getHeaders() }
            );

            return response.data;
        } catch (error) {
            console.error('Failed to add firewall rule:', error);
            throw new Error('Failed to add firewall rule in cloud provider');
        }
    }

    static async deleteFirewallRule(serverId, ruleId) {
        try {
            await axios.delete(
                `${config.cloud.apiUrl}/servers/${serverId}/firewall/${ruleId}`,
                { headers: this.getHeaders() }
            );

            return true;
        } catch (error) {
            console.error('Failed to delete firewall rule:', error);
            throw new Error('Failed to delete firewall rule in cloud provider');
        }
    }
}

module.exports = { cloudAPI: CloudAPI }; 