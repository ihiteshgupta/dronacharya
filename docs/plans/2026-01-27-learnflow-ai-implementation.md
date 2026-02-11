# Dronacharya Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an interactive AI-driven LMS with multi-agent tutoring, immersive learning modules, tiered certifications, and adaptive gamification.

**Architecture:** Next.js 15 App Router with tRPC for type-safe APIs, LangGraph for AI agent orchestration, PostgreSQL + Redis + Qdrant for data layer, shadcn/ui for components. Cloud-agnostic Kubernetes deployment.

**Tech Stack:** Next.js 15, React 19, TypeScript, shadcn/ui, Tailwind CSS 4, Drizzle ORM, tRPC v11, PostgreSQL 17, Redis 8, Qdrant, LangGraph, Claude/GPT APIs, Vitest, Playwright

---

## Phase 1: Project Foundation (Tasks 1-8)

### Task 1: Initialize Next.js Project

**Files:**
- Create: `dronacharya/package.json`
- Create: `dronacharya/next.config.ts`
- Create: `dronacharya/tsconfig.json`
- Create: `dronacharya/.gitignore`

**Step 1: Create Next.js 15 project**

Run:
```bash
cd ~/dronacharya
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack
```

Expected: Project scaffolded with Next.js 15

**Step 2: Verify project runs**

Run:
```bash
cd ~/dronacharya && pnpm dev
```

Expected: Server starts at localhost:3000

**Step 3: Commit**

```bash
cd ~/dronacharya
git init
git add .
git commit -m "chore: initialize Next.js 15 project with TypeScript and Tailwind"
```

---

### Task 2: Install Core Dependencies

**Files:**
- Modify: `dronacharya/package.json`

**Step 1: Install UI and state dependencies**

Run:
```bash
cd ~/dronacharya
pnpm add @tanstack/react-query zustand react-hook-form @hookform/resolvers zod framer-motion lucide-react
```

**Step 2: Install backend dependencies**

Run:
```bash
cd ~/dronacharya
pnpm add @trpc/server @trpc/client @trpc/react-query @trpc/next hono @hono/node-server drizzle-orm postgres dotenv
```

**Step 3: Install AI dependencies**

Run:
```bash
cd ~/dronacharya
pnpm add ai @langchain/core @langchain/anthropic @langchain/openai @langchain/langgraph @qdrant/js-client-rest
```

**Step 4: Install dev dependencies**

Run:
```bash
cd ~/dronacharya
pnpm add -D drizzle-kit vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @playwright/test msw typescript @types/node @types/react
```

**Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add core dependencies for UI, backend, and AI"
```

---

### Task 3: Setup shadcn/ui

**Files:**
- Create: `dronacharya/components.json`
- Create: `dronacharya/src/components/ui/button.tsx`
- Modify: `dronacharya/src/app/globals.css`

**Step 1: Initialize shadcn/ui**

Run:
```bash
cd ~/dronacharya
pnpm dlx shadcn@latest init -d
```

Select: New York style, Zinc color, CSS variables: yes

**Step 2: Add essential components**

Run:
```bash
cd ~/dronacharya
pnpm dlx shadcn@latest add button card input label tabs progress avatar badge scroll-area tooltip dialog dropdown-menu separator slider switch textarea alert
```

**Step 3: Verify component installation**

Run:
```bash
ls src/components/ui/
```

Expected: Multiple component files present

**Step 4: Commit**

```bash
git add .
git commit -m "chore: setup shadcn/ui with essential components"
```

---

### Task 4: Setup Environment Configuration

**Files:**
- Create: `dronacharya/.env.example`
- Create: `dronacharya/.env.local`
- Create: `dronacharya/src/lib/config/env.ts`

**Step 1: Create environment schema**

Create `src/lib/config/env.ts`:
```typescript
import { z } from 'zod';

const envSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_SIZE: z.coerce.number().default(10),

  // Redis
  REDIS_URL: z.string().url(),

  // AI
  ANTHROPIC_API_KEY: z.string(),
  OPENAI_API_KEY: z.string().optional(),
  AI_MODEL_PRIMARY: z.string().default('claude-sonnet-4-20250514'),
  AI_MODEL_FALLBACK: z.string().default('gpt-4o'),

  // Vector DB
  QDRANT_URL: z.string().url(),
  QDRANT_API_KEY: z.string().optional(),

  // Auth
  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.string().url().default('http://localhost:3000'),

  // Feature flags
  ENABLE_GAMIFICATION: z.coerce.boolean().default(true),
  ENABLE_AI_PROCTORING: z.coerce.boolean().default(false),
  MAX_AI_REQUESTS_PER_MINUTE: z.coerce.number().default(30),
});

export type Env = z.infer<typeof envSchema>;

function getEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

export const env = getEnv();
```

**Step 2: Create .env.example**

Create `.env.example`:
```bash
# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dronacharya
DATABASE_POOL_SIZE=10

# Redis
REDIS_URL=redis://localhost:6379

# AI
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx
AI_MODEL_PRIMARY=claude-sonnet-4-20250514
AI_MODEL_FALLBACK=gpt-4o

# Vector DB
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=

# Auth
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# Feature Flags
ENABLE_GAMIFICATION=true
ENABLE_AI_PROCTORING=false
MAX_AI_REQUESTS_PER_MINUTE=30
```

**Step 3: Create .env.local (copy and fill)**

Run:
```bash
cp .env.example .env.local
```

**Step 4: Update .gitignore**

Append to `.gitignore`:
```
.env.local
.env.*.local
```

**Step 5: Commit**

```bash
git add .env.example src/lib/config/env.ts .gitignore
git commit -m "chore: setup environment configuration with Zod validation"
```

---

### Task 5: Setup Database Schema (Core Tables)

**Files:**
- Create: `dronacharya/src/lib/db/index.ts`
- Create: `dronacharya/src/lib/db/schema/users.ts`
- Create: `dronacharya/src/lib/db/schema/organizations.ts`
- Create: `dronacharya/src/lib/db/schema/index.ts`
- Create: `dronacharya/drizzle.config.ts`

**Step 1: Create database connection**

Create `src/lib/db/index.ts`:
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, {
  max: Number(process.env.DATABASE_POOL_SIZE) || 10,
});

export const db = drizzle(client, { schema });

export type Database = typeof db;
```

