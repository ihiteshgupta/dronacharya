# Phase 2: AI Agents Complete - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete all 6 AI agents with full functionality, enhance the orchestrator routing, and verify RAG pipeline works end-to-end.

**Architecture:** LangGraph-based orchestrator with specialized agents. Tutor/Assessor/CodeReview are production-ready. Mentor/ProjectGuide need enhancement. QuizGenerator needs implementation.

**Tech Stack:** LangChain, LangGraph, Claude/OpenAI, Qdrant, TypeScript

---

## Current State Assessment

| Agent | Status | Needs |
|-------|--------|-------|
| Tutor | ✅ Production | No changes needed |
| Assessor | ✅ Production | No changes needed |
| Code Review | ✅ Production | No changes needed |
| Mentor | ⚠️ Basic | Add specialized methods |
| Project Guide | ⚠️ Basic | Add milestone/submission methods |
| Quiz Generator | ❌ Missing | Full implementation needed |

---

## Task 1: Implement Quiz Generator Agent

**Files:**
- Create: `src/lib/ai/agents/quiz-generator.ts`
- Create: `src/lib/ai/prompts/quiz-generator-prompts.ts`
- Modify: `src/lib/ai/agents/index.ts`

**Step 1: Create quiz generator prompts**

Create `src/lib/ai/prompts/quiz-generator-prompts.ts`:

```typescript
export const QUIZ_GENERATOR_SYSTEM_PROMPT = `You are a Quiz Generator for an interactive learning platform.

STUDENT CONTEXT:
- Skill Level: {level}
- Course: {courseName}
- Module: {moduleName}
- Learning Objectives: {objectives}

YOUR ROLE:
Generate high-quality assessment questions that:
1. Test understanding, not memorization
2. Progress from basic to advanced concepts
3. Include practical application scenarios
4. Provide meaningful distractors (for MCQ)

QUESTION TYPES YOU CAN GENERATE:
1. multiple_choice - 4 options, one correct
2. code_output - "What does this code print?"
3. bug_finding - "Find and explain the bug"
4. code_completion - Fill in the missing code
5. conceptual - Explain a concept or compare approaches
6. true_false - Statement verification
7. ordering - Arrange steps in correct order

RAG CONTEXT (Course Material):
{ragContext}

RESPONSE FORMAT:
Always respond with valid JSON matching the QuizQuestion schema.
Include clear explanations for correct answers.
Generate hints that guide without giving away the answer.`;

export const QUIZ_GENERATION_PROMPT = `Generate {count} questions for a {difficulty} level quiz on "{topic}".

Requirements:
- Mix of question types: {questionTypes}
- Focus areas: {focusAreas}
- Time limit per question: ~{timePerQuestion} seconds

Generate questions that progressively test deeper understanding.`;

export const EXAM_GENERATION_PROMPT = `Generate a comprehensive certification exam with {count} questions.

Exam Requirements:
- Passing score: {passingScore}%
- Time limit: {timeLimit} minutes
- Covers all module objectives
- 60% application questions, 40% conceptual
- Include at least 2 code-based questions

This is for {certificationTier} certification.
Be rigorous but fair. Test real understanding.`;
```

**Step 2: Create quiz generator agent**

Create `src/lib/ai/agents/quiz-generator.ts`:

