import { beforeAll, afterAll } from 'vitest';

// Setup test database connection
beforeAll(async () => {
  console.log('Setting up integration test environment...');
});

afterAll(async () => {
  console.log('Cleaning up integration test environment...');
});
