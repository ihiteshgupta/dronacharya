import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/__tests__/utils/test-utils';
import Dashboard from '@/app/page';

// Mock trpc client
vi.mock('@/lib/trpc/client', () => ({
  trpc: {
    course: {
      getDomains: {
        useQuery: () => ({
          data: [
            { id: '1', slug: 'python', name: 'Python', description: 'Learn Python programming' },
            { id: '2', slug: 'data-science', name: 'Data Science', description: 'Master data analysis' },
          ],
          isLoading: false,
        }),
      },
    },
    gamification: {
      getProfile: {
        useQuery: () => ({
          data: {
            totalXp: 1500,
            currentStreak: 5,
            longestStreak: 10,
            level: 3,
            levelProgress: { current: 200, required: 500, percentage: 40 },
          },
        }),
      },
      getAchievements: {
        useQuery: () => ({
          data: [
            { id: '1', name: 'First Steps', description: 'Complete your first lesson', earned: true, xpReward: 50 },
            { id: '2', name: 'Streak Master', description: 'Maintain a 7-day streak', earned: false, xpReward: 100 },
          ],
        }),
      },
    },
  },
}));

// Mock onboarding store
vi.mock('@/stores/onboarding-store', () => ({
  useOnboardingStore: () => ({ isComplete: true }),
}));

// Mock OnboardingWizard to render nothing
vi.mock('@/components/onboarding', () => ({
  OnboardingWizard: () => null,
}));

// Mock gamification components as simple elements
vi.mock('@/components/gamification', () => ({
  XPDisplay: ({ xp }: { xp: number }) => <div data-testid="xp-display">{xp} XP</div>,
  StreakDisplay: ({ streak }: { streak: number }) => <div data-testid="streak-display">{streak} day streak</div>,
  LevelProgress: ({ level, currentXP, requiredXP }: { level: number; currentXP: number; requiredXP: number }) => (
    <div data-testid="level-progress">Level {level}: {currentXP}/{requiredXP}</div>
  ),
}));

// Mock MainLayout as a passthrough wrapper
vi.mock('@/components/layout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="main-layout">{children}</div>,
}));

describe('Dashboard', () => {
  it('renders "Welcome back" text', () => {
    render(<Dashboard />);
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  it('renders "Explore Domains" section heading', () => {
    render(<Dashboard />);
    expect(screen.getByText('Explore Domains')).toBeInTheDocument();
  });
});