```typescript
import { AIMessage } from '@langchain/core/messages';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { getModelForAgent } from '../models';
import { AgentState } from '../types';
import {
  QUIZ_GENERATOR_SYSTEM_PROMPT,
  QUIZ_GENERATION_PROMPT,
  EXAM_GENERATION_PROMPT,
} from '../prompts/quiz-generator-prompts';

// Question schema
const QuestionSchema = z.object({
  id: z.string(),
  type: z.enum([
    'multiple_choice',
    'code_output',
    'bug_finding',
    'code_completion',
    'conceptual',
    'true_false',
    'ordering',
  ]),
  question: z.string(),
  code: z.string().optional(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]),
  explanation: z.string(),
  hint: z.string(),
  points: z.number(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  timeEstimate: z.number(), // seconds
  tags: z.array(z.string()),
});

const QuizSchema = z.object({
  title: z.string(),
  description: z.string(),
  questions: z.array(QuestionSchema),
  totalPoints: z.number(),
  passingScore: z.number(),
  timeLimit: z.number(), // minutes
});

export type Question = z.infer<typeof QuestionSchema>;
export type Quiz = z.infer<typeof QuizSchema>;

interface GenerateQuizOptions {
  topic: string;
  count: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  questionTypes?: string[];
  focusAreas?: string[];
  timePerQuestion?: number;
  lessonContext?: AgentState['lessonContext'];
  ragContext?: string;
}

interface GenerateExamOptions {
  courseId: string;
  courseName: string;
  moduleObjectives: string[];
  count: number;
  passingScore: number;
  timeLimit: number;
  certificationTier: 'bronze' | 'silver' | 'gold';
  ragContext?: string;
}

export const quizGeneratorAgent = {
  name: 'quiz-generator',

  /**
   * Standard invoke for conversational quiz requests
   */
  async invoke(state: AgentState): Promise<{
    messages: AIMessage[];
    metadata: Record<string, unknown>;
  }> {
    const model = getModelForAgent('quizGenerator');
    const systemTemplate = PromptTemplate.fromTemplate(QUIZ_GENERATOR_SYSTEM_PROMPT);

    const systemPrompt = await systemTemplate.format({
      level: state.userProfile?.level || 'beginner',
      courseName: state.lessonContext?.topic || 'General',
      moduleName: state.metadata?.moduleName || '',
      objectives: state.lessonContext?.objectives?.join(', ') || '',
      ragContext: state.ragContext || 'No specific context available.',
    });

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...state.messages.map((m) => ({
        role: m._getType() as 'human' | 'ai',
        content: m.content as string,
      })),
    ];

    const response = await model.invoke(messages);

    return {
      messages: [new AIMessage(response.content as string)],
      metadata: {
        agent: 'quiz-generator',
        action: 'conversational',
      },
    };
  },

  /**
   * Generate a quiz with specific parameters
   */
  async generateQuiz(options: GenerateQuizOptions): Promise<Quiz> {
    const model = getModelForAgent('quizGenerator');

    const systemTemplate = PromptTemplate.fromTemplate(QUIZ_GENERATOR_SYSTEM_PROMPT);
    const systemPrompt = await systemTemplate.format({
      level: options.difficulty,
      courseName: options.lessonContext?.topic || options.topic,
      moduleName: '',
      objectives: options.focusAreas?.join(', ') || '',
      ragContext: options.ragContext || 'No specific context available.',
    });

    const generateTemplate = PromptTemplate.fromTemplate(QUIZ_GENERATION_PROMPT);
    const generatePrompt = await generateTemplate.format({
      count: options.count,
      difficulty: options.difficulty,
      topic: options.topic,
      questionTypes: options.questionTypes?.join(', ') || 'multiple_choice, code_output, conceptual',
      focusAreas: options.focusAreas?.join(', ') || 'core concepts',
      timePerQuestion: options.timePerQuestion || 60,
    });

    const response = await model.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: generatePrompt + '\n\nRespond with valid JSON only.' },
    ]);

    const content = response.content as string;

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse quiz response as JSON');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return QuizSchema.parse(parsed);
  },

  /**
   * Generate a certification exam
   */
  async generateExam(options: GenerateExamOptions): Promise<Quiz> {
    const model = getModelForAgent('quizGenerator');

    const systemTemplate = PromptTemplate.fromTemplate(QUIZ_GENERATOR_SYSTEM_PROMPT);
    const systemPrompt = await systemTemplate.format({
      level: options.certificationTier === 'gold' ? 'advanced' : 'intermediate',
      courseName: options.courseName,
      moduleName: 'Certification Exam',
      objectives: options.moduleObjectives.join(', '),
      ragContext: options.ragContext || 'No specific context available.',
    });

    const examTemplate = PromptTemplate.fromTemplate(EXAM_GENERATION_PROMPT);
    const examPrompt = await examTemplate.format({
      count: options.count,
      passingScore: options.passingScore,
      timeLimit: options.timeLimit,
      certificationTier: options.certificationTier,
    });

    const response = await model.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: examPrompt + '\n\nRespond with valid JSON only.' },
    ]);

    const content = response.content as string;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse exam response as JSON');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return QuizSchema.parse(parsed);
  },

  /**
   * Generate a single question on demand
   */
  async generateQuestion(
    topic: string,
    type: Question['type'],
    difficulty: Question['difficulty'],
    ragContext?: string
  ): Promise<Question> {
    const model = getModelForAgent('quizGenerator');

    const prompt = `Generate a single ${difficulty} level ${type} question about "${topic}".

${ragContext ? `Context:\n${ragContext}\n` : ''}

