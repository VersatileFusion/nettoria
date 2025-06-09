const { ApiError } = require('./error.middleware');
const logger = require('../utils/logger');

// Service middleware
const serviceMiddleware = {
    // Validate service configuration
    validateServiceConfig: async (req, res, next) => {
        try {
            const { type, plan, os, cpu, ram, storage } = req.body;

            // Validate service type
            if (!type || !['vm', 'hosting', 'domain'].includes(type)) {
                throw new ApiError('نوع سرویس نامعتبر است', 400);
            }

            // Validate plan
            if (!plan) {
                throw new ApiError('پلن سرویس الزامی است', 400);
            }

            // Validate VM-specific parameters
            if (type === 'vm') {
                if (!os) {
                    throw new ApiError('سیستم عامل الزامی است', 400);
                }
                if (!cpu || cpu < 1) {
                    throw new ApiError('تعداد CPU نامعتبر است', 400);
                }
                if (!ram || ram < 1) {
                    throw new ApiError('مقدار RAM نامعتبر است', 400);
                }
                if (!storage || storage < 1) {
                    throw new ApiError('مقدار فضای ذخیره‌سازی نامعتبر است', 400);
                }
            }

            next();
        } catch (error) {
            next(error);
        }
    },

    // Check service availability
    checkServiceAvailability: async (req, res, next) => {
        try {
            const { type, plan, os, cpu, ram, storage } = req.body;

            // Check resource availability
            const available = await checkResourceAvailability(type, plan, os, cpu, ram, storage);
            if (!available) {
                throw new ApiError('منابع درخواستی در حال حاضر در دسترس نیستند', 400);
            }

            next();
        } catch (error) {
            next(error);
        }
    },

    // Calculate service price
    calculateServicePrice: async (req, res, next) => {
        try {
            const { type, plan, os, cpu, ram, storage, period } = req.body;

            // Calculate base price
            const basePrice = await calculateBasePrice(type, plan, os, cpu, ram, storage);

            // Apply period discount
            const finalPrice = applyPeriodDiscount(basePrice, period);

            // Store price in request
            req.servicePrice = {
                basePrice,
                finalPrice,
                period
            };

            next();
        } catch (error) {
            next(error);
        }
    },

    // Provision service
    provisionService: async (req, res, next) => {
        try {
            const { type, plan, os, cpu, ram, storage } = req.body;
            const { userId } = req.user;

            // Create service record
            const service = await req.app.locals.db.Service.create({
                userId,
                type,
                plan,
                os,
                cpu,
                ram,
                storage,
                status: 'provisioning'
            });

            // Store service in request
            req.service = service;

            // Start provisioning process
            startProvisioning(service)
                .catch(error => {
                    logger.error('Service provisioning failed:', error);
                    service.status = 'failed';
                    service.error = error.message;
                    service.save();
                });

            next();
        } catch (error) {
            next(error);
        }
    }
};

// Check resource availability
const checkResourceAvailability = async (type, plan, os, cpu, ram, storage) => {
    try {
        // Implement resource availability check
        // This is a placeholder for the actual implementation
        return true;
    } catch (error) {
        logger.error('Resource availability check failed:', error);
        throw new ApiError('خطا در بررسی منابع', 500);
    }
};

// Calculate base price
const calculateBasePrice = async (type, plan, os, cpu, ram, storage) => {
    try {
        // Implement price calculation
        // This is a placeholder for the actual implementation
        let basePrice = 0;

        // Add plan cost
        switch (plan) {
            case 'basic':
                basePrice += 100000;
                break;
            case 'standard':
                basePrice += 200000;
                break;
            case 'premium':
                basePrice += 300000;
                break;
        }

        // Add resource costs for VM
        if (type === 'vm') {
            basePrice += cpu * 50000;
            basePrice += ram * 30000;
            basePrice += storage * 10000;
        }

        return basePrice;
    } catch (error) {
        logger.error('Price calculation failed:', error);
        throw new ApiError('خطا در محاسبه قیمت', 500);
    }
};

// Apply period discount
const applyPeriodDiscount = (basePrice, period) => {
    try {
        // Implement period discount calculation
        // This is a placeholder for the actual implementation
        let discount = 0;

        switch (period) {
            case 'monthly':
                discount = 0;
                break;
            case 'quarterly':
                discount = 0.05;
                break;
            case 'yearly':
                discount = 0.15;
                break;
        }

        return basePrice * (1 - discount);
    } catch (error) {
        logger.error('Discount calculation failed:', error);
        throw new ApiError('خطا در محاسبه تخفیف', 500);
    }
};

// Start service provisioning
const startProvisioning = async (service) => {
    try {
        // Implement service provisioning
        // This is a placeholder for the actual implementation
        logger.info('Starting service provisioning:', service._id);

        // Simulate provisioning delay
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Update service status
        service.status = 'active';
        await service.save();

        logger.info('Service provisioning completed:', service._id);
    } catch (error) {
        logger.error('Service provisioning failed:', error);
        throw error;
    }
};

module.exports = {
    serviceMiddleware
}; 