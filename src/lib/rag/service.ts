import { generateText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { retrieveWithReranking } from './retriever';
import { buildContextBlock, buildSystemPrompt, formatSourcesForClient } from './prompt';
import { normalizeQuery } from './queryNormalizer';
import { parseFollowUpQuestions } from './followUpParser';
import type { RetrievedChunk, RetrievalOptions, SourceReference } from './types';
import type { RelevanceQuality } from './prompt';

export const INSTRUCTION_FOLLOWING_MODELS = [
  'anthropic/',
  'google/',
  'openai/',
];

export function isInstructionFollowingModel(model: string): boolean {
  return INSTRUCTION_FOLLOWING_MODELS.some((prefix) => model.startsWith(prefix));
}

export const LOW_RELEVANCE_FALLBACK_RESPONSE = `I don't have specific documentation about that topic in my knowledge base.

While Quilibrium supports various capabilities including token operations, compute deployment via QCL, and hypergraph storage, I don't have the detailed instructions for what you're asking about.

For the most accurate and up-to-date information, please check:
- **Official Documentation**: https://docs.quilibrium.com
- **Community Channels**: The Quilibrium Discord community can help with specific questions

Is there something else about Quilibrium I can help you with?`;

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

export async function processQuery(options: PrepareQueryOptions): Promise<ProcessQueryResult> {
  const prepared = await prepareQuery(options);
  const model = options.model || process.env.BOT_MODEL || 'deepseek/deepseek-chat-v3-0324';

  if (prepared.ragQuality !== 'high' && !isInstructionFollowingModel(model)) {
    return {
      text: LOW_RELEVANCE_FALLBACK_RESPONSE,
      sources: [],
      followUpQuestions: null,
    };
  }

  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    ...options.conversationHistory,
    { role: 'user' as const, content: options.query },
  ];

  const provider = createOpenRouter({ apiKey: options.llmApiKey });

  const result = await generateText({
    model: provider(model),
    system: prepared.systemPrompt,
    messages,
  });

  const { cleanText, questions } = parseFollowUpQuestions(result.text);

  return {
    text: cleanText,
    sources: prepared.sources,
    followUpQuestions: questions,
  };
}
