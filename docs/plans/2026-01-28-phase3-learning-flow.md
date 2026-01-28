# Phase 3: Learning Flow - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the learning experience - users can take real lessons with code execution, quizzes, and AI assistance.

**Architecture:** Lesson player page connects existing canvases with new code sandbox backend. Admin functionality via seed scripts (simplified for v1).

**Tech Stack:** Next.js App Router, Monaco Editor, Piston API, tRPC, Drizzle ORM

---

## Current State Assessment

| Component | Status | Notes |
|-----------|--------|-------|
| Code Editor Canvas | ✅ Complete | Monaco editor, test UI, ~192 lines |
| Challenge Canvas | ✅ Complete | Timer, hints, progress bar |
| Visualization Canvas | ✅ Complete | Step animations, speed controls |
| Immersive Lesson | ✅ Complete | Navigation, AI panel, XP display |
| AI Tutor Panel | ✅ Complete | Chat interface with quick actions |
| Quiz Canvas | ❌ Missing | Need to create |
| Concept Canvas | ❌ Missing | Need markdown rendering |
| Lesson Page | ❌ Missing | Route /lesson/[id] |
| Code Sandbox | ❌ Missing | Backend execution service |
| Seed Data | ❌ Missing | No real course content |

---

## Task 1: Create Concept Canvas Component

**Files:**
- Create: `src/components/learning/canvases/concept-canvas.tsx`

**Description:**
Create a concept canvas that renders markdown content with syntax-highlighted code blocks, interactive examples, key takeaways section, and a confirmation button. Use react-markdown with react-syntax-highlighter.

**Key Requirements:**
- Render markdown with prose styling
- Syntax highlight code blocks using Prism (oneDark theme)
- Display key takeaways in a highlighted card
- "I understand this concept" button triggers onComplete

**Dependencies to install:**
```bash
pnpm add react-markdown react-syntax-highlighter
pnpm add -D @types/react-syntax-highlighter
```

**Commit message:** `feat: add concept canvas with markdown rendering and key takeaways`

---

## Task 2: Create Quiz Canvas Component

**Files:**
- Create: `src/components/learning/canvases/quiz-canvas.tsx`

**Description:**
Create a quiz canvas that supports multiple choice questions with immediate feedback, score tracking, and pass/fail determination. Include hint system and progress indicator.

**Key Requirements:**
- Support question types: multiple_choice, code_output, true_false
- Show progress bar and score
- Immediate feedback after each answer with explanation
- Final results screen with pass/fail determination
- Optional hints (can show before answering)

**Props Interface:**
```typescript
interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'code_output' | 'true_false';
  question: string;
  code?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hint?: string;
}

interface QuizCanvasProps {
  questions: QuizQuestion[];
  passingScore: number;
  onComplete: (score: number, passed: boolean) => void;
}
```

**Commit message:** `feat: add quiz canvas with multiple choice, feedback, and scoring`

---

## Task 3: Create Code Execution Sandbox Service

**Files:**
- Create: `src/lib/sandbox/executor.ts`
- Create: `src/lib/sandbox/languages.ts`
- Create: `src/app/api/sandbox/execute/route.ts`

**Description:**
Create a code execution service that uses the Piston API for secure code execution. Support JavaScript, TypeScript, and Python. Include test case runner.

**Key Requirements:**
- Languages config with Piston IDs and versions
- executeCode() function that calls Piston API
- runTestCases() function that runs multiple test cases
- API route with authentication and input validation
- 10 second timeout, 128MB memory limit

**Piston API endpoint:** `https://emkc.org/api/v2/piston/execute`

**API Route Input Schema:**
```typescript
{
  code: string (max 50000 chars),
  language: 'javascript' | 'typescript' | 'python',
  stdin?: string,
  testCases?: { input: string, expectedOutput: string }[]
}
```

**Commit message:** `feat: add code execution sandbox with Piston API integration`

---

## Task 4: Create Lesson Player Page

**Files:**
- Create: `src/app/lesson/[id]/page.tsx`

**Description:**
Create the main lesson player page that fetches lesson data and renders the appropriate canvas based on lesson type. Integrate AI tutor panel and progress tracking.

**Key Requirements:**
- Fetch lesson via tRPC course.getLesson
- Support multi-step lessons (content.steps array)
- Render correct canvas based on step.type
- Track step completion state
- Call sandbox API for code execution
- Call AI chat API for tutor messages
- Update progress on lesson completion
- Navigate to next step or back to courses on complete

**Canvas Type Mapping:**
- concept → ConceptCanvas
- code → CodeEditorCanvas
- challenge → ChallengeCanvas
- visualization → VisualizationCanvas
- quiz → QuizCanvas

**Commit message:** `feat: add lesson player page with multi-step support and AI integration`

---

## Task 5: Update Canvas Exports and Fix Integration

**Files:**
- Create: `src/components/learning/canvases/index.ts`
- Modify: `src/components/learning/immersive-lesson.tsx` (if needed)

**Description:**
Create barrel export for all canvases. Verify ImmersiveLesson component has all needed props for step navigation control (canGoNext prop).

**Commit message:** `feat: update learning component exports and integration`

---

## Task 6: Create Seed Data Script

**Files:**
- Create: `scripts/seed-content.ts`

**Description:**
Create a seed script that populates the database with a complete JavaScript Essentials course including:
- 1 Domain: Technology
- 1 Track: Web Development Fundamentals
- 1 Course: JavaScript Essentials
- 2+ Modules with mixed lesson types
- Lessons covering: concepts, code exercises, quizzes

**Dependencies:**
```bash
pnpm add uuid
pnpm add -D @types/uuid
```

**Key Requirements:**
- Use uuid for IDs
- Include all 5 lesson types
- Real educational content (not lorem ipsum)
- Proper content structure matching schema

**Commit message:** `feat: add seed content script with JavaScript Essentials course`

---

## Task 7: Run Full Verification

**Steps:**
1. Install all new dependencies
2. Run `pnpm typecheck` - fix any TypeScript errors
3. Run `pnpm test:unit` - ensure tests pass
4. Run `pnpm build` - ensure build succeeds
5. Fix any issues found
6. Final commit

**Commit message:** `feat: complete Phase 3 - Learning Flow`

---

## Phase 3 Completion Checklist

- [ ] Concept canvas renders markdown with syntax highlighting
- [ ] Quiz canvas supports multiple choice with feedback
- [ ] Code sandbox executes JS/TS/Python via Piston API
- [ ] Lesson page renders all 5 canvas types
- [ ] AI tutor integration works in lessons
- [ ] Seed data creates complete JavaScript course
- [ ] TypeScript passes
- [ ] Build succeeds
- [ ] Tests pass
