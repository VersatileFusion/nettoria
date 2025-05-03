const vCenterService = require("../services/vcenter.service");
const { VirtualMachine, Order } = require("../models");
const logger = require("../utils/logger");

/**
 * Create a virtual machine based on order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createVM = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Get order details
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order is paid
    if (order.paymentStatus !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Order is not paid",
      });
    }

    // Check if VM already exists for this order
    const existingVM = await VirtualMachine.findOne({
      where: { orderId },
    });

    if (existingVM) {
      return res.status(400).json({
        success: false,
        message: "VM already exists for this order",
      });
    }

    // Prepare VM configuration
    const serviceConfig = JSON.parse(order.serviceConfig);
    const vmName = `vm-${order.id}-${Date.now().toString().slice(-6)}`;

    const vmConfig = {
      name: vmName,
      numCPUs: serviceConfig.cpuCores || 1,
      memoryGB: serviceConfig.memoryGB || 2,
      diskGB: serviceConfig.diskGB || 20,
      osType: serviceConfig.osType || "ubuntu20.04",
      datastoreName: process.env.VCENTER_DEFAULT_DATASTORE || "datastore1",
      networkName: process.env.VCENTER_DEFAULT_NETWORK || "VM Network",
      hostName: process.env.VCENTER_DEFAULT_HOST || "host1",
      datacenterName: process.env.VCENTER_DEFAULT_DATACENTER || "datacenter1",
    };

    // Create VM in vCenter
    logger.info(`Creating VM with config: ${JSON.stringify(vmConfig)}`);
    const vmResult = await vCenterService.createVM(vmConfig);

    // Create VM record in database
    const virtualMachine = await VirtualMachine.create({
      name: vmName,
      orderId: order.id,
      userId: order.userId,
      status: "ACTIVE",
      ipAddress: "0.0.0.0", // To be updated later
      vcenterVmId: vmResult.id || vmName,
      specifications: JSON.stringify(vmConfig),
      expiryDate: new Date(Date.now() + order.duration * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({
      success: true,
      message: "Virtual machine created successfully",
      virtualMachine,
    });
  } catch (error) {
    logger.error("Error creating VM:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create virtual machine",
      error: error.message,
    });
  }
};

/**
 * Power on a virtual machine
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.powerOnVM = async (req, res) => {
  try {
    const { vmId } = req.params;

    // Get VM details
    const virtualMachine = await VirtualMachine.findByPk(vmId);
    if (!virtualMachine) {
      return res.status(404).json({
        success: false,
        message: "Virtual machine not found",
      });
    }

    // Check if user owns this VM
    if (virtualMachine.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to manage this virtual machine",
      });
    }

    // Check if VM is expired
    if (new Date(virtualMachine.expiryDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Virtual machine is expired",
      });
    }

    // Power on VM
    const result = await vCenterService.powerOnVM(virtualMachine.name);

    if (result) {
      // Update VM status
      await virtualMachine.update({ status: "ACTIVE" });

      res.json({
        success: true,
        message: "Virtual machine powered on successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to power on virtual machine",
      });
    }
  } catch (error) {
    logger.error("Error powering on VM:", error);
    res.status(500).json({
      success: false,
      message: "Failed to power on virtual machine",
      error: error.message,
    });
  }
};

/**
 * Power off a virtual machine
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.powerOffVM = async (req, res) => {
  try {
    const { vmId } = req.params;

    // Get VM details
    const virtualMachine = await VirtualMachine.findByPk(vmId);
    if (!virtualMachine) {
      return res.status(404).json({
        success: false,
        message: "Virtual machine not found",
      });
    }

    // Check if user owns this VM
    if (virtualMachine.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to manage this virtual machine",
      });
    }

    // Power off VM
    const result = await vCenterService.powerOffVM(virtualMachine.name);

    if (result) {
      // Update VM status
      await virtualMachine.update({ status: "STOPPED" });

      res.json({
        success: true,
        message: "Virtual machine powered off successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to power off virtual machine",
      });
    }
  } catch (error) {
    logger.error("Error powering off VM:", error);
    res.status(500).json({
      success: false,
      message: "Failed to power off virtual machine",
      error: error.message,
    });
  }
};

/**
 * Restart a virtual machine
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.restartVM = async (req, res) => {
  try {
    const { vmId } = req.params;

    // Get VM details
    const virtualMachine = await VirtualMachine.findByPk(vmId);
    if (!virtualMachine) {
      return res.status(404).json({
        success: false,
        message: "Virtual machine not found",
      });
    }

    // Check if user owns this VM
    if (virtualMachine.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to manage this virtual machine",
      });
    }

    // Check if VM is expired
    if (new Date(virtualMachine.expiryDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Virtual machine is expired",
      });
    }

    // Restart VM
    const result = await vCenterService.restartVM(virtualMachine.name);

    if (result) {
      // Update VM status
      await virtualMachine.update({ status: "ACTIVE" });

      res.json({
        success: true,
        message: "Virtual machine restarted successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to restart virtual machine",
      });
    }
  } catch (error) {
    logger.error("Error restarting VM:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restart virtual machine",
      error: error.message,
    });
  }
};

/**
 * Rebuild a virtual machine with a new OS
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.rebuildVM = async (req, res) => {
  try {
    const { vmId } = req.params;
    const { osType } = req.body;

    if (!osType) {
      return res.status(400).json({
        success: false,
        message: "OS type is required",
      });
    }

    // Get VM details
    const virtualMachine = await VirtualMachine.findByPk(vmId);
    if (!virtualMachine) {
      return res.status(404).json({
        success: false,
        message: "Virtual machine not found",
      });
    }

    // Check if user owns this VM
    if (virtualMachine.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to manage this virtual machine",
      });
    }

    // Check if VM is expired
    if (new Date(virtualMachine.expiryDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Virtual machine is expired",
      });
    }

    // Rebuild VM
    const result = await vCenterService.rebuildVM(virtualMachine.name, osType);

    if (result) {
      // Update VM specifications
      const specs = JSON.parse(virtualMachine.specifications);
      specs.osType = osType;

      await virtualMachine.update({
        status: "REBUILDING",
        specifications: JSON.stringify(specs),
      });

      // After a short delay, set the VM as active
      setTimeout(async () => {
        await virtualMachine.update({ status: "ACTIVE" });
      }, 60000);

      res.json({
        success: true,
        message: "Virtual machine rebuild initiated successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to rebuild virtual machine",
      });
    }
  } catch (error) {
    logger.error("Error rebuilding VM:", error);
    res.status(500).json({
      success: false,
      message: "Failed to rebuild virtual machine",
      error: error.message,
    });
  }
};

/**
 * Delete a virtual machine
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteVM = async (req, res) => {
  try {
    const { vmId } = req.params;

    // Get VM details
    const virtualMachine = await VirtualMachine.findByPk(vmId);
    if (!virtualMachine) {
      return res.status(404).json({
        success: false,
        message: "Virtual machine not found",
      });
    }

    // Only admin can delete VMs
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete virtual machines",
      });
    }

    // Delete VM in vCenter
    const result = await vCenterService.deleteVM(virtualMachine.name);

    if (result) {
      // Delete VM from database
      await virtualMachine.destroy();

      res.json({
        success: true,
        message: "Virtual machine deleted successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to delete virtual machine",
      });
    }
  } catch (error) {
    logger.error("Error deleting VM:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete virtual machine",
      error: error.message,
    });
  }
};

/**
 * Get details of a virtual machine
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getVM = async (req, res) => {
  try {
    const { vmId } = req.params;

    // Get VM details
    const virtualMachine = await VirtualMachine.findByPk(vmId);
    if (!virtualMachine) {
      return res.status(404).json({
        success: false,
        message: "Virtual machine not found",
      });
    }

    // Check if user owns this VM
    if (virtualMachine.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this virtual machine",
      });
    }

    res.json({
      success: true,
      virtualMachine,
    });
  } catch (error) {
    logger.error("Error getting VM details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get virtual machine details",
      error: error.message,
    });
  }
};

/**
 * Get all virtual machines for the current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserVMs = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all VMs for the user
    const virtualMachines = await VirtualMachine.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      virtualMachines,
    });
  } catch (error) {
    logger.error("Error getting user VMs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get virtual machines",
      error: error.message,
    });
  }
};

/**
 * Get all expired virtual machines (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getExpiredVMs = async (req, res) => {
  try {
    // Only admin can view all expired VMs
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view expired virtual machines",
      });
    }

    const now = new Date();

    // Get all expired VMs
    const expiredVMs = await VirtualMachine.findAll({
      where: {
        expiryDate: {
          [Op.lt]: now,
        },
        status: {
          [Op.ne]: "DELETED",
        },
      },
      order: [["expiryDate", "ASC"]],
    });

    res.json({
      success: true,
      expiredVMs,
    });
  } catch (error) {
    logger.error("Error getting expired VMs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get expired virtual machines",
      error: error.message,
    });
  }
};

/**
 * Suspend an expired virtual machine
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.suspendVM = async (req, res) => {
  try {
    const { vmId } = req.params;

    // Only admin can suspend VMs
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to suspend virtual machines",
      });
    }

    // Get VM details
    const virtualMachine = await VirtualMachine.findByPk(vmId);
    if (!virtualMachine) {
      return res.status(404).json({
        success: false,
        message: "Virtual machine not found",
      });
    }

    // Power off VM in vCenter
    const result = await vCenterService.powerOffVM(virtualMachine.name);

    if (result) {
      // Update VM status
      await virtualMachine.update({ status: "SUSPENDED" });

      res.json({
        success: true,
        message: "Virtual machine suspended successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to suspend virtual machine",
      });
    }
  } catch (error) {
    logger.error("Error suspending VM:", error);
    res.status(500).json({
      success: false,
      message: "Failed to suspend virtual machine",
      error: error.message,
    });
  }
};
