import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { PromptTemplate } from '@langchain/core/prompts';
import { getModelForAgent } from '../models';
import {
  PROJECT_GUIDE_SYSTEM_PROMPT,
  PROJECT_PLAN_PROMPT,
  ARCHITECTURE_REVIEW_PROMPT,
  MILESTONE_REVIEW_PROMPT,
  DEBUGGING_GUIDE_PROMPT,
  DEPLOYMENT_GUIDE_PROMPT,
} from '../prompts/project-guide-prompts';
import type { AgentState } from '../types';

const systemPromptTemplate = PromptTemplate.fromTemplate(PROJECT_GUIDE_SYSTEM_PROMPT);
const projectPlanTemplate = PromptTemplate.fromTemplate(PROJECT_PLAN_PROMPT);
const architectureReviewTemplate = PromptTemplate.fromTemplate(ARCHITECTURE_REVIEW_PROMPT);
const milestoneReviewTemplate = PromptTemplate.fromTemplate(MILESTONE_REVIEW_PROMPT);
const debuggingGuideTemplate = PromptTemplate.fromTemplate(DEBUGGING_GUIDE_PROMPT);
const deploymentGuideTemplate = PromptTemplate.fromTemplate(DEPLOYMENT_GUIDE_PROMPT);

export interface ProjectTask {
  name: string;
  description: string;
  skills: string[];
}

export interface ProjectMilestone {
  name: string;
  description: string;
  estimatedDays: number;
  tasks: ProjectTask[];
  deliverables: string[];
  checkpoints: string[];
}

export interface ProjectPlan {
  overview: string;
  techStack: string[];
  milestones: ProjectMilestone[];
  evaluationCriteria: {
    codeQuality: string;
    functionality: string;
    testing: string;
    documentation: string;
    deployment: string;
  };
  resources: string[];
  tips: string[];
}

export interface ArchitectureReview {
  score: number;
  strengths: string[];
  concerns: string[];
  questions: string[];
  suggestions: string[];
  patterns: string[];
  scalabilityNotes: string;
  maintainabilityNotes: string;
}

export interface MilestoneReview {
  status: 'approved' | 'needs_work' | 'in_progress';
  completionPercentage: number;
  feedback: {
    completed: string[];
    missing: string[];
    improvements: string[];
  };
  nextSteps: string[];
  encouragement: string;
}

export interface DebuggingGuide {
  problemAnalysis: string;
  investigationQuestions: string[];
  debuggingSteps: string[];
  hints: string[];
  conceptsToReview: string[];
  commonMistakes: string[];
}

export interface DeploymentChecklist {
  item: string;
  description: string;
  priority: 'required' | 'recommended' | 'optional';
}

export interface DeploymentGuide {
  checklist: DeploymentChecklist[];
  environmentVariables: string[];
  cicdSuggestions: string[];
  securityChecklist: string[];
  monitoringSuggestions: string[];
  commonIssues: string[];
  resources: string[];
}

function parseJsonFromResponse<T>(content: string, fallback: T): T {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Failed to parse JSON response:', error);
  }
  return fallback;
}

export const projectGuideAgent = {
  name: 'projectGuide',

  async invoke(state: AgentState): Promise<{
    messages: AIMessage[];
    metadata: Record<string, unknown>;
  }> {
    const model = getModelForAgent('projectGuide');

    const projectData = state.metadata.project as {
      name?: string;
      milestone?: string;
      requirements?: string;
    } || {};

    const systemPrompt = await systemPromptTemplate.format({
      level: state.userProfile.level,
      projectName: projectData.name || 'Portfolio Project',
      milestone: projectData.milestone || 'Planning',
      requirements: projectData.requirements || 'Standard project requirements',
      ragContext: state.ragContext || '',
    });

    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      ...state.messages,
    ]);

    return {
      messages: [new AIMessage(response.content.toString())],
      metadata: {
        agentType: 'projectGuide',
      },
    };
  },

  async generateProjectPlan(
    projectName: string,
    description: string,
    studentLevel: number,
    timeAvailable: string
  ): Promise<ProjectPlan> {
    const model = getModelForAgent('projectGuide');

    const prompt = await projectPlanTemplate.format({
      projectName,
      description,
      level: studentLevel,
      timeAvailable,
    });

    const response = await model.invoke([new HumanMessage(prompt)]);

    return parseJsonFromResponse<ProjectPlan>(response.content.toString(), {
      overview: 'Unable to generate project plan',
      techStack: [],
      milestones: [],
      evaluationCriteria: {
        codeQuality: 'Clean, readable code',
        functionality: 'All features working',
        testing: '70%+ coverage',
        documentation: 'README and API docs',
        deployment: 'Live URL',
      },
      resources: [],
      tips: [],
    });
  },

  async reviewArchitecture(
    projectName: string,
    techStack: string[],
    architecture: string,
    fileStructure: string
  ): Promise<ArchitectureReview> {
    const model = getModelForAgent('projectGuide');

    const prompt = await architectureReviewTemplate.format({
      projectName,
      techStack: techStack.join(', '),
      architecture,
      fileStructure,
    });

    const response = await model.invoke([new HumanMessage(prompt)]);

    return parseJsonFromResponse<ArchitectureReview>(response.content.toString(), {
      score: 50,
      strengths: [],
      concerns: [],
      questions: [],
      suggestions: [],
      patterns: [],
      scalabilityNotes: 'Unable to assess',
      maintainabilityNotes: 'Unable to assess',
    });
  },

  async reviewMilestone(
    projectName: string,
    milestoneName: string,
    requirements: string,
    submission: string
  ): Promise<MilestoneReview> {
    const model = getModelForAgent('projectGuide');

    const prompt = await milestoneReviewTemplate.format({
      projectName,
      milestoneName,
      requirements,
      submission,
    });

    const response = await model.invoke([new HumanMessage(prompt)]);

    return parseJsonFromResponse<MilestoneReview>(response.content.toString(), {
      status: 'in_progress',
      completionPercentage: 0,
      feedback: { completed: [], missing: [], improvements: [] },
      nextSteps: [],
      encouragement: 'Keep going!',
    });
  },

  async guideDebugging(
    projectName: string,
    errorDescription: string,
    codeContext: string,
    attemptedSolutions: string
  ): Promise<DebuggingGuide> {
    const model = getModelForAgent('projectGuide');

    const prompt = await debuggingGuideTemplate.format({
      projectName,
      errorDescription,
      codeContext,
      attemptedSolutions,
    });

    const response = await model.invoke([new HumanMessage(prompt)]);

    return parseJsonFromResponse<DebuggingGuide>(response.content.toString(), {
      problemAnalysis: 'Unable to analyze',
      investigationQuestions: [],
      debuggingSteps: [],
      hints: [],
      conceptsToReview: [],
      commonMistakes: [],
    });
  },

  async generateDeploymentGuide(
    projectName: string,
    techStack: string[],
    platform: string,
    currentStatus: string
  ): Promise<DeploymentGuide> {
    const model = getModelForAgent('projectGuide');

    const prompt = await deploymentGuideTemplate.format({
      projectName,
      techStack: techStack.join(', '),
      platform,
      currentStatus,
    });

    const response = await model.invoke([new HumanMessage(prompt)]);

    return parseJsonFromResponse<DeploymentGuide>(response.content.toString(), {
      checklist: [],
      environmentVariables: [],
      cicdSuggestions: [],
      securityChecklist: [],
      monitoringSuggestions: [],
      commonIssues: [],
      resources: [],
    });
  },
};
