# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**Dronacharya** (द्रोणाचार्य) is an AI-powered learning platform with agentic workflows. Named after the legendary teacher from Mahabharata, it embodies the philosophy of "AI that teaches like a Guru."

Part of the **Margadeshaka** family (alongside Sakha).

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL with Drizzle ORM
- **AI/LLM**: LangChain (Anthropic Claude, OpenAI), LangGraph
- **Vector DB**: Qdrant
- **Auth**: NextAuth.js v5 (beta)
- **State**: Zustand, TanStack Query
- **API**: tRPC, Hono
- **Testing**: Vitest, Playwright, MSW

## Development Commands

```bash
# Development
pnpm dev              # Start Next.js dev server

# Build
pnpm build            # Production build
pnpm start            # Start production server

# Database
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema to database
pnpm db:studio        # Open Drizzle Studio

# Code Quality
pnpm lint             # Run ESLint
```

## Project Structure

```
dronacharya/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── page.tsx      # Dashboard
│   │   ├── courses/      # Course catalog & lessons
│   │   ├── achievements/ # Gamification achievements
│   │   ├── analytics/    # Learning analytics
│   │   ├── certifications/ # Certificates
│   │   ├── settings/     # User settings
│   │   ├── help/         # Help & FAQ
│   │   └── auth/         # Authentication pages
│   ├── components/       # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── layout/       # Header, Sidebar, MainLayout
│   │   ├── gamification/ # XP, Streak, Level displays
│   │   ├── learning/     # Course, Lesson components
│   │   └── ai/           # AI chat components
│   ├── lib/
│   │   ├── ai/           # AI agents and prompts
│   │   │   ├── agents/   # Tutor, Mentor, Assessor, etc.
│   │   │   └── prompts/  # System prompts for each agent
│   │   ├── trpc/         # tRPC routers
│   │   ├── db/           # Drizzle schema
│   │   └── auth/         # NextAuth configuration
│   └── stores/           # Zustand stores
├── public/               # Static assets
├── k8s/                  # Kubernetes manifests
├── terraform/            # Infrastructure as code
└── docs/                 # Documentation
    └── plans/            # Design and implementation plans
```

## AI Agents

Dronacharya uses 6 specialized AI agents:

| Agent | Role | Status |
|-------|------|--------|
| **Tutor** | Guided learning, Socratic questioning | ✅ Working |
| **Assessor** | Quiz generation, answer evaluation | ✅ Working |
| **Mentor** | Career guidance, motivation | ✅ Working |
| **Code Review** | Code analysis, best practices | 🟡 Partial |
| **Project Guide** | Portfolio project guidance | 🟡 Partial |
| **Quiz Generator** | RAG-based question generation | ❌ Pending |

## Learning Domains (Beta)

- **Python** - Fundamentals to Advanced
- **Data Science** - pandas, NumPy, visualization
- **AI/ML** - Machine learning foundations

## Gamification System

- **XP** - Earned from lessons, quizzes, streaks
- **Levels** - Progress through levels as XP accumulates
- **Streaks** - Daily learning streaks with multipliers
- **Achievements** - Unlockable badges for milestones
- **Leaderboards** - Compare progress with other learners

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...

# AI APIs
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...

# Vector DB
QDRANT_URL=...
QDRANT_API_KEY=...
```

## Brand Identity

- **Name**: Dronacharya (द्रोणाचार्य)
- **Tagline**: "AI that teaches like a Guru"
- **Colors**: Deep Indigo (#1e1b4b) + Saffron/Gold (#f59e0b)
- **Parent Company**: Margadeshaka

## Development Notes

- Uses pnpm as package manager
- Git worktrees for parallel development (`.worktrees/`)
- Kubernetes deployment configs in `k8s/`
- Terraform for Azure infrastructure
- Target deployment: Azure App Service + PostgreSQL