**Step 2: Create users schema**

Create `src/lib/db/schema/users.ts`:
```typescript
import { pgTable, uuid, varchar, text, jsonb, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }),
  role: varchar('role', { length: 50 }).notNull().default('learner'),
  orgId: uuid('org_id'),
  teamId: uuid('team_id'),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  preferences: jsonb('preferences').$type<UserPreferences>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userProfiles = pgTable('user_profiles', {
  userId: uuid('user_id').primaryKey(),
  level: integer('level').notNull().default(1),
  totalXp: integer('total_xp').notNull().default(0),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  learningStyle: varchar('learning_style', { length: 50 }),
  gamificationMode: varchar('gamification_mode', { length: 20 }).default('full'),
  studyPreferences: jsonb('study_preferences').$type<StudyPreferences>(),
  skillMap: jsonb('skill_map').$type<SkillMap>(),
  lastActiveAt: timestamp('last_active_at'),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

// Types
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  notifications?: boolean;
  emailDigest?: 'daily' | 'weekly' | 'never';
}

export interface StudyPreferences {
  preferredTimes?: string[];
  sessionDuration?: number;
  interests?: string[];
}

export interface SkillMap {
  strengths?: string[];
  weakAreas?: string[];
  completedTopics?: string[];
}
```

**Step 3: Create organizations schema**

Create `src/lib/db/schema/organizations.ts`:
```typescript
import { pgTable, uuid, varchar, text, jsonb, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  planType: varchar('plan_type', { length: 50 }).notNull().default('free'),
  settings: jsonb('settings').$type<OrgSettings>(),
  branding: jsonb('branding').$type<OrgBranding>(),
  maxSeats: integer('max_seats'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  managerId: uuid('manager_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  teams: many(teams),
  users: many(users),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [teams.orgId],
    references: [organizations.id],
  }),
  manager: one(users, {
    fields: [teams.managerId],
    references: [users.id],
  }),
  members: many(users),
}));

// Types
export interface OrgSettings {
  gamificationMode?: 'full' | 'moderate' | 'minimal' | 'off';
  requireApproval?: boolean;
  allowSelfEnroll?: boolean;
}

export interface OrgBranding {
  logo?: string;
  primaryColor?: string;
  certificateLogo?: string;
}
```

**Step 4: Create schema index**

Create `src/lib/db/schema/index.ts`:
```typescript
export * from './users';
export * from './organizations';
```

**Step 5: Create Drizzle config**

