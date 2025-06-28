/**
 * Service Controller
 * Handles service plans, VM configurations, and operating systems
 */

const vmPlans = require('../config/vm-plans');
const operatingSystems = require('../config/operating-systems');
const Service = require('../models/service.model');
const logger = require("../utils/logger");
const { Op } = require("sequelize");

/**
 * Get all available VM plans
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getVmPlans = async (req, res) => {
  try {
    console.log('Getting VM plans');

    // Return the VM plans with pricing information
    const plans = vmPlans.map(plan => {
      // Here you could add pricing based on plan specs
      // For now using simplified pricing based on resources
      const cpuPrice = plan.specs.cpu * 10000; // 10,000 per CPU core
      const ramPrice = plan.specs.ram * 5000;  // 5,000 per GB RAM
      const storagePrice = plan.specs.storage * 500; // 500 per GB storage

      const monthlyPrice = cpuPrice + ramPrice + storagePrice;

      return {
        ...plan,
        pricing: {
          monthly: monthlyPrice,
          quarterly: monthlyPrice * 3 * 0.95, // 5% discount
          biannual: monthlyPrice * 6 * 0.9,  // 10% discount
          annual: monthlyPrice * 12 * 0.85,  // 15% discount
          hourly: Math.round(monthlyPrice / 730) // ~730 hours in a month
        }
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        plans
      }
    });
  } catch (error) {
    console.error('Error getting VM plans:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve VM plans',
      error: error.message
    });
  }
};

/**
 * Get all available operating systems
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getOperatingSystems = async (req, res) => {
  try {
    console.log('Getting operating systems');

    res.status(200).json({
      status: 'success',
      data: {
        operatingSystems
      }
    });
  } catch (error) {
    console.error('Error getting operating systems:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve operating systems',
      error: error.message
    });
  }
};

/**
 * Configure custom VM service
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.configureService = async (req, res) => {
  try {
    const { serviceId, configuration } = req.body;

    // Validate service exists
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "سرویس یافت نشد"
      });
    }

    // Validate configuration based on service type
    let validationResult = { valid: true, price: service.price };

    switch (service.type) {
      case 'vps':
        validationResult = validateVPSConfiguration(configuration, service);
        break;
      case 'hosting':
        validationResult = validateHostingConfiguration(configuration, service);
        break;
      case 'domain':
        validationResult = validateDomainConfiguration(configuration, service);
        break;
      case 'vpn':
        validationResult = validateVPNConfiguration(configuration, service);
        break;
      default:
        validationResult = { valid: true, price: service.price };
    }

    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        message: "پیکربندی نامعتبر است",
        errors: validationResult.errors
      });
    }

    res.json({
      success: true,
      data: {
        service,
        configuration,
        calculatedPrice: validationResult.price,
        features: validationResult.features
      }
    });
  } catch (error) {
    logger.error("Error configuring service:", error);
    res.status(500).json({
      success: false,
      message: "خطا در پیکربندی سرویس",
      error: error.message
    });
  }
};

/**
 * Get data centers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDataCenters = async (req, res) => {
  try {
    console.log('Getting data centers');

    // Sample data centers - in production, this would come from a database
    const dataCenters = [
      {
        id: 'tehran',
        name: 'Tehran',
        nameFA: 'تهران',
        location: 'Iran',
        locationFA: 'ایران',
        status: 'active'
      },
      {
        id: 'mashhad',
        name: 'Mashhad',
        nameFA: 'مشهد',
        location: 'Iran',
        locationFA: 'ایران',
        status: 'active'
      }
    ];

    res.status(200).json({
      status: 'success',
      data: {
        dataCenters
      }
    });
  } catch (error) {
    console.error('Error getting data centers:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve data centers',
      error: error.message
    });
  }
};

/**
 * Get all available services
 */
exports.getAllServices = async (req, res) => {
  try {
    const { type, status, search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const whereClause = {};

    if (type) whereClause.type = type;
    if (status) whereClause.status = status;
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: services } = await Service.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        services,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    logger.error("Error getting all services:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت لیست سرویس‌ها",
      error: error.message
    });
  }
};

/**
 * Get service by ID
 */
exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "سرویس یافت نشد"
      });
    }

    res.json({
      success: true,
      data: { service }
    });
  } catch (error) {
    logger.error("Error getting service by ID:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت اطلاعات سرویس",
      error: error.message
    });
  }
};

/**
 * Get predefined service plans
 */
exports.getServicePlans = async (req, res) => {
  try {
    const { type } = req.query;

    const whereClause = { status: 'active' };
    if (type) whereClause.type = type;

    const plans = await Service.findAll({
      where: whereClause,
      order: [['price', 'ASC']]
    });

    // Group plans by type
    const groupedPlans = plans.reduce((acc, plan) => {
      if (!acc[plan.type]) {
        acc[plan.type] = [];
      }
      acc[plan.type].push(plan);
      return acc;
    }, {});

    res.json({
      success: true,
      data: { plans: groupedPlans }
    });
  } catch (error) {
    logger.error("Error getting service plans:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت پلن‌های سرویس",
      error: error.message
    });
  }
};

/**
 * Create new service (admin only)
 */
