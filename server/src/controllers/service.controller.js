/**
 * Service Controller
 * Handles service plans, VM configurations, and operating systems
 */

const vmPlans = require('../config/vm-plans');
const operatingSystems = require('../config/operating-systems');
const Service = require('../models/service.model');

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
    console.log('Configuring custom VM service');
    
    const { cpu, ram, storage, traffic, operatingSystem, dataCenter, paymentPeriod } = req.body;
    
    // Validate inputs
    if (!cpu || !ram || !storage || !operatingSystem || !dataCenter || !paymentPeriod) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required configuration parameters'
      });
    }
    
    // Calculate price based on resources
    const cpuPrice = cpu * 10000;
    const ramPrice = ram * 5000;
    const storagePrice = storage * 500;
    const trafficPrice = (traffic && traffic > 1024) ? (traffic - 1024) * 1000 : 0;
    
    const basePrice = cpuPrice + ramPrice + storagePrice + trafficPrice;
    
    // Apply discount based on payment period
    let finalPrice;
    let discountPercentage = 0;
    
    switch (paymentPeriod) {
      case 'monthly':
        finalPrice = basePrice;
        break;
      case 'quarterly':
        discountPercentage = 5;
        finalPrice = basePrice * 3 * 0.95;
        break;
      case 'biannual':
        discountPercentage = 10;
        finalPrice = basePrice * 6 * 0.9;
        break;
      case 'annual':
        discountPercentage = 15;
        finalPrice = basePrice * 12 * 0.85;
        break;
      case 'hourly':
        finalPrice = Math.round(basePrice / 730);
        break;
      default:
        finalPrice = basePrice;
    }
    
    // Create configuration object
    const serviceConfig = {
      specs: {
        cpu,
        ram,
        storage,
        traffic: traffic || 1024 // Default 1TB if not specified
      },
      operatingSystem,
      dataCenter,
      paymentPeriod,
      pricing: {
        basePrice,
        finalPrice,
        discountPercentage
      }
    };
    
    res.status(200).json({
      status: 'success',
      data: {
        serviceConfig
      }
    });
  } catch (error) {
    console.error('Error configuring service:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to configure service',
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

module.exports = exports; 