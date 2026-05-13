/**
 * Backend validation utilities
 */

const validators = {
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  password: (password, minLength = 6) => {
    return password && password.length >= minLength;
  },

  // ✅ FINAL FIX: Nepal-aware + junk-tolerant phone validation
  phone: (phone) => {
    if (!phone) return true;

    const cleaned = String(phone).replace(/\D/g, "");

    let normalized = cleaned;
    if (cleaned.startsWith("977")) {
      normalized = cleaned.slice(3);
    }

    const mobileRegex = /^9[6-8]\d{8}$/;
    const landlineRegex = /^(1\d{7}|[2-9]\d{7})$/;

    return mobileRegex.test(normalized) || landlineRegex.test(normalized);
  },

  required: (value) => {
    return value && (typeof value !== 'string' || value.trim() !== '');
  },

  isNumeric: (value) => {
    return !isNaN(value) && !isNaN(parseFloat(value));
  },

  isUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
};

const validate = {
  registerInput: (name, email, password) => {
    const errors = {};

    if (!validators.required(name)) errors.name = 'Name is required';
    if (!validators.required(email)) errors.email = 'Email is required';
    else if (!validators.email(email)) errors.email = 'Invalid email format';

    if (!validators.required(password)) errors.password = 'Password is required';
    else if (!validators.password(password)) errors.password = 'Password must be at least 6 characters';

    return { isValid: Object.keys(errors).length === 0, errors };
  },

  loginInput: (email, password) => {
    const errors = {};

    if (!validators.required(email)) errors.email = 'Email is required';
    if (!validators.required(password)) errors.password = 'Password is required';

    return { isValid: Object.keys(errors).length === 0, errors };
  },

  branchInput: (name, manager_name = '', address = '', contact = '') => {
    const errors = {};

    if (!validators.required(name)) errors.name = 'Branch name is required';
    if (manager_name && manager_name.length > 100) errors.manager_name = 'Manager name is too long';
    if (address && address.length > 255) errors.address = 'Address is too long';
    if (contact && !validators.phone(contact)) errors.contact = 'Invalid phone number';

    return { isValid: Object.keys(errors).length === 0, errors };
  },
};

module.exports = { validators, validate };
