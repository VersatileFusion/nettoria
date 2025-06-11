const config = require('../config');

const calculateVMPrice = ({ cpu, ram, storage }) => {
  const basePrice = config.pricing.basePrice || 10;
  const cpuPrice = (config.pricing.cpuPrice || 5) * cpu;
  const ramPrice = (config.pricing.ramPrice || 0.5) * ram;
  const storagePrice = (config.pricing.storagePrice || 0.1) * storage;

  return basePrice + cpuPrice + ramPrice + storagePrice;
};

const calculateBackupPrice = (size) => {
  const storagePrice = (config.pricing.backupStoragePrice || 0.05) * size;
  return storagePrice;
};

const calculateUpgradePrice = (currentConfig, newConfig) => {
  const currentPrice = calculateVMPrice(currentConfig);
  const newPrice = calculateVMPrice(newConfig);
  return newPrice - currentPrice;
};

function calculateServerPrice({ plan, region, backups, monitoring }) {
  const basePrice = config.pricing.cloud.plans[plan] || 0;
  const regionMultiplier = config.pricing.cloud.regions[region] || 1;

  let totalPrice = basePrice * regionMultiplier;

  if (backups) {
    totalPrice += config.pricing.cloud.backups;
  }

  if (monitoring) {
    totalPrice += config.pricing.cloud.monitoring;
  }

  return parseFloat(totalPrice.toFixed(2));
}

function calculateBackupPrice(size) {
  return parseFloat((size * config.pricing.cloud.backupStorage).toFixed(2));
}

function calculateUpgradePrice(currentConfig, newConfig) {
  const currentPrice = calculateServerPrice(currentConfig);
  const newPrice = calculateServerPrice(newConfig);

  return parseFloat((newPrice - currentPrice).toFixed(2));
}

module.exports = {
  calculateVMPrice,
  calculateBackupPrice: calculateVMBackupPrice,
  calculateUpgradePrice: calculateVMUpgradePrice,
  calculateServerPrice,
  calculateCloudBackupPrice: calculateBackupPrice,
  calculateServerUpgradePrice: calculateUpgradePrice
}; 