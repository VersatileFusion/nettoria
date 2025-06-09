/**
 * Validates a password based on security requirements
 * @param {string} password - The password to validate
 * @returns {string|null} Error message if validation fails, null if validation passes
 */
exports.validatePassword = (password) => {
    if (!password) {
        return 'رمز عبور الزامی است';
    }

    if (password.length < 8) {
        return 'رمز عبور باید حداقل ۸ کاراکتر باشد';
    }

    if (!/[A-Z]/.test(password)) {
        return 'رمز عبور باید حداقل یک حرف بزرگ داشته باشد';
    }

    if (!/[a-z]/.test(password)) {
        return 'رمز عبور باید حداقل یک حرف کوچک داشته باشد';
    }

    if (!/[0-9]/.test(password)) {
        return 'رمز عبور باید حداقل یک عدد داشته باشد';
    }

    if (!/[!@#$%^&*]/.test(password)) {
        return 'رمز عبور باید حداقل یک کاراکتر خاص (!@#$%^&*) داشته باشد';
    }

    return null;
};

/**
 * Validates an email address
 * @param {string} email - The email to validate
 * @returns {boolean} True if email is valid, false otherwise
 */
exports.validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validates a phone number (Iranian format)
 * @param {string} phone - The phone number to validate
 * @returns {boolean} True if phone number is valid, false otherwise
 */
exports.validatePhone = (phone) => {
    const phoneRegex = /^09[0-9]{9}$/;
    return phoneRegex.test(phone);
};

/**
 * Validates a national ID (Iranian format)
 * @param {string} nationalId - The national ID to validate
 * @returns {boolean} True if national ID is valid, false otherwise
 */
exports.validateNationalId = (nationalId) => {
    if (!nationalId || nationalId.length !== 10) {
        return false;
    }

    const digits = nationalId.split('').map(Number);
    const lastDigit = digits[9];
    const sum = digits.slice(0, 9).reduce((acc, digit, index) => {
        return acc + digit * (10 - index);
    }, 0);

    const remainder = sum % 11;
    const checkDigit = remainder < 2 ? remainder : 11 - remainder;

    return checkDigit === lastDigit;
};

/**
 * Validates a postal code (Iranian format)
 * @param {string} postalCode - The postal code to validate
 * @returns {boolean} True if postal code is valid, false otherwise
 */
exports.validatePostalCode = (postalCode) => {
    const postalCodeRegex = /^\d{10}$/;
    return postalCodeRegex.test(postalCode);
};

/**
 * Validates a URL
 * @param {string} url - The URL to validate
 * @returns {boolean} True if URL is valid, false otherwise
 */
exports.validateUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Validates a date string
 * @param {string} date - The date string to validate
 * @returns {boolean} True if date is valid, false otherwise
 */
exports.validateDate = (date) => {
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj);
};

/**
 * Validates a credit card number
 * @param {string} cardNumber - The credit card number to validate
 * @returns {boolean} True if credit card number is valid, false otherwise
 */
exports.validateCreditCard = (cardNumber) => {
    // Remove spaces and dashes
    const cleanNumber = cardNumber.replace(/[\s-]/g, '');

    // Check if the number is 16 digits
    if (!/^\d{16}$/.test(cleanNumber)) {
        return false;
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;

    // Loop through values starting from the rightmost digit
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanNumber.charAt(i));

        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        isEven = !isEven;
    }

    return sum % 10 === 0;
};

/**
 * Validates a sheba number (Iranian bank account)
 * @param {string} sheba - The sheba number to validate
 * @returns {boolean} True if sheba number is valid, false otherwise
 */
exports.validateSheba = (sheba) => {
    // Remove spaces and convert to uppercase
    const cleanSheba = sheba.replace(/\s/g, '').toUpperCase();

    // Check if the number starts with IR and is 26 characters long
    if (!/^IR\d{24}$/.test(cleanSheba)) {
        return false;
    }

    // Move country code to the end
    const rearranged = cleanSheba.slice(4) + cleanSheba.slice(0, 4);

    // Convert letters to numbers (A=10, B=11, etc.)
    const numeric = rearranged.split('').map(char => {
        const code = char.charCodeAt(0);
        return code >= 65 ? code - 55 : char;
    }).join('');

    // Check if the number is divisible by 97
    const remainder = BigInt(numeric) % BigInt(97);
    return remainder === BigInt(1);
}; 