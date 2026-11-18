import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    env: {
      NODE_ENV: 'test',
      MONGODB_URI: 'mongodb://127.0.0.1:27017/shopsphere-test',
      JWT_SECRET: 'test-secret-that-is-long-enough',
      PAYMENT_MODE: 'mock',
    },
  },
});
