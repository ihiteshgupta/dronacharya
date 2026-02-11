import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { checkRateLimit, resetRateLimit } from '../rate-limit';

// Mock Redis client to prevent actual connections during tests
vi.mock('../../redis/client', () => ({
  getRedisClient: vi.fn(() => null), // Return null to use in-memory fallback
  isRedisAvailable: vi.fn(async () => false),
  closeRedisConnection: vi.fn(async () => {}),
}));

describe('rate-limit', () => {
  beforeEach(() => {
    // Reset all rate limits before each test
    vi.useFakeTimers();
    // Use a unique identifier prefix for each test to avoid cross-test pollution
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('checkRateLimit', () => {
    it('should allow first request and return remaining attempts', async () => {
      const identifier = 'test-user-1';
      await resetRateLimit(identifier);

      const result = await checkRateLimit(identifier);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4); // MAX_ATTEMPTS (5) - 1
      expect(result.resetAt).toBeGreaterThan(Date.now());
    });

    it('should decrement remaining attempts on subsequent requests', async () => {
      const identifier = 'test-user-2';
      await resetRateLimit(identifier);

      // First request
      const first = await checkRateLimit(identifier);
      expect(first.remaining).toBe(4);

      // Second request
      const second = await checkRateLimit(identifier);
      expect(second.allowed).toBe(true);
      expect(second.remaining).toBe(3);

      // Third request
      const third = await checkRateLimit(identifier);
      expect(third.allowed).toBe(true);
      expect(third.remaining).toBe(2);
    });

    it('should block requests after limit is exceeded', async () => {
      const identifier = 'test-user-3';
      await resetRateLimit(identifier);

      // Make 5 requests (MAX_ATTEMPTS)
      for (let i = 0; i < 5; i++) {
        const result = await checkRateLimit(identifier);
        expect(result.allowed).toBe(true);
      }

      // 6th request should be blocked
      const blocked = await checkRateLimit(identifier);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
    });

    it('should reset after window expires', async () => {
      const identifier = 'test-user-4';
      await resetRateLimit(identifier);

      // Use all attempts
      for (let i = 0; i < 5; i++) {
        await checkRateLimit(identifier);
      }

      // Verify blocked
      const blocked = await checkRateLimit(identifier);
      expect(blocked.allowed).toBe(false);

      // Advance time past the window (15 minutes + 1ms)
      vi.advanceTimersByTime(15 * 60 * 1000 + 1);

      // Should be allowed again
      const afterReset = await checkRateLimit(identifier);
      expect(afterReset.allowed).toBe(true);
      expect(afterReset.remaining).toBe(4);
    });

    it('should track different identifiers independently', async () => {
      const user1 = 'independent-user-1';
      const user2 = 'independent-user-2';
      await resetRateLimit(user1);
      await resetRateLimit(user2);

      // Use all attempts for user1
      for (let i = 0; i < 5; i++) {
        await checkRateLimit(user1);
      }

      // User1 should be blocked
      const user1Result = await checkRateLimit(user1);
      expect(user1Result.allowed).toBe(false);

      // User2 should still be allowed
      const user2Result = await checkRateLimit(user2);
      expect(user2Result.allowed).toBe(true);
      expect(user2Result.remaining).toBe(4);
    });

    it('should return consistent resetAt within the same window', async () => {
      const identifier = 'test-user-5';
      await resetRateLimit(identifier);

      const first = await checkRateLimit(identifier);
      const second = await checkRateLimit(identifier);

      expect(first.resetAt).toBe(second.resetAt);
    });
  });

  describe('resetRateLimit', () => {
    it('should clear rate limit for an identifier', async () => {
      const identifier = 'reset-test-user';
      await resetRateLimit(identifier);

      // Use all attempts
      for (let i = 0; i < 5; i++) {
        await checkRateLimit(identifier);
      }

      // Verify blocked
      expect((await checkRateLimit(identifier)).allowed).toBe(false);

      // Reset
      await resetRateLimit(identifier);

      // Should be allowed again
      const afterReset = await checkRateLimit(identifier);
      expect(afterReset.allowed).toBe(true);
      expect(afterReset.remaining).toBe(4);
    });

    it('should not affect other identifiers when resetting one', async () => {
      const user1 = 'reset-user-1';
      const user2 = 'reset-user-2';
      await resetRateLimit(user1);
      await resetRateLimit(user2);

      // Use some attempts for both
      await checkRateLimit(user1);
      await checkRateLimit(user1);
      await checkRateLimit(user2);
      await checkRateLimit(user2);
      await checkRateLimit(user2);

      // Reset user1
      await resetRateLimit(user1);

      // User1 should have full attempts
      expect((await checkRateLimit(user1)).remaining).toBe(4);

      // User2 should still have reduced attempts (5 - 3 - 1 = 1)
      expect((await checkRateLimit(user2)).remaining).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string identifier', async () => {
      const identifier = '';
      await resetRateLimit(identifier);

      const result = await checkRateLimit(identifier);
      expect(result.allowed).toBe(true);
    });

    it('should handle special characters in identifier', async () => {
      const identifier = 'user@example.com:192.168.1.1';
      await resetRateLimit(identifier);

      const result = await checkRateLimit(identifier);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should handle very long identifiers', async () => {
      const identifier = 'x'.repeat(1000);
      await resetRateLimit(identifier);

      const result = await checkRateLimit(identifier);
      expect(result.allowed).toBe(true);
    });

    it('should handle rapid successive calls', async () => {
      const identifier = 'rapid-test-user';
      await resetRateLimit(identifier);

      const results = await Promise.all(
        Array.from({ length: 10 }, () => checkRateLimit(identifier))
      );

      // First 5 should be allowed
      expect(results.slice(0, 5).every((r) => r.allowed)).toBe(true);

      // Last 5 should be blocked
      expect(results.slice(5).every((r) => !r.allowed)).toBe(true);
    });

    it('should return 0 remaining when blocked', async () => {
      const identifier = 'remaining-test-user';
      await resetRateLimit(identifier);

      // Exhaust all attempts
      for (let i = 0; i < 6; i++) {
        await checkRateLimit(identifier);
      }

      const blocked = await checkRateLimit(identifier);
      expect(blocked.remaining).toBe(0);
    });
  });
});