Respond with valid JSON matching this schema:
{
  "id": "unique-id",
  "type": "${type}",
  "question": "...",
  "code": "..." (if applicable),
  "options": [...] (if multiple choice),
  "correctAnswer": "...",
  "explanation": "...",
  "hint": "...",
  "points": number,
  "difficulty": "${difficulty}",
  "timeEstimate": seconds,
  "tags": [...]
}`;

    const response = await model.invoke([{ role: 'user', content: prompt }]);
    const content = response.content as string;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse question response as JSON');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return QuestionSchema.parse(parsed);
  },
};
```

**Step 3: Update agents index**

Add to `src/lib/ai/agents/index.ts`:

```typescript
export { quizGeneratorAgent, type Question, type Quiz } from './quiz-generator';
```

**Step 4: Add quizGenerator to config**

Update `src/lib/ai/config.ts` to include quizGenerator temperature (0.4 - balanced creativity/precision).

**Step 5: Commit**

```bash
git add src/lib/ai/agents/quiz-generator.ts src/lib/ai/prompts/quiz-generator-prompts.ts src/lib/ai/agents/index.ts src/lib/ai/config.ts
git commit -m "feat: implement quiz generator agent with quiz and exam generation"
```

---

## Task 2: Enhance Mentor Agent

**Files:**
- Modify: `src/lib/ai/agents/mentor.ts`
- Modify: `src/lib/ai/prompts/mentor-prompts.ts`

**Step 1: Add specialized methods to mentor agent**

Enhance `src/lib/ai/agents/mentor.ts` to add:

```typescript
interface CareerGuidanceOptions {
  currentSkills: string[];
  targetRole: string;
  experienceLevel: 'student' | 'junior' | 'mid' | 'senior';
  interests: string[];
}

interface MotivationContext {
  currentStreak: number;
  recentProgress: number; // percentage
  strugglingAreas: string[];
  lastActiveDate: Date;
}

// Add these methods to mentorAgent:

/**
 * Provide personalized career guidance
 */
async getCareerGuidance(options: CareerGuidanceOptions): Promise<{
  roadmap: string[];
  skillGaps: string[];
  recommendations: string[];
  estimatedTimeline: string;
}>;

/**
 * Generate motivational message based on context
 */
async getMotivation(context: MotivationContext): Promise<{
  message: string;
  actionItems: string[];
  encouragement: string;
}>;

/**
 * Set and track learning goals
 */
async setGoals(
  userId: string,
  goals: { short: string[]; medium: string[]; long: string[] }
): Promise<{
  refinedGoals: { short: string[]; medium: string[]; long: string[] };
  milestones: string[];
  checkpoints: Date[];
}>;
```

**Step 2: Update mentor prompts**

Add career guidance and motivation prompts to `src/lib/ai/prompts/mentor-prompts.ts`.

**Step 3: Commit**

```bash
git add src/lib/ai/agents/mentor.ts src/lib/ai/prompts/mentor-prompts.ts
git commit -m "feat: enhance mentor agent with career guidance and motivation methods"
```

---

## Task 3: Enhance Project Guide Agent

**Files:**
- Modify: `src/lib/ai/agents/project-guide.ts`
- Modify: `src/lib/ai/prompts/project-guide-prompts.ts`

**Step 1: Add specialized methods**

Enhance `src/lib/ai/agents/project-guide.ts` to add:

```typescript
interface ProjectSubmission {
  projectId: string;
  userId: string;
  githubUrl: string;
  deployedUrl?: string;
  description: string;
  technologiesUsed: string[];
}

interface ProjectMilestone {
  id: string;
  name: string;
  description: string;
  criteria: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'needs_revision';
}

// Add these methods:

/**
 * Break project into milestones
 */
async createMilestones(
  projectRequirements: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): Promise<ProjectMilestone[]>;

/**
 * Review a milestone submission
 */
async reviewMilestone(
  milestone: ProjectMilestone,
  submissionNotes: string,
  codeSnippets?: string[]
): Promise<{
  approved: boolean;
  feedback: string;
  improvements: string[];
  nextSteps: string[];
}>;

/**
 * Evaluate final project submission for Gold certification
 */
async evaluateSubmission(submission: ProjectSubmission): Promise<{
  scores: {
    codeQuality: number; // 0-25
    functionality: number; // 0-30
    testing: number; // 0-20
    documentation: number; // 0-15
    deployment: number; // 0-10
  };
  totalScore: number;
  passed: boolean;
  feedback: string;
  strengths: string[];
  improvements: string[];
  recommendation: 'approve' | 'revise' | 'reject';
}>;

/**
 * Generate project ideas based on skills
 */
async suggestProjects(
  skills: string[],
  interests: string[],
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): Promise<{
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
    estimatedHours: number;
    learningOutcomes: string[];
  }>;
}>;
```

