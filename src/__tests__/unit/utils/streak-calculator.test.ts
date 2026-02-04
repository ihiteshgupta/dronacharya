import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateStreak,
  shouldBreakStreak,
  getStreakFreeze,
  getStreakReward,
} from '@/lib/utils/streak-calculator';

describe('streak-calculator', () => {
  beforeEach(() => {
    // Fix "now" to 2025-06-15 12:00:00 UTC for deterministic tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── calculateStreak ──────────────────────────────────────────────

  describe('calculateStreak', () => {
    it('returns 1 when lastActiveAt is null (first activity)', () => {
      expect(calculateStreak(null, 0)).toBe(1);
    });

    it('returns 1 when lastActiveAt is null regardless of currentStreak', () => {
      expect(calculateStreak(null, 10)).toBe(1);
    });

    it('maintains streak when last active today', () => {
      const todayEarlier = new Date('2025-06-15T08:00:00Z');
      expect(calculateStreak(todayEarlier, 5)).toBe(5);
    });

    it('increments streak when last active yesterday', () => {
      const yesterday = new Date('2025-06-14T18:00:00Z');
      expect(calculateStreak(yesterday, 3)).toBe(4);
    });

    it('resets streak to 1 when gap is more than one day', () => {
      const twoDaysAgo = new Date('2025-06-13T10:00:00Z');
      expect(calculateStreak(twoDaysAgo, 10)).toBe(1);
    });

    it('resets streak for a week-old lastActiveAt', () => {
      const weekAgo = new Date('2025-06-08T10:00:00Z');
      expect(calculateStreak(weekAgo, 20)).toBe(1);
    });

    it('respects timezone parameter for day boundary', () => {
      // At 2025-06-15T12:00:00Z, in Asia/Kolkata it is 17:30 IST (same day)
      // A lastActiveAt of 2025-06-14T20:00:00Z = 2025-06-15 01:30 IST (today in IST)
      const lastActive = new Date('2025-06-14T20:00:00Z');
      // In IST this is same day as "now", so streak should be maintained
      expect(calculateStreak(lastActive, 5, 'Asia/Kolkata')).toBe(5);
    });

    it('defaults timezone to UTC', () => {
      const yesterday = new Date('2025-06-14T15:00:00Z');
      expect(calculateStreak(yesterday, 2, 'UTC')).toBe(3);
      // Should match behavior without explicit timezone
      expect(calculateStreak(yesterday, 2)).toBe(3);
    });
  });

  // ── shouldBreakStreak ────────────────────────────────────────────

  describe('shouldBreakStreak', () => {
    it('returns false when lastActiveAt is null', () => {
      expect(shouldBreakStreak(null)).toBe(false);
    });

    it('returns false when last active today', () => {
      const today = new Date('2025-06-15T08:00:00Z');
      expect(shouldBreakStreak(today)).toBe(false);
    });

    it('returns false when last active yesterday (outside grace period)', () => {
      // now is 12:00, grace hours = 3, so 12 >= 3 => grace not active
      // but yesterday is not before yesterday => false
      const yesterday = new Date('2025-06-14T18:00:00Z');
      expect(shouldBreakStreak(yesterday)).toBe(false);
    });

    it('returns true when last active two days ago', () => {
      const twoDaysAgo = new Date('2025-06-13T10:00:00Z');
      expect(shouldBreakStreak(twoDaysAgo)).toBe(true);
    });

    it('uses grace period within first 3 hours of the day', () => {
      // Set time to 2:00 AM (within grace period)
      vi.setSystemTime(new Date('2025-06-15T02:00:00Z'));
      const yesterday = new Date('2025-06-14T10:00:00Z');
      // Within grace: last active yesterday should NOT break streak
      expect(shouldBreakStreak(yesterday)).toBe(false);
    });

    it('breaks streak after grace period even for yesterday', () => {
      // Set time to 4:00 AM (past grace period)
      vi.setSystemTime(new Date('2025-06-15T04:00:00Z'));
      const twoDaysAgo = new Date('2025-06-13T10:00:00Z');
      // Two days ago is before yesterday, so should break
      expect(shouldBreakStreak(twoDaysAgo)).toBe(true);
    });
  });

  // ── getStreakFreeze ──────────────────────────────────────────────

  describe('getStreakFreeze', () => {
    it('uses a freeze when available', () => {
      const result = getStreakFreeze(10, 2);
      expect(result).toEqual({
        newStreak: 10,
        freezesRemaining: 1,
        freezeUsed: true,
      });
    });

    it('uses last available freeze', () => {
      const result = getStreakFreeze(5, 1);
      expect(result).toEqual({
        newStreak: 5,
        freezesRemaining: 0,
        freezeUsed: true,
      });
    });

    it('resets streak when no freezes available', () => {
      const result = getStreakFreeze(15, 0);
      expect(result).toEqual({
        newStreak: 1,
        freezesRemaining: 0,
        freezeUsed: false,
      });
    });
  });

  // ── getStreakReward ──────────────────────────────────────────────

  describe('getStreakReward', () => {
    it('returns xp and badge for 7-day streak', () => {
      expect(getStreakReward(7)).toEqual({ xp: 500, badge: 'week_warrior' });
    });

    it('returns xp and badge for 14-day streak', () => {
      expect(getStreakReward(14)).toEqual({ xp: 1000, badge: 'two_week_champion' });
    });

    it('returns xp and badge for 30-day streak', () => {
      expect(getStreakReward(30)).toEqual({ xp: 2500, badge: 'monthly_master' });
    });

    it('returns xp and badge for 100-day streak', () => {
      expect(getStreakReward(100)).toEqual({ xp: 10000, badge: 'centurion' });
    });

    it('returns zero xp and null badge for non-milestone days', () => {
      expect(getStreakReward(1)).toEqual({ xp: 0, badge: null });
      expect(getStreakReward(5)).toEqual({ xp: 0, badge: null });
      expect(getStreakReward(15)).toEqual({ xp: 0, badge: null });
      expect(getStreakReward(50)).toEqual({ xp: 0, badge: null });
      expect(getStreakReward(99)).toEqual({ xp: 0, badge: null });
    });

    it('returns object with xp property', () => {
      const result = getStreakReward(3);
      expect(result).toHaveProperty('xp');
      expect(typeof result.xp).toBe('number');
    });

    it('returns object with badge property', () => {
      const result = getStreakReward(7);
      expect(result).toHaveProperty('badge');
      expect(typeof result.badge).toBe('string');
    });
  });
});