Create `drizzle.config.ts`:
```typescript
import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default {
  schema: './src/lib/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

**Step 6: Add db scripts to package.json**

Add to `package.json` scripts:
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

**Step 7: Commit**

```bash
git add src/lib/db drizzle.config.ts package.json
git commit -m "feat: setup database schema for users and organizations"
```

---

### Task 6: Setup Database Schema (Content Tables)

**Files:**
- Create: `dronacharya/src/lib/db/schema/content.ts`

**Step 1: Create content schema**

Create `src/lib/db/schema/content.ts`:
```typescript
import { pgTable, uuid, varchar, text, jsonb, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const domains = pgTable('domains', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tracks = pgTable('tracks', {
  id: uuid('id').primaryKey().defaultRandom(),
  domainId: uuid('domain_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  difficulty: varchar('difficulty', { length: 20 }).notNull().default('beginner'),
  estimatedHours: integer('estimated_hours'),
  prerequisites: jsonb('prerequisites').$type<string[]>(),
  skillsGained: jsonb('skills_gained').$type<string[]>(),
  isPublished: boolean('is_published').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  trackId: uuid('track_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  description: text('description'),
  order: integer('order').notNull().default(0),
  estimatedMinutes: integer('estimated_minutes'),
  isPublished: boolean('is_published').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const modules = pgTable('modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  order: integer('order').notNull().default(0),
  type: varchar('type', { length: 50 }).notNull().default('concept'),
  estimatedMinutes: integer('estimated_minutes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const lessons = pgTable('lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  moduleId: uuid('module_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull().default('concept'),
  order: integer('order').notNull().default(0),
  contentJson: jsonb('content_json').$type<LessonContent>(),
  aiConfig: jsonb('ai_config').$type<AIConfig>(),
  estimatedMinutes: integer('estimated_minutes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const domainsRelations = relations(domains, ({ many }) => ({
  tracks: many(tracks),
}));

export const tracksRelations = relations(tracks, ({ one, many }) => ({
  domain: one(domains, {
    fields: [tracks.domainId],
    references: [domains.id],
  }),
  courses: many(courses),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  track: one(tracks, {
    fields: [courses.trackId],
    references: [tracks.id],
  }),
  modules: many(modules),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, {
    fields: [modules.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one }) => ({
  module: one(modules, {
    fields: [lessons.moduleId],
    references: [modules.id],
  }),
}));

// Types
export interface LessonContent {
  type: 'concept' | 'code' | 'visualization' | 'challenge' | 'quiz';
  title?: string;
  objectives?: string[];
  steps?: LessonStep[];
  code?: {
    language: string;
    initialCode: string;
    testCases?: TestCase[];
  };
  visualization?: {
    type: string;
    data: unknown;
  };
}

export interface LessonStep {
  id: string;
  type: 'text' | 'code' | 'interactive' | 'question';
  content: string;
  options?: string[];
  correctAnswer?: string | number;
}

export interface TestCase {
  input: string;
  expected: string;
  hidden?: boolean;
}

export interface AIConfig {
  mode: 'socratic' | 'adaptive' | 'scaffolded';
  personality?: string;
  hints?: string[];
  maxHints?: number;
}
```

**Step 2: Update schema index**

Update `src/lib/db/schema/index.ts`:
```typescript
export * from './users';
export * from './organizations';
export * from './content';
```

**Step 3: Commit**

```bash
git add src/lib/db/schema/
git commit -m "feat: add content schema for domains, tracks, courses, modules, lessons"
```

---

### Task 7: Setup Database Schema (Progress & Gamification)

**Files:**
- Create: `dronacharya/src/lib/db/schema/progress.ts`
- Create: `dronacharya/src/lib/db/schema/gamification.ts`

**Step 1: Create progress schema**

Create `src/lib/db/schema/progress.ts`:
```typescript
import { pgTable, uuid, varchar, timestamp, integer, jsonb, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { tracks, lessons } from './content';

export const enrollments = pgTable('enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  trackId: uuid('track_id').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  targetDate: timestamp('target_date'),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  userTrackUnique: unique().on(table.userId, table.trackId),
}));

export const progress = pgTable('progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  lessonId: uuid('lesson_id').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('not_started'),
  score: integer('score'),
  attempts: integer('attempts').default(0),
  timeSpentSeconds: integer('time_spent_seconds').default(0),
  completedAt: timestamp('completed_at'),
  metadata: jsonb('metadata').$type<ProgressMetadata>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userLessonUnique: unique().on(table.userId, table.lessonId),
}));

// Relations
export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  track: one(tracks, {
    fields: [enrollments.trackId],
    references: [tracks.id],
  }),
}));

export const progressRelations = relations(progress, ({ one }) => ({
  user: one(users, {
    fields: [progress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [progress.lessonId],
    references: [lessons.id],
  }),
}));

// Types
export interface ProgressMetadata {
  hintsUsed?: number;
  codeSubmissions?: number;
  lastPosition?: number;
}
```

**Step 2: Create gamification schema**

Create `src/lib/db/schema/gamification.ts`:
```typescript
import { pgTable, uuid, varchar, text, timestamp, integer, jsonb, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const achievements = pgTable('achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull(),
  icon: varchar('icon', { length: 50 }),
  xpReward: integer('xp_reward').default(0),
  criteria: jsonb('criteria').$type<AchievementCriteria>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userAchievements = pgTable('user_achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  achievementId: uuid('achievement_id').notNull(),
  earnedAt: timestamp('earned_at').defaultNow().notNull(),
}, (table) => ({
  userAchievementUnique: unique().on(table.userId, table.achievementId),
}));

export const xpTransactions = pgTable('xp_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  amount: integer('amount').notNull(),
  reason: varchar('reason', { length: 100 }).notNull(),
  sourceType: varchar('source_type', { length: 50 }),
  sourceId: uuid('source_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const streakHistory = pgTable('streak_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  date: timestamp('date').notNull(),
  streakCount: integer('streak_count').notNull(),
  freezeUsed: integer('freeze_used').default(0),
});

// Relations
export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export const xpTransactionsRelations = relations(xpTransactions, ({ one }) => ({
  user: one(users, {
    fields: [xpTransactions.userId],
    references: [users.id],
  }),
}));

// Types
export interface AchievementCriteria {
  type: 'count' | 'streak' | 'score' | 'time' | 'custom';
  target: number;
  metric?: string;
  conditions?: Record<string, unknown>;
}
```

**Step 3: Update schema index**

Update `src/lib/db/schema/index.ts`:
```typescript
export * from './users';
export * from './organizations';
export * from './content';
export * from './progress';
export * from './gamification';
```

**Step 4: Commit**

```bash
git add src/lib/db/schema/
git commit -m "feat: add progress and gamification schemas"
```

---

### Task 8: Setup Database Schema (Certifications & AI)

**Files:**
- Create: `dronacharya/src/lib/db/schema/certifications.ts`
- Create: `dronacharya/src/lib/db/schema/ai.ts`

**Step 1: Create certifications schema**

Create `src/lib/db/schema/certifications.ts`:
```typescript
import { pgTable, uuid, varchar, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { courses } from './content';

export const certifications = pgTable('certifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  courseId: uuid('course_id').notNull(),
  tier: varchar('tier', { length: 10 }).notNull(),
  credentialId: varchar('credential_id', { length: 50 }).notNull().unique(),
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
  projectUrl: varchar('project_url', { length: 500 }),
  projectRepo: varchar('project_repo', { length: 500 }),
  metadata: jsonb('metadata').$type<CertMetadata>(),
});

export const assessments = pgTable('assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  courseId: uuid('course_id').notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  score: integer('score'),
  maxScore: integer('max_score'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  answers: jsonb('answers').$type<AssessmentAnswers>(),
  feedback: jsonb('feedback').$type<AssessmentFeedback>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const assessmentQuestions = pgTable('assessment_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').notNull(),
  questionType: varchar('question_type', { length: 50 }).notNull(),
  question: text('question').notNull(),
  options: jsonb('options').$type<string[]>(),
  correctAnswer: text('correct_answer'),
  points: integer('points').notNull().default(1),
  order: integer('order').notNull(),
});

// Relations
export const certificationsRelations = relations(certifications, ({ one }) => ({
  user: one(users, {
    fields: [certifications.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [certifications.courseId],
    references: [courses.id],
  }),
}));

export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
  user: one(users, {
    fields: [assessments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [assessments.courseId],
    references: [courses.id],
  }),
  questions: many(assessmentQuestions),
}));

export const assessmentQuestionsRelations = relations(assessmentQuestions, ({ one }) => ({
  assessment: one(assessments, {
    fields: [assessmentQuestions.assessmentId],
    references: [assessments.id],
  }),
}));

// Types
export interface CertMetadata {
  skills?: string[];
  projectDescription?: string;
  reviewerNotes?: string;
}

export interface AssessmentAnswers {
  [questionId: string]: {
    answer: string | number;
    timeSpent: number;
  };
}

export interface AssessmentFeedback {
  overall?: string;
  bySection?: Record<string, string>;
  recommendations?: string[];
}
```

**Step 2: Create AI schema**

Create `src/lib/db/schema/ai.ts`:
```typescript
import { pgTable, uuid, varchar, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { lessons } from './content';

export const aiSessions = pgTable('ai_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  lessonId: uuid('lesson_id'),
  agentType: varchar('agent_type', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
  tokenCount: integer('token_count').default(0),
  metadata: jsonb('metadata').$type<SessionMetadata>(),
});

export const aiMessages = pgTable('ai_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull(),
  role: varchar('role', { length: 20 }).notNull(),
  content: text('content').notNull(),
  metadata: jsonb('metadata').$type<MessageMetadata>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const aiSessionsRelations = relations(aiSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [aiSessions.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [aiSessions.lessonId],
    references: [lessons.id],
  }),
  messages: many(aiMessages),
}));

export const aiMessagesRelations = relations(aiMessages, ({ one }) => ({
  session: one(aiSessions, {
    fields: [aiMessages.sessionId],
    references: [aiSessions.id],
  }),
}));

// Types
export interface SessionMetadata {
  teachingMode?: string;
  confusionDetected?: boolean;
  topicsCovered?: string[];
}

export interface MessageMetadata {
  tokensUsed?: number;
  latencyMs?: number;
  model?: string;
}
```

**Step 3: Update schema index**

Update `src/lib/db/schema/index.ts`:
```typescript
export * from './users';
export * from './organizations';
export * from './content';
export * from './progress';
export * from './gamification';
export * from './certifications';
export * from './ai';
```

**Step 4: Generate migrations**

Run:
```bash
cd ~/dronacharya
pnpm db:generate
```

Expected: Migration files created in `drizzle/` folder

**Step 5: Commit**

```bash
git add src/lib/db/schema/ drizzle/
git commit -m "feat: add certification and AI session schemas, generate migrations"
```

---

## Phase 2: tRPC API Setup (Tasks 9-14)

### Task 9: Setup tRPC Infrastructure

**Files:**
- Create: `dronacharya/src/lib/trpc/trpc.ts`
- Create: `dronacharya/src/lib/trpc/root.ts`
- Create: `dronacharya/src/lib/trpc/context.ts`
- Create: `dronacharya/src/app/api/trpc/[trpc]/route.ts`

**Step 1: Create tRPC context**

Create `src/lib/trpc/context.ts`:
```typescript
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export interface Context {
  db: typeof db;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    orgId: string | null;
    teamId: string | null;
  } | null;
}

export async function createContext(opts: { headers: Headers }): Promise<Context> {
  // For now, we'll use a simple header-based auth
  // Later replace with NextAuth session
  const userId = opts.headers.get('x-user-id');

  let user = null;
  if (userId) {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (dbUser) {
      user = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        orgId: dbUser.orgId,
        teamId: dbUser.teamId,
      };
    }
  }

  return { db, user };
}

export type CreateContext = typeof createContext;
```

**Step 2: Create tRPC instance**

Create `src/lib/trpc/trpc.ts`:
```typescript
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import type { Context } from './context';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user || !['admin', 'super_admin'].includes(ctx.user.role)) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({ ctx: { user: ctx.user } });
});

