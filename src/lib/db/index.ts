import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index';

// Define the database type with schema
export type Database = PostgresJsDatabase<typeof schema>;

// Check if DATABASE_URL is configured
const connectionString = process.env.DATABASE_URL;

// Create a mock db for development without database
const createMockDb = (): Database => ({
  query: {
    users: { findFirst: async () => null, findMany: async () => [] },
    userProfiles: { findFirst: async () => null, findMany: async () => [] },
    domains: { findFirst: async () => null, findMany: async () => [] },
    tracks: { findFirst: async () => null, findMany: async () => [] },
    courses: { findFirst: async () => null, findMany: async () => [] },
    modules: { findFirst: async () => null, findMany: async () => [] },
    lessons: { findFirst: async () => null, findMany: async () => [] },
    enrollments: { findFirst: async () => null, findMany: async () => [] },
    progress: { findFirst: async () => null, findMany: async () => [] },
    achievements: { findFirst: async () => null, findMany: async () => [] },
    userAchievements: { findFirst: async () => null, findMany: async () => [] },
    xpTransactions: { findFirst: async () => null, findMany: async () => [] },
    streakHistory: { findFirst: async () => null, findMany: async () => [] },
    certifications: { findFirst: async () => null, findMany: async () => [] },
    assessments: { findFirst: async () => null, findMany: async () => [] },
    aiSessions: { findFirst: async () => null, findMany: async () => [] },
    aiMessages: { findFirst: async () => null, findMany: async () => [] },
  },
  insert: () => ({ values: () => ({ returning: async () => [], onConflictDoUpdate: () => ({ returning: async () => [] }) }) }),
  update: () => ({ set: () => ({ where: () => ({ returning: async () => [] }) }) }),
  delete: () => ({ where: async () => {} }),
  execute: async () => [{}],
  select: () => ({ from: () => ({ orderBy: () => ({ limit: async () => [] }) }) }),
}) as unknown as Database;

let db: Database;

if (connectionString) {
  const client = postgres(connectionString, {
    max: Number(process.env.DATABASE_POOL_SIZE) || 10,
  });
  db = drizzle(client, { schema });
} else {
  console.warn('DATABASE_URL not configured - using mock database');
  db = createMockDb();
}

export { db };

// Re-export all schema types
export * from './schema/index';
