import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// UUID-like pattern: 8-4-4-4-12 hex characters
// More lenient than strict RFC 4122 to allow test UUIDs
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface Context {
  db: typeof db;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    orgId: string | null;
    teamId: string | null;
  } | null;
}

export async function createContext(opts: { headers: Headers }): Promise<Context> {
  // For now, we'll use a simple header-based auth
  // Later replace with NextAuth session
  const userId = opts.headers.get('x-user-id');

  let user = null;
  if (userId) {
    // Validate UUID format before querying database
    if (!UUID_PATTERN.test(userId)) {
      // Invalid UUID format - return null user (will trigger UNAUTHORIZED)
      return { db, user: null };
    }

    try {
      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });
      if (dbUser) {
        user = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          orgId: dbUser.orgId,
          teamId: dbUser.teamId,
        };
      }
    } catch (error) {
      // Log error internally but don't expose details
      console.error('Database error during user lookup:', error);
      return { db, user: null };
    }
  }

  return { db, user };
}

export type CreateContext = typeof createContext;
