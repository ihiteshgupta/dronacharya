import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useGamificationStore } from './gamification-store';

describe('gamification-store', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Reset store
    useGamificationStore.setState({
      totalXP: 0,
      recentGain: 0,
      level: 1,
      currentStreak: 0,
      showAchievement: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should have correct default values', () => {
      const state = useGamificationStore.getState();

      expect(state.totalXP).toBe(0);
      expect(state.recentGain).toBe(0);
      expect(state.level).toBe(1);
      expect(state.currentStreak).toBe(0);
      expect(state.showAchievement).toBeNull();
    });
  });

  describe('addXP', () => {
    it('should add XP correctly', () => {
      const store = useGamificationStore.getState();

      store.addXP(100);

      expect(useGamificationStore.getState().totalXP).toBe(100);
      expect(useGamificationStore.getState().recentGain).toBe(100);
    });

    it('should accumulate XP', () => {
      const store = useGamificationStore.getState();

      store.addXP(100);
      store.addXP(50);

      expect(useGamificationStore.getState().totalXP).toBe(150);
    });

    it('should calculate level based on XP', () => {
      const store = useGamificationStore.getState();

      // Level formula: Math.floor(Math.sqrt(xp / 50)) + 1
      // 200 XP = sqrt(4) + 1 = 3
      store.addXP(200);

      expect(useGamificationStore.getState().level).toBe(3);
    });

    it('should cap level at 100', () => {
      const store = useGamificationStore.getState();

      // Adding huge XP should not go above level 100
      store.addXP(1000000);

      expect(useGamificationStore.getState().level).toBeLessThanOrEqual(100);
    });

    it('should clear recent gain after timeout', () => {
      const store = useGamificationStore.getState();

      store.addXP(100);
      expect(useGamificationStore.getState().recentGain).toBe(100);

      // Fast-forward 2 seconds
      vi.advanceTimersByTime(2000);

      expect(useGamificationStore.getState().recentGain).toBe(0);
    });
  });

  describe('setStreak', () => {
    it('should set streak correctly', () => {
      const store = useGamificationStore.getState();

      store.setStreak(7);

      expect(useGamificationStore.getState().currentStreak).toBe(7);
    });
  });

  describe('achievements', () => {
    it('should show achievement toast', () => {
      const store = useGamificationStore.getState();

      store.showAchievementToast({ name: 'First Steps', xpReward: 50 });

      expect(useGamificationStore.getState().showAchievement).toEqual({
        name: 'First Steps',
        xpReward: 50,
      });
    });

    it('should hide achievement toast', () => {
      const store = useGamificationStore.getState();

      store.showAchievementToast({ name: 'First Steps', xpReward: 50 });
      store.hideAchievementToast();

      expect(useGamificationStore.getState().showAchievement).toBeNull();
    });
  });
});