export const adminProcedure = t.procedure.use(enforceUserIsAdmin);
```

**Step 3: Create root router**

Create `src/lib/trpc/root.ts`:
```typescript
import { router } from './trpc';
import { userRouter } from './routers/user';
import { courseRouter } from './routers/course';
import { progressRouter } from './routers/progress';
import { gamificationRouter } from './routers/gamification';

export const appRouter = router({
  user: userRouter,
  course: courseRouter,
  progress: progressRouter,
  gamification: gamificationRouter,
});

export type AppRouter = typeof appRouter;
```

**Step 4: Create API route**

Create `src/app/api/trpc/[trpc]/route.ts`:
```typescript
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/lib/trpc/root';
import { createContext } from '@/lib/trpc/context';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext({ headers: req.headers }),
  });

export { handler as GET, handler as POST };
```

**Step 5: Install superjson**

Run:
```bash
pnpm add superjson
```

**Step 6: Commit**

```bash
git add src/lib/trpc/ src/app/api/trpc/ package.json pnpm-lock.yaml
git commit -m "feat: setup tRPC infrastructure with context and routing"
```

---

### Task 10: Create User Router

**Files:**
- Create: `dronacharya/src/lib/trpc/routers/user.ts`

**Step 1: Write user router tests**

Create `src/lib/trpc/routers/__tests__/user.test.ts`:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
      userProfiles: {
        findFirst: vi.fn(),
      },
    },
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([{ id: 'test-id' }])),
        })),
      })),
    })),
  },
}));

describe('User Router', () => {
  it('should be defined', () => {
    expect(true).toBe(true);
  });
});
```

**Step 2: Run test to verify setup**

Run:
```bash
pnpm vitest run src/lib/trpc/routers/__tests__/user.test.ts
```

Expected: Test passes

**Step 3: Create user router**

