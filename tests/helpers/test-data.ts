/**
 * Test data for authentication tests
 * You can modify these values or load them from environment variables
 */

export const TEST_USERS = {
  valid: {
    username: process.env.TEST_USERNAME || 'test-user',
    password: process.env.TEST_PASSWORD || 'test-password',
  },
  invalid: {
    username: 'invalid-user',
    password: 'invalid-password',
  },
  admin: {
    username: process.env.TEST_ADMIN_USERNAME || 'admin-user',
    password: process.env.TEST_ADMIN_PASSWORD || 'admin-password',
  },
};

export const TEST_URLS = {
  login: '/auth/login',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  dashboard: '/', // Update with your actual dashboard route
};

export const TIMEOUTS = {
  short: 2000,
  medium: 5000,
  long: 10000,
};
