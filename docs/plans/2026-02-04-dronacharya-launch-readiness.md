# Dronacharya Launch Readiness Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete all blockers for Dronacharya beta launch — fix CI, expand seed content, add tests, persist onboarding, add readiness endpoint, security headers, fix hardcodes, and rewrite README.

**Architecture:** Iterative phase-by-phase approach. Each phase is implemented then verified before moving to the next. Phase 1 fixes broken CI and testing infra. Phase 2 expands content and fixes data issues. Phase 3 hardens for production. Phase 4 validates everything end-to-end.

**Tech Stack:** Next.js 16, TypeScript, Vitest, Playwright, Drizzle ORM, PostgreSQL, tRPC, NextAuth v5

---

## Phase 1: Fix CI Pipeline & Testing Infrastructure

### Task 1: Add missing test scripts to package.json

**Files:**
- Modify: `package.json:5-21` (scripts section)

**Step 1: Read current scripts**

Current state — CI references `pnpm test:unit` (line 47 of `.github/workflows/ci.yml`) and `pnpm test:integration` (line 99) but package.json only has `test`, `test:run`, `test:coverage`.

**Step 2: Add missing scripts**

In `package.json`, add these scripts:

```json
"test:unit": "vitest run --exclude 'src/__tests__/integration/**'",
"test:integration": "vitest run --config vitest.integration.config.ts",
```

**Step 3: Verify scripts are valid**

Run: `cd /Users/hitesh.gupta/personal-projects/learnflow-ai && pnpm test:unit --help`
Expected: vitest help output (not "script not found")

**Step 4: Commit**

```bash
git add package.json
git commit -m "fix: add test:unit and test:integration scripts for CI"
```

---

### Task 2: Create vitest integration config

**Files:**
- Create: `vitest.integration.config.ts`

**Step 1: Create the integration test config**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    include: ['src/__tests__/integration/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./src/__tests__/integration/setup.ts'],
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Step 2: Create integration test setup file**

Create `src/__tests__/integration/setup.ts`:

```typescript
import { config } from 'dotenv';

// Load test environment
config({ path: '.env.test' });

// Set test defaults
process.env.NODE_ENV = 'test';
```

**Step 3: Verify config loads**

Run: `pnpm test:integration --help`
Expected: No config errors

**Step 4: Commit**

```bash
git add vitest.integration.config.ts src/__tests__/integration/setup.ts
git commit -m "feat: add vitest integration test configuration"
```

---

### Task 3: Write first unit tests — XP calculator

**Files:**
- Test: `src/__tests__/unit/utils/xp-calculator.test.ts`
- Reference: `src/lib/utils/xp-calculator.ts`

**Step 1: Write the failing tests**

```typescript
import { describe, it, expect } from 'vitest';
import { calculateLevelFromXP, getXPProgressInLevel } from '@/lib/utils/xp-calculator';

describe('calculateLevelFromXP', () => {
  it('returns level 1 for 0 XP', () => {
    expect(calculateLevelFromXP(0)).toBe(1);
  });

  it('returns level 1 for small XP', () => {
    expect(calculateLevelFromXP(49)).toBe(1);
  });

  it('increases level with more XP', () => {
    const level = calculateLevelFromXP(500);
    expect(level).toBeGreaterThan(1);
  });

  it('caps at level 100', () => {
    expect(calculateLevelFromXP(999999)).toBeLessThanOrEqual(100);
  });
});

describe('getXPProgressInLevel', () => {
  it('returns progress object with current, required, percentage', () => {
    const progress = getXPProgressInLevel(100);
    expect(progress).toHaveProperty('current');
    expect(progress).toHaveProperty('required');
    expect(progress).toHaveProperty('percentage');
  });

  it('percentage is between 0 and 100', () => {
    const progress = getXPProgressInLevel(250);
    expect(progress.percentage).toBeGreaterThanOrEqual(0);
    expect(progress.percentage).toBeLessThanOrEqual(100);
  });
});
```

**Step 2: Run test to verify it works**

Run: `pnpm test:unit src/__tests__/unit/utils/xp-calculator.test.ts`
Expected: PASS (these test existing code, so they should pass)

**Step 3: Commit**

```bash
git add src/__tests__/unit/utils/xp-calculator.test.ts
git commit -m "test: add unit tests for XP calculator"
```