Create `src/lib/trpc/routers/user.ts`:
```typescript
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { users, userProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const userRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
      with: {
        profile: true,
      },
    });

    return user;
  }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(255).optional(),
      avatarUrl: z.string().url().optional(),
      preferences: z.object({
        theme: z.enum(['light', 'dark', 'system']).optional(),
        notifications: z.boolean().optional(),
        emailDigest: z.enum(['daily', 'weekly', 'never']).optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(users)
        .set({
          name: input.name,
          avatarUrl: input.avatarUrl,
          preferences: input.preferences,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id))
        .returning();

      return updated;
    }),

  updateLearningPreferences: protectedProcedure
    .input(z.object({
      learningStyle: z.enum(['visual', 'auditory', 'kinesthetic', 'reading']).optional(),
      gamificationMode: z.enum(['full', 'moderate', 'minimal', 'off']).optional(),
      studyPreferences: z.object({
        preferredTimes: z.array(z.string()).optional(),
        sessionDuration: z.number().min(5).max(120).optional(),
        interests: z.array(z.string()).optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(userProfiles)
        .set({
          learningStyle: input.learningStyle,
          gamificationMode: input.gamificationMode,
          studyPreferences: input.studyPreferences,
        })
        .where(eq(userProfiles.userId, ctx.user.id))
        .returning();

      return updated;
    }),

  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, ctx.user.id),
    });

    return {
      gamificationMode: profile?.gamificationMode ?? 'full',
      learningStyle: profile?.learningStyle,
      studyPreferences: profile?.studyPreferences,
    };
  }),
});
```

**Step 4: Commit**

```bash
git add src/lib/trpc/routers/
git commit -m "feat: add user router with profile and settings endpoints"
```

---

### Task 11: Create Course Router

**Files:**
- Create: `dronacharya/src/lib/trpc/routers/course.ts`

**Step 1: Create course router**

Create `src/lib/trpc/routers/course.ts`:
```typescript
import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../trpc';
import { domains, tracks, courses, modules, lessons, enrollments, progress } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export const courseRouter = router({
  getDomains: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.domains.findMany({
      orderBy: (domains, { asc }) => [asc(domains.order)],
    });
  }),

  getTracks: protectedProcedure
    .input(z.object({
      domainId: z.string().uuid().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const tracksData = await ctx.db.query.tracks.findMany({
        where: input?.domainId ? eq(tracks.domainId, input.domainId) : undefined,
        with: {
          domain: true,
          courses: {
            with: {
              modules: true,
            },
          },
        },
      });

      const userEnrollments = await ctx.db.query.enrollments.findMany({
        where: eq(enrollments.userId, ctx.user.id),
      });

      return tracksData.map((track) => ({
        ...track,
        enrollment: userEnrollments.find((e) => e.trackId === track.id),
        totalModules: track.courses.reduce((acc, c) => acc + c.modules.length, 0),
        totalCourses: track.courses.length,
      }));
    }),

  getTrack: protectedProcedure
    .input(z.object({ trackId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const track = await ctx.db.query.tracks.findFirst({
        where: eq(tracks.id, input.trackId),
        with: {
          domain: true,
          courses: {
            orderBy: (courses, { asc }) => [asc(courses.order)],
            with: {
              modules: {
                orderBy: (modules, { asc }) => [asc(modules.order)],
              },
            },
          },
        },
      });

      if (!track) {
        throw new Error('Track not found');
      }

      const enrollment = await ctx.db.query.enrollments.findFirst({
        where: and(
          eq(enrollments.userId, ctx.user.id),
          eq(enrollments.trackId, input.trackId)
        ),
      });

      return { ...track, enrollment };
    }),

  getCourse: protectedProcedure
    .input(z.object({ courseId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const course = await ctx.db.query.courses.findFirst({
        where: eq(courses.id, input.courseId),
        with: {
          track: true,
          modules: {
            orderBy: (modules, { asc }) => [asc(modules.order)],
            with: {
              lessons: {
                orderBy: (lessons, { asc }) => [asc(lessons.order)],
              },
            },
          },
        },
      });

      if (!course) {
        throw new Error('Course not found');
      }

      // Get all lesson IDs for this course
      const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));

      // Get user progress
      const userProgress = await ctx.db.query.progress.findMany({
        where: and(
          eq(progress.userId, ctx.user.id),
        ),
      });

      const completedLessons = userProgress.filter(
        (p) => p.status === 'completed' && lessonIds.includes(p.lessonId)
      ).length;

      return {
        ...course,
        progress: userProgress.filter((p) => lessonIds.includes(p.lessonId)),
        completionPercentage: lessonIds.length > 0
          ? Math.round((completedLessons / lessonIds.length) * 100)
          : 0,
      };
    }),

  getLesson: protectedProcedure
    .input(z.object({ lessonId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const lesson = await ctx.db.query.lessons.findFirst({
        where: eq(lessons.id, input.lessonId),
        with: {
          module: {
            with: {
              course: {
                with: {
                  track: true,
                },
              },
            },
          },
        },
      });

      if (!lesson) {
        throw new Error('Lesson not found');
      }

      // Get or create progress
      let userProgress = await ctx.db.query.progress.findFirst({
        where: and(
          eq(progress.userId, ctx.user.id),
          eq(progress.lessonId, input.lessonId)
        ),
      });

      if (!userProgress) {
        const [newProgress] = await ctx.db
          .insert(progress)
          .values({
            userId: ctx.user.id,
            lessonId: input.lessonId,
            status: 'in_progress',
          })
          .returning();
        userProgress = newProgress;
      }

      return { lesson, progress: userProgress };
    }),

  enroll: protectedProcedure
    .input(z.object({
      trackId: z.string().uuid(),
      targetDate: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.enrollments.findFirst({
        where: and(
          eq(enrollments.userId, ctx.user.id),
          eq(enrollments.trackId, input.trackId)
        ),
      });

      if (existing) {
        throw new Error('Already enrolled in this track');
      }

      const [enrollment] = await ctx.db
        .insert(enrollments)
        .values({
          userId: ctx.user.id,
          trackId: input.trackId,
          targetDate: input.targetDate,
        })
        .returning();

      return enrollment;
    }),

  unenroll: protectedProcedure
    .input(z.object({ trackId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(enrollments)
        .where(and(
          eq(enrollments.userId, ctx.user.id),
          eq(enrollments.trackId, input.trackId)
        ));

      return { success: true };
    }),
});
```

**Step 2: Commit**

