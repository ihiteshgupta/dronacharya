import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OnboardingData {
  domains: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | null;
  dailyGoal: number;
  learningPace: 'relaxed' | 'steady' | 'intensive' | null;
}

interface OnboardingState {
  isComplete: boolean;
  currentStep: number;
  data: OnboardingData;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (partial: Partial<OnboardingData>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const TOTAL_STEPS = 4;

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      isComplete: false,
      currentStep: 0,
      data: {
        domains: [],
        experienceLevel: null,
        dailyGoal: 30,
        learningPace: null,
      },

      setStep: (step) => set({ currentStep: Math.max(0, Math.min(step, TOTAL_STEPS - 1)) }),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, TOTAL_STEPS - 1),
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 0),
        })),

      updateData: (partial) =>
        set((state) => ({
          data: { ...state.data, ...partial },
        })),

      completeOnboarding: () => set({ isComplete: true }),

      resetOnboarding: () =>
        set({
          isComplete: false,
          currentStep: 0,
          data: {
            domains: [],
            experienceLevel: null,
            dailyGoal: 30,
            learningPace: null,
          },
        }),
    }),
    {
      name: 'dronacharya-onboarding',
    }
  )
);
