/**
 * Environment configuration
 */

const config = {
  development: {
    dbHost: process.env.DB_HOST || 'localhost',
    dbPort: process.env.DB_PORT || 3306,
    dbName: process.env.DB_NAME || 'project_ims',
    dbUser: process.env.DB_USER || 'root',
    dbPassword: process.env.DB_PASSWORD || '',
    nodeEnv: 'development',
    port: process.env.PORT || 5000,
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    apiUrl: process.env.API_URL || 'http://localhost:5000',
  },
  production: {
    dbHost: process.env.DB_HOST,
    dbPort: process.env.DB_PORT || 3306,
    dbName: process.env.DB_NAME,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    nodeEnv: 'production',
    port: process.env.PORT || 5000,
    jwtSecret: process.env.JWT_SECRET,
    apiUrl: process.env.API_URL,
  },
  test: {
    dbHost: 'localhost',
    dbPort: 3306,
    dbName: 'project_ims_test',
    dbUser: 'root',
    dbPassword: '',
    nodeEnv: 'test',
    port: 5001,
    jwtSecret: 'test-secret',
    apiUrl: 'http://localhost:5001',
  },
};

const env = process.env.NODE_ENV || 'development';
module.exports = config[env];