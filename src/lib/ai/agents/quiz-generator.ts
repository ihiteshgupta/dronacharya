import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { PromptTemplate } from '@langchain/core/prompts';
import { getModelForAgent } from '../models';
import {
  QUIZ_GENERATOR_SYSTEM_PROMPT,
  GENERATE_QUIZ_PROMPT,
  ADAPTIVE_QUESTION_PROMPT,
  ANALYZE_QUIZ_RESULTS_PROMPT,
  GENERATE_PRACTICE_SET_PROMPT,
} from '../prompts/quiz-generator-prompts';
import type { AgentState } from '../types';

const systemPromptTemplate = PromptTemplate.fromTemplate(QUIZ_GENERATOR_SYSTEM_PROMPT);
const generateQuizTemplate = PromptTemplate.fromTemplate(GENERATE_QUIZ_PROMPT);
const adaptiveQuestionTemplate = PromptTemplate.fromTemplate(ADAPTIVE_QUESTION_PROMPT);
const analyzeResultsTemplate = PromptTemplate.fromTemplate(ANALYZE_QUIZ_RESULTS_PROMPT);
const practiceSetTemplate = PromptTemplate.fromTemplate(GENERATE_PRACTICE_SET_PROMPT);

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'code_output' | 'fill_blank' | 'true_false' | 'short_answer';
  difficulty: number;
  question: string;
  codeSnippet?: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  hint: string;
  points: number;
  bloomLevel?: 'remember' | 'understand' | 'apply' | 'analyze';
  conceptsTested: string[];
}

export interface Quiz {
  title: string;
  description: string;
  estimatedMinutes: number;
  questions: QuizQuestion[];
  passingScore: number;
  totalPoints: number;
}

export interface AdaptiveQuestionResult {
  question: QuizQuestion;
  rationale: string;
}

export interface ConceptMastery {
  score: number;
  status: 'mastered' | 'developing' | 'needs_work';
}

export interface QuizRecommendation {
  type: 'review' | 'practice' | 'advance';
  topic: string;
  reason: string;
}

export interface QuizAnalysis {
  overallAssessment: string;
  strengthAreas: string[];
  weakAreas: string[];
  conceptMastery: Record<string, ConceptMastery>;
  recommendations: QuizRecommendation[];
  nextSteps: string[];
  encouragement: string;
  suggestedRetakeIn?: string;
}

export interface PracticeQuestion extends QuizQuestion {
  relatedConcept: string;
}

export interface PracticeSet {
  practiceSetTitle: string;
  targetConcepts: string[];
  questions: PracticeQuestion[];
  learningTips: string[];
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

export const quizGeneratorAgent = {
  name: 'quizGenerator',

  async invoke(state: AgentState): Promise<{
    messages: AIMessage[];
    metadata: Record<string, unknown>;
  }> {
    const model = getModelForAgent('assessor'); // Use assessor model for quiz generation

    const systemPrompt = await systemPromptTemplate.format({
      level: state.userProfile.level,
      topic: state.lessonContext.topic,
      objectives: state.lessonContext.objectives.join(', '),
      ragContext: state.ragContext || 'No specific content loaded.',
    });

    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      ...state.messages,
    ]);

