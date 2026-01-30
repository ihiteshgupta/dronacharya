import { describe, it, expect, beforeEach } from 'vitest';
import { useOnboardingStore } from './onboarding-store';

describe('onboarding-store', () => {
  beforeEach(() => {
    // Reset store before each test
    useOnboardingStore.getState().resetOnboarding();
  });

  describe('initial state', () => {
    it('should have correct default values', () => {
      const state = useOnboardingStore.getState();

      expect(state.isComplete).toBe(false);
      expect(state.currentStep).toBe(0);
      expect(state.data.domains).toEqual([]);
      expect(state.data.experienceLevel).toBeNull();
      expect(state.data.dailyGoal).toBe(30);
      expect(state.data.learningPace).toBeNull();
    });
  });

  describe('navigation', () => {
    it('should go to next step', () => {
      const store = useOnboardingStore.getState();

      expect(store.currentStep).toBe(0);
      store.nextStep();
      expect(useOnboardingStore.getState().currentStep).toBe(1);
      store.nextStep();
      expect(useOnboardingStore.getState().currentStep).toBe(2);
    });

    it('should not go past step 3', () => {
      const store = useOnboardingStore.getState();

      store.setStep(3);
      expect(useOnboardingStore.getState().currentStep).toBe(3);

      store.nextStep();
      expect(useOnboardingStore.getState().currentStep).toBe(3);
    });

    it('should go to previous step', () => {
      const store = useOnboardingStore.getState();

      store.setStep(2);
      expect(useOnboardingStore.getState().currentStep).toBe(2);

      store.prevStep();
      expect(useOnboardingStore.getState().currentStep).toBe(1);
    });

    it('should not go below step 0', () => {
      const store = useOnboardingStore.getState();

      expect(store.currentStep).toBe(0);
      store.prevStep();
      expect(useOnboardingStore.getState().currentStep).toBe(0);
    });
  });

  describe('data updates', () => {
    it('should update domains', () => {
      const store = useOnboardingStore.getState();

      store.updateData({ domains: ['python', 'data-science'] });
      expect(useOnboardingStore.getState().data.domains).toEqual(['python', 'data-science']);
    });

    it('should update experience level', () => {
      const store = useOnboardingStore.getState();

      store.updateData({ experienceLevel: 'intermediate' });
      expect(useOnboardingStore.getState().data.experienceLevel).toBe('intermediate');
    });

    it('should update learning pace and daily goal', () => {
      const store = useOnboardingStore.getState();

      store.updateData({ learningPace: 'intensive', dailyGoal: 60 });
      expect(useOnboardingStore.getState().data.learningPace).toBe('intensive');
      expect(useOnboardingStore.getState().data.dailyGoal).toBe(60);
    });

    it('should preserve other data when updating', () => {
      const store = useOnboardingStore.getState();

      store.updateData({ domains: ['python'] });
      store.updateData({ experienceLevel: 'beginner' });

      const state = useOnboardingStore.getState();
      expect(state.data.domains).toEqual(['python']);
      expect(state.data.experienceLevel).toBe('beginner');
    });
  });

  describe('completion', () => {
    it('should mark onboarding as complete', () => {
      const store = useOnboardingStore.getState();

      expect(store.isComplete).toBe(false);
      store.completeOnboarding();
      expect(useOnboardingStore.getState().isComplete).toBe(true);
    });

    it('should reset all data', () => {
      const store = useOnboardingStore.getState();

      // Set up some state
      store.updateData({ domains: ['python'], experienceLevel: 'advanced' });
      store.setStep(3);
      store.completeOnboarding();

      // Reset
      store.resetOnboarding();

      const state = useOnboardingStore.getState();
      expect(state.isComplete).toBe(false);
      expect(state.currentStep).toBe(0);
      expect(state.data.domains).toEqual([]);
      expect(state.data.experienceLevel).toBeNull();
    });
  });
});
