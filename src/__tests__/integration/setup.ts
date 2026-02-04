import { config } from 'dotenv';

// Load test environment
config({ path: '.env.test' });

// Set test defaults
(process.env as Record<string, string>).NODE_ENV = 'test';