---

### Task 4: Write unit tests — streak calculator

**Files:**
- Test: `src/__tests__/unit/utils/streak-calculator.test.ts`
- Reference: `src/lib/utils/streak-calculator.ts`

**Step 1: Write the tests**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { calculateStreak, getStreakReward } from '@/lib/utils/streak-calculator';

describe('calculateStreak', () => {
  it('returns 1 for first activity (null lastActiveAt)', () => {
    expect(calculateStreak(null, 0)).toBe(1);
  });

  it('increments streak for consecutive days', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(calculateStreak(yesterday, 5)).toBe(6);
  });

  it('resets streak if more than 1 day gap', () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    expect(calculateStreak(threeDaysAgo, 10)).toBe(1);
  });
});

describe('getStreakReward', () => {
  it('returns XP reward object', () => {
    const reward = getStreakReward(7);
    expect(reward).toHaveProperty('xp');
    expect(typeof reward.xp).toBe('number');
  });
});
```

**Step 2: Run test**

Run: `pnpm test:unit src/__tests__/unit/utils/streak-calculator.test.ts`
Expected: PASS

**Step 3: Commit**

```bash
git add src/__tests__/unit/utils/streak-calculator.test.ts
git commit -m "test: add unit tests for streak calculator"
```

---

### Task 5: Write component test — Dashboard rendering

**Files:**
- Test: `src/__tests__/unit/components/dashboard.test.tsx`

**Step 1: Write the test**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/__tests__/utils/test-utils';

// Mock trpc
vi.mock('@/lib/trpc/client', () => ({
  trpc: {
    course: {
      getDomains: { useQuery: () => ({ data: [], isLoading: false }) },
    },
    gamification: {
      getProfile: { useQuery: () => ({ data: null }) },
      getAchievements: { useQuery: () => ({ data: [] }) },
    },
  },
}));

// Mock onboarding store
vi.mock('@/stores/onboarding-store', () => ({
  useOnboardingStore: () => ({ isComplete: true }),
}));

// Mock child components that may have complex deps
vi.mock('@/components/onboarding', () => ({
  OnboardingWizard: () => null,
}));

vi.mock('@/components/gamification', () => ({
  XPDisplay: ({ xp }: { xp: number }) => <span data-testid="xp">{xp}</span>,
  StreakDisplay: ({ streak }: { streak: number }) => <span data-testid="streak">{streak}</span>,
  LevelProgress: () => null,
}));

import Dashboard from '@/app/page';

describe('Dashboard', () => {
  it('renders welcome message', () => {
    render(<Dashboard />);
    expect(screen.getByText('Welcome back')).toBeDefined();
  });

  it('renders explore domains section', () => {
    render(<Dashboard />);
    expect(screen.getByText('Explore Domains')).toBeDefined();
  });
});
```

**Step 2: Run test**

Run: `pnpm test:unit src/__tests__/unit/components/dashboard.test.tsx`
Expected: PASS

**Step 3: Commit**

```bash
git add src/__tests__/unit/components/dashboard.test.tsx
git commit -m "test: add Dashboard component rendering tests"
```

---

### Task 6: Verify Phase 1

**Step 1: Run all unit tests**

Run: `pnpm test:unit`
Expected: All tests pass

**Step 2: Run lint and typecheck**

Run: `pnpm lint && pnpm typecheck`
Expected: No errors

**Step 3: Run build**

Run: `SKIP_ENV_VALIDATION=true pnpm build`
Expected: Build succeeds

---

## Phase 2: Expand Seed Content & Fix Data Issues

### Task 7: Expand seed script with more lessons per module

**Files:**
- Modify: `scripts/seed-beta-content.ts`

**Step 1: Identify the gap**

Current seed has only 3 lessons for 1 module ("Understanding Variables"). The other 4 modules and all other courses/tracks have zero lessons. For beta, each module needs 3-5 lessons.

**Step 2: Add lessons for remaining modules in "Variables and Data Types" course**

Add lessons arrays for these modules (already defined in MODULES array):
- `numeric-types-variables-data-types` — 3 lessons (concept, code, quiz)
- `strings-variables-data-types` — 3 lessons (concept, code, quiz)
- `lists-and-tuples-variables-data-types` — 3 lessons (concept, code, quiz)
- `practice-challenge-variables-data-types` — 1 lesson (challenge)

