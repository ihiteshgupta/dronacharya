/**
 * Redis-based rate limiter for auth endpoints with in-memory fallback
 *
 * Uses Redis for distributed rate limiting across multiple instances.
 * Falls back to in-memory Map if Redis is unavailable.
 */

import { getRedisClient } from '../redis/client';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitOptions {
  maxAttempts?: number;
  windowMs?: number;
}

// Fallback in-memory store when Redis unavailable
const rateLimitStore = new Map<string, RateLimitEntry>();

// Defaults: 5 attempts per 15 minutes (login protection)
const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX_ATTEMPTS = 5;
const REDIS_KEY_PREFIX = 'ratelimit:';

/**
 * Check rate limit for an identifier (IP, user ID, etc.)
 * Supports configurable limits per endpoint.
 */
export async function checkRateLimit(
  identifier: string,
  options?: RateLimitOptions,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const maxAttempts = options?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const windowMs = options?.windowMs ?? DEFAULT_WINDOW_MS;
  const redis = getRedisClient();

  if (redis) {
    return checkRateLimitRedis(identifier, redis, maxAttempts, windowMs);
  }

  // Fallback to in-memory rate limiting
  console.warn('Using in-memory rate limiting - not recommended for production');
  return checkRateLimitMemory(identifier, maxAttempts, windowMs);
}

/**
 * Redis-based rate limiting (production)
 */
async function checkRateLimitRedis(
  identifier: string,
  redis: NonNullable<ReturnType<typeof getRedisClient>>,
  maxAttempts: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = `${REDIS_KEY_PREFIX}${identifier}`;
  const now = Date.now();
  const windowSeconds = Math.floor(windowMs / 1000);

  try {
    // Use Redis INCR for atomic increment
    const count = await redis.incr(key);

    if (count === 1) {
      // First request in window - set TTL
      await redis.expire(key, windowSeconds);
    }

    // Get TTL to calculate resetAt
    const ttl = await redis.ttl(key);
    const resetAt = ttl > 0 ? now + ttl * 1000 : now + windowMs;

    if (count > maxAttempts) {
      return { allowed: false, remaining: 0, resetAt };
    }

    return {
      allowed: true,
      remaining: Math.max(0, maxAttempts - count),
      resetAt,
    };
  } catch (error) {
    console.error('Redis rate limit check failed, falling back to memory:', error);
    // Fall back to in-memory on Redis errors
    return checkRateLimitMemory(identifier, maxAttempts, windowMs);
  }
}

/**
 * In-memory rate limiting (fallback only)
 */
function checkRateLimitMemory(
  identifier: string,
  maxAttempts: number,
  windowMs: number,
): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    cleanupExpired();
  }

  if (!entry || now > entry.resetAt) {
    // New window
    const resetAt = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: maxAttempts - 1, resetAt };
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: maxAttempts - entry.count, resetAt: entry.resetAt };
}

/**
 * Reset rate limit for an identifier (e.g., after successful auth)
 */
export async function resetRateLimit(identifier: string): Promise<void> {
  const redis = getRedisClient();

  if (redis) {
    const key = `${REDIS_KEY_PREFIX}${identifier}`;
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Failed to reset rate limit in Redis:', error);
    }
  }

  // Also clear from memory fallback
  rateLimitStore.delete(identifier);
}

/**
 * Clean up expired entries from in-memory store
 */
function cleanupExpired(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}
