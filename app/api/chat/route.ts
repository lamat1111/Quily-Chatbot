import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
} from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from 'zod';
import { retrieveWithReranking } from '@/src/lib/rag/retriever';
import {
  buildContextBlock,
  buildSystemPrompt,
  formatSourcesForClient,
} from '@/src/lib/rag/prompt';

/**
 * Request schema for chat API
 */
const requestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
    })
  ),
  apiKey: z.string().min(1, 'API key required'),
  model: z.string().default('anthropic/claude-3.5-sonnet'),
});

/**
 * POST /api/chat
 *
 * Streaming chat endpoint with RAG context injection.
 * Sends sources before streaming LLM response.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request
    const parseResult = requestSchema.safeParse(body);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: parseResult.error.flatten(),
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { messages, apiKey, model } = parseResult.data;

    // Find last user message for retrieval
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMessage) {
      return new Response(
        JSON.stringify({ error: 'No user message found' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Retrieve relevant context
    const chunks = await retrieveWithReranking(lastUserMessage.content, {
      embeddingApiKey: apiKey,
      cohereApiKey: process.env.COHERE_API_KEY,
    });

    // Build prompt with context
    const context = buildContextBlock(chunks);
    const systemPrompt = buildSystemPrompt(context, chunks.length);

    // Create OpenRouter provider with user's API key
    const openrouter = createOpenRouter({ apiKey });

    // Create UI message stream with sources first, then LLM response
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        // Send sources as source-url parts before LLM stream
        const sources = formatSourcesForClient(chunks);
        for (const source of sources) {
          writer.write({
            type: 'source-url',
            sourceId: `source-${source.index}`,
            url: source.url || source.file,
            title: source.heading || source.file,
          });
        }

        // Stream LLM response
        const result = streamText({
          model: openrouter(model),
          system: systemPrompt,
          messages,
        });

        // Merge LLM stream into our stream
        writer.merge(result.toUIMessageStream());
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    console.error('Chat API error:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
