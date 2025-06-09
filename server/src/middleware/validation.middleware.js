const Joi = require('joi');
const { ApiError } = require('./error.middleware');

// Validation middleware
const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        const message = error.details.map(detail => detail.message).join('. ');
        return next(new ApiError(message, 400));
    }

    next();
};

// Common validation schemas
const schemas = {
    // User schemas
    register: Joi.object({
        firstName: Joi.string().required().min(2).max(50),
        lastName: Joi.string().required().min(2).max(50),
        email: Joi.string().required().email(),
        phone: Joi.string().required().pattern(/^09[0-9]{9}$/),
        password: Joi.string().required().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
        confirmPassword: Joi.string().required().valid(Joi.ref('password'))
    }),

    login: Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().required()
    }),

    updateProfile: Joi.object({
        firstName: Joi.string().min(2).max(50),
        lastName: Joi.string().min(2).max(50),
        phone: Joi.string().pattern(/^09[0-9]{9}$/),
        company: Joi.string().max(100),
        address: Joi.string().max(200)
    }),

    changePassword: Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().required().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
        confirmPassword: Joi.string().required().valid(Joi.ref('newPassword'))
    }),

    // Service schemas
    createService: Joi.object({
        name: Joi.string().required().min(3).max(50),
        type: Joi.string().required().valid('vm', 'hosting', 'domain'),
        plan: Joi.string().required(),
        os: Joi.string().when('type', {
            is: 'vm',
            then: Joi.required(),
            otherwise: Joi.forbidden()
        }),
        cpu: Joi.number().when('type', {
            is: 'vm',
            then: Joi.required().min(1),
            otherwise: Joi.forbidden()
        }),
        ram: Joi.number().when('type', {
            is: 'vm',
            then: Joi.required().min(1),
            otherwise: Joi.forbidden()
        }),
        storage: Joi.number().when('type', {
            is: 'vm',
            then: Joi.required().min(1),
            otherwise: Joi.forbidden()
        })
    }),

    // Payment schemas
    createPayment: Joi.object({
        orderId: Joi.string().required(),
        method: Joi.string().required().valid('online', 'wallet', 'bank'),
        amount: Joi.number().required().min(0)
    }),

    // Support schemas
    createTicket: Joi.object({
        subject: Joi.string().required().min(5).max(100),
        message: Joi.string().required().min(10).max(1000),
        priority: Joi.string().required().valid('low', 'medium', 'high'),
        department: Joi.string().required().valid('technical', 'billing', 'sales')
    })
};

module.exports = {
    validate,
    schemas
}; 