# Dronacharya - Interactive Agent-Based LMS

## Design Document

**Date**: January 27, 2026
**Version**: 1.0
**Status**: Approved for Implementation

---

## Table of Contents

1. [Overview](#1-overview)
2. [System Architecture](#2-system-architecture)
3. [Tech Stack](#3-tech-stack)
4. [User Roles & Experience](#4-user-roles--experience)
5. [AI Agent System](#5-ai-agent-system)
6. [Course & Content Structure](#6-course--content-structure)
7. [Immersive Learning Interface](#7-immersive-learning-interface)
8. [Gamification & Rewards](#8-gamification--rewards)
9. [Certification System](#9-certification-system)
10. [Analytics & Reporting](#10-analytics--reporting)
11. [Database Schema](#11-database-schema)
12. [UI Components](#12-ui-components)
13. [API Design](#13-api-design)
14. [Testing Strategy](#14-testing-strategy)
15. [Deployment & Infrastructure](#15-deployment--infrastructure)

---

## 1. Overview

### 1.1 Vision

Dronacharya is an interactive, AI-driven Learning Management System that replaces passive video consumption with active AI-guided learning. Students don't watch someone code - they think through problems with an AI tutor that adapts to their understanding.

### 1.2 Core Philosophy

- **No Videos** - 100% interactive AI-driven content
- **Thinking-First** - AI guides discovery, not just delivers answers
- **Real-Time Adaptation** - Content difficulty adjusts mid-lesson
- **Production-Ready Projects** - Gold certifications require deployable work

### 1.3 Platform Pillars

1. **Multi-Agent AI Tutoring** - Specialized agents (Tutor, Assessor, Code Reviewer, Mentor, Project Guide) orchestrated for coherent learning
2. **Immersive Modules** - Full-screen interactive experiences with simulations, live coding, visualizations
3. **Adaptive Paths** - Structured tracks available, but AI personalizes based on goals and knowledge gaps
4. **Tiered Certification** - Bronze (completion) → Silver (assessment) → Gold (portfolio)
5. **Universal Audience** - Role-based experiences for students, professionals, self-learners, enterprises

### 1.4 Target Audiences

- **Students (K-12/College)** - Structured curriculum, academic focus
- **Working Professionals** - Career advancement, flexible scheduling
- **Self-learners/Hobbyists** - Interest-driven, exploratory learning
- **Enterprise/Corporate** - Team management, compliance tracking

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Web App   │ │ Mobile PWA  │ │  Admin UI   │ │ Enterprise  │           │
│  │  (Next.js)  │ │  (Next.js)  │ │  Dashboard  │ │   Portal    │           │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘           │
└─────────┼───────────────┼───────────────┼───────────────┼───────────────────┘
          │               │               │               │
          └───────────────┴───────┬───────┴───────────────┘
                                  │
┌─────────────────────────────────┼───────────────────────────────────────────┐
│                          API GATEWAY                                         │
│  ┌──────────────────────────────┴──────────────────────────────────┐        │
│  │                    Next.js + Hono + tRPC                         │        │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │        │
│  │  │  Auth   │ │ Courses │ │Progress │ │  Certs  │ │Analytics│   │        │
│  │  │ Router  │ │ Router  │ │ Router  │ │ Router  │ │ Router  │   │        │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │        │
│  └─────────────────────────────┬────────────────────────────────────┘        │
└────────────────────────────────┼────────────────────────────────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
┌───────┴───────┐  ┌─────────────┴─────────────┐  ┌──────┴───────┐
│   SERVICE     │  │      AI AGENT LAYER       │  │    DATA      │
│    LAYER      │  │                           │  │    LAYER     │
│               │  │  ┌─────────────────────┐  │  │              │
│ ┌───────────┐ │  │  │  ORCHESTRATOR AGENT │  │  │ ┌──────────┐ │
│ │  Course   │ │  │  │    (LangGraph)      │  │  │ │PostgreSQL│ │
│ │  Service  │ │  │  └──────────┬──────────┘  │  │ │   17     │ │
│ └───────────┘ │  │             │             │  │ └──────────┘ │
│ ┌───────────┐ │  │  ┌──────────┼──────────┐  │  │ ┌──────────┐ │
│ │  User     │ │  │  │          │          │  │  │ │  Redis   │ │
│ │  Service  │ │  │  ▼          ▼          ▼  │  │ │    8     │ │
│ └───────────┘ │  │ ┌────┐  ┌────────┐ ┌────┐│  │ └──────────┘ │
│ ┌───────────┐ │  │ │Tutor│  │Assessor│ │Code││  │ ┌──────────┐ │
│ │  Cert     │ │  │ │Agent│  │ Agent  │ │Rev ││  │ │  Qdrant  │ │
│ │  Service  │ │  │ └────┘  └────────┘ └────┘│  │ │ (Vector) │ │
│ └───────────┘ │  │ ┌────┐  ┌────────┐ ┌────┐│  │ └──────────┘ │
│ ┌───────────┐ │  │ │Mentor│ │Project │ │Quiz││  │ ┌──────────┐ │
│ │ Analytics │ │  │ │Agent│  │ Guide  │ │Gen ││  │ │   S3     │ │
│ │  Service  │ │  │ └────┘  └────────┘ └────┘│  │ │ (Assets) │ │
│ └───────────┘ │  │             │             │  │ └──────────┘ │
└───────────────┘  │  ┌──────────┴──────────┐  │  └──────────────┘
                   │  │    RAG Pipeline     │  │
                   │  │  (Course Content)   │  │
                   │  └─────────────────────┘  │
                   └───────────────────────────┘
```

### 2.2 Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| Edge-First | API routes at edge for low latency globally |
| Agent Isolation | Each AI agent is stateless, orchestrator manages context |
| Event-Driven | Progress updates via Redis pub/sub for real-time sync |
| RAG-Backed | All course content vectorized for accurate AI responses |

---

## 3. Tech Stack

### 3.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15 | App Router, Server Components, Turbopack |
| React | 19 | Server Components, Actions, use() hook |
| shadcn/ui | Latest | UI component library |
| Tailwind CSS | 4 | Styling with new CSS-first config |
| Framer Motion | 12 | Animations for immersive modules |
| TanStack Query | v5 | Server state management |
| Zustand | 5 | Client state management |
| React Hook Form + Zod | Latest | Forms and validation |

### 3.2 Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | 15 | Primary API layer |
| Hono | Latest | High-performance API routing |
| tRPC | v11 | End-to-end typesafe APIs |
| Drizzle ORM | Latest | TypeScript-first, edge-ready ORM |
| PostgreSQL | 17 | Primary database |
| Redis | 8 | Caching, sessions, real-time |
| Qdrant | Latest | Vector DB for RAG |

### 3.3 AI Infrastructure

| Technology | Purpose |
|------------|---------|
| Vercel AI SDK 4 | Streaming, multi-model support |
| LangGraph | Multi-agent orchestration |
| Claude 4 Opus/Sonnet | Primary LLM |
| OpenAI GPT-5 | Fallback/specialized tasks |
| Instructor | Structured outputs |

### 3.4 Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Kubernetes | Orchestration (cloud-agnostic) |
| Terraform/Pulumi | Infrastructure as Code |
| GitHub Actions | CI/CD |
| OpenTelemetry | Observability |
| Upstash | Serverless Redis/Kafka |

### 3.5 Testing

| Technology | Purpose |
|------------|---------|
| Vitest | Unit tests |
| Playwright | E2E tests |
| MSW 2 | API mocking |

---

## 4. User Roles & Experience

### 4.1 Role Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                        SUPER ADMIN                               │
│         (Platform owner, full system access)                     │
└─────────────────────────┬───────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│   ENTERPRISE  │ │    CONTENT    │ │   ANALYTICS   │
│     ADMIN     │ │    CREATOR    │ │    VIEWER     │
│ (Org manager) │ │(Course author)│ │  (Read-only)  │
└───────┬───────┘ └───────────────┘ └───────────────┘
        │
        ▼
┌───────────────┐
│  TEAM MANAGER │
│(Dept. lead)   │
└───────┬───────┘
        │
        ▼
┌───────────────────────────────────────────────────┐
│                    LEARNERS                        │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │ Student  │ │ Professional │ │ Self-Learner │  │
│  │(Academic)│ │  (Career)    │ │  (Hobby)     │  │
│  └──────────┘ └──────────────┘ └──────────────┘  │
└───────────────────────────────────────────────────┘
```

### 4.2 Experience by Role

| Feature | Student | Professional | Self-Learner | Enterprise |
|---------|---------|--------------|--------------|------------|
| Gamification | Full (XP, levels, avatars) | Light (badges, streaks) | Customizable | Configurable per org |
| Deadlines | Enforced | Self-set | None | Manager-set |
| Leaderboards | Class/School | Opt-in | Global opt-in | Team-based |
| Certificates | Academic format | LinkedIn-ready | Shareable | Company branded |
| Analytics | Personal + Parent view | Personal + Portfolio | Personal | Full hierarchy |
| AI Tone | Encouraging, patient | Direct, efficient | Adaptive | Org-configured |

### 4.3 Onboarding Flow

```
Sign Up → Role Select → Skill Assessment → Goal Setting → Learning Style → Personalized Path → Start Learning
```

- **Skill Assessment**: AI-driven diagnostic (10-15 min) that maps existing knowledge
- **Learning Style Detection**: Short interactive module identifies preferences

---

## 5. AI Agent System

### 5.1 Agent Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ORCHESTRATOR AGENT                               │
│  • Routes requests to appropriate specialist agent                       │
│  • Maintains conversation context & learning state                       │
│  • Decides when to switch teaching modes                                 │
│  • Tracks cognitive load and adjusts pacing                              │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
        ┌──────────┬──────────┬───┴───┬──────────┬──────────┐
        ▼          ▼          ▼       ▼          ▼          ▼
   ┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌─────────┐
   │  TUTOR  ││ASSESSOR ││  CODE   ││ MENTOR  ││ PROJECT ││  QUIZ   │
   │  AGENT  ││  AGENT  ││ REVIEW  ││  AGENT  ││  GUIDE  ││GENERATOR│
   └─────────┘└─────────┘└─────────┘└─────────┘└─────────┘└─────────┘
```

### 5.2 Agent Specifications

#### Tutor Agent
**Purpose**: Primary teaching, concept explanation, guided discovery

| Mode | Behavior |
|------|----------|
| Socratic | Asks probing questions, never gives direct answers |
| Adaptive | Explains concepts, detects confusion, simplifies |
| Scaffolded | Provides partial solutions, fills in as student progresses |

#### Assessor Agent
**Purpose**: Evaluate understanding, identify knowledge gaps
- Generates adaptive questions
- Provides detailed feedback
- Maps performance to skill graph

#### Code Review Agent
**Purpose**: Review student code, teach best practices
- Analyzes code for correctness, efficiency, style
- Explains issues without giving solutions directly
- Teaches debugging methodology

#### Mentor Agent
**Purpose**: Career guidance, motivation, long-term planning
- Tracks overall progress and goals
- Provides encouragement during struggles
- Connects skills to career outcomes

#### Project Guide Agent
**Purpose**: Guide through portfolio projects for Gold certification
- Breaks projects into milestones
- Reviews architecture decisions
- Evaluates final submissions

#### Quiz Generator Agent
**Purpose**: Create assessments on-demand
- Generates questions from course content (RAG)
- Creates varied formats: MCQ, code completion, debugging
- Produces edge cases and tricky scenarios

### 5.3 RAG Pipeline

All course content is vectorized and stored in Qdrant for:
- Accurate, curriculum-aligned AI responses
- Context-aware explanations
- Relevant code examples

---

## 6. Course & Content Structure

### 6.1 Content Hierarchy

```
DOMAINS → TRACKS → COURSES → MODULES → LESSONS
```

- **Domains**: Tech, Business, Creative, Data, Leadership
- **Tracks**: Complete learning paths (e.g., "Python Developer")
- **Courses**: Individual subjects (e.g., "Python Basics")
- **Modules**: 5-10 per course, ~30-60 min each
- **Lessons**: Concept, Hands-on, Practice, Quiz, Project Task

### 6.2 Initial Course Catalog

#### Technology Domain

| Track | Courses | Modules |
|-------|---------|---------|
| Python Developer | Python Basics, Data Structures, OOP, Testing, Async, Packaging | 45 |
| Web Development | HTML/CSS, JavaScript, TypeScript, React, Next.js, Node.js, APIs | 55 |
| Data Science | Statistics, Pandas, Visualization, SQL, Feature Engineering | 40 |
| AI/ML Engineer | ML Fundamentals, Deep Learning, NLP, Computer Vision, MLOps | 50 |
| Cloud & DevOps | Linux, Docker, Kubernetes, CI/CD, Terraform, AWS/Azure/GCP | 60 |
| Backend Engineering | System Design, Databases, Caching, Queues, Security | 45 |

#### Business & Leadership Domain

| Track | Courses | Modules |
|-------|---------|---------|
| Product Management | Discovery, Roadmaps, Metrics, Stakeholders, Agile | 35 |
| Leadership | Communication, Delegation, Feedback, Conflict, Strategy | 30 |
| Project Management | Planning, Risk, Scrum, Kanban, Tools | 25 |

### 6.3 Content Types per Lesson

| Type | Description | AI Role |
|------|-------------|---------|
| Concept Intro | AI explains with analogies, visuals | Tutor (Adaptive) |
| Guided Discovery | AI asks questions, student discovers | Tutor (Socratic) |
| Code Along | Split screen: AI guides, student types | Tutor (Scaffolded) |
| Sandbox Practice | Free coding with AI hints | Code Review Agent |
| Challenge | Timed problem, minimal AI help | Assessor Agent |
| Project Milestone | Build real feature, AI reviews | Project Guide |
| Reflection | AI asks what was learned | Mentor Agent |

---

## 7. Immersive Learning Interface

### 7.1 Module Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌─────┐  Course > Module > Lesson              ⚡ XP   [Settings] [Close]  │
│  │ Nav │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━●━━━━━━━  Progress Bar               │
│  └─────┘                                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                        ┌─────────────────────────┐                          │
│                        │    IMMERSIVE CANVAS     │                          │
│                        │                         │                          │
│                        │  • Visualizations       │                          │
│                        │  • Code Editor          │                          │
│                        │  • Simulations          │                          │
│                        │  • Interactive Diagrams │                          │
│                        └─────────────────────────┘                          │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ AI Tutor Panel                                                        │  │
│  │ [Chat Interface] [Quick Actions: Hint, Explain, Example]              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Canvas Modes

1. **Visualization Mode** - Interactive diagrams (memory, algorithms, data flow)
2. **Code Editor Mode** - Split view with live execution and AI assistance
3. **Simulation Mode** - Real-world scenarios (API requests, system behavior)
4. **Challenge Mode** - Timed coding challenges with test cases

### 7.3 AI Interaction Patterns

| Pattern | Trigger | Response |
|---------|---------|----------|
| Confusion Detection | Long pause, repeated errors | Offer simpler explanation |
| Encouragement | Correct answer | Brief celebration, advance |
| Guided Recovery | Wrong answer | Socratic questions |
| Adaptive Depth | Quick correct answers | Increase complexity |
| Check-in | Every 5-7 interactions | Verify understanding |

---

## 8. Gamification & Rewards

### 8.1 XP & Leveling

```
Level 1 (Novice) → Level 10 (Explorer) → Level 25 (Practitioner) → Level 50 (Expert) → Level 100 (Master)
0 XP              5,000 XP               25,000 XP                 100,000 XP          500,000 XP
```

### 8.2 XP Earning Activities

| Activity | Base XP | Multipliers |
|----------|---------|-------------|
| Complete lesson | 50 | +25% first attempt, +10% streak |
| Pass quiz (>80%) | 100 | +50% perfect score |
| Complete challenge | 150 | +100% no hints used |
| Finish module | 300 | +25% under par time |
| Earn Bronze cert | 500 | - |
| Pass Silver assessment | 1,000 | +50% first attempt |
| Complete Gold project | 2,500 | +100% exceptional review |

### 8.3 Achievement Categories

- **Mastery** - First Steps, Python Pro, Full Stack, ML Engineer
- **Consistency** - 7-Day Streak, 30-Day Streak, Early Bird
- **Thinking** - Bug Hunter, Code Reviewer, Optimizer
- **Achievement** - First Cert, Triple Gold, Completionist
- **Community** - Helper, Mentor, Top Contributor
- **Speed** - Speed Demon, Quick Learner, Challenge Ace

### 8.4 Adaptive Gamification Modes

| Mode | Features |
|------|----------|
| Full (Students) | XP, levels, leaderboards, avatars, sounds, animations |
| Moderate (Professionals) | XP, levels, streaks, badges (no sounds/animations) |
| Minimal (Enterprise) | Levels, streaks, badges only |
| Off | Disabled entirely |

---

## 9. Certification System

### 9.1 Tiered Model

| Tier | Requirement | Proves |
|------|-------------|--------|
| Bronze | Complete all modules, pass quizzes (70%) | Effort & Exposure |
| Silver | Pass proctored AI assessment (80%) | Knowledge & Understanding |
| Gold | Build & deploy real project, AI review approved | Ability to Deliver |

### 9.2 Silver Assessment Structure

| Section | Duration | Content |
|---------|----------|---------|
| Conceptual | 25 min | 20 MCQ, adaptive difficulty |
| Code Analysis | 20 min | 10 questions: predict output, find bugs |
| Coding Challenges | 45 min | Easy + Medium + Hard problems |
| System Design | 15 min | AI interview with follow-ups |

### 9.3 Gold Project Requirements

- Choose from predefined options or propose custom project
- Evaluation: Code Quality (25%), Functionality (30%), Testing (20%), Documentation (15%), Deployment (10%)
- Passing: 75% overall, no category below 60%

### 9.4 Certificate Features

- Unique credential ID with QR verification
- Public verification page
- LinkedIn integration
- Blockchain anchoring (optional for enterprise)
- Links to live project demos

---

## 10. Analytics & Reporting

### 10.1 Analytics Hierarchy

| Level | Audience | Metrics |
|-------|----------|---------|
| Platform | Super Admin | Total users, revenue, engagement, AI performance |
| Organization | Enterprise Admin | Company progress, ROI, compliance, skill gaps |
| Team | Manager | Team progress, individual performance, deadlines |
| Individual | Learner | Personal progress, skill map, recommendations |

### 10.2 Key Metrics

| Metric | Description |
|--------|-------------|
| Learning Velocity | Modules completed / time spent |
| Knowledge Retention | Performance on spaced reviews |
| Engagement Score | Sessions × duration × interactions |
| Struggle Index | Attempts × hints × time per topic |
| Predicted Completion | ML-based finish date |
| Skill Decay Risk | Days since practice × volatility |

### 10.3 Report Types

| Report | Audience | Frequency |
|--------|----------|-----------|
| Personal Progress | Learner | Real-time |
| Weekly Digest | Learner | Weekly |
| Team Summary | Manager | Weekly |
| Executive Summary | C-Suite | Monthly |
| Compliance Report | HR/Legal | On-demand |
| Skill Inventory | HR | Quarterly |

---

## 11. Database Schema

### 11.1 Core Tables

```
users                 → User accounts and auth
user_profiles         → Gamification data, preferences
organizations         → Enterprise accounts
teams                 → Team management

domains               → Learning domains
tracks                → Learning paths
courses               → Individual courses
modules               → Course modules
lessons               → Individual lessons

enrollments           → User-track relationships
progress              → Lesson completion tracking

certifications        → Issued certificates
assessments           → Assessment attempts

achievements          → Badge definitions
user_achievements     → Earned badges
xp_transactions       → XP history

ai_sessions           → AI conversation sessions
ai_messages           → Individual messages
```

### 11.2 Key Relationships

- Users belong to Organizations and Teams
- Tracks contain Courses contain Modules contain Lessons
- Progress tracks User × Lesson completion
- Certifications link Users to Courses with tier level

---

## 12. UI Components

### 12.1 Project Structure

```
dronacharya/
├── app/
│   ├── (auth)/           # Login, register, onboarding
│   ├── (dashboard)/      # Learner dashboard, courses
│   ├── (admin)/          # Content management, users
│   ├── (enterprise)/     # Team, reports, settings
│   └── api/              # tRPC, AI endpoints
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── learning/         # Immersive lesson, canvases
│   ├── dashboard/        # Widgets, charts
│   ├── gamification/     # XP, badges, streaks
│   └── ai/               # Tutor panel, chat
├── lib/
│   ├── db/               # Drizzle setup, schema
│   ├── ai/               # Agent implementations
│   ├── trpc/             # API routers
│   └── utils/            # Helpers
├── hooks/
├── stores/               # Zustand stores
└── types/
```

### 12.2 Key Components

- `ImmersiveLesson` - Full-screen learning container
- `AITutorPanel` - Chat interface with quick actions
- `CodeEditorCanvas` - Monaco editor with test runner
- `VisualizationCanvas` - Animated diagrams
- `XPDisplay` - XP counter with animations
- `StreakDisplay` - Streak tracker
- `AchievementToast` - Celebration notifications

---

## 13. API Design

### 13.1 tRPC Routers

| Router | Endpoints |
|--------|-----------|
| user | getProfile, updateProfile, getSettings |
| course | getTracks, getCourse, getLesson, enroll |
| progress | updateProgress, getStats, getHistory |
| assessment | start, submit, getResults |
| certification | requestBronze, requestSilver, submitGold, verify |
| analytics | getLearnerStats, getTeamStats, getOrgStats |
| gamification | getProfile, getLeaderboard, checkStreak |
| admin | createCourse, updateContent, manageUsers |
| enterprise | getTeams, assignCourses, getReports |

### 13.2 AI Endpoints

| Endpoint | Purpose |
|----------|---------|
| POST /api/ai/chat | Main AI conversation |
| POST /api/ai/assess | Generate assessment questions |
| POST /api/ai/review | Code review requests |
| POST /api/ai/hint | Get contextual hints |

---

## 14. Testing Strategy

### 14.1 Testing Pyramid

| Level | Coverage | Tools |
|-------|----------|-------|
| Unit | 60% | Vitest |
| Integration | 30% | Vitest + Test DB |
| E2E | 10% | Playwright |

### 14.2 Key Test Areas

- XP calculation with multipliers
- Streak calculation across timezones
- Progress tracking with concurrent updates
- Certification eligibility checks
- AI agent responses and routing
- Gamification edge cases

### 14.3 Edge Cases Covered

- Concurrent progress updates
- Network interruptions during completion
- XP overflow at max level
- Streak at midnight timezone boundary
- Assessment timeout handling
- Org seat limit enforcement

---

## 15. Deployment & Infrastructure

### 15.1 Cloud-Agnostic Setup

- Kubernetes cluster (EKS/AKS/GKE)
- Terraform modules for AWS, Azure, GCP
- Docker containers for all services
- Cloudflare for DNS/CDN

### 15.2 Services

| Service | Replicas | Resources |
|---------|----------|-----------|
| Web App | 3 | 256Mi-512Mi, 200m-500m CPU |
| API Service | 5 | 512Mi-1Gi, 300m-1000m CPU |
| AI Service | 3 | 1Gi-2Gi, 500m-2000m CPU |

### 15.3 Scaling

- HPA for API (target 70% CPU)
- HPA for AI Service (target 60% CPU)
- Auto-scaling node pools

### 15.4 CI/CD Pipeline

1. **CI**: Lint → Unit Tests → Integration Tests → E2E Tests → Build
2. **Deploy Staging**: Auto on merge to develop
3. **Deploy Production**: Manual approval, canary rollout, monitoring

### 15.5 Monitoring

- Prometheus + Grafana for metrics
- OpenTelemetry for tracing
- Alert rules for error rates, latency, pool exhaustion

---

## Appendix A: Environment Variables

```
NODE_ENV, NEXT_PUBLIC_APP_URL
DATABASE_URL, DATABASE_POOL_SIZE
REDIS_URL
ANTHROPIC_API_KEY, OPENAI_API_KEY
QDRANT_URL, QDRANT_API_KEY
NEXTAUTH_SECRET, NEXTAUTH_URL
OTEL_EXPORTER_OTLP_ENDPOINT, SENTRY_DSN
ENABLE_GAMIFICATION, ENABLE_AI_PROCTORING, MAX_AI_REQUESTS_PER_MINUTE
```

---

## Appendix B: Feature Flags

| Flag | Default | Purpose |
|------|---------|---------|
| ENABLE_GAMIFICATION | true | Toggle gamification features |
| ENABLE_AI_PROCTORING | false | AI webcam monitoring for assessments |
| MAX_AI_REQUESTS_PER_MINUTE | 30 | Rate limiting for AI endpoints |

---

**Document End**

*This design was collaboratively developed and approved for implementation.*