**Step 2: Update prompts**

Add evaluation and milestone prompts to `src/lib/ai/prompts/project-guide-prompts.ts`.

**Step 3: Commit**

```bash
git add src/lib/ai/agents/project-guide.ts src/lib/ai/prompts/project-guide-prompts.ts
git commit -m "feat: enhance project guide agent with milestone tracking and submission evaluation"
```

---

## Task 4: Update Orchestrator Router

**Files:**
- Modify: `src/lib/ai/orchestrator/router.ts`
- Modify: `src/lib/ai/orchestrator/graph.ts`

**Step 1: Add Quiz Generator to router patterns**

Update `src/lib/ai/orchestrator/router.ts`:

```typescript
// Add patterns for quiz generator
const QUIZ_PATTERNS = [
  /quiz/i,
  /test me/i,
  /practice questions/i,
  /generate.*questions/i,
  /assessment/i,
  /exam/i,
];

// Update routeAfterRouter to include quiz generator
```

**Step 2: Add Quiz Generator node to graph**

Update `src/lib/ai/orchestrator/graph.ts` to add quizGenerator as a node.

**Step 3: Add confidence scoring (optional enhancement)**

Add basic confidence scoring to routing decisions.

**Step 4: Commit**

```bash
git add src/lib/ai/orchestrator/router.ts src/lib/ai/orchestrator/graph.ts
git commit -m "feat: add quiz generator to orchestrator and improve routing"
```

---

## Task 5: Add Agent Unit Tests

**Files:**
- Create: `src/lib/ai/agents/__tests__/quiz-generator.test.ts`
- Create: `src/lib/ai/agents/__tests__/mentor.test.ts`
- Create: `src/lib/ai/agents/__tests__/project-guide.test.ts`

**Step 1: Create quiz generator tests**

Test:
- invoke() method
- generateQuiz() with various options
- generateExam() for certification
- generateQuestion() for single questions
- JSON parsing and schema validation

**Step 2: Create mentor tests**

Test:
- invoke() method
- getCareerGuidance()
- getMotivation()
- setGoals()

**Step 3: Create project guide tests**

Test:
- invoke() method
- createMilestones()
- reviewMilestone()
- evaluateSubmission()
- suggestProjects()

**Step 4: Commit**

```bash
git add src/lib/ai/agents/__tests__/
git commit -m "test: add unit tests for quiz generator, mentor, and project guide agents"
```

---

## Task 6: Verify RAG Pipeline Works

**Files:**
- Create: `scripts/test-rag.ts`

**Step 1: Create RAG test script**

Create a script that:
1. Initializes RAG pipeline
2. Indexes sample content
3. Retrieves content
4. Verifies retrieval accuracy

**Step 2: Run and verify**

```bash
npx tsx scripts/test-rag.ts
```

**Step 3: Commit**

```bash
git add scripts/test-rag.ts
git commit -m "test: add RAG pipeline verification script"
```

---

## Task 7: Run Full Verification

**Step 1: Run typecheck**

```bash
pnpm typecheck
```

**Step 2: Run tests**

```bash
pnpm test:unit
```

**Step 3: Run build**

```bash
pnpm build
```

**Step 4: Fix any issues**

**Step 5: Final commit**

```bash
git add .
git commit -m "feat: complete Phase 2 - all 6 AI agents fully implemented

- Implement Quiz Generator agent with quiz/exam generation
- Enhance Mentor agent with career guidance and motivation
- Enhance Project Guide with milestone tracking and submission evaluation
- Update orchestrator to route to quiz generator
- Add comprehensive unit tests for all agents
- Verify RAG pipeline works end-to-end

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Phase 2 Completion Checklist

- [ ] Quiz Generator agent implemented with generateQuiz, generateExam, generateQuestion
- [ ] Mentor agent enhanced with getCareerGuidance, getMotivation, setGoals
- [ ] Project Guide enhanced with createMilestones, reviewMilestone, evaluateSubmission
- [ ] Orchestrator routes to quiz generator
- [ ] Unit tests for all new agent methods
- [ ] RAG pipeline verified working
- [ ] All TypeScript errors resolved
- [ ] Build passes
- [ ] Tests pass
