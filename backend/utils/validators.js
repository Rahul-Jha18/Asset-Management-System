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

  phone: (phone) => {
    if (!phone) return true;
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone);
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