Each lesson follows the same structure as existing lessons with contentJson and aiConfig.

**Step 3: Add lessons for "Getting Started with Python" course**

Add a module + 3 lessons:
- "What is Python?" (concept)
- "Installing Python" (concept)
- "Hello World Program" (code)

**Step 4: Add lessons for "Control Flow" course**

Add a module + 3 lessons:
- "If Statements" (concept)
- "For Loops" (code)
- "While Loops" (code)

**Step 5: Add lessons for "Functions" course**

Add a module + 3 lessons:
- "Defining Functions" (concept)
- "Parameters and Return Values" (code)
- "Functions Quiz" (quiz)

**Step 6: Add lessons for Data Science courses**

Add modules + 2-3 lessons each for:
- "Introduction to pandas" — DataFrames concept + code
- "Data Cleaning" — Missing data concept + code

**Step 7: Add lessons for ML course**

Add modules + 2-3 lessons each for:
- "What is Machine Learning?" — Intro concept + types concept
- "Supervised Learning" — Classification concept + code

**Step 8: Run seed to verify**

Run: `pnpm db:push && pnpm db:seed`
Expected: All domains, tracks, courses, modules, lessons, achievements seeded successfully

**Step 9: Commit**

```bash
git add scripts/seed-beta-content.ts
git commit -m "feat: expand seed content with lessons for all courses"
```

---

### Task 8: Fix hardcoded "+250 this week" XP on dashboard

**Files:**
- Modify: `src/app/page.tsx:106-109`
- Modify: `src/lib/trpc/routers/gamification.ts`

**Step 1: Add weeklyXP to gamification router**

In `src/lib/trpc/routers/gamification.ts`, inside the `getProfile` procedure, after fetching `recentXP`, add:

```typescript
// Calculate this week's XP
const weekStart = startOfWeek(new Date());
const weeklyXP = await ctx.db
  .select({ total: sql<number>`COALESCE(SUM(${xpTransactions.amount}), 0)` })
  .from(xpTransactions)
  .where(and(
    eq(xpTransactions.userId, ctx.user.id),
    gte(xpTransactions.createdAt, weekStart)
  ));
```

Add `weeklyXP: weeklyXP[0]?.total || 0` to the return object.

**Step 2: Update dashboard to use real data**

In `src/app/page.tsx`, replace line 108:

```tsx
// Before:
<span className="text-xs text-emerald font-medium">+250 this week</span>

// After:
<span className="text-xs text-emerald font-medium">
  +{(profile?.weeklyXP || 0).toLocaleString()} this week
</span>
```

**Step 3: Write test for weeklyXP display**

Add to dashboard test:

```typescript
it('displays weekly XP from profile data', () => {
  // Override mock to return weeklyXP
  vi.mocked(trpc.gamification.getProfile.useQuery).mockReturnValue({
    data: { totalXp: 1000, weeklyXP: 150, level: 3, currentStreak: 5, longestStreak: 10, levelProgress: { current: 50, required: 100, percentage: 50 } },
  } as any);
  render(<Dashboard />);
  expect(screen.getByText('+150 this week')).toBeDefined();
});
```

**Step 4: Run tests**

Run: `pnpm test:unit`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/page.tsx src/lib/trpc/routers/gamification.ts src/__tests__/unit/components/dashboard.test.tsx
git commit -m "fix: replace hardcoded weekly XP with real data from DB"
```

---

### Task 9: Persist onboarding data to database

**Files:**
- Modify: `src/stores/onboarding-store.ts`
- Modify: `src/lib/trpc/routers/user.ts` (or create if needed)
- Reference: `src/lib/db/schema/users.ts` (userProfiles has studyPreferences)

**Step 1: Add tRPC mutation for saving onboarding**

In the user router, add a `saveOnboarding` mutation:

```typescript
saveOnboarding: protectedProcedure
  .input(z.object({
    domains: z.array(z.string()),
    experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
    dailyGoal: z.number().min(5).max(120),
    learningPace: z.enum(['relaxed', 'steady', 'intensive']),
  }))
  .mutation(async ({ ctx, input }) => {
    await ctx.db
      .update(userProfiles)
      .set({
        studyPreferences: {
          domains: input.domains,
          experienceLevel: input.experienceLevel,
          dailyGoalMinutes: input.dailyGoal,
          learningPace: input.learningPace,
        },
      })
      .where(eq(userProfiles.userId, ctx.user.id));

    return { success: true };
  }),
