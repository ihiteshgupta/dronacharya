import { describe, it, expect } from 'vitest';
import {
  calculateXP,
  calculateLevelFromXP,
  getXPForNextLevel,
  getXPProgressInLevel,
} from '@/lib/utils/xp-calculator';

describe('calculateLevelFromXP', () => {
  it('returns level 1 for 0 XP', () => {
    expect(calculateLevelFromXP(0)).toBe(1);
  });

  it('returns level 1 for negative XP', () => {
    expect(calculateLevelFromXP(-100)).toBe(1);
  });

  it('increases level with more XP', () => {
    const level1 = calculateLevelFromXP(0);
    const level2 = calculateLevelFromXP(5000);
    const level3 = calculateLevelFromXP(25000);
    const level4 = calculateLevelFromXP(100000);

    expect(level2).toBeGreaterThan(level1);
    expect(level3).toBeGreaterThan(level2);
    expect(level4).toBeGreaterThan(level3);
  });

  it('caps at level 100 for very high XP', () => {
    expect(calculateLevelFromXP(500000)).toBe(100);
    expect(calculateLevelFromXP(1000000)).toBe(100);
    expect(calculateLevelFromXP(999999999)).toBe(100);
  });

  it('returns correct level using formula floor(sqrt(xp/50)) + 1', () => {
    // Level = floor(sqrt(xp / 50)) + 1
    // xp=50 => floor(sqrt(1)) + 1 = 2
    expect(calculateLevelFromXP(50)).toBe(2);
    // xp=200 => floor(sqrt(4)) + 1 = 3
    expect(calculateLevelFromXP(200)).toBe(3);
    // xp=450 => floor(sqrt(9)) + 1 = 4
    expect(calculateLevelFromXP(450)).toBe(4);
  });

  it('always returns an integer', () => {
    for (const xp of [0, 1, 37, 99, 150, 777, 12345, 499999]) {
      const level = calculateLevelFromXP(xp);
      expect(Number.isInteger(level)).toBe(true);
    }
  });

  it('never returns a level below 1', () => {
    for (const xp of [-1000, -1, 0]) {
      expect(calculateLevelFromXP(xp)).toBeGreaterThanOrEqual(1);
    }
  });

  it('never returns a level above 100', () => {
    for (const xp of [500000, 600000, 10000000]) {
      expect(calculateLevelFromXP(xp)).toBeLessThanOrEqual(100);
    }
  });
});

describe('getXPProgressInLevel', () => {
  it('returns an object with current, required, and percentage', () => {
    const progress = getXPProgressInLevel(0);
    expect(progress).toHaveProperty('current');
    expect(progress).toHaveProperty('required');
    expect(progress).toHaveProperty('percentage');
  });

  it('returns numeric values for all fields', () => {
    const progress = getXPProgressInLevel(100);
    expect(typeof progress.current).toBe('number');
    expect(typeof progress.required).toBe('number');
    expect(typeof progress.percentage).toBe('number');
  });

  it('has percentage between 0 and 100', () => {
    for (const xp of [0, 50, 100, 500, 1000, 5000, 25000, 100000]) {
      const progress = getXPProgressInLevel(xp);
      expect(progress.percentage).toBeGreaterThanOrEqual(0);
      expect(progress.percentage).toBeLessThanOrEqual(100);
    }
  });

  it('has required > 0 for non-max levels', () => {
    const progress = getXPProgressInLevel(100);
    expect(progress.required).toBeGreaterThan(0);
  });

  it('has current >= 0', () => {
    for (const xp of [0, 1, 50, 100, 999]) {
      const progress = getXPProgressInLevel(xp);
      expect(progress.current).toBeGreaterThanOrEqual(0);
    }
  });

  it('current is less than or equal to required', () => {
    for (const xp of [0, 25, 49, 50, 100, 500, 2500]) {
      const progress = getXPProgressInLevel(xp);
      expect(progress.current).toBeLessThanOrEqual(progress.required);
    }
  });

  it('returns 0% progress at the start of a level', () => {
    // At 0 XP, level is 1. currentLevelXP = 0, nextLevelXP = 50.
    // current = 0, required = 50, percentage = 0
    const progress = getXPProgressInLevel(0);
    expect(progress.current).toBe(0);
    expect(progress.required).toBe(50);
    expect(progress.percentage).toBe(0);
  });

  it('computes correct progress mid-level', () => {
    // At 25 XP: level 1, currentLevelXP=0, nextLevelXP=50
    // current=25, required=50, percentage=50
    const progress = getXPProgressInLevel(25);
    expect(progress.current).toBe(25);
    expect(progress.required).toBe(50);
    expect(progress.percentage).toBe(50);
  });
});

describe('calculateXP', () => {
  it('returns base XP for a known activity with no multipliers', () => {
    expect(calculateXP('lesson_complete', {})).toBe(50);
    expect(calculateXP('quiz_pass', {})).toBe(100);
    expect(calculateXP('challenge_complete', {})).toBe(150);
  });

  it('returns 0 for an unknown activity', () => {
    expect(calculateXP('unknown_activity', {})).toBe(0);
  });

  it('applies first attempt multiplier (1.25x)', () => {
    const xp = calculateXP('lesson_complete', { isFirstAttempt: true });
    expect(xp).toBe(Math.round(50 * 1.25));
  });

  it('applies perfect score multiplier (1.5x)', () => {
    const xp = calculateXP('quiz_pass', { isPerfectScore: true });
    expect(xp).toBe(Math.round(100 * 1.5));
  });

  it('applies streak bonus', () => {
    const xp = calculateXP('lesson_complete', { streakDays: 10 });
    // streakBonus = min(10,30) * 0.01 = 0.1, multiplier = 1.1
    expect(xp).toBe(Math.round(50 * 1.1));
  });

  it('caps streak bonus at 30 days', () => {
    const xp30 = calculateXP('lesson_complete', { streakDays: 30 });
    const xp60 = calculateXP('lesson_complete', { streakDays: 60 });
    expect(xp30).toBe(xp60);
  });

  it('caps total multiplier at 3x', () => {
    // All multipliers active with high streak: 1.25 * 1.3 * 1.5 * 1.25 * 1.1 = ~3.34
    // Should be capped at 3
    const xp = calculateXP('quiz_pass', {
      isFirstAttempt: true,
      streakDays: 30,
      isPerfectScore: true,
      noHintsUsed: true,
      underParTime: true,
    });
    expect(xp).toBe(Math.round(100 * 3));
  });
});

describe('getXPForNextLevel', () => {
  it('returns XP required for the next level', () => {
    // nextLevel = 2, XP = 2*2*50 = 200
    expect(getXPForNextLevel(1)).toBe(200);
    // nextLevel = 3, XP = 3*3*50 = 450
    expect(getXPForNextLevel(2)).toBe(450);
  });

  it('returns 0 at max level (100)', () => {
    expect(getXPForNextLevel(100)).toBe(0);
  });

  it('returns 0 for levels above 100', () => {
    expect(getXPForNextLevel(150)).toBe(0);
  });
});
