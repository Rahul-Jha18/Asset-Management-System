/**
 * Form validation utilities
 */

export const validators = {
  email: (value) => {
    if (!value) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Invalid email format';
    return null;
  },

  password: (value, minLength = 6) => {
    if (!value) return 'Password is required';
    if (value.length < minLength) return `Password must be at least ${minLength} characters`;
    return null;
  },

  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(value)) return 'Invalid phone number';
    return null;
  },

  required: (value, fieldName = 'This field') => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} is required`;
    }
    return null;
  },

  minLength: (value, length) => {
    if (!value) return null;
    if (value.length < length) return `Must be at least ${length} characters`;
    return null;
  },

  maxLength: (value, length) => {
    if (!value) return null;
    if (value.length > length) return `Must be at most ${length} characters`;
    return null;
  },

  number: (value) => {
    if (!value) return null;
    if (isNaN(value)) return 'Must be a number';
    return null;
  },

  url: (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Invalid URL';
    }
  },
};

/**
 * Compose multiple validators
 */
export const composeValidators = (...validators) => (value) => {
  for (let validator of validators) {
    const error = validator(value);
    if (error) return error;
  }
  return null;
};
