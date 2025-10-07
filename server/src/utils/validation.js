const validator = require("validator");
const bcrypt = require("bcryptjs");

/**
 * Validation utility functions
 */
class ValidationService {
  constructor() {
    this.passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    this.phoneRegex = /^09[0-9]{9}$/;
    this.persianNameRegex = /^[\u0600-\u06FF\s]+$/;
  }

  /**
   * Validate email address
   * @param {string} email - Email to validate
   * @returns {boolean} - True if valid
   */
  validateEmail(email) {
    return validator.isEmail(email);
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} - Validation result
   */
  validatePassword(password) {
    const result = {
      isValid: false,
      errors: [],
    };

    if (!password) {
      result.errors.push("Password is required");
      return result;
    }

    if (password.length < 8) {
      result.errors.push("Password must be at least 8 characters long");
    }

    if (!/[a-z]/.test(password)) {
      result.errors.push("Password must contain at least one lowercase letter");
    }

    if (!/[A-Z]/.test(password)) {
      result.errors.push("Password must contain at least one uppercase letter");
    }

    if (!/\d/.test(password)) {
      result.errors.push("Password must contain at least one number");
    }

    if (!/[@$!%*?&]/.test(password)) {
      result.errors.push(
        "Password must contain at least one special character (@$!%*?&)"
      );
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * Validate Iranian phone number
   * @param {string} phone - Phone number to validate
   * @returns {boolean} - True if valid
   */
  validatePhoneNumber(phone) {
    if (!phone) return false;
    return this.phoneRegex.test(phone);
  }

  /**
   * Validate Persian name
   * @param {string} name - Name to validate
   * @returns {boolean} - True if valid
   */
  validatePersianName(name) {
    if (!name) return false;
    return this.persianNameRegex.test(name.trim());
  }

  /**
   * Validate URL
   * @param {string} url - URL to validate
   * @returns {boolean} - True if valid
   */
  validateUrl(url) {
    return validator.isURL(url);
  }

  /**
   * Validate UUID
   * @param {string} uuid - UUID to validate
   * @returns {boolean} - True if valid
   */
  validateUUID(uuid) {
    return validator.isUUID(uuid);
  }

  /**
   * Validate domain name
   * @param {string} domain - Domain to validate
   * @returns {boolean} - True if valid
   */
  validateDomain(domain) {
    const domainRegex =
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
    return domainRegex.test(domain);
  }

  /**
   * Validate IP address
   * @param {string} ip - IP address to validate
   * @returns {boolean} - True if valid
   */
  validateIPAddress(ip) {
    return validator.isIP(ip);
  }

  /**
   * Validate date string
   * @param {string} date - Date string to validate
   * @returns {boolean} - True if valid
   */
  validateDate(date) {
    return validator.isISO8601(date);
  }

  /**
   * Validate numeric string
   * @param {string} str - String to validate
   * @returns {boolean} - True if valid
   */
  validateNumeric(str) {
    return validator.isNumeric(str);
  }

  /**
   * Validate alphanumeric string
   * @param {string} str - String to validate
   * @returns {boolean} - True if valid
   */
  validateAlphanumeric(str) {
    return validator.isAlphanumeric(str);
  }

  /**
   * Validate string length
   * @param {string} str - String to validate
   * @param {number} min - Minimum length
   * @param {number} max - Maximum length
   * @returns {boolean} - True if valid
   */
  validateLength(str, min, max) {
    if (!str) return false;
    return str.length >= min && str.length <= max;
  }

  /**
   * Sanitize string
   * @param {string} str - String to sanitize
   * @returns {string} - Sanitized string
   */
  sanitizeString(str) {
    if (!str) return "";
    return validator.escape(str.trim());
  }

  /**
   * Normalize phone number
   * @param {string} phone - Phone number to normalize
   * @returns {string} - Normalized phone number
   */
  normalizePhoneNumber(phone) {
    if (!phone) return "";

    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, "");

    // Handle different formats
    if (cleaned.startsWith("98")) {
      return "0" + cleaned.substring(2);
    } else if (cleaned.startsWith("0098")) {
      return "0" + cleaned.substring(4);
    } else if (!cleaned.startsWith("0")) {
      return "0" + cleaned;
    }

    return cleaned;
  }

  /**
   * Normalize email
   * @param {string} email - Email to normalize
   * @returns {string} - Normalized email
   */
  normalizeEmail(email) {
    if (!email) return "";
    return validator.normalizeEmail(email);
  }

  /**
   * Compare password with hash
   * @param {string} password - Plain password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>} - True if match
   */
  async comparePassword(password, hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error("Password comparison failed");
    }
  }

  /**
   * Hash password
   * @param {string} password - Plain password
   * @returns {Promise<string>} - Hashed password
   */
  async hashPassword(password) {
    try {
      const saltRounds = 12;
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      throw new Error("Password hashing failed");
    }
  }
}

// Create singleton instance
const validationService = new ValidationService();

// Export individual functions for backward compatibility
module.exports = {
  validateEmail: (email) => validationService.validateEmail(email),
  validatePassword: (password) => validationService.validatePassword(password),
  validatePhoneNumber: (phone) => validationService.validatePhoneNumber(phone),
  validatePersianName: (name) => validationService.validatePersianName(name),
  validateUrl: (url) => validationService.validateUrl(url),
  validateUUID: (uuid) => validationService.validateUUID(uuid),
  validateDomain: (domain) => validationService.validateDomain(domain),
  validateIPAddress: (ip) => validationService.validateIPAddress(ip),
  validateDate: (date) => validationService.validateDate(date),
  validateNumeric: (str) => validationService.validateNumeric(str),
  validateAlphanumeric: (str) => validationService.validateAlphanumeric(str),
  validateLength: (str, min, max) =>
    validationService.validateLength(str, min, max),
  sanitizeString: (str) => validationService.sanitizeString(str),
  normalizePhoneNumber: (phone) =>
    validationService.normalizePhoneNumber(phone),
  normalizeEmail: (email) => validationService.normalizeEmail(email),
  comparePassword: (password, hash) =>
    validationService.comparePassword(password, hash),
  hashPassword: (password) => validationService.hashPassword(password),
  ValidationService,
};