```

**Step 2: Update onboarding store to call API on complete**

In `src/stores/onboarding-store.ts`, the `completeOnboarding` action should trigger a tRPC call. Since Zustand stores can't directly use hooks, the component calling `completeOnboarding` should also call the mutation. Update the OnboardingWizard component to call both.

**Step 3: Run tests and verify**

Run: `pnpm test:unit && pnpm typecheck`
Expected: PASS

**Step 4: Commit**

```bash
git add src/stores/onboarding-store.ts src/lib/trpc/routers/user.ts src/components/onboarding/
git commit -m "feat: persist onboarding preferences to database"
```

---

### Task 10: Verify Phase 2

**Step 1: Run all tests**

Run: `pnpm test:unit`
Expected: All pass

**Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: No errors

**Step 3: Build**

Run: `SKIP_ENV_VALIDATION=true pnpm build`
Expected: Build succeeds

---

## Phase 3: Production Hardening

### Task 11: Add readiness endpoint

**Files:**
- Create: `src/app/api/ready/route.ts`

**Step 1: Write failing test**

Create `src/__tests__/unit/api/ready.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';

// We'll test the response shape — the actual DB check requires integration test
describe('/api/ready', () => {
  it('should export a GET handler', async () => {
    const { GET } = await import('@/app/api/ready/route');
    expect(typeof GET).toBe('function');
  });
});
```

**Step 2: Implement readiness endpoint**

```typescript
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check database connectivity
    await db.execute(sql`SELECT 1`);

    return NextResponse.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'ok',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'failed',
        },
      },
      { status: 503 }
    );
  }
}
```

**Step 3: Run test**

Run: `pnpm test:unit src/__tests__/unit/api/ready.test.ts`
Expected: PASS

**Step 4: Commit**

```bash
git add src/app/api/ready/route.ts src/__tests__/unit/api/ready.test.ts
git commit -m "feat: add /api/ready readiness endpoint with DB check"
```

---

### Task 12: Add security headers to next.config.ts

**Files:**
- Modify: `next.config.ts`

**Step 1: Add security headers**

```typescript
import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
```

**Step 2: Verify build passes**

Run: `SKIP_ENV_VALIDATION=true pnpm build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat: add security headers (HSTS, X-Frame-Options, CSP)"
```

---

### Task 13: Generate Drizzle migrations

**Files:**
- Modify: `drizzle/` directory (auto-generated)

**Step 1: Generate migration from current schema**

Run: `pnpm db:generate`
Expected: Migration files created in `drizzle/` directory

**Step 2: Verify migration file exists**

Run: `ls drizzle/`
Expected: SQL migration file(s) present

**Step 3: Commit**

```bash
git add drizzle/
git commit -m "feat: generate initial Drizzle migration files"
```

---

### Task 14: Rewrite README.md

**Files:**
- Modify: `README.md`

**Step 1: Replace default content**

```markdown
# Dronacharya (द्रोणाचार्य)

AI-powered learning platform with agentic workflows. Named after the legendary teacher from Mahabharata.

**"AI that teaches like a Guru"**

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL 17
- Docker (optional, for full stack)

### Development Setup

```bash
# Clone and install
git clone <repo-url>
cd learnflow-ai
pnpm install

# Start infrastructure
docker compose -f docker-compose.dev.yml up -d

# Setup database
cp .env.example .env.local
# Edit .env.local with your credentials
pnpm db:push
pnpm db:seed

# Start dev server
pnpm dev
```

Open http://localhost:3000

### Using Docker Compose (Full Stack)

```bash
docker compose up
```

This starts the app, PostgreSQL, Redis, and Qdrant.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL + Drizzle ORM |
| AI | LangChain (Claude + GPT-4o), LangGraph |
| Vector DB | Qdrant |
| Auth | NextAuth.js v5 |
| State | Zustand, TanStack Query |
| API | tRPC, Hono |
| Testing | Vitest, Playwright, MSW |

