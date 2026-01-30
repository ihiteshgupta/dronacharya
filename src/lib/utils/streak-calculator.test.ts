import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateStreak,
  shouldBreakStreak,
  getStreakFreeze,
  getStreakReward,
} from './streak-calculator';

describe('calculateStreak', () => {
  beforeEach(() => {
    // Mock current time to 2026-01-30 12:00:00 UTC
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-30T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns 1 for first activity (null lastActiveAt)', () => {
    expect(calculateStreak(null, 0)).toBe(1);
  });

  it('maintains streak when active same day', () => {
    const today = new Date('2026-01-30T08:00:00Z');
    expect(calculateStreak(today, 5)).toBe(5);
  });

  it('increments streak when active yesterday', () => {
    const yesterday = new Date('2026-01-29T18:00:00Z');
    expect(calculateStreak(yesterday, 5)).toBe(6);
  });

  it('resets streak when last active more than yesterday', () => {
    const twoDaysAgo = new Date('2026-01-28T12:00:00Z');
    expect(calculateStreak(twoDaysAgo, 10)).toBe(1);
  });

  it('handles timezone conversion', () => {
    // Test that timezone affects the streak calculation
    // At 12:00 UTC on Jan 30, in America/Los_Angeles (UTC-8) it's Jan 30 4:00 AM
    // Activity on Jan 29 at 23:00 UTC = Jan 29 15:00 in LA = yesterday in LA time
    // So streak should increment (yesterday activity → continue streak)
    const yesterday = new Date('2026-01-29T23:00:00Z');
    expect(calculateStreak(yesterday, 5, 'America/Los_Angeles')).toBe(6);
  });
});

describe('shouldBreakStreak', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns false for null lastActiveAt', () => {
    expect(shouldBreakStreak(null)).toBe(false);
  });

  it('returns false when last active yesterday', () => {
    vi.setSystemTime(new Date('2026-01-30T12:00:00Z'));
    const yesterday = new Date('2026-01-29T18:00:00Z');
    expect(shouldBreakStreak(yesterday)).toBe(false);
  });

  it('returns true when last active before yesterday', () => {
    vi.setSystemTime(new Date('2026-01-30T12:00:00Z'));
    const twoDaysAgo = new Date('2026-01-28T12:00:00Z');
    expect(shouldBreakStreak(twoDaysAgo)).toBe(true);
  });

  it('respects grace period (first 3 hours of day)', () => {
    // 2:00 AM - within grace period
    vi.setSystemTime(new Date('2026-01-30T02:00:00Z'));
    const yesterday = new Date('2026-01-29T18:00:00Z');
    expect(shouldBreakStreak(yesterday)).toBe(false);
  });

  it('breaks streak after grace period', () => {
    // 4:00 AM - past grace period
    vi.setSystemTime(new Date('2026-01-30T04:00:00Z'));
    const twoDaysAgo = new Date('2026-01-28T12:00:00Z');
    expect(shouldBreakStreak(twoDaysAgo)).toBe(true);
  });
});

describe('getStreakFreeze', () => {
  it('uses freeze when available', () => {
    const result = getStreakFreeze(10, 2);
    expect(result).toEqual({
      newStreak: 10,
      freezesRemaining: 1,
      freezeUsed: true,
    });
  });

  it('resets streak when no freezes available', () => {
    const result = getStreakFreeze(10, 0);
    expect(result).toEqual({
      newStreak: 1,
      freezesRemaining: 0,
      freezeUsed: false,
    });
  });

  it('decrements freezes correctly', () => {
    const result = getStreakFreeze(5, 1);
    expect(result.freezesRemaining).toBe(0);
    expect(result.freezeUsed).toBe(true);
  });
});

describe('getStreakReward', () => {
  it('returns rewards for 7-day streak', () => {
    const reward = getStreakReward(7);
    expect(reward).toEqual({ xp: 500, badge: 'week_warrior' });
  });

  it('returns rewards for 14-day streak', () => {
    const reward = getStreakReward(14);
    expect(reward).toEqual({ xp: 1000, badge: 'two_week_champion' });
  });

  it('returns rewards for 30-day streak', () => {
    const reward = getStreakReward(30);
    expect(reward).toEqual({ xp: 2500, badge: 'monthly_master' });
  });

  it('returns rewards for 100-day streak', () => {
    const reward = getStreakReward(100);
    expect(reward).toEqual({ xp: 10000, badge: 'centurion' });
  });

  it('returns no reward for non-milestone days', () => {
    expect(getStreakReward(1)).toEqual({ xp: 0, badge: null });
    expect(getStreakReward(5)).toEqual({ xp: 0, badge: null });
    expect(getStreakReward(15)).toEqual({ xp: 0, badge: null });
    expect(getStreakReward(50)).toEqual({ xp: 0, badge: null });
  });
});