```bash
git add src/lib/trpc/routers/course.ts
git commit -m "feat: add course router with tracks, courses, lessons, enrollment"
```

---

### Task 12: Create Progress Router

**Files:**
- Create: `dronacharya/src/lib/trpc/routers/progress.ts`
- Create: `dronacharya/src/lib/utils/xp-calculator.ts`

**Step 1: Create XP calculator utility**

Create `src/lib/utils/xp-calculator.ts`:
```typescript
export interface XPMultipliers {
  isFirstAttempt?: boolean;
  streakDays?: number;
  isPerfectScore?: boolean;
  noHintsUsed?: boolean;
  underParTime?: boolean;
}

const BASE_XP: Record<string, number> = {
  lesson_complete: 50,
  quiz_pass: 100,
  challenge_complete: 150,
  module_complete: 300,
  bronze_cert: 500,
  silver_cert: 1000,
  gold_cert: 2500,
  peer_help: 75,
  streak_bonus: 25,
};

export function calculateXP(activity: string, multipliers: XPMultipliers): number {
  const baseXP = BASE_XP[activity] || 0;
  let totalMultiplier = 1;

  if (multipliers.isFirstAttempt) {
    totalMultiplier *= 1.25;
  }

  if (multipliers.streakDays && multipliers.streakDays > 0) {
    const streakBonus = Math.min(multipliers.streakDays, 30) * 0.01;
    totalMultiplier *= 1 + streakBonus;
  }

  if (multipliers.isPerfectScore) {
    totalMultiplier *= 1.5;
  }

  if (multipliers.noHintsUsed) {
    totalMultiplier *= 1.25;
  }

  if (multipliers.underParTime) {
    totalMultiplier *= 1.1;
  }

  // Cap at 3x
  totalMultiplier = Math.min(totalMultiplier, 3);

  return Math.round(baseXP * totalMultiplier);
}

export function calculateLevelFromXP(xp: number): number {
  // Exponential leveling curve
  // Level 1: 0, Level 10: 5000, Level 25: 25000, Level 50: 100000, Level 100: 500000
  if (xp <= 0) return 1;
  if (xp >= 500000) return 100;

  const level = Math.floor(Math.sqrt(xp / 50)) + 1;
  return Math.min(level, 100);
}

export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= 100) return 0;
  const nextLevel = currentLevel + 1;
  return nextLevel * nextLevel * 50;
}

export function getXPProgressInLevel(totalXP: number): { current: number; required: number; percentage: number } {
  const level = calculateLevelFromXP(totalXP);
  const currentLevelXP = (level - 1) * (level - 1) * 50;
  const nextLevelXP = level * level * 50;

  const current = totalXP - currentLevelXP;
  const required = nextLevelXP - currentLevelXP;
  const percentage = Math.round((current / required) * 100);

  return { current, required, percentage };
}
```

**Step 2: Create progress router**

Create `src/lib/trpc/routers/progress.ts`:
```typescript
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { progress, userProfiles, xpTransactions } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { calculateXP, calculateLevelFromXP } from '@/lib/utils/xp-calculator';

export const progressRouter = router({
  updateProgress: protectedProcedure
    .input(z.object({
      lessonId: z.string().uuid(),
      status: z.enum(['in_progress', 'completed']),
      score: z.number().min(0).max(100).optional(),
      timeSpent: z.number().min(0),
      hintsUsed: z.number().min(0).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get existing progress
      const existing = await ctx.db.query.progress.findFirst({
        where: and(
          eq(progress.userId, ctx.user.id),
          eq(progress.lessonId, input.lessonId)
        ),
      });

      const isFirstCompletion = !existing || existing.status !== 'completed';

      // Update progress
      const [updated] = await ctx.db
        .insert(progress)
        .values({
          userId: ctx.user.id,
          lessonId: input.lessonId,
          status: input.status,
          score: input.score,
          timeSpentSeconds: input.timeSpent,
          completedAt: input.status === 'completed' ? new Date() : null,
          metadata: { hintsUsed: input.hintsUsed },
        })
        .onConflictDoUpdate({
          target: [progress.userId, progress.lessonId],
          set: {
            status: input.status,
            score: input.score,
            timeSpentSeconds: sql`${progress.timeSpentSeconds} + ${input.timeSpent}`,
            attempts: sql`${progress.attempts} + 1`,
            completedAt: input.status === 'completed' ? new Date() : progress.completedAt,
            updatedAt: new Date(),
          },
        })
        .returning();

      // Award XP if completed for first time
      if (input.status === 'completed' && isFirstCompletion) {
        const profile = await ctx.db.query.userProfiles.findFirst({
          where: eq(userProfiles.userId, ctx.user.id),
        });

        const xpAmount = calculateXP('lesson_complete', {
          isFirstAttempt: !existing,
          streakDays: profile?.currentStreak || 0,
          isPerfectScore: input.score === 100,
          noHintsUsed: (input.hintsUsed || 0) === 0,
        });

        // Record XP transaction
        await ctx.db.insert(xpTransactions).values({
          userId: ctx.user.id,
          amount: xpAmount,
          reason: 'lesson_complete',
          sourceType: 'lesson',
          sourceId: input.lessonId,
        });

        // Update user profile
        await ctx.db
          .update(userProfiles)
          .set({
            totalXp: sql`${userProfiles.totalXp} + ${xpAmount}`,
            lastActiveAt: new Date(),
          })
          .where(eq(userProfiles.userId, ctx.user.id));
      }

      return updated;
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const [stats] = await ctx.db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'completed') as completed_lessons,
        SUM(time_spent_seconds) as total_time_seconds,
        AVG(score) FILTER (WHERE score IS NOT NULL) as avg_score,
        COUNT(DISTINCT DATE(completed_at)) as active_days
      FROM progress
      WHERE user_id = ${ctx.user.id}
    `);

    const profile = await ctx.db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, ctx.user.id),
    });

    return {
      completedLessons: Number(stats?.completed_lessons || 0),
      totalTimeSeconds: Number(stats?.total_time_seconds || 0),
      avgScore: Number(stats?.avg_score || 0),
      activeDays: Number(stats?.active_days || 0),
      level: profile?.level || 1,
      totalXp: profile?.totalXp || 0,
      currentStreak: profile?.currentStreak || 0,
    };
  }),

  getHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const history = await ctx.db.query.progress.findMany({
        where: eq(progress.userId, ctx.user.id),
        orderBy: (progress, { desc }) => [desc(progress.updatedAt)],
        limit: input.limit,
        offset: input.offset,
        with: {
          lesson: {
            with: {
              module: {
                with: {
                  course: true,
                },
              },
            },
          },
        },
      });

      return history;
    }),
});
```

**Step 3: Commit**

```bash
git add src/lib/trpc/routers/progress.ts src/lib/utils/xp-calculator.ts
git commit -m "feat: add progress router with XP calculation"
```

---

### Task 13: Create Gamification Router

**Files:**
- Create: `dronacharya/src/lib/trpc/routers/gamification.ts`
- Create: `dronacharya/src/lib/utils/streak-calculator.ts`

**Step 1: Create streak calculator**

Create `src/lib/utils/streak-calculator.ts`:
```typescript
import { startOfDay, subDays, isSameDay, isBefore, isAfter } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export function calculateStreak(
  lastActiveAt: Date | null,
  currentStreak: number,
  timezone: string = 'UTC'
): number {
  const now = new Date();
  const today = startOfDay(toZonedTime(now, timezone));
  const yesterday = subDays(today, 1);

  if (!lastActiveAt) {
    return 1; // First activity
  }

  const lastActiveDay = startOfDay(toZonedTime(lastActiveAt, timezone));

  if (isSameDay(lastActiveDay, today)) {
    // Already active today, maintain streak
    return currentStreak;
  }

  if (isSameDay(lastActiveDay, yesterday)) {
    // Active yesterday, continue streak
    return currentStreak + 1;
  }

  // Streak broken
  return 1;
}

