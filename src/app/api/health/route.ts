import { NextResponse } from 'next/server';
import { isRedisAvailable } from '@/lib/redis/client';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const startTime = Date.now();

export async function GET() {
  const uptimeMs = Date.now() - startTime;
  const uptimeSeconds = Math.floor(uptimeMs / 1000);

  // Check dependencies
  const checks: Record<string, string> = {
    app: 'ok',
  };

  let overallStatus = 'healthy';

  // Check Redis connectivity
  try {
    const redisOk = await isRedisAvailable();
    checks.redis = redisOk ? 'ok' : 'unavailable';
    if (!redisOk && process.env.REDIS_URL) {
      // Redis configured but not available
      overallStatus = 'degraded';
    }
  } catch (error) {
    checks.redis = 'error';
    overallStatus = 'degraded';
  }

  // Check Database connectivity
  try {
    // Simple query to verify database connection
    await db.execute(sql`SELECT 1 as health_check`);
    checks.database = 'ok';
  } catch (error) {
    checks.database = 'error';
    overallStatus = 'unhealthy';
    console.error('Database health check failed:', error);
  }

  const health = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: uptimeSeconds,
    checks,
  };

  // Return 503 if unhealthy (for K8s readiness probe)
  const statusCode = overallStatus === 'unhealthy' ? 503 : 200;

  return NextResponse.json(health, { status: statusCode });
}