exports.createService = async (req, res) => {
  try {
    const {
      name,
      type,
      description,
      price,
      features = {},
      specifications = {},
      status = 'active'
    } = req.body;

    // Validate required fields
    if (!name || !type || !price) {
      return res.status(400).json({
        success: false,
        message: "نام، نوع و قیمت سرویس الزامی است"
      });
    }

    // Create service
    const service = await Service.create({
      name,
      type,
      description,
      price,
      features,
      specifications,
      status
    });

    res.status(201).json({
      success: true,
      message: "سرویس با موفقیت ایجاد شد",
      data: { service }
    });
  } catch (error) {
    logger.error("Error creating service:", error);
    res.status(500).json({
      success: false,
      message: "خطا در ایجاد سرویس",
      error: error.message
    });
  }
};

/**
 * Update service (admin only)
 */
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "سرویس یافت نشد"
      });
    }

    // Update service
    await service.update(updateData);

    res.json({
      success: true,
      message: "سرویس با موفقیت به‌روزرسانی شد",
      data: { service }
    });
  } catch (error) {
    logger.error("Error updating service:", error);
    res.status(500).json({
      success: false,
      message: "خطا در به‌روزرسانی سرویس",
      error: error.message
    });
  }
};

/**
 * Delete service (admin only)
 */
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "سرویس یافت نشد"
      });
    }

    // Check if service has active orders
    // This would require checking the orders table
    // For now, we'll just delete the service

    await service.destroy();

    res.json({
      success: true,
      message: "سرویس با موفقیت حذف شد"
    });
  } catch (error) {
    logger.error("Error deleting service:", error);
    res.status(500).json({
      success: false,
      message: "خطا در حذف سرویس",
      error: error.message
    });
  }
};

/**
 * Get service statistics
 */
exports.getServiceStats = async (req, res) => {
  try {
    const stats = await Service.findAll({
      attributes: [
        'type',
        [Service.sequelize.fn('COUNT', Service.sequelize.col('id')), 'count'],
        [Service.sequelize.fn('AVG', Service.sequelize.col('price')), 'avgPrice']
      ],
      group: ['type']
    });

    const totalServices = await Service.count();
    const activeServices = await Service.count({ where: { status: 'active' } });

    res.json({
      success: true,
      data: {
        stats,
        summary: {
          total: totalServices,
          active: activeServices
        }
      }
    });
  } catch (error) {
    logger.error("Error getting service stats:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت آمار سرویس‌ها",
      error: error.message
    });
  }
};

// Helper functions for service configuration validation

function validateVPSConfiguration(config, service) {
  const errors = [];
  let price = service.price;

  if (!config.cpu || config.cpu < 1) {
    errors.push("CPU cores must be at least 1");
  }
  if (!config.ram || config.ram < 512) {
    errors.push("RAM must be at least 512MB");
  }
  if (!config.storage || config.storage < 10) {
    errors.push("Storage must be at least 10GB");
  }

  // Calculate price based on configuration
  if (config.cpu > 1) price += (config.cpu - 1) * 50000; // 50,000 per additional CPU
  if (config.ram > 1024) price += (config.ram - 1024) * 100; // 100 per additional MB
  if (config.storage > 20) price += (config.storage - 20) * 2000; // 2,000 per additional GB

  return {
    valid: errors.length === 0,
    price,
    errors,
    features: {
      cpu: config.cpu,
      ram: config.ram,
      storage: config.storage,
      bandwidth: config.bandwidth || 'Unlimited'
    }
  };
}

function validateHostingConfiguration(config, service) {
  const errors = [];
  let price = service.price;

  if (!config.storage || config.storage < 1) {
    errors.push("Storage must be at least 1GB");
  }
  if (!config.bandwidth || config.bandwidth < 1) {
    errors.push("Bandwidth must be at least 1GB");
  }

  // Calculate price based on configuration
  if (config.storage > 5) price += (config.storage - 5) * 10000; // 10,000 per additional GB
  if (config.bandwidth > 10) price += (config.bandwidth - 10) * 5000; // 5,000 per additional GB

  return {
    valid: errors.length === 0,
    price,
    errors,
    features: {
      storage: config.storage,
      bandwidth: config.bandwidth,
      databases: config.databases || 1,
      emailAccounts: config.emailAccounts || 5
    }
  };
}

function validateDomainConfiguration(config, service) {
  const errors = [];
  let price = service.price;

  if (!config.domain || !config.domain.includes('.')) {
    errors.push("Valid domain name is required");
  }
  if (!config.period || config.period < 1) {
    errors.push("Registration period must be at least 1 year");
  }

  // Calculate price based on period
  price = price * config.period;

  return {
    valid: errors.length === 0,
    price,
    errors,
    features: {
      domain: config.domain,
      period: config.period,
      dnsManagement: true,
      emailForwarding: true
    }
  };
}

function validateVPNConfiguration(config, service) {
  const errors = [];
  let price = service.price;

  if (!config.location) {
    errors.push("VPN location is required");
  }
  if (!config.protocol || !['OpenVPN', 'WireGuard', 'IKEv2'].includes(config.protocol)) {
    errors.push("Valid VPN protocol is required");
  }

  // Calculate price based on configuration
  if (config.dedicatedIP) price += 50000; // 50,000 for dedicated IP
  if (config.portForwarding) price += 25000; // 25,000 for port forwarding

  return {
    valid: errors.length === 0,
    price,
    errors,
    features: {
      location: config.location,
      protocol: config.protocol,
      dedicatedIP: config.dedicatedIP || false,
      portForwarding: config.portForwarding || false
    }
  };
}

module.exports = exports; 