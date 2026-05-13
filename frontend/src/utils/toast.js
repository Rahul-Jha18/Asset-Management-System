/**
 * Toast notification utilities
 */

export const toast = {
  success: (message) => {
    console.log('✅ Success:', message);
  },
  error: (message) => {
    console.error('❌ Error:', message);
  },
  info: (message) => {
    console.info('ℹ️ Info:', message);
  },
  warning: (message) => {
    console.warn('⚠️ Warning:', message);
  },
};

/**
 * Show toast based on API response
 */
export const showToastFromResponse = (response, defaultMessage = 'Success') => {
  const message = response?.data?.message || defaultMessage;
  toast.success(message);
};

/**
 * Show error toast from error object
 */
export const showToastFromError = (error, defaultMessage = 'An error occurred') => {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    defaultMessage;
  toast.error(message);
};