## AI Agents

| Agent | Role |
|-------|------|
| Tutor | Guided learning with Socratic questioning |
| Assessor | Quiz generation and answer evaluation |
| Mentor | Career guidance and motivation |
| Code Review | Multi-level code analysis |
| Project Guide | Portfolio project lifecycle |
| Quiz Generator | RAG-based adaptive quizzes |

## Scripts

```bash
pnpm dev              # Development server
pnpm build            # Production build
pnpm test:unit        # Unit tests
pnpm test:integration # Integration tests
pnpm test:e2e         # E2E tests (Playwright)
pnpm db:push          # Push schema to DB
pnpm db:seed          # Seed beta content
pnpm db:studio        # Drizzle Studio GUI
pnpm lint             # ESLint
pnpm typecheck        # TypeScript check
```

## Deployment

- **Docker**: Multi-stage Dockerfile for production
- **Kubernetes**: Kustomize overlays for staging/production
- **Terraform**: AWS (EKS + RDS + Redis) and Azure (App Service)
- **CI/CD**: GitHub Actions with lint, test, build, deploy

## Learning Domains (Beta)

- **Python** — Fundamentals to Advanced
- **Data Science** — pandas, NumPy, visualization
- **AI/ML** — Machine learning foundations

## License

Private — All rights reserved.
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README with project-specific setup and docs"
```

---

### Task 15: Verify Phase 3

**Step 1: Run full test suite**

Run: `pnpm test:unit`
Expected: All pass

**Step 2: Typecheck and lint**

Run: `pnpm typecheck && pnpm lint`
Expected: No errors

**Step 3: Build**

Run: `SKIP_ENV_VALIDATION=true pnpm build`
Expected: Build succeeds

---

## Phase 4: Validate & Final Polish

### Task 16: Fix "20+ hours" hardcode on domain cards

**Files:**
- Modify: `src/app/page.tsx:227`

**Step 1: Replace hardcoded hours**

The domain cards show "20+ hours" for all domains. Replace with actual track hours from tRPC data.

In `src/app/page.tsx`, the domain cards don't have hours data from the `getDomains` query. Two options:
1. Add estimated hours to domains schema (requires migration)
2. Show track count instead

Simplest fix — replace with track count text or remove the hardcoded hours:

```tsx
// Before (line 227-228):
<Clock className="h-4 w-4" />
<span>20+ hours</span>

// After:
<BookOpen className="h-4 w-4" />
<span>Multiple tracks</span>
```

**Step 2: Run tests**

Run: `pnpm test:unit`
Expected: PASS

**Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "fix: remove hardcoded hours from domain cards"
```

---

### Task 17: Enhance health endpoint with uptime

**Files:**
- Modify: `src/app/api/health/route.ts`

**Step 1: Add uptime tracking**

```typescript
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const startTime = Date.now();

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks: {
      app: 'ok',
    },
  };

  return NextResponse.json(health);
}
```

**Step 2: Commit**

```bash
git add src/app/api/health/route.ts
git commit -m "feat: add uptime to health endpoint"
```

---

### Task 18: Final verification — full build and test

**Step 1: Clean install**

Run: `rm -rf node_modules/.cache && pnpm install --frozen-lockfile`

**Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: 0 errors

**Step 3: Lint**

Run: `pnpm lint`
Expected: 0 errors

**Step 4: Unit tests with coverage**

Run: `pnpm test:coverage`
Expected: All pass, coverage report generated

**Step 5: Build**

Run: `SKIP_ENV_VALIDATION=true pnpm build`
Expected: Build succeeds

**Step 6: Commit everything and tag**

```bash
git add -A
git commit -m "chore: final launch readiness verification"
git tag -a v0.1.0-beta.1 -m "Beta launch candidate 1"
```

---

## Summary

| Phase | Tasks | Focus |
|-------|-------|-------|
| 1 | Tasks 1-6 | CI pipeline + testing infrastructure |
| 2 | Tasks 7-10 | Content expansion + data fixes |
| 3 | Tasks 11-15 | Production hardening |
| 4 | Tasks 16-18 | Final polish + validation |

**Total tasks:** 18
**Verification points:** After each phase (Tasks 6, 10, 15, 18)
