import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import {
  projectGuideAgent,
  type ProjectPlan,
  type ArchitectureReview,
  type MilestoneReview,
  type DebuggingGuide,
  type DeploymentGuide,
} from '../project-guide';
import type { AgentState } from '../../types';

// Mock the models module
vi.mock('../../models', () => ({
  getModelForAgent: vi.fn(),
}));

// Mock the prompts module - use real prompts via importOriginal
vi.mock('../../prompts/project-guide-prompts', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  return {
    ...actual,
  };
});

import { getModelForAgent } from '../../models';

// Helper to create mock model
function createMockModel() {
  return {
    invoke: vi.fn(),
  };
}

// Helper to create mock agent state
function createMockState(overrides: Partial<AgentState> = {}): AgentState {
  return {
    messages: [new HumanMessage('Help me with my project')],
    currentAgent: 'projectGuide',
    lessonContext: {
      lessonId: 'lesson-1',
      topic: 'Portfolio Project',
      courseId: 'course-1',
      objectives: ['Build a full-stack app', 'Deploy to cloud'],
      teachingMode: 'scaffolded',
    },
    userProfile: {
      id: 'user-1',
      level: 40,
      learningStyle: 'kinesthetic',
      struggleAreas: ['deployment'],
      interests: ['web development', 'React'],
      avgScore: 82,
    },
    ragContext: 'Project development best practices...',
    shouldContinue: true,
    metadata: {
      project: {
        name: 'E-commerce App',
        milestone: 'Backend Setup',
        requirements: 'Build REST API with authentication',
      },
    },
    ...overrides,
  };
}

// Helper to create a project plan response
function createProjectPlan(overrides: Partial<ProjectPlan> = {}): ProjectPlan {
  return {
    overview: 'A full-stack e-commerce application',
    techStack: ['React', 'Node.js', 'PostgreSQL'],
    milestones: [
      {
        name: 'Project Setup',
        description: 'Initialize project structure',
        estimatedDays: 3,
        tasks: [
          { name: 'Init repo', description: 'Create repository', skills: ['git'] },
        ],
        deliverables: ['Git repo with initial structure'],
        checkpoints: ['Repo exists with README'],
      },
    ],
    evaluationCriteria: {
      codeQuality: 'Clean, readable code',
      functionality: 'All features working',
      testing: '70%+ coverage',
      documentation: 'README and API docs',
      deployment: 'Live URL',
    },
    resources: ['https://docs.example.com'],
    tips: ['Start with the data model'],
    ...overrides,
  };
}

// Helper to create an architecture review response
function createArchitectureReview(overrides: Partial<ArchitectureReview> = {}): ArchitectureReview {
  return {
    score: 75,
    strengths: ['Good separation of concerns'],
    concerns: ['Might have scaling issues'],
    questions: ['Why did you choose this ORM?'],
    suggestions: ['Consider adding caching'],
    patterns: ['Repository pattern'],
    scalabilityNotes: 'Should handle moderate traffic',
    maintainabilityNotes: 'Well-structured for maintenance',
    ...overrides,
  };
}

// Helper to create a milestone review response
function createMilestoneReview(overrides: Partial<MilestoneReview> = {}): MilestoneReview {
  return {
    status: 'approved',
    completionPercentage: 90,
    feedback: {
      completed: ['API endpoints created', 'Auth implemented'],
      missing: ['Some edge case handling'],
      improvements: ['Add rate limiting'],
    },
    nextSteps: ['Move to frontend integration'],
    encouragement: 'Great work so far!',
    ...overrides,
  };
}

// Helper to create a debugging guide response
function createDebuggingGuide(overrides: Partial<DebuggingGuide> = {}): DebuggingGuide {
  return {
    problemAnalysis: 'The issue seems to be related to async handling',
    investigationQuestions: ['Have you checked the network tab?'],
    debuggingSteps: ['Add console.log before the fetch call'],
    hints: ['Look at how you handle the Promise'],
    conceptsToReview: ['async/await', 'error handling'],
    commonMistakes: ['Forgetting to await'],
    ...overrides,
  };
}

// Helper to create a deployment guide response
function createDeploymentGuide(overrides: Partial<DeploymentGuide> = {}): DeploymentGuide {
  return {
    checklist: [
      { item: 'Environment variables', description: 'Set all env vars', priority: 'required' },
    ],
    environmentVariables: ['DATABASE_URL', 'JWT_SECRET'],
    cicdSuggestions: ['Use GitHub Actions'],
    securityChecklist: ['Enable HTTPS'],
    monitoringSuggestions: ['Set up health checks'],
    commonIssues: ['Port conflicts'],
    resources: ['https://vercel.com/docs'],
    ...overrides,
  };
}

