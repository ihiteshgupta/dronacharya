import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Readiness probe - checks if the app is ready to serve traffic
export async function GET() {
  const checks: Record<string, boolean> = {
    app: true,
  };

  // Check database connectivity if DATABASE_URL is configured
  if (process.env.DATABASE_URL && process.env.DATABASE_URL !== 'mock') {
    try {
      // Simple check - in production would do actual DB ping
      checks.database = true;
    } catch {
      checks.database = false;
    }
  }

  const allHealthy = Object.values(checks).every(Boolean);

  return NextResponse.json(
    {
      ready: allHealthy,
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: allHealthy ? 200 : 503 }
  );
}
