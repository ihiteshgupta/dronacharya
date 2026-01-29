import { describe, it, expect } from 'vitest';
import {
  calculateXP,
  calculateLevelFromXP,
  getXPForNextLevel,
  getXPProgressInLevel,
  type XPMultipliers,
} from '../xp-calculator';

describe('xp-calculator', () => {
  describe('calculateXP', () => {
    describe('base XP values', () => {
      it('returns correct base XP for lesson_complete', () => {
        expect(calculateXP('lesson_complete', {})).toBe(50);
      });

      it('returns correct base XP for quiz_pass', () => {
        expect(calculateXP('quiz_pass', {})).toBe(100);
      });

      it('returns correct base XP for challenge_complete', () => {
        expect(calculateXP('challenge_complete', {})).toBe(150);
      });

      it('returns correct base XP for module_complete', () => {
        expect(calculateXP('module_complete', {})).toBe(300);
      });

      it('returns correct base XP for bronze_cert', () => {
        expect(calculateXP('bronze_cert', {})).toBe(500);
      });

      it('returns correct base XP for silver_cert', () => {
        expect(calculateXP('silver_cert', {})).toBe(1000);
      });

      it('returns correct base XP for gold_cert', () => {
        expect(calculateXP('gold_cert', {})).toBe(2500);
      });

      it('returns correct base XP for peer_help', () => {
        expect(calculateXP('peer_help', {})).toBe(75);
      });

      it('returns correct base XP for streak_bonus', () => {
        expect(calculateXP('streak_bonus', {})).toBe(25);
      });

      it('returns 0 for unknown activity', () => {
        expect(calculateXP('unknown_activity', {})).toBe(0);
      });
    });

    describe('multipliers', () => {
      it('applies first attempt bonus (1.25x)', () => {
        const multipliers: XPMultipliers = { isFirstAttempt: true };
        expect(calculateXP('lesson_complete', multipliers)).toBe(63); // 50 * 1.25 = 62.5, rounded to 63
      });

      it('applies perfect score bonus (1.5x)', () => {
        const multipliers: XPMultipliers = { isPerfectScore: true };
        expect(calculateXP('quiz_pass', multipliers)).toBe(150); // 100 * 1.5 = 150
      });

      it('applies no hints used bonus (1.25x)', () => {
        const multipliers: XPMultipliers = { noHintsUsed: true };
        expect(calculateXP('lesson_complete', multipliers)).toBe(63); // 50 * 1.25 = 62.5, rounded to 63
      });

      it('applies under par time bonus (1.1x)', () => {
        const multipliers: XPMultipliers = { underParTime: true };
        expect(calculateXP('quiz_pass', multipliers)).toBe(110); // 100 * 1.1 = 110
      });

      describe('streak bonus', () => {
        it('applies streak bonus based on streak days', () => {
          const multipliers: XPMultipliers = { streakDays: 10 };
          // 10 days = 10% bonus = 1.1x
          expect(calculateXP('quiz_pass', multipliers)).toBe(110); // 100 * 1.1 = 110
        });

        it('caps streak bonus at 30 days (30%)', () => {
          const multipliers: XPMultipliers = { streakDays: 50 };
          // Capped at 30 days = 30% bonus = 1.3x
          expect(calculateXP('quiz_pass', multipliers)).toBe(130); // 100 * 1.3 = 130
        });

        it('ignores streak bonus when streakDays is 0', () => {
          const multipliers: XPMultipliers = { streakDays: 0 };
          expect(calculateXP('quiz_pass', multipliers)).toBe(100);
        });

        it('ignores streak bonus when streakDays is negative', () => {
          const multipliers: XPMultipliers = { streakDays: -5 };
          expect(calculateXP('quiz_pass', multipliers)).toBe(100);
        });
      });

      it('combines multiple multipliers', () => {
        const multipliers: XPMultipliers = {
          isFirstAttempt: true, // 1.25x
          isPerfectScore: true, // 1.5x
        };
        // 100 * 1.25 * 1.5 = 187.5, rounded to 188
        expect(calculateXP('quiz_pass', multipliers)).toBe(188);
      });

      it('caps total multiplier at 3x', () => {
        const multipliers: XPMultipliers = {
          isFirstAttempt: true, // 1.25x
          streakDays: 30, // 1.3x
          isPerfectScore: true, // 1.5x
          noHintsUsed: true, // 1.25x
          underParTime: true, // 1.1x
        };
        // Uncapped would be: 1.25 * 1.3 * 1.5 * 1.25 * 1.1 = 3.35
        // But capped at 3x: 100 * 3 = 300
        expect(calculateXP('quiz_pass', multipliers)).toBe(300);
      });
    });
  });

  describe('calculateLevelFromXP', () => {
    it('returns level 1 for 0 XP', () => {
      expect(calculateLevelFromXP(0)).toBe(1);
    });

    it('returns level 1 for negative XP', () => {
      expect(calculateLevelFromXP(-100)).toBe(1);
    });

    it('returns level 100 for XP at or above 500000', () => {
      expect(calculateLevelFromXP(500000)).toBe(100);
      expect(calculateLevelFromXP(600000)).toBe(100);
    });

    it('calculates correct level for low XP values', () => {
      // Level formula: floor(sqrt(xp / 50)) + 1
      // Level 2 requires: (2-1)^2 * 50 = 50 XP
      expect(calculateLevelFromXP(49)).toBe(1);
      expect(calculateLevelFromXP(50)).toBe(2);
    });

    it('calculates correct level for mid XP values', () => {
      // Level 10 requires: (10-1)^2 * 50 = 81 * 50 = 4050 XP
      expect(calculateLevelFromXP(4049)).toBe(9);
      expect(calculateLevelFromXP(4050)).toBe(10);
    });

    it('calculates correct level for high XP values', () => {
      // Level 50 requires: (50-1)^2 * 50 = 2401 * 50 = 120050 XP
      expect(calculateLevelFromXP(120049)).toBe(49);
      expect(calculateLevelFromXP(120050)).toBe(50);
    });
  });

  describe('getXPForNextLevel', () => {
    it('returns XP required for level 2 when at level 1', () => {
      // Level 2 XP: 2^2 * 50 = 200
      expect(getXPForNextLevel(1)).toBe(200);
    });

    it('returns XP required for level 11 when at level 10', () => {
      // Level 11 XP: 11^2 * 50 = 6050
      expect(getXPForNextLevel(10)).toBe(6050);
    });

    it('returns 0 when at max level 100', () => {
      expect(getXPForNextLevel(100)).toBe(0);
    });

    it('returns 0 when above max level', () => {
      expect(getXPForNextLevel(150)).toBe(0);
    });
  });

  describe('getXPProgressInLevel', () => {
    it('returns correct progress for XP at start of level', () => {
      // At level 1 with 0 XP
      const progress = getXPProgressInLevel(0);
      expect(progress.current).toBe(0);
      expect(progress.required).toBe(50); // Level 2 requires 50 XP from level 1
      expect(progress.percentage).toBe(0);
    });

    it('returns correct progress for XP mid-level', () => {
      // At level 1 with 25 XP (50% progress to level 2)
      const progress = getXPProgressInLevel(25);
      expect(progress.current).toBe(25);
      expect(progress.required).toBe(50);
      expect(progress.percentage).toBe(50);
    });

    it('returns correct progress for higher levels', () => {
      // At 5000 XP, level = floor(sqrt(5000/50)) + 1 = floor(10) + 1 = 11
      // Level 11 starts at: 10^2 * 50 = 5000
      // Level 12 requires: 11^2 * 50 = 6050
      // Current progress: 5000 - 5000 = 0
      // Required: 6050 - 5000 = 1050
      const progress = getXPProgressInLevel(5000);
      expect(progress.current).toBe(0);
      expect(progress.required).toBe(1050);
      expect(progress.percentage).toBe(0);
    });

    it('returns correct progress when partially through a level', () => {
      // At 5500 XP, level = floor(sqrt(5500/50)) + 1 = floor(10.49) + 1 = 11
      // Level 11 starts at: 10^2 * 50 = 5000
      // Level 12 requires: 11^2 * 50 = 6050
      // Current progress: 5500 - 5000 = 500
      // Required: 6050 - 5000 = 1050
      // Percentage: (500 / 1050) * 100 = 47.6, rounded to 48
      const progress = getXPProgressInLevel(5500);
      expect(progress.current).toBe(500);
      expect(progress.required).toBe(1050);
      expect(progress.percentage).toBe(48);
    });
  });
});
