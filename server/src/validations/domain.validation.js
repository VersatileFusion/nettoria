const Joi = require("joi");

const domainValidation = {
  checkAvailability: {
    body: Joi.object({
      domain: Joi.string()
        .pattern(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/)
        .required()
        .messages({
          "string.pattern.base": "Invalid domain name format",
          "any.required": "Domain name is required",
        }),
    }),
  },

  register: {
    body: Joi.object({
      domain: Joi.string()
        .pattern(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/)
        .required()
        .messages({
          "string.pattern.base": "Invalid domain name format",
          "any.required": "Domain name is required",
        }),
      period: Joi.number().integer().min(1).max(10).required().messages({
        "number.base": "Period must be a number",
        "number.integer": "Period must be an integer",
        "number.min": "Period must be at least 1 year",
        "number.max": "Period cannot exceed 10 years",
        "any.required": "Registration period is required",
      }),
      registrant: Joi.object({
        name: Joi.string().required().messages({
          "string.empty": "Name is required",
          "any.required": "Name is required",
        }),
        email: Joi.string().email().required().messages({
          "string.email": "Invalid email format",
          "any.required": "Email is required",
        }),
        phone: Joi.string().required().messages({
          "string.empty": "Phone number is required",
          "any.required": "Phone number is required",
        }),
        address: Joi.string().required().messages({
          "string.empty": "Address is required",
          "any.required": "Address is required",
        }),
        city: Joi.string().required().messages({
          "string.empty": "City is required",
          "any.required": "City is required",
        }),
        state: Joi.string().allow("").optional(),
        country: Joi.string().required().messages({
          "string.empty": "Country is required",
          "any.required": "Country is required",
        }),
        postalCode: Joi.string().allow("").optional(),
      })
        .required()
        .messages({
          "object.base": "Registrant information is required",
          "any.required": "Registrant information is required",
        }),
    }),
  },

  renew: {
    body: Joi.object({
      period: Joi.number().integer().min(1).max(10).required().messages({
        "number.base": "Period must be a number",
        "number.integer": "Period must be an integer",
        "number.min": "Period must be at least 1 year",
        "number.max": "Period cannot exceed 10 years",
        "any.required": "Renewal period is required",
      }),
    }),
  },

  transfer: {
    body: Joi.object({
      transferCode: Joi.string().required().messages({
        "string.empty": "Transfer code is required",
        "any.required": "Transfer code is required",
      }),
      newRegistrar: Joi.string().required().messages({
        "string.empty": "New registrar is required",
        "any.required": "New registrar is required",
      }),
    }),
  },

  addDNSRecord: {
    body: Joi.object({
      type: Joi.string()
        .valid("A", "AAAA", "CNAME", "MX", "TXT", "NS", "SRV")
        .required()
        .messages({
          "any.only": "Invalid DNS record type",
          "any.required": "DNS record type is required",
        }),
      name: Joi.string().required().messages({
        "string.empty": "Record name is required",
        "any.required": "Record name is required",
      }),
      value: Joi.string().required().messages({
        "string.empty": "Record value is required",
        "any.required": "Record value is required",
      }),
      ttl: Joi.number().integer().min(60).max(86400).default(3600).messages({
        "number.base": "TTL must be a number",
        "number.integer": "TTL must be an integer",
        "number.min": "TTL must be at least 60 seconds",
        "number.max": "TTL cannot exceed 86400 seconds",
      }),
      priority: Joi.number()
        .integer()
        .min(0)
        .max(65535)
        .when("type", {
          is: "MX",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "number.base": "Priority must be a number",
          "number.integer": "Priority must be an integer",
          "number.min": "Priority must be at least 0",
          "number.max": "Priority cannot exceed 65535",
          "any.required": "Priority is required for MX records",
        }),
    }),
  },
};

module.exports = {
  domainValidation,
};
