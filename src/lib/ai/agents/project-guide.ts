import { AIMessage, SystemMessage, HumanMessage } from '@langchain/core/messages';
import { PromptTemplate } from '@langchain/core/prompts';
import { getModelForAgent } from '../models';
import {
  PROJECT_GUIDE_SYSTEM_PROMPT,
  MILESTONE_CREATION_PROMPT,
  MILESTONE_REVIEW_PROMPT,
  SUBMISSION_EVALUATION_PROMPT,
  PROJECT_SUGGESTION_PROMPT,
} from '../prompts/project-guide-prompts';
import type { AgentState } from '../types';

// Type definitions for milestone tracking
export interface ProjectMilestone {
  id: string;
  name: string;
  description: string;
  criteria: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'needs_revision';
  estimatedHours: number;
}

// Type definitions for project submission
export interface ProjectSubmission {
  projectId: string;
  userId: string;
  githubUrl: string;
  deployedUrl?: string;
  description: string;
  technologiesUsed: string[];
}

// Type definitions for evaluation result
export interface EvaluationResult {
  scores: {
    codeQuality: number;
    functionality: number;
    testing: number;
    documentation: number;
    deployment: number;
  };
  totalScore: number;
  passed: boolean;
  feedback: string;
  strengths: string[];
  improvements: string[];
  recommendation: 'approve' | 'revise' | 'reject';
}

// Type definitions for milestone review response
export interface MilestoneReviewResponse {
  approved: boolean;
  feedback: string;
  improvements: string[];
  nextSteps: string[];
}

// Type definitions for project suggestion response
export interface ProjectSuggestion {
  title: string;
  description: string;
  technologies: string[];
  estimatedHours: number;
  learningOutcomes: string[];
}

export interface ProjectSuggestionResponse {
  projects: ProjectSuggestion[];
}

// Helper function to extract JSON from response
function extractJsonFromResponse<T>(response: string): T {
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON object found in response');
  }
  return JSON.parse(jsonMatch[0]) as T;
}

const systemPromptTemplate = PromptTemplate.fromTemplate(PROJECT_GUIDE_SYSTEM_PROMPT);

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

  /**
   * Create milestones for a project based on requirements and difficulty
   */
  async createMilestones(
    projectRequirements: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<ProjectMilestone[]> {
    try {
      const model = getModelForAgent('projectGuide');
      const promptTemplate = PromptTemplate.fromTemplate(MILESTONE_CREATION_PROMPT);

      const prompt = await promptTemplate.format({
        projectRequirements,
        difficulty,
      });

      const response = await model.invoke([
        new SystemMessage(prompt),
        new HumanMessage(
          'Please create a set of milestones for this project based on the requirements and difficulty level.'
        ),
      ]);

      const responseText = response.content.toString();
      const parsed = extractJsonFromResponse<{ milestones: ProjectMilestone[] }>(responseText);

      return parsed.milestones;
    } catch (error) {
      console.error('Error in createMilestones:', error);
      throw new Error(
        `Failed to create milestones: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  /**
   * Review a milestone submission and provide feedback
   */
  async reviewMilestone(
    milestone: ProjectMilestone,
    submissionNotes: string,
    codeSnippets?: string
  ): Promise<MilestoneReviewResponse> {
    try {
      const model = getModelForAgent('projectGuide');
      const promptTemplate = PromptTemplate.fromTemplate(MILESTONE_REVIEW_PROMPT);

      const prompt = await promptTemplate.format({
        milestoneName: milestone.name,
        milestoneDescription: milestone.description,
        milestoneCriteria: milestone.criteria.join('\n- '),
        submissionNotes,
        codeSnippets: codeSnippets || 'No code snippets provided',
      });

      const response = await model.invoke([
        new SystemMessage(prompt),
        new HumanMessage(
          'Please review this milestone submission and provide feedback.'
        ),
      ]);

      const responseText = response.content.toString();
      return extractJsonFromResponse<MilestoneReviewResponse>(responseText);
    } catch (error) {
      console.error('Error in reviewMilestone:', error);
      throw new Error(
        `Failed to review milestone: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  /**
   * Evaluate a complete project submission
   */
  async evaluateSubmission(
    submission: ProjectSubmission
  ): Promise<EvaluationResult> {
    try {
      const model = getModelForAgent('projectGuide');
      const promptTemplate = PromptTemplate.fromTemplate(SUBMISSION_EVALUATION_PROMPT);

      const prompt = await promptTemplate.format({
        projectId: submission.projectId,
        githubUrl: submission.githubUrl,
        deployedUrl: submission.deployedUrl || 'Not provided',
        description: submission.description,
        technologiesUsed: submission.technologiesUsed.join(', '),
      });

      const response = await model.invoke([
        new SystemMessage(prompt),
        new HumanMessage(
          'Please evaluate this project submission according to the rubric.'
        ),
      ]);

      const responseText = response.content.toString();
      const result = extractJsonFromResponse<EvaluationResult>(responseText);

      // Ensure totalScore calculation is correct
      const calculatedTotal =
        result.scores.codeQuality +
        result.scores.functionality +
        result.scores.testing +
        result.scores.documentation +
        result.scores.deployment;

      return {
        ...result,
        totalScore: calculatedTotal,
        passed: calculatedTotal >= 70,
      };
    } catch (error) {
      console.error('Error in evaluateSubmission:', error);
      throw new Error(
        `Failed to evaluate submission: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  /**
   * Suggest projects based on student skills, interests, and difficulty preference
   */
  async suggestProjects(
    skills: string[],
    interests: string[],
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<ProjectSuggestionResponse> {
    try {
      const model = getModelForAgent('projectGuide');
      const promptTemplate = PromptTemplate.fromTemplate(PROJECT_SUGGESTION_PROMPT);

      const prompt = await promptTemplate.format({
        skills: skills.join(', ') || 'Not specified',
        interests: interests.join(', ') || 'Not specified',
        difficulty,
      });

      const response = await model.invoke([
        new SystemMessage(prompt),
        new HumanMessage(
          'Please suggest portfolio projects based on my profile.'
        ),
      ]);

      const responseText = response.content.toString();
      return extractJsonFromResponse<ProjectSuggestionResponse>(responseText);
    } catch (error) {
      console.error('Error in suggestProjects:', error);
      throw new Error(
        `Failed to suggest projects: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};