    return {
      messages: [new AIMessage(response.content.toString())],
      metadata: {
        agentType: 'quizGenerator',
      },
    };
  },

  async generateQuiz(
    topic: string,
    content: string,
    options: {
      studentLevel?: number;
      previousScore?: number;
      questionCount?: number;
      focusAreas?: string[];
    } = {}
  ): Promise<Quiz> {
    const model = getModelForAgent('assessor');
    const {
      studentLevel = 1,
      previousScore = 0,
      questionCount = 10,
      focusAreas = [],
    } = options;

    const prompt = await generateQuizTemplate.format({
      topic,
      content: content.slice(0, 4000), // Limit content length
      level: studentLevel,
      previousScore,
      questionCount,
      focusAreas: focusAreas.join(', ') || 'all topics',
    });

    const response = await model.invoke([
      new SystemMessage('You are a quiz generator. Output valid JSON only.'),
      new HumanMessage(prompt),
    ]);

    return parseJsonFromResponse<Quiz>(response.content.toString(), {
      title: `Quiz: ${topic}`,
      description: 'Unable to generate quiz',
      estimatedMinutes: 10,
      questions: [],
      passingScore: 70,
      totalPoints: 0,
    });
  },

  async generateAdaptiveQuestion(
    previousQuestion: string,
    studentAnswer: string,
    wasCorrect: boolean,
    studentLevel: number,
    concepts: string[]
  ): Promise<AdaptiveQuestionResult> {
    const model = getModelForAgent('assessor');

    const prompt = await adaptiveQuestionTemplate.format({
      previousQuestion,
      studentAnswer,
      wasCorrect: wasCorrect ? 'yes' : 'no',
      level: studentLevel,
      concepts: concepts.join(', '),
    });

    const response = await model.invoke([
      new SystemMessage('Generate an adaptive follow-up question. Output valid JSON only.'),
      new HumanMessage(prompt),
    ]);

    return parseJsonFromResponse<AdaptiveQuestionResult>(response.content.toString(), {
      question: {
        id: 'adaptive-1',
        type: 'multiple_choice',
        difficulty: studentLevel,
        question: 'Unable to generate question',
        correctAnswer: '',
        explanation: '',
        hint: '',
        points: 10,
        conceptsTested: concepts,
      },
      rationale: 'Unable to generate rationale',
    });
  },

  async analyzeQuizResults(
    topic: string,
    questionsWithAnswers: Array<{
      question: QuizQuestion;
      studentAnswer: string;
      isCorrect: boolean;
    }>,
    score: number,
    totalPoints: number,
    timeTaken: number
  ): Promise<QuizAnalysis> {
    const model = getModelForAgent('assessor');

    const formattedQA = questionsWithAnswers
      .map(
        (qa, i) =>
          `Q${i + 1}: ${qa.question.question}\nStudent Answer: ${qa.studentAnswer}\nCorrect: ${qa.isCorrect ? 'Yes' : 'No'}\nCorrect Answer: ${qa.question.correctAnswer}\nConcepts: ${qa.question.conceptsTested.join(', ')}`
      )
      .join('\n\n');

    const prompt = await analyzeResultsTemplate.format({
      topic,
      questionsWithAnswers: formattedQA,
      score,
      totalPoints,
      timeTaken,
    });

    const response = await model.invoke([
      new SystemMessage('Analyze quiz results and provide comprehensive feedback. Output valid JSON only.'),
      new HumanMessage(prompt),
    ]);

    return parseJsonFromResponse<QuizAnalysis>(response.content.toString(), {
      overallAssessment: 'Unable to analyze results',
      strengthAreas: [],
      weakAreas: [],
      conceptMastery: {},
      recommendations: [],
      nextSteps: [],
      encouragement: 'Keep learning!',
    });
  },

  async generatePracticeSet(
    weakAreas: string[],
    studentLevel: number,
    content: string
  ): Promise<PracticeSet> {
    const model = getModelForAgent('assessor');

    const prompt = await practiceSetTemplate.format({
      weakAreas: weakAreas.join(', '),
      level: studentLevel,
      content: content.slice(0, 3000),
    });

    const response = await model.invoke([
      new SystemMessage('Generate a practice question set. Output valid JSON only.'),
      new HumanMessage(prompt),
    ]);

    return parseJsonFromResponse<PracticeSet>(response.content.toString(), {
      practiceSetTitle: `Practice: ${weakAreas[0] || 'Mixed Topics'}`,
      targetConcepts: weakAreas,
      questions: [],
      learningTips: [],
    });
  },

  async generateQuizFromRAG(
    topic: string,
    ragContext: string,
    studentLevel: number,
    questionCount: number = 5
  ): Promise<Quiz> {
    // Convenience method that uses RAG context directly
    return this.generateQuiz(topic, ragContext, {
      studentLevel,
      questionCount,
    });
  },
};
