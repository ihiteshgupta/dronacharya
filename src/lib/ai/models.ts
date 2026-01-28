import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { aiConfig, ragConfig } from './config';

// Lazy-loaded model instances to avoid build-time errors when env vars are not set
let _claudeModel: ChatAnthropic | null = null;
let _openaiModel: ChatOpenAI | null = null;
let _embeddingsInstance: OpenAIEmbeddings | null = null;

export function getClaudeModel(): ChatAnthropic {
  if (!_claudeModel) {
    _claudeModel = new ChatAnthropic({
      model: aiConfig.primaryModel,
      maxTokens: aiConfig.maxTokens,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return _claudeModel;
}

export function getOpenAIModel(): ChatOpenAI {
  if (!_openaiModel) {
    _openaiModel = new ChatOpenAI({
      model: aiConfig.fallbackModel,
      maxTokens: aiConfig.maxTokens,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openaiModel;
}

export function getEmbeddings(): OpenAIEmbeddings {
  if (!_embeddingsInstance) {
    _embeddingsInstance = new OpenAIEmbeddings({
      model: ragConfig.embeddingModel,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _embeddingsInstance;
}

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
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  return new ChatOpenAI({
    model: aiConfig.fallbackModel,
    maxTokens: aiConfig.maxTokens,
    temperature,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
}
