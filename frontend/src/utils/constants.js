/**
 * Common constants for the application
 */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export const USER_ROLES = {
  ADMIN: 'admin',
  SUB_ADMIN: 'subadmin',
  USER: 'user',
};

export const ASSET_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
  DISPOSED: 'disposed',
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
};

export const API_TIMEOUT = 30000; // 30 seconds

export const STORAGE_KEYS = {
  USER: 'ims_user',
  CREDENTIALS: 'ims_creds',
  THEME: 'ims_theme',
  PREFERENCES: 'ims_preferences',
};
