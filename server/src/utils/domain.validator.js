/**
 * Validates a domain name format
 * @param {string} domain - The domain name to validate
 * @returns {boolean} - Whether the domain name is valid
 */
const validateDomain = (domain) => {
  // Basic domain name validation regex
  const domainRegex =
    /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
};

/**
 * Validates a DNS record
 * @param {Object} record - The DNS record to validate
 * @returns {Object} - Validation result with isValid and errors
 */
const validateDNSRecord = (record) => {
  const errors = [];

  // Validate record type
  if (!["A", "AAAA", "CNAME", "MX", "TXT"].includes(record.type)) {
    errors.push("Invalid record type");
  }

  // Validate name
  if (!record.name || typeof record.name !== "string") {
    errors.push("Name is required and must be a string");
  }

  // Validate value
  if (!record.value || typeof record.value !== "string") {
    errors.push("Value is required and must be a string");
  }

  // Validate TTL
  if (record.ttl && (typeof record.ttl !== "number" || record.ttl < 60)) {
    errors.push("TTL must be a number and at least 60 seconds");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates a domain transfer request
 * @param {Object} transfer - The transfer request to validate
 * @returns {Object} - Validation result with isValid and errors
 */
const validateTransfer = (transfer) => {
  const errors = [];

  // Validate domain name
  if (!validateDomain(transfer.name)) {
    errors.push("Invalid domain name format");
  }

  // Validate authorization code
  if (!transfer.authCode || typeof transfer.authCode !== "string") {
    errors.push("Authorization code is required and must be a string");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateDomain,
  validateDNSRecord,
  validateTransfer,
};