describe('projectGuideAgent', () => {
  let mockModel: ReturnType<typeof createMockModel>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockModel = createMockModel();
    (getModelForAgent as Mock).mockReturnValue(mockModel);
  });

  describe('agent properties', () => {
    it('should have the correct name', () => {
      expect(projectGuideAgent.name).toBe('projectGuide');
    });
  });

  describe('invoke', () => {
    it('should return project guidance response', async () => {
      const state = createMockState();
      mockModel.invoke.mockResolvedValue({
        content: "I'll help you with your E-commerce App project. Let's focus on the Backend Setup milestone.",
      });

      const result = await projectGuideAgent.invoke(state);

      expect(getModelForAgent).toHaveBeenCalledWith('projectGuide');
      expect(mockModel.invoke).toHaveBeenCalledTimes(1);
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toBeInstanceOf(AIMessage);
      expect(result.metadata.agentType).toBe('projectGuide');
    });

    it('should use project metadata in system prompt', async () => {
      const state = createMockState({
        metadata: {
          project: {
            name: 'Portfolio Website',
            milestone: 'Design Phase',
            requirements: 'Responsive design with animations',
          },
        },
      });
      mockModel.invoke.mockResolvedValue({
        content: 'Let me help you with the design phase...',
      });

      await projectGuideAgent.invoke(state);

      const invokeCall = mockModel.invoke.mock.calls[0][0];
      expect(invokeCall[0]).toBeInstanceOf(SystemMessage);
      expect(invokeCall[0].content).toContain('Portfolio Website');
      expect(invokeCall[0].content).toContain('Design Phase');
    });

    it('should handle missing project metadata', async () => {
      const state = createMockState({
        metadata: {},
      });
      mockModel.invoke.mockResolvedValue({
        content: "Let's start with your portfolio project...",
      });

      const result = await projectGuideAgent.invoke(state);

      expect(result.messages).toHaveLength(1);
      expect(result.metadata.agentType).toBe('projectGuide');
    });

    it('should include user level in system prompt', async () => {
      const state = createMockState({
        userProfile: {
          id: 'user-1',
          level: 75,
          learningStyle: 'visual',
          struggleAreas: [],
          interests: ['AI'],
          avgScore: 95,
        },
      });
      mockModel.invoke.mockResolvedValue({
        content: 'For your advanced level...',
      });

      await projectGuideAgent.invoke(state);

      const invokeCall = mockModel.invoke.mock.calls[0][0];
      expect(invokeCall[0].content).toContain('75');
    });
  });

  describe('generateProjectPlan', () => {
    it('should generate a project plan', async () => {
      const plan = createProjectPlan();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(plan),
      });

      const result = await projectGuideAgent.generateProjectPlan(
        'E-commerce App',
        'A full-stack e-commerce platform',
        30,
        '4 weeks'
      );

      expect(getModelForAgent).toHaveBeenCalledWith('projectGuide');
      expect(result.overview).toBe('A full-stack e-commerce application');
      expect(result.milestones).toHaveLength(1);
      expect(result.techStack).toContain('React');
    });

    it('should return fallback when JSON extraction fails', async () => {
      mockModel.invoke.mockResolvedValue({
        content: 'Here is a project plan for you...',
      });

      const result = await projectGuideAgent.generateProjectPlan(
        'My App',
        'A simple app',
        10,
        '2 weeks'
      );

      expect(result.overview).toBe('Unable to generate project plan');
      expect(result.milestones).toEqual([]);
    });

    it('should include all parameters in prompt', async () => {
      const plan = createProjectPlan();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(plan),
      });

      await projectGuideAgent.generateProjectPlan(
        'Portfolio Site',
        'Personal portfolio with projects showcase',
        50,
        '3 weeks'
      );

      expect(mockModel.invoke).toHaveBeenCalledTimes(1);
      const invokeCall = mockModel.invoke.mock.calls[0][0];
      expect(invokeCall[0]).toBeInstanceOf(HumanMessage);
      expect(invokeCall[0].content).toContain('Portfolio Site');
      expect(invokeCall[0].content).toContain('3 weeks');
    });
  });

  describe('reviewArchitecture', () => {
    it('should review architecture and return scores', async () => {
      const review = createArchitectureReview({ score: 85 });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(review),
      });

      const result = await projectGuideAgent.reviewArchitecture(
        'E-commerce App',
        ['React', 'Node.js', 'PostgreSQL'],
        'MVC with service layer',
        'src/\n  controllers/\n  services/\n  models/'
      );

      expect(result.score).toBe(85);
      expect(result.strengths).toHaveLength(1);
      expect(result.suggestions).toHaveLength(1);
    });

    it('should return fallback when JSON extraction fails', async () => {
      mockModel.invoke.mockResolvedValue({
        content: 'Your architecture looks decent...',
      });

      const result = await projectGuideAgent.reviewArchitecture(
        'App',
        ['React'],
        'Simple SPA',
        'src/'
      );

      expect(result.score).toBe(50);
      expect(result.strengths).toEqual([]);
    });

    it('should join tech stack in prompt', async () => {
      const review = createArchitectureReview();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(review),
      });

      await projectGuideAgent.reviewArchitecture(
        'App',
        ['Next.js', 'Prisma', 'PostgreSQL'],
        'Monolith',
        'src/'
      );

      const invokeCall = mockModel.invoke.mock.calls[0][0];
      expect(invokeCall[0].content).toContain('Next.js, Prisma, PostgreSQL');
    });
  });

  describe('reviewMilestone', () => {
    it('should approve a completed milestone', async () => {
      const review = createMilestoneReview({
        status: 'approved',
        completionPercentage: 100,
      });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(review),
      });

      const result = await projectGuideAgent.reviewMilestone(
        'E-commerce App',
        'API Implementation',
        'Build all REST endpoints',
        'All endpoints created with validation and tests'
      );

      expect(result.status).toBe('approved');
      expect(result.completionPercentage).toBe(100);
    });

    it('should request revision for incomplete milestone', async () => {
      const review = createMilestoneReview({
        status: 'needs_work',
        completionPercentage: 60,
        feedback: {
          completed: ['Basic endpoints'],
          missing: ['Auth middleware', 'Tests'],
          improvements: ['Add input validation'],
        },
      });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(review),
      });

      const result = await projectGuideAgent.reviewMilestone(
        'E-commerce App',
        'API Implementation',
        'Build all REST endpoints with auth',
        'Created basic CRUD endpoints'
      );

      expect(result.status).toBe('needs_work');
      expect(result.feedback.missing.length).toBeGreaterThan(0);
    });

    it('should return fallback when JSON extraction fails', async () => {
      mockModel.invoke.mockResolvedValue({
        content: 'Great job on this milestone!',
      });

      const result = await projectGuideAgent.reviewMilestone(
        'App',
        'Setup',
        'Initialize project',
        'Done'
      );

      expect(result.status).toBe('in_progress');
      expect(result.completionPercentage).toBe(0);
    });

    it('should return in_progress status', async () => {
      const review = createMilestoneReview({
        status: 'in_progress',
        completionPercentage: 40,
      });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(review),
      });

      const result = await projectGuideAgent.reviewMilestone(
        'App',
        'Backend',
        'Build backend',
        'Started working on models'
      );

      expect(result.status).toBe('in_progress');
      expect(result.completionPercentage).toBe(40);
    });
  });

  describe('guideDebugging', () => {
    it('should provide debugging guidance', async () => {
      const guide = createDebuggingGuide();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(guide),
      });

      const result = await projectGuideAgent.guideDebugging(
        'E-commerce App',
        'TypeError: Cannot read property of undefined',
        'const data = response.data.items;',
        'Added null checks but still fails'
      );

      expect(result.problemAnalysis).toBeDefined();
      expect(result.debuggingSteps.length).toBeGreaterThan(0);
      expect(result.hints.length).toBeGreaterThan(0);
    });

    it('should return fallback when JSON extraction fails', async () => {
      mockModel.invoke.mockResolvedValue({
        content: 'Try checking the console logs...',
      });

      const result = await projectGuideAgent.guideDebugging(
        'App',
        'Error',
        'code',
        'nothing'
      );

      expect(result.problemAnalysis).toBe('Unable to analyze');
      expect(result.debuggingSteps).toEqual([]);
    });

    it('should include concepts to review', async () => {
      const guide = createDebuggingGuide({
        conceptsToReview: ['Promises', 'async/await', 'error boundaries'],
      });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(guide),
      });

      const result = await projectGuideAgent.guideDebugging(
        'App',
        'Unhandled promise rejection',
        'fetch(url).then(r => r.json())',
        'Added .catch but not working'
      );

      expect(result.conceptsToReview).toHaveLength(3);
      expect(result.conceptsToReview).toContain('Promises');
    });
  });

  describe('generateDeploymentGuide', () => {
    it('should generate deployment guide', async () => {
      const guide = createDeploymentGuide();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(guide),
      });

      const result = await projectGuideAgent.generateDeploymentGuide(
        'E-commerce App',
        ['React', 'Node.js', 'PostgreSQL'],
        'Vercel',
        'Development complete, ready for deployment'
      );

      expect(result.checklist.length).toBeGreaterThan(0);
      expect(result.environmentVariables.length).toBeGreaterThan(0);
      expect(result.checklist[0].priority).toBe('required');
    });

    it('should return fallback when JSON extraction fails', async () => {
      mockModel.invoke.mockResolvedValue({
        content: 'Here are the deployment steps...',
      });

      const result = await projectGuideAgent.generateDeploymentGuide(
        'App',
        ['React'],
        'AWS',
        'Ready'
      );

      expect(result.checklist).toEqual([]);
      expect(result.resources).toEqual([]);
    });

    it('should join tech stack in prompt', async () => {
      const guide = createDeploymentGuide();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(guide),
      });

      await projectGuideAgent.generateDeploymentGuide(
        'App',
        ['Next.js', 'Prisma', 'PostgreSQL'],
        'Railway',
        'Built and tested'
      );

      const invokeCall = mockModel.invoke.mock.calls[0][0];
      expect(invokeCall[0].content).toContain('Next.js, Prisma, PostgreSQL');
    });

    it('should include security checklist', async () => {
      const guide = createDeploymentGuide({
        securityChecklist: ['Enable HTTPS', 'Set CORS headers', 'Sanitize inputs'],
      });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(guide),
      });

      const result = await projectGuideAgent.generateDeploymentGuide(
        'App',
        ['Node.js'],
        'Heroku',
        'Code complete'
      );

      expect(result.securityChecklist).toHaveLength(3);
    });
  });

  describe('error handling', () => {
    it('should handle malformed JSON in generateProjectPlan', async () => {
      mockModel.invoke.mockResolvedValue({
        content: '{ "overview": "plan" invalid',
      });

      const result = await projectGuideAgent.generateProjectPlan(
        'App', 'Desc', 10, '2 weeks'
      );

      // Falls back to default
      expect(result.overview).toBe('Unable to generate project plan');
    });

    it('should handle malformed JSON in reviewArchitecture', async () => {
      mockModel.invoke.mockResolvedValue({
        content: '{ "score": 80 broken',
      });

      const result = await projectGuideAgent.reviewArchitecture(
        'App', ['React'], 'SPA', 'src/'
      );

      expect(result.score).toBe(50);
    });

    it('should handle malformed JSON in reviewMilestone', async () => {
      mockModel.invoke.mockResolvedValue({
        content: '{ "status": "approved" broken',
      });

      const result = await projectGuideAgent.reviewMilestone(
        'App', 'Setup', 'Init', 'Done'
      );

      expect(result.status).toBe('in_progress');
    });

    it('should handle malformed JSON in guideDebugging', async () => {
      mockModel.invoke.mockResolvedValue({
        content: '{ "problemAnalysis": invalid',
      });

      const result = await projectGuideAgent.guideDebugging(
        'App', 'Error', 'code', 'tried stuff'
      );

      expect(result.problemAnalysis).toBe('Unable to analyze');
    });

    it('should handle malformed JSON in generateDeploymentGuide', async () => {
      mockModel.invoke.mockResolvedValue({
        content: '{ "checklist": [ } invalid',
      });

      const result = await projectGuideAgent.generateDeploymentGuide(
        'App', ['React'], 'Vercel', 'Ready'
      );

      expect(result.checklist).toEqual([]);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete project workflow', async () => {
      // Step 1: Generate project plan
      const plan = createProjectPlan();
      mockModel.invoke.mockResolvedValueOnce({
        content: JSON.stringify(plan),
      });

      const projectPlan = await projectGuideAgent.generateProjectPlan(
        'E-commerce App',
        'Full-stack e-commerce platform',
        30,
        '4 weeks'
      );

      // Step 2: Review architecture
      const archReview = createArchitectureReview({ score: 80 });
      mockModel.invoke.mockResolvedValueOnce({
        content: JSON.stringify(archReview),
      });

      const architectureResult = await projectGuideAgent.reviewArchitecture(
        'E-commerce App',
        projectPlan.techStack,
        'MVC with service layer',
        'src/controllers/ src/services/ src/models/'
      );

      // Step 3: Review milestone
      const milestoneReview = createMilestoneReview({ status: 'approved' });
      mockModel.invoke.mockResolvedValueOnce({
        content: JSON.stringify(milestoneReview),
      });

      const milestoneResult = await projectGuideAgent.reviewMilestone(
        'E-commerce App',
        projectPlan.milestones[0].name,
        'Initialize project',
        'Project initialized with all dependencies'
      );

      expect(projectPlan.milestones).toHaveLength(1);
      expect(architectureResult.score).toBe(80);
      expect(milestoneResult.status).toBe('approved');
      expect(mockModel.invoke).toHaveBeenCalledTimes(3);
    });
  });
});
