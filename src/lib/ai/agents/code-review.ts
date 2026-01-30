import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { PromptTemplate } from '@langchain/core/prompts';
import { getModelForAgent } from '../models';
import {
  CODE_REVIEW_SYSTEM_PROMPT,
  CODE_ANALYSIS_PROMPT,
  INLINE_REVIEW_PROMPT,
  SECURITY_REVIEW_PROMPT,
  REFACTORING_SUGGESTIONS_PROMPT,
} from '../prompts/code-review-prompts';
import type { AgentState } from '../types';

const systemPromptTemplate = PromptTemplate.fromTemplate(CODE_REVIEW_SYSTEM_PROMPT);
const analysisTemplate = PromptTemplate.fromTemplate(CODE_ANALYSIS_PROMPT);
const inlineReviewTemplate = PromptTemplate.fromTemplate(INLINE_REVIEW_PROMPT);
const securityReviewTemplate = PromptTemplate.fromTemplate(SECURITY_REVIEW_PROMPT);
const refactoringTemplate = PromptTemplate.fromTemplate(REFACTORING_SUGGESTIONS_PROMPT);

export interface CodeReviewResult {
  overallAssessment: string;
  positives: string[];
  improvements: string[];
  resources: string[];
  score: number; // 0-100
}

export interface LineComment {
  line: number;
  type: 'suggestion' | 'issue' | 'praise';
  message: string;
}

export interface InlineReviewResult {
  summary: string;
  score: number;
  lineComments: LineComment[];
  conceptsToReview: string[];
}

export interface SecurityVulnerability {
  severity: 'high' | 'medium' | 'low';
  type: string;
  line: number;
  description: string;
  guidance: string;
}

export interface SecurityReviewResult {
  securityScore: number;
  vulnerabilities: SecurityVulnerability[];
  bestPractices: string[];
  recommendations: string[];
}

export interface RefactoringSuggestion {
  type: 'extract_method' | 'simplify' | 'rename' | 'reduce_duplication';
  lines: number[];
  question: string;
  benefit: string;
}

export interface RefactoringResult {
  refactoringScore: number;
  suggestions: RefactoringSuggestion[];
  patterns: string[];
  readingList: string[];
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

export const codeReviewAgent = {
  name: 'codeReview',

  async invoke(state: AgentState): Promise<{
    messages: AIMessage[];
    metadata: Record<string, unknown>;
  }> {
    const model = getModelForAgent('codeReview');

    const systemPrompt = await systemPromptTemplate.format({
      level: state.userProfile.level,
      language: state.lessonContext.language || 'python',
      ragContext: state.ragContext || 'No specific content loaded.',
    });

    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      ...state.messages,
    ]);

    return {
      messages: [new AIMessage(response.content.toString())],
      metadata: {
        agentType: 'codeReview',
      },
    };
  },

  async reviewCode(
    code: string,
    language: string,
    objective: string,
    studentLevel: number,
    ragContext?: string
  ): Promise<CodeReviewResult> {
    const model = getModelForAgent('codeReview');

    const systemPrompt = await systemPromptTemplate.format({
      level: studentLevel,
      language,
      ragContext: ragContext || 'General code review.',
    });

    const analysisPrompt = await analysisTemplate.format({
      language,
      code,
      objective,
    });

    const response = await model.invoke([
      new SystemMessage(systemPrompt + '\n\nRespond with JSON in this format: { "overallAssessment": "", "positives": [], "improvements": [], "resources": [], "score": 0 }'),
      new HumanMessage(analysisPrompt),
    ]);

    return parseJsonFromResponse<CodeReviewResult>(response.content.toString(), {
      overallAssessment: response.content.toString(),
      positives: [],
      improvements: [],
      resources: [],
      score: 50,
    });
  },

  async reviewWithInlineComments(
    code: string,
    language: string,
    objective: string
  ): Promise<InlineReviewResult> {
    const model = getModelForAgent('codeReview');

    const prompt = await inlineReviewTemplate.format({
      language,
      code,
      objective,
    });

    const response = await model.invoke([new HumanMessage(prompt)]);

    return parseJsonFromResponse<InlineReviewResult>(response.content.toString(), {
      summary: 'Unable to generate inline review',
      score: 50,
      lineComments: [],
      conceptsToReview: [],
    });
  },

  async securityReview(code: string, language: string): Promise<SecurityReviewResult> {
    const model = getModelForAgent('codeReview');

    const prompt = await securityReviewTemplate.format({
      language,
      code,
    });

    const response = await model.invoke([new HumanMessage(prompt)]);

    return parseJsonFromResponse<SecurityReviewResult>(response.content.toString(), {
      securityScore: 50,
      vulnerabilities: [],
      bestPractices: [],
      recommendations: [],
    });
  },

  async suggestRefactoring(code: string, language: string): Promise<RefactoringResult> {
    const model = getModelForAgent('codeReview');

    const prompt = await refactoringTemplate.format({
      language,
      code,
    });

    const response = await model.invoke([new HumanMessage(prompt)]);

    return parseJsonFromResponse<RefactoringResult>(response.content.toString(), {
      refactoringScore: 50,
      suggestions: [],
      patterns: [],
      readingList: [],
    });
  },

  async comprehensiveReview(
    code: string,
    language: string,
    objective: string,
    studentLevel: number,
    ragContext?: string
  ): Promise<{
    basic: CodeReviewResult;
    inline: InlineReviewResult;
    security: SecurityReviewResult;
    refactoring: RefactoringResult;
    overallScore: number;
  }> {
    // Run all reviews in parallel for efficiency
    const [basic, inline, security, refactoring] = await Promise.all([
      this.reviewCode(code, language, objective, studentLevel, ragContext),
      this.reviewWithInlineComments(code, language, objective),
      this.securityReview(code, language),
      this.suggestRefactoring(code, language),
    ]);

    // Calculate weighted overall score
    const overallScore = Math.round(
      basic.score * 0.4 +
      inline.score * 0.2 +
      security.securityScore * 0.25 +
      refactoring.refactoringScore * 0.15
    );

    return {
      basic,
      inline,
      security,
      refactoring,
      overallScore,
    };
  },
};
