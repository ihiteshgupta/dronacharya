import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import {
  quizGeneratorAgent,
  type Quiz,
  type QuizQuestion,
  type AdaptiveQuestionResult,
  type QuizAnalysis,
  type PracticeSet,
} from '../quiz-generator';
import type { AgentState } from '../../types';

// Mock the models module
vi.mock('../../models', () => ({
  getModelForAgent: vi.fn(),
}));

// Mock the prompts module - use real prompts via importOriginal
vi.mock('../../prompts/quiz-generator-prompts', async (importOriginal) => {
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

// Helper to create a valid quiz JSON response
function createQuizJson(overrides: Partial<Quiz> = {}): Quiz {
  return {
    title: 'JavaScript Fundamentals Quiz',
    description: 'Test your knowledge of JavaScript basics',
    estimatedMinutes: 10,
    questions: [
      {
        id: 'q1',
        type: 'multiple_choice',
        difficulty: 5,
        question: 'What is the correct way to declare a variable in JavaScript?',
        options: ['var x = 5', 'int x = 5', 'x := 5', 'declare x = 5'],
        correctAnswer: 'var x = 5',
        explanation: 'var is the traditional way to declare variables in JavaScript.',
        hint: 'Think about JavaScript keywords',
        points: 10,
        conceptsTested: ['variables', 'basics'],
      },
    ],
    passingScore: 70,
    totalPoints: 10,
    ...overrides,
  };
}

// Helper to create a quiz question
function createQuizQuestion(overrides: Partial<QuizQuestion> = {}): QuizQuestion {
  return {
    id: 'q1',
    type: 'multiple_choice',
    difficulty: 5,
    question: 'What is a closure in JavaScript?',
    options: [
      'A function with access to its outer scope',
      'A type of loop',
      'A way to close the browser',
      'None of the above',
    ],
    correctAnswer: 'A function with access to its outer scope',
    explanation: 'A closure is a function that has access to variables from its outer scope.',
    hint: 'Think about scope and functions',
    points: 10,
    conceptsTested: ['closures', 'scope'],
    ...overrides,
  };
}

// Helper to create mock agent state
function createMockState(overrides: Partial<AgentState> = {}): AgentState {
  return {
    messages: [new HumanMessage('Generate a quiz on JavaScript')],
    currentAgent: 'quizGenerator',
    lessonContext: {
      lessonId: 'lesson-1',
      topic: 'JavaScript Basics',
      courseId: 'course-1',
      objectives: ['Understand variables', 'Learn functions'],
      teachingMode: 'adaptive',
    },
    userProfile: {
      id: 'user-1',
      level: 25,
      learningStyle: 'visual',
      struggleAreas: [],
      interests: ['web development'],
      avgScore: 85,
    },
    ragContext: 'JavaScript is a programming language...',
    shouldContinue: true,
    metadata: {},
    ...overrides,
  };
}

describe('quizGeneratorAgent', () => {
  let mockModel: ReturnType<typeof createMockModel>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockModel = createMockModel();
    (getModelForAgent as Mock).mockReturnValue(mockModel);
  });

  describe('agent properties', () => {
    it('should have the correct name', () => {
      expect(quizGeneratorAgent.name).toBe('quizGenerator');
    });
  });

  describe('invoke', () => {
    it('should return quiz-related response for conversational request', async () => {
      const state = createMockState();
      mockModel.invoke.mockResolvedValue({
        content: "I'll help you create a quiz on JavaScript. What topics would you like to focus on?",
      });

      const result = await quizGeneratorAgent.invoke(state);

      expect(getModelForAgent).toHaveBeenCalledWith('assessor');
      expect(mockModel.invoke).toHaveBeenCalledTimes(1);
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toBeInstanceOf(AIMessage);
      expect(result.metadata.agentType).toBe('quizGenerator');
    });

    it('should use user profile level in system prompt', async () => {
      const state = createMockState({
        userProfile: {
          id: 'user-1',
          level: 50,
          learningStyle: 'auditory',
          struggleAreas: ['loops'],
          interests: ['AI'],
          avgScore: 90,
        },
      });
      mockModel.invoke.mockResolvedValue({
        content: 'Creating an advanced quiz for your level...',
      });

      await quizGeneratorAgent.invoke(state);

      const invokeCall = mockModel.invoke.mock.calls[0][0];
      expect(invokeCall[0]).toBeInstanceOf(SystemMessage);
      expect(invokeCall[0].content).toContain('50');
    });

    it('should pass through lesson context', async () => {
      const state = createMockState({
        lessonContext: {
          lessonId: 'lesson-2',
          topic: 'React Hooks',
          courseId: 'course-2',
          objectives: ['Master useState', 'Understand useEffect'],
          teachingMode: 'socratic',
        },
      });
      mockModel.invoke.mockResolvedValue({
        content: 'Generating React Hooks quiz...',
      });

      await quizGeneratorAgent.invoke(state);

      expect(mockModel.invoke).toHaveBeenCalled();
    });

    it('should handle model invocation errors in invoke', async () => {
      mockModel.invoke.mockRejectedValue(new Error('API Error'));

      const state = createMockState();

      await expect(quizGeneratorAgent.invoke(state)).rejects.toThrow('API Error');
    });
  });

  describe('generateQuiz', () => {
    it('should generate quiz with specified parameters', async () => {
      const quiz = createQuizJson();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(quiz),
      });

      const result = await quizGeneratorAgent.generateQuiz(
        'JavaScript',
        'JavaScript is a programming language used for web development.',
        { studentLevel: 25, questionCount: 5, focusAreas: ['variables', 'functions'] }
      );

      expect(getModelForAgent).toHaveBeenCalledWith('assessor');
      expect(mockModel.invoke).toHaveBeenCalledTimes(1);
      expect(result.title).toBe(quiz.title);
      expect(result.questions).toHaveLength(1);
    });

    it('should use default values when optional parameters are not provided', async () => {
      const quiz = createQuizJson();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(quiz),
      });

      const result = await quizGeneratorAgent.generateQuiz(
        'Python',
        'Python is a versatile programming language.'
      );

      expect(result).toBeDefined();
      expect(mockModel.invoke).toHaveBeenCalled();
    });

    it('should return fallback when JSON extraction fails', async () => {
      mockModel.invoke.mockResolvedValue({
        content: 'No JSON here, just plain text response.',
      });

      const result = await quizGeneratorAgent.generateQuiz(
        'JavaScript',
        'Content about JavaScript.'
      );

      expect(result.title).toContain('JavaScript');
      expect(result.questions).toEqual([]);
    });

    it('should include focus areas in prompt', async () => {
      const quiz = createQuizJson();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(quiz),
      });

      await quizGeneratorAgent.generateQuiz(
        'JavaScript',
        'Content about JavaScript closures and prototypes.',
        { focusAreas: ['closures', 'prototypes', 'async/await'] }
      );

      const invokeCall = mockModel.invoke.mock.calls[0][0];
      // Second message is the HumanMessage with the prompt
      expect(invokeCall[1]).toBeInstanceOf(HumanMessage);
    });

    it('should handle model invocation errors', async () => {
      mockModel.invoke.mockRejectedValue(new Error('Network Error'));

      await expect(
        quizGeneratorAgent.generateQuiz('JavaScript', 'Content')
      ).rejects.toThrow('Network Error');
    });

    it('should handle malformed JSON gracefully', async () => {
      mockModel.invoke.mockResolvedValue({
        content: '{ "title": "Quiz", "questions": [ } invalid json',
      });

      const result = await quizGeneratorAgent.generateQuiz(
        'JavaScript',
        'Content about JavaScript.'
      );

      // Falls back to default
      expect(result.title).toContain('JavaScript');
      expect(result.questions).toEqual([]);
    });

    it('should truncate content to 4000 chars', async () => {
      const quiz = createQuizJson();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(quiz),
      });

      const longContent = 'x'.repeat(5000);
      await quizGeneratorAgent.generateQuiz('Topic', longContent);

      expect(mockModel.invoke).toHaveBeenCalled();
    });
  });

  describe('generateAdaptiveQuestion', () => {
    it('should generate adaptive follow-up after correct answer', async () => {
      const adaptiveResult: AdaptiveQuestionResult = {
        question: createQuizQuestion({ difficulty: 7 }),
        rationale: 'Student answered correctly, increasing difficulty.',
      };
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(adaptiveResult),
      });

      const result = await quizGeneratorAgent.generateAdaptiveQuestion(
        'What is a variable?',
        'A named storage for data',
        true,
        25,
        ['variables', 'data types']
      );

      expect(result.rationale).toBeDefined();
      expect(result.question).toBeDefined();
    });

    it('should generate easier follow-up after incorrect answer', async () => {
      const adaptiveResult: AdaptiveQuestionResult = {
        question: createQuizQuestion({ difficulty: 3 }),
        rationale: 'Student struggled, providing an easier question.',
      };
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(adaptiveResult),
      });

      const result = await quizGeneratorAgent.generateAdaptiveQuestion(
        'Explain closures in JavaScript',
        'A closure is when you close a function',
        false,
        25,
        ['closures', 'scope']
      );

      expect(result.question.difficulty).toBe(3);
      expect(result.rationale).toContain('easier');
    });

    it('should return fallback when JSON extraction fails', async () => {
      mockModel.invoke.mockResolvedValue({
        content: 'Here is a follow-up question for you...',
      });

      const result = await quizGeneratorAgent.generateAdaptiveQuestion(
        'What is JS?',
        'A language',
        true,
        10,
        ['basics']
      );

      expect(result.question.id).toBe('adaptive-1');
      expect(result.rationale).toBe('Unable to generate rationale');
    });
  });

  describe('analyzeQuizResults', () => {
    it('should analyze quiz results and provide feedback', async () => {
      const analysis: QuizAnalysis = {
        overallAssessment: 'Good performance with room for improvement',
        strengthAreas: ['variables', 'functions'],
        weakAreas: ['closures'],
        conceptMastery: {
          variables: { score: 90, status: 'mastered' },
          closures: { score: 40, status: 'needs_work' },
        },
        recommendations: [
          { type: 'practice', topic: 'closures', reason: 'Low score on closure questions' },
        ],
        nextSteps: ['Review closure documentation', 'Practice with examples'],
        encouragement: 'Great start! Keep going!',
      };
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(analysis),
      });

      const questionsWithAnswers = [
        {
          question: createQuizQuestion({ conceptsTested: ['variables'] }),
          studentAnswer: 'A function with access to its outer scope',
          isCorrect: true,
        },
        {
          question: createQuizQuestion({ id: 'q2', conceptsTested: ['closures'] }),
          studentAnswer: 'Wrong answer',
          isCorrect: false,
        },
      ];

      const result = await quizGeneratorAgent.analyzeQuizResults(
        'JavaScript',
        questionsWithAnswers,
        50,
        100,
        15
      );

      expect(result.strengthAreas).toContain('variables');
      expect(result.weakAreas).toContain('closures');
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should return fallback when JSON extraction fails', async () => {
      mockModel.invoke.mockResolvedValue({
        content: 'Your results look good overall.',
      });

      const result = await quizGeneratorAgent.analyzeQuizResults(
        'JavaScript',
        [],
        0,
        100,
        10
      );

      expect(result.overallAssessment).toBe('Unable to analyze results');
      expect(result.encouragement).toBe('Keep learning!');
    });
  });

  describe('generatePracticeSet', () => {
    it('should generate practice questions for weak areas', async () => {
      const practiceSet: PracticeSet = {
        practiceSetTitle: 'Practice: Closures',
        targetConcepts: ['closures', 'scope'],
        questions: [
          {
            ...createQuizQuestion({ id: 'p1', difficulty: 3 }),
            relatedConcept: 'closures',
          },
        ],
        learningTips: ['Review how scope works in JavaScript'],
      };
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(practiceSet),
      });

      const result = await quizGeneratorAgent.generatePracticeSet(
        ['closures', 'scope'],
        25,
        'JavaScript closures allow functions to access outer scope variables...'
      );

      expect(result.practiceSetTitle).toContain('Closures');
      expect(result.targetConcepts).toContain('closures');
      expect(result.questions.length).toBeGreaterThan(0);
      expect(result.learningTips.length).toBeGreaterThan(0);
    });

    it('should return fallback when JSON extraction fails', async () => {
      mockModel.invoke.mockResolvedValue({
        content: 'Here are some practice questions...',
      });

      const result = await quizGeneratorAgent.generatePracticeSet(
        ['arrays'],
        10,
        'Content about arrays.'
      );

      expect(result.practiceSetTitle).toContain('arrays');
      expect(result.questions).toEqual([]);
    });

    it('should truncate content to 3000 chars', async () => {
      const practiceSet: PracticeSet = {
        practiceSetTitle: 'Practice: Topic',
        targetConcepts: ['topic'],
        questions: [],
        learningTips: [],
      };
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(practiceSet),
      });

      const longContent = 'x'.repeat(4000);
      await quizGeneratorAgent.generatePracticeSet(['topic'], 10, longContent);

      expect(mockModel.invoke).toHaveBeenCalled();
    });
  });

  describe('generateQuizFromRAG', () => {
    it('should generate quiz from RAG context', async () => {
      const quiz = createQuizJson();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(quiz),
      });

      const result = await quizGeneratorAgent.generateQuizFromRAG(
        'JavaScript Closures',
        'Closures are functions that capture variables from their surrounding scope...',
        25,
        5
      );

      expect(result.title).toBe(quiz.title);
      expect(getModelForAgent).toHaveBeenCalledWith('assessor');
    });

    it('should use default question count', async () => {
      const quiz = createQuizJson();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(quiz),
      });

      const result = await quizGeneratorAgent.generateQuizFromRAG(
        'Python',
        'Python is a general-purpose language...',
        15
      );

      expect(result).toBeDefined();
      expect(mockModel.invoke).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle model invocation errors in generateQuiz', async () => {
      mockModel.invoke.mockRejectedValue(new Error('Network Error'));

      await expect(
        quizGeneratorAgent.generateQuiz('JavaScript', 'Content')
      ).rejects.toThrow('Network Error');
    });

    it('should handle model invocation errors in generateAdaptiveQuestion', async () => {
      mockModel.invoke.mockRejectedValue(new Error('Timeout'));

      await expect(
        quizGeneratorAgent.generateAdaptiveQuestion('Q', 'A', true, 10, ['c'])
      ).rejects.toThrow('Timeout');
    });

    it('should handle model invocation errors in analyzeQuizResults', async () => {
      mockModel.invoke.mockRejectedValue(new Error('Service Error'));

      await expect(
        quizGeneratorAgent.analyzeQuizResults('Topic', [], 0, 100, 10)
      ).rejects.toThrow('Service Error');
    });

    it('should handle model invocation errors in generatePracticeSet', async () => {
      mockModel.invoke.mockRejectedValue(new Error('Rate Limited'));

      await expect(
        quizGeneratorAgent.generatePracticeSet(['area'], 10, 'content')
      ).rejects.toThrow('Rate Limited');
    });
  });
});
