const axios = require('axios');
const config = require('../config');

class vCenterAPI {
    static async initialize() {
        try {
            const response = await axios.post(`${config.vcenter.url}/rest/com/vmware/cis/session`, {}, {
                auth: {
                    username: config.vcenter.username,
                    password: config.vcenter.password
                }
            });
            this.sessionId = response.data.value;
            return true;
        } catch (error) {
            console.error('Failed to initialize vCenter session:', error);
            throw new Error('Failed to connect to vCenter');
        }
    }

    static async getHeaders() {
        if (!this.sessionId) {
            await this.initialize();
        }
        return {
            'vmware-api-session-id': this.sessionId,
            'Content-Type': 'application/json'
        };
    }

    static async createVM({ name, template, cpu, ram, storage, network }) {
        try {
            const headers = await this.getHeaders();
            const response = await axios.post(
                `${config.vcenter.url}/rest/vcenter/vm`,
                {
                    spec: {
                        name,
                        guest_OS: 'OTHER_LINUX_64',
                        placement: {
                            cluster: config.vcenter.clusterId,
                            datastore: config.vcenter.datastoreId
                        },
                        hardware: {
                            memory: {
                                size_MiB: ram * 1024
                            },
                            cpu: {
                                count: cpu
                            },
                            disks: [{
                                new_vmdk: {
                                    capacity: storage * 1024 * 1024 * 1024
                                }
                            }],
                            nics: [{
                                type: 'VMXNET3',
                                backing: {
                                    type: 'STANDARD_PORTGROUP',
                                    network: network
                                }
                            }]
                        }
                    }
                },
                { headers }
            );
            return response.data.value;
        } catch (error) {
            console.error('Failed to create VM:', error);
            throw new Error('Failed to create VM in vCenter');
        }
    }

    static async updateVM(vmId, updateData) {
        try {
            const headers = await this.getHeaders();
            const updates = {};

            if (updateData.cpu) {
                updates.cpu = { count: updateData.cpu };
            }

            if (updateData.ram) {
                updates.memory = { size_MiB: updateData.ram * 1024 };
            }

            if (updateData.storage) {
                updates.disks = [{
                    new_vmdk: {
                        capacity: updateData.storage * 1024 * 1024 * 1024
                    }
                }];
            }

            await axios.patch(
                `${config.vcenter.url}/rest/vcenter/vm/${vmId}`,
                { spec: updates },
                { headers }
            );

            return true;
        } catch (error) {
            console.error('Failed to update VM:', error);
            throw new Error('Failed to update VM in vCenter');
        }
    }

    static async controlVM(vmId, action) {
        try {
            const headers = await this.getHeaders();
            const actionMap = {
                start: 'start',
                stop: 'stop',
                restart: 'reset',
                reset: 'reset'
            };

            if (!actionMap[action]) {
                throw new Error('Invalid action');
            }

            await axios.post(
                `${config.vcenter.url}/rest/vcenter/vm/${vmId}/power/${actionMap[action]}`,
                {},
                { headers }
            );

            return true;
        } catch (error) {
            console.error('Failed to control VM:', error);
            throw new Error('Failed to control VM in vCenter');
        }
    }

    static async getVMStatus(vmId) {
        try {
            const headers = await this.getHeaders();
            const response = await axios.get(
                `${config.vcenter.url}/rest/vcenter/vm/${vmId}/power`,
                { headers }
            );
            return response.data.value.state;
        } catch (error) {
            console.error('Failed to get VM status:', error);
            throw new Error('Failed to get VM status from vCenter');
        }
    }

    static async getVMMetrics(vmId) {
        try {
            const headers = await this.getHeaders();
            const response = await axios.get(
                `${config.vcenter.url}/rest/vcenter/vm/${vmId}/metrics`,
                { headers }
            );
            return response.data.value;
        } catch (error) {
            console.error('Failed to get VM metrics:', error);
            throw new Error('Failed to get VM metrics from vCenter');
        }
    }

    static async getConsoleURL(vmId) {
        try {
            const headers = await this.getHeaders();
            const response = await axios.post(
                `${config.vcenter.url}/rest/vcenter/vm/${vmId}/console/tickets`,
                {},
                { headers }
            );
            return response.data.value;
        } catch (error) {
            console.error('Failed to get console URL:', error);
            throw new Error('Failed to get console URL from vCenter');
        }
    }

    static async createBackup(vmId, backupData) {
        try {
            const headers = await this.getHeaders();
            const response = await axios.post(
                `${config.vcenter.url}/rest/vcenter/vm/${vmId}/snapshot`,
                {
                    spec: {
                        name: backupData.name,
                        description: backupData.description,
                        memory: true,
                        quiesce: true
                    }
                },
                { headers }
            );
            return response.data.value;
        } catch (error) {
            console.error('Failed to create backup:', error);
            throw new Error('Failed to create backup in vCenter');
        }
    }

    static async restoreFromBackup(vmId, backupId) {
        try {
            const headers = await this.getHeaders();
            await axios.post(
                `${config.vcenter.url}/rest/vcenter/vm/${vmId}/snapshot/${backupId}/revert`,
                {},
                { headers }
            );
            return true;
        } catch (error) {
            console.error('Failed to restore from backup:', error);
            throw new Error('Failed to restore from backup in vCenter');
        }
    }

    static async deleteVM(vmId) {
        try {
            const headers = await this.getHeaders();
            await axios.delete(
                `${config.vcenter.url}/rest/vcenter/vm/${vmId}`,
                { headers }
            );
            return true;
        } catch (error) {
            console.error('Failed to delete VM:', error);
            throw new Error('Failed to delete VM in vCenter');
        }
    }
}

module.exports = vCenterAPI; 