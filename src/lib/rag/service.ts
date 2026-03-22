import { generateText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createChutes } from '@chutes-ai/ai-sdk-provider';
import { retrieveWithReranking } from './retriever';
import { buildContextBlock, buildSystemPrompt, formatSourcesForClient } from './prompt';
import { normalizeQuery } from './queryNormalizer';
import { parseFollowUpQuestions } from './followUpParser';
import { ragTools } from './tools';
import type { RetrievedChunk, RetrievalOptions, SourceReference } from './types';
import type { RelevanceQuality } from './prompt';

export interface PrepareQueryOptions {
  query: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  priorityDocIds?: number[];
  llmProvider?: 'openrouter' | 'chutes';
  llmApiKey?: string;
  model?: string;
  embeddingProvider?: 'openrouter' | 'chutes';
  embeddingApiKey?: string;
  chutesAccessToken?: string;
  embeddingModel?: string;
  cohereApiKey?: string;
}

export interface PreparedQuery {
  systemPrompt: string;
  retrievedChunks: RetrievedChunk[];
  normalizedQuery: string;
  ragQuality: RelevanceQuality;
  avgSimilarity: number;
  sources: SourceReference[];
}

export interface ProcessQueryResult {
  text: string;
  sources: SourceReference[];
  followUpQuestions: string[] | null;
  toolCalls: Array<{ toolName: string; input: Record<string, string> }>;
}

export async function prepareQuery(options: PrepareQueryOptions): Promise<PreparedQuery> {
  const normalizedQuery = normalizeQuery(options.query);

  const retrievalOptions: RetrievalOptions = {
    embeddingProvider: options.embeddingProvider || 'openrouter',
    embeddingApiKey: options.embeddingApiKey,
    chutesAccessToken: options.chutesAccessToken,
    embeddingModel: options.embeddingModel,
    cohereApiKey: options.cohereApiKey,
    priorityDocIds: options.priorityDocIds,
  };

  const chunks = await retrieveWithReranking(normalizedQuery, retrievalOptions);
  const { context, quality, avgSimilarity } = buildContextBlock(chunks);
  const systemPrompt = buildSystemPrompt(context, chunks.length);
  const sources = formatSourcesForClient(chunks);

  return {
    systemPrompt,
    retrievedChunks: chunks,
    normalizedQuery,
    ragQuality: quality,
    avgSimilarity,
    sources,
  };
}

// Default models per provider
const OPENROUTER_DEFAULT_MODEL = 'deepseek/deepseek-v3.2';
const CHUTES_DEFAULT_MODEL = 'chutes-deepseek-ai-deepseek-v3-1-tee';

const DEFAULT_FALLBACK_MODELS: Record<string, string[]> = {
  openrouter: [
    'qwen/qwen3-32b',
    'mistralai/mistral-small-3.2-24b-instruct',
  ],
  chutes: [
    'chutes-qwen-qwen3-32b',
    'chutes-chutesai-mistral-small-3-2-24b-instruct-2506',
  ],
};

function getFallbackModels(llmProvider: string): string[] {
  const envModels = process.env.BOT_FALLBACK_MODELS;
  if (envModels) return envModels.split(',').map((m) => m.trim()).filter(Boolean);
  return DEFAULT_FALLBACK_MODELS[llmProvider] || DEFAULT_FALLBACK_MODELS.openrouter;
}

/**
 * Convert a Chutes slug to its URL form for the AI SDK provider.
 */
function getChuteUrl(slug: string): string {
  if (slug.startsWith('http://') || slug.startsWith('https://')) return slug;
  return `https://${slug}.chutes.ai`;
}

export async function processQuery(options: PrepareQueryOptions): Promise<ProcessQueryResult> {
  const t0 = Date.now();
  const prepared = await prepareQuery(options);
  console.log(`[processQuery] prepareQuery took ${Date.now() - t0}ms`);

  const llmProvider = options.llmProvider || 'openrouter';
  const defaultModel = llmProvider === 'chutes' ? CHUTES_DEFAULT_MODEL : OPENROUTER_DEFAULT_MODEL;
  const primaryModel = options.model || process.env.BOT_MODEL || defaultModel;

  // All queries go to the LLM — the personality and system prompt handle
  // both casual interactions (jokes, banter) and low-relevance knowledge
  // questions. The LOW RELEVANCE WARNING injected into the context block
  // guards against hallucination on topics without good documentation.

  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    ...options.conversationHistory,
    { role: 'user' as const, content: options.query },
  ];

  const modelsToTry = [primaryModel, ...getFallbackModels(llmProvider)];
  let lastError: unknown;

  for (const model of modelsToTry) {
    try {
      const modelId = llmProvider === 'chutes' ? getChuteUrl(model) : model;
      // Both providers return AI SDK-compatible models; Chutes types include
      // Promise<LanguageModelV2> which confuses the union — cast is safe.
      const aiModel = llmProvider === 'chutes'
        ? createChutes({ apiKey: options.llmApiKey })(modelId) as Parameters<typeof generateText>[0]['model']
        : createOpenRouter({ apiKey: options.llmApiKey })(modelId);
      const t1 = Date.now();
      const result = await generateText({
        model: aiModel,
        system: prepared.systemPrompt,
        messages,
        tools: ragTools,
        maxOutputTokens: 1000,
      });
      console.log(`[processQuery] generateText (${model}) took ${Date.now() - t1}ms`);

      const { cleanText, questions } = parseFollowUpQuestions(result.text);

      const toolCalls = (result.toolCalls || []).map((tc) => ({
        toolName: tc.toolName,
        input: tc.input as Record<string, string>,
      }));

      return {
        text: cleanText,
        sources: prepared.sources,
        followUpQuestions: questions,
        toolCalls,
      };
    } catch (error) {
      lastError = error;
      console.error(`Model ${model} failed, ${modelsToTry.indexOf(model) < modelsToTry.length - 1 ? 'trying next fallback...' : 'no more fallbacks'}`);
    }
  }

  throw lastError;
}
