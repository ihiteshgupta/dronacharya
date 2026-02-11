/**
 * Redis client singleton for rate limiting and caching
 */

import Redis from 'ioredis';

let redis: Redis | null = null;

export function getRedisClient(): Redis | null {
  // Return null if Redis URL not configured (graceful degradation)
  if (!process.env.REDIS_URL) {
    console.warn('REDIS_URL not configured - Redis features disabled');
    return null;
  }

  // Return existing client if already initialized
  if (redis) {
    return redis;
  }

  try {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError(err) {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          // Reconnect on READONLY errors (replica promoted to master)
          return true;
        }
        return false;
      },
      lazyConnect: true, // Don't connect immediately
    });

    // Handle connection events
    redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    redis.on('connect', () => {
      console.log('Redis connected successfully');
    });

    redis.on('ready', () => {
      console.log('Redis ready to accept commands');
    });

    redis.on('close', () => {
      console.warn('Redis connection closed');
    });

    redis.on('reconnecting', () => {
      console.log('Redis reconnecting...');
    });

    // Connect to Redis
    redis.connect().catch((err) => {
      console.error('Failed to connect to Redis:', err);
      redis = null;
    });

    return redis;
  } catch (error) {
    console.error('Failed to initialize Redis client:', error);
    redis = null;
    return null;
  }
}

/**
 * Check if Redis is available and connected
 */
export async function isRedisAvailable(): Promise<boolean> {
  const client = getRedisClient();
  if (!client) {
    return false;
  }

  try {
    await client.ping();
    return true;
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}

/**
 * Close Redis connection (for graceful shutdown)
 */
export async function closeRedisConnection(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