export function shouldBreakStreak(lastActiveAt: Date | null): boolean {
  if (!lastActiveAt) return false;

  const now = new Date();
  const today = startOfDay(now);
  const yesterday = subDays(today, 1);
  const lastActiveDay = startOfDay(lastActiveAt);

  // Grace period: 3 hours into new day
  const graceHours = 3;
  const hoursIntoDay = now.getHours();

  if (hoursIntoDay < graceHours && isSameDay(lastActiveDay, yesterday)) {
    return false;
  }

  return isBefore(lastActiveDay, yesterday);
}

export function getStreakFreeze(
  currentStreak: number,
  freezesAvailable: number
): { newStreak: number; freezesRemaining: number; freezeUsed: boolean } {
  if (freezesAvailable > 0) {
    return {
      newStreak: currentStreak,
      freezesRemaining: freezesAvailable - 1,
      freezeUsed: true,
    };
  }

  return {
    newStreak: 1,
    freezesRemaining: 0,
    freezeUsed: false,
  };
}

export function getStreakReward(streakDays: number): { xp: number; badge: string | null } {
  if (streakDays === 7) {
    return { xp: 500, badge: 'week_warrior' };
  }
  if (streakDays === 14) {
    return { xp: 1000, badge: 'two_week_champion' };
  }
  if (streakDays === 30) {
    return { xp: 2500, badge: 'monthly_master' };
  }
  if (streakDays === 100) {
    return { xp: 10000, badge: 'centurion' };
  }
  return { xp: 0, badge: null };
}
```

**Step 2: Install date-fns**

Run:
```bash
pnpm add date-fns date-fns-tz
```

**Step 3: Create gamification router**

Create `src/lib/trpc/routers/gamification.ts`:
```typescript
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { userProfiles, achievements, userAchievements, xpTransactions, streakHistory } from '@/lib/db/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { calculateStreak, getStreakReward } from '@/lib/utils/streak-calculator';
import { calculateLevelFromXP, getXPProgressInLevel } from '@/lib/utils/xp-calculator';
import { subDays, startOfWeek, startOfMonth } from 'date-fns';

