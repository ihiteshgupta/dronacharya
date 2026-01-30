import { describe, it, expect } from 'vitest';
import {
  calculateXP,
  calculateLevelFromXP,
  getXPForNextLevel,
  getXPProgressInLevel,
} from './xp-calculator';

describe('calculateXP', () => {
  it('returns base XP for known activity with no multipliers', () => {
    expect(calculateXP('lesson_complete', {})).toBe(50);
    expect(calculateXP('quiz_pass', {})).toBe(100);
    expect(calculateXP('challenge_complete', {})).toBe(150);
    expect(calculateXP('module_complete', {})).toBe(300);
  });

  it('returns 0 for unknown activity', () => {
    expect(calculateXP('unknown_activity', {})).toBe(0);
  });

  it('applies first attempt multiplier (1.25x)', () => {
    const xp = calculateXP('lesson_complete', { isFirstAttempt: true });
    expect(xp).toBe(63); // 50 * 1.25 = 62.5 → 63
  });

  it('applies perfect score multiplier (1.5x)', () => {
    const xp = calculateXP('quiz_pass', { isPerfectScore: true });
    expect(xp).toBe(150); // 100 * 1.5
  });

  it('applies no hints used multiplier (1.25x)', () => {
    const xp = calculateXP('lesson_complete', { noHintsUsed: true });
    expect(xp).toBe(63); // 50 * 1.25 = 62.5 → 63
  });

  it('applies under par time multiplier (1.1x)', () => {
    const xp = calculateXP('lesson_complete', { underParTime: true });
    expect(xp).toBe(55); // 50 * 1.1
  });

  it('applies streak multiplier based on streak days', () => {
    const xp10Days = calculateXP('lesson_complete', { streakDays: 10 });
    expect(xp10Days).toBe(55); // 50 * 1.10 (10 * 0.01 = 0.10 bonus)

    const xp30Days = calculateXP('lesson_complete', { streakDays: 30 });
    expect(xp30Days).toBe(65); // 50 * 1.30 (capped at 30 days)

    const xp50Days = calculateXP('lesson_complete', { streakDays: 50 });
    expect(xp50Days).toBe(65); // Still capped at 30 days bonus
  });

  it('combines multiple multipliers', () => {
    const xp = calculateXP('lesson_complete', {
      isFirstAttempt: true,
      isPerfectScore: true,
      noHintsUsed: true,
    });
    // 50 * 1.25 * 1.5 * 1.25 = 117.1875 → 117
    expect(xp).toBe(117);
  });

  it('caps total multiplier at 3x', () => {
    const xp = calculateXP('lesson_complete', {
      isFirstAttempt: true,
      isPerfectScore: true,
      noHintsUsed: true,
      underParTime: true,
      streakDays: 30,
    });
    // Would be > 3x without cap, so: 50 * 3 = 150
    expect(xp).toBe(150);
  });
});

describe('calculateLevelFromXP', () => {
  it('returns level 1 for 0 XP', () => {
    expect(calculateLevelFromXP(0)).toBe(1);
  });

  it('returns level 1 for negative XP', () => {
    expect(calculateLevelFromXP(-100)).toBe(1);
  });

  it('calculates correct levels for various XP amounts', () => {
    expect(calculateLevelFromXP(50)).toBe(2); // sqrt(50/50) + 1 = 2
    expect(calculateLevelFromXP(200)).toBe(3); // sqrt(200/50) + 1 = 3
    expect(calculateLevelFromXP(450)).toBe(4); // sqrt(450/50) + 1 = 4
    expect(calculateLevelFromXP(5000)).toBe(11); // sqrt(5000/50) + 1 = 11
  });

  it('returns level 100 for very high XP', () => {
    expect(calculateLevelFromXP(500000)).toBe(100);
    expect(calculateLevelFromXP(1000000)).toBe(100);
  });
});

describe('getXPForNextLevel', () => {
  it('returns XP required for next level', () => {
    expect(getXPForNextLevel(1)).toBe(200); // 2 * 2 * 50
    expect(getXPForNextLevel(5)).toBe(1800); // 6 * 6 * 50
    expect(getXPForNextLevel(10)).toBe(6050); // 11 * 11 * 50
  });

  it('returns 0 for level 100 (max level)', () => {
    expect(getXPForNextLevel(100)).toBe(0);
  });
});

describe('getXPProgressInLevel', () => {
  it('calculates progress within current level', () => {
    const progress = getXPProgressInLevel(75);
    expect(progress.current).toBe(25); // 75 - 50 (level 1 floor)
    expect(progress.required).toBe(150); // 200 - 50
    expect(progress.percentage).toBe(17); // 25/150 * 100 ≈ 17
  });

  it('handles level 1 correctly', () => {
    const progress = getXPProgressInLevel(25);
    expect(progress.current).toBe(25);
    expect(progress.required).toBe(50); // 50 - 0
    expect(progress.percentage).toBe(50);
  });

  it('handles exact level boundary', () => {
    const progress = getXPProgressInLevel(200);
    expect(progress.current).toBe(0);
    expect(progress.required).toBe(250); // 450 - 200
    expect(progress.percentage).toBe(0);
  });
});
