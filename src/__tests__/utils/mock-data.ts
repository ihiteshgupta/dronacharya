export const mockUser = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'test@example.com',
  name: 'Test User',
  role: 'learner',
  orgId: null,
  teamId: null,
};

export const mockGamificationProfile = {
  userId: mockUser.id,
  totalXp: 1500,
  currentStreak: 5,
  longestStreak: 10,
  level: 3,
  xpToNextLevel: 500,
};

export const mockAchievements = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Complete your first lesson',
    iconUrl: '/icons/first-steps.svg',
    xpReward: 50,
    rarity: 'common',
    earned: true,
    earnedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Streak Master',
    description: 'Maintain a 7-day streak',
    iconUrl: '/icons/streak.svg',
    xpReward: 100,
    rarity: 'rare',
    earned: false,
    earnedAt: null,
  },
];

export const mockDomains = [
  {
    id: '1',
    name: 'Technology',
    slug: 'technology',
    description: 'Programming and software development',
    iconUrl: '/icons/tech.svg',
  },
];

export const mockTracks = [
  {
    id: '1',
    name: 'Web Development',
    slug: 'web-development',
    description: 'Learn to build modern web applications',
    domainId: '1',
    difficulty: 'beginner',
    estimatedHours: 40,
  },
];