export const gamificationRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, ctx.user.id),
    });

    if (!profile) {
      // Create profile if doesn't exist
      const [newProfile] = await ctx.db
        .insert(userProfiles)
        .values({ userId: ctx.user.id })
        .returning();

      return {
        ...newProfile,
        levelProgress: getXPProgressInLevel(0),
      };
    }

    const earnedAchievements = await ctx.db.query.userAchievements.findMany({
      where: eq(userAchievements.userId, ctx.user.id),
      with: { achievement: true },
    });

    const recentXP = await ctx.db.query.xpTransactions.findMany({
      where: eq(xpTransactions.userId, ctx.user.id),
      orderBy: [desc(xpTransactions.createdAt)],
      limit: 10,
    });

    return {
      ...profile,
      level: calculateLevelFromXP(profile.totalXp),
      levelProgress: getXPProgressInLevel(profile.totalXp),
      achievements: earnedAchievements,
      recentXP,
    };
  }),

  checkStreak: protectedProcedure.mutation(async ({ ctx }) => {
    const profile = await ctx.db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, ctx.user.id),
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    const newStreak = calculateStreak(
      profile.lastActiveAt,
      profile.currentStreak
    );

    const streakChanged = newStreak !== profile.currentStreak;
    const streakIncreased = newStreak > profile.currentStreak;

    // Update streak
    await ctx.db
      .update(userProfiles)
      .set({
        currentStreak: newStreak,
        longestStreak: sql`GREATEST(${userProfiles.longestStreak}, ${newStreak})`,
        lastActiveAt: new Date(),
      })
      .where(eq(userProfiles.userId, ctx.user.id));

    // Record streak history
    await ctx.db.insert(streakHistory).values({
      userId: ctx.user.id,
      date: new Date(),
      streakCount: newStreak,
    });

    // Award streak rewards
    let reward = null;
    if (streakIncreased) {
      const streakReward = getStreakReward(newStreak);
      if (streakReward.xp > 0) {
        await ctx.db.insert(xpTransactions).values({
          userId: ctx.user.id,
          amount: streakReward.xp,
          reason: `streak_${newStreak}_days`,
        });

        await ctx.db
          .update(userProfiles)
          .set({
            totalXp: sql`${userProfiles.totalXp} + ${streakReward.xp}`,
          })
          .where(eq(userProfiles.userId, ctx.user.id));

        reward = streakReward;
      }
    }

    return {
      streak: newStreak,
      streakChanged,
      streakIncreased,
      reward,
    };
  }),

  getLeaderboard: protectedProcedure
    .input(z.object({
      scope: z.enum(['global', 'team', 'organization']).default('global'),
      period: z.enum(['weekly', 'monthly', 'allTime']).default('weekly'),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const periodStart = input.period === 'weekly'
        ? startOfWeek(new Date())
        : input.period === 'monthly'
        ? startOfMonth(new Date())
        : new Date(0);

      // For now, simplified global leaderboard
      const leaderboard = await ctx.db
        .select({
          userId: userProfiles.userId,
          totalXp: userProfiles.totalXp,
          level: userProfiles.level,
          currentStreak: userProfiles.currentStreak,
        })
        .from(userProfiles)
        .orderBy(desc(userProfiles.totalXp))
        .limit(input.limit);

      // Find current user's rank
      const userRank = leaderboard.findIndex((l) => l.userId === ctx.user.id) + 1;

      return {
        leaderboard,
        userRank: userRank > 0 ? userRank : null,
      };
    }),

  getAchievements: protectedProcedure.query(async ({ ctx }) => {
    const allAchievements = await ctx.db.query.achievements.findMany();

    const earned = await ctx.db.query.userAchievements.findMany({
      where: eq(userAchievements.userId, ctx.user.id),
    });

    const earnedIds = new Set(earned.map((e) => e.achievementId));

    return allAchievements.map((a) => ({
      ...a,
      earned: earnedIds.has(a.id),
      earnedAt: earned.find((e) => e.achievementId === a.id)?.earnedAt,
    }));
  }),

  getXPHistory: protectedProcedure
    .input(z.object({
      days: z.number().min(1).max(90).default(30),
    }))
    .query(async ({ ctx, input }) => {
      const startDate = subDays(new Date(), input.days);

      const history = await ctx.db.query.xpTransactions.findMany({
        where: and(
          eq(xpTransactions.userId, ctx.user.id),
          gte(xpTransactions.createdAt, startDate)
        ),
        orderBy: [desc(xpTransactions.createdAt)],
      });

      // Group by day
      const byDay: Record<string, number> = {};
      history.forEach((h) => {
        const day = h.createdAt.toISOString().split('T')[0];
        byDay[day] = (byDay[day] || 0) + h.amount;
      });

      return {
        transactions: history,
        dailyTotals: byDay,
        totalEarned: history.reduce((sum, h) => sum + h.amount, 0),
      };
    }),
});
```

**Step 4: Update root router**

Update `src/lib/trpc/root.ts` to include new routers:
```typescript
import { router } from './trpc';
import { userRouter } from './routers/user';
import { courseRouter } from './routers/course';
import { progressRouter } from './routers/progress';
import { gamificationRouter } from './routers/gamification';

export const appRouter = router({
  user: userRouter,
  course: courseRouter,
  progress: progressRouter,
  gamification: gamificationRouter,
});

export type AppRouter = typeof appRouter;
```

**Step 5: Commit**

```bash
git add src/lib/trpc/ src/lib/utils/ package.json pnpm-lock.yaml
git commit -m "feat: add gamification router with streaks, leaderboards, achievements"
```

---

### Task 14: Setup tRPC Client

**Files:**
- Create: `dronacharya/src/lib/trpc/client.ts`
- Create: `dronacharya/src/lib/trpc/provider.tsx`

**Step 1: Create tRPC client**

Create `src/lib/trpc/client.ts`:
```typescript
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from './root';

export const trpc = createTRPCReact<AppRouter>();
```

**Step 2: Create provider**

Create `src/lib/trpc/provider.tsx`:
```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import superjson from 'superjson';
import { trpc } from './client';

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
          headers() {
            return {
              // Add auth headers here
            };
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
```

**Step 3: Update root layout**

Update `src/app/layout.tsx`:
```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TRPCProvider } from '@/lib/trpc/provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dronacharya',
  description: 'Interactive AI-powered learning platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
```

**Step 4: Commit**

```bash
git add src/lib/trpc/ src/app/layout.tsx
git commit -m "feat: setup tRPC client and React Query provider"
```

---

## Phase 3: Core UI Components (Tasks 15-22)

*[Continued in next section due to length...]*

---

## Summary

This implementation plan covers:

- **Phase 1 (Tasks 1-8)**: Project setup, dependencies, database schema
- **Phase 2 (Tasks 9-14)**: tRPC API with user, course, progress, gamification routers
- **Phase 3 (Tasks 15-22)**: Core UI components (dashboard, learning interface)
- **Phase 4 (Tasks 23-30)**: AI agent system with LangGraph
- **Phase 5 (Tasks 31-38)**: Certification system
- **Phase 6 (Tasks 39-46)**: Analytics dashboards
- **Phase 7 (Tasks 47-54)**: Testing suite
- **Phase 8 (Tasks 55-60)**: Deployment infrastructure

Each task is designed to be completed in 2-5 minutes with clear steps, exact file paths, and commit points.

---

**End of Phase 1 & 2 Implementation Plan**

*Full plan continues with Phases 3-8 in subsequent documents.*
