import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { aiConfig, ragConfig } from './config';
import { env } from '../env';

// Lazy-loaded model instances (only created when first accessed)
let _claudeModel: ChatAnthropic | null = null;
let _openaiModel: ChatOpenAI | null = null;
let _embeddings: OpenAIEmbeddings | null = null;

export function getClaudeModel(): ChatAnthropic {
  if (!_claudeModel) {
    _claudeModel = new ChatAnthropic({
      model: aiConfig.primaryModel,
      maxTokens: aiConfig.maxTokens,
      anthropicApiKey: env.ANTHROPIC_API_KEY,
    });
  }
  return _claudeModel;
}

export function getOpenAIModel(): ChatOpenAI {
  if (!_openaiModel) {
    if (!env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    _openaiModel = new ChatOpenAI({
      model: aiConfig.fallbackModel,
      maxTokens: aiConfig.maxTokens,
      openAIApiKey: env.OPENAI_API_KEY,
    });
  }
  return _openaiModel;
}

export function getEmbeddings(): OpenAIEmbeddings {
  if (!_embeddings) {
    if (!env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required for embeddings');
    }
    _embeddings = new OpenAIEmbeddings({
      model: ragConfig.embeddingModel,
      openAIApiKey: env.OPENAI_API_KEY,
    });
  }
  return _embeddings;
}

// Legacy exports for backward compatibility (lazy getters)
export const claudeModel = {
  get instance() {
    return getClaudeModel();
  },
};

export const openaiModel = {
  get instance() {
    return getOpenAIModel();
  },
};

export const embeddings = {
  get instance() {
    return getEmbeddings();
  },
};

export function getModelForAgent(
  agentType: string,
  preferClaude: boolean = true
) {
  const temperature = aiConfig.temperature[agentType as keyof typeof aiConfig.temperature] || 0.7;

  if (preferClaude) {
    return new ChatAnthropic({
      model: aiConfig.primaryModel,
      maxTokens: aiConfig.maxTokens,
      temperature,
    });
  }

  return new ChatOpenAI({
    model: aiConfig.fallbackModel,
    maxTokens: aiConfig.maxTokens,
    temperature,
  });
}
