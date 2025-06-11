const { VirtualServer, VMTemplate, VMBackup, User } = require('../models');
const { Op } = require('sequelize');
const { createNotification } = require('../utils/notifications');
const { vCenterAPI } = require('../utils/vcenter-api');
const { calculateVMPrice } = require('../utils/pricing');

class VirtualServerService {
  static async getUserVMs(userId) {
    return await VirtualServer.findAll({
      where: { userId },
      include: [VMTemplate],
      order: [['createdAt', 'DESC']]
    });
  }

  static async getVMDetails(userId, vmId) {
    const vm = await VirtualServer.findOne({
      where: {
        id: vmId,
        userId
      },
      include: [VMTemplate]
    });

    if (!vm) {
      throw new Error('VM not found');
    }

    // Get real-time status from vCenter
    const vCenterStatus = await vCenterAPI.getVMStatus(vm.vCenterId);
    return { ...vm.toJSON(), status: vCenterStatus };
  }

  static async createVM(userId, vmData) {
    const { name, templateId, cpu, ram, storage, network } = vmData;

    // Get template
    const template = await VMTemplate.findByPk(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Calculate price
    const price = calculateVMPrice({ cpu, ram, storage });

    // Check user's balance
    const user = await User.findByPk(userId);
    if (!user || user.balance < price) {
      throw new Error('Insufficient balance');
    }

    // Create VM in vCenter
    const vCenterVM = await vCenterAPI.createVM({
      name,
      template: template.vCenterTemplateId,
      cpu,
      ram,
      storage,
      network
    });

    // Create VM record
    const vm = await VirtualServer.create({
      userId,
      name,
      templateId,
      vCenterId: vCenterVM.id,
      cpu,
      ram,
      storage,
      network,
      status: 'creating',
      price
    });

    // Deduct balance
    await user.update({
      balance: user.balance - price
    });

    // Create notification
    await createNotification({
      userId,
      type: 'vm_created',
      title: 'VM Created',
      message: `Your VM "${name}" is being created`,
      data: { vmId: vm.id }
    });

    return vm;
  }

  static async updateVM(userId, vmId, updateData) {
    const vm = await VirtualServer.findOne({
      where: {
        id: vmId,
        userId
      }
    });

    if (!vm) {
      throw new Error('VM not found');
    }

    // Calculate price difference
    const newPrice = calculateVMPrice({
      cpu: updateData.cpu || vm.cpu,
      ram: updateData.ram || vm.ram,
      storage: updateData.storage || vm.storage
    });

    const priceDifference = newPrice - vm.price;

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

    // Update VM in vCenter
    await vCenterAPI.updateVM(vm.vCenterId, updateData);

    // Update VM record
    await vm.update({
      ...updateData,
      price: newPrice
    });

    return vm;
  }

  static async controlVM(userId, vmId, action) {
    const vm = await VirtualServer.findOne({
      where: {
        id: vmId,
        userId
      }
    });

    if (!vm) {
      throw new Error('VM not found');
    }

    // Perform action in vCenter
    await vCenterAPI.controlVM(vm.vCenterId, action);

    // Update status
    await vm.update({ status: action });

    return { message: `VM ${action} successful` };
  }

  static async getVMMetrics(userId, vmId) {
    const vm = await VirtualServer.findOne({
      where: {
        id: vmId,
        userId
      }
    });

    if (!vm) {
      throw new Error('VM not found');
    }

    // Get metrics from vCenter
    return await vCenterAPI.getVMMetrics(vm.vCenterId);
  }

  static async getTemplates() {
    return await VMTemplate.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });
  }

  static async getConsoleAccess(userId, vmId) {
    const vm = await VirtualServer.findOne({
      where: {
        id: vmId,
        userId
      }
    });

    if (!vm) {
      throw new Error('VM not found');
    }

    // Get console URL from vCenter
    return await vCenterAPI.getConsoleURL(vm.vCenterId);
  }

  static async createBackup(userId, vmId, backupData) {
    const vm = await VirtualServer.findOne({
      where: {
        id: vmId,
        userId
      }
    });

    if (!vm) {
      throw new Error('VM not found');
    }

    // Create backup in vCenter
    const vCenterBackup = await vCenterAPI.createBackup(vm.vCenterId, backupData);

    // Create backup record
    const backup = await VMBackup.create({
      vmId,
      name: backupData.name || `Backup ${new Date().toISOString()}`,
      description: backupData.description,
      vCenterBackupId: vCenterBackup.id,
      size: vCenterBackup.size
    });

    return backup;
  }

  static async getBackups(userId, vmId) {
    const vm = await VirtualServer.findOne({
      where: {
        id: vmId,
        userId
      }
    });

    if (!vm) {
      throw new Error('VM not found');
    }

    return await VMBackup.findAll({
      where: { vmId },
      order: [['createdAt', 'DESC']]
    });
  }

  static async restoreFromBackup(userId, vmId, backupId) {
    const vm = await VirtualServer.findOne({
      where: {
        id: vmId,
        userId
      }
    });

    if (!vm) {
      throw new Error('VM not found');
    }

    const backup = await VMBackup.findOne({
      where: {
        id: backupId,
        vmId
      }
    });

    if (!backup) {
      throw new Error('Backup not found');
    }

    // Restore from backup in vCenter
    await vCenterAPI.restoreFromBackup(vm.vCenterId, backup.vCenterBackupId);

    return { message: 'VM restored successfully' };
  }

  static async deleteVM(userId, vmId) {
    const vm = await VirtualServer.findOne({
      where: {
        id: vmId,
        userId
      }
    });

    if (!vm) {
      throw new Error('VM not found');
    }

    // Delete VM in vCenter
    await vCenterAPI.deleteVM(vm.vCenterId);

    // Delete all backups
    await VMBackup.destroy({
      where: { vmId }
    });

    // Delete VM record
    await vm.destroy();

    // Create notification
    await createNotification({
      userId,
      type: 'vm_deleted',
      title: 'VM Deleted',
      message: `Your VM "${vm.name}" has been deleted`,
      data: { vmId }
    });
  }
}

module.exports = VirtualServerService; 