import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
} from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { retrieveWithReranking } from '@/src/lib/rag/retriever';
import {
  buildContextBlock,
  buildSystemPrompt,
  formatSourcesForClient,
} from '@/src/lib/rag/prompt';

/**
 * Extract text content from message (handles various formats)
 */
function getMessageContent(msg: Record<string, unknown>): string {
  // Try content string first (legacy format)
  if (typeof msg.content === 'string') return msg.content;

  // Try parts array (AI SDK v6 format)
  if (Array.isArray(msg.parts)) {
    return msg.parts
      .filter((p): p is { type: string; text: string } =>
        p && typeof p === 'object' && 'type' in p && p.type === 'text' && typeof (p as { text?: unknown }).text === 'string'
      )
      .map((p) => p.text)
      .join('');
  }

  return '';
}

/**
 * Extract role from message
 */
function getMessageRole(msg: Record<string, unknown>): 'user' | 'assistant' | 'system' {
  const role = msg.role;
  if (role === 'user' || role === 'assistant' || role === 'system') {
    return role;
  }
  return 'user';
}

/**
 * POST /api/chat
 *
 * Streaming chat endpoint with RAG context injection.
 * Sends sources before streaming LLM response.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    // Basic validation without zod
    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response(
        JSON.stringify({ error: 'messages array required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!body.apiKey || typeof body.apiKey !== 'string') {
      return new Response(
        JSON.stringify({ error: 'apiKey string required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const messages = body.messages;
    const apiKey = body.apiKey;
    const model = body.model || 'anthropic/claude-3.5-sonnet';

    // Find last user message for retrieval
    const lastUserMessage = [...messages].reverse().find((m: Record<string, unknown>) => getMessageRole(m) === 'user');
    if (!lastUserMessage) {
      return new Response(
        JSON.stringify({ error: 'No user message found' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userQuery = getMessageContent(lastUserMessage);
    if (!userQuery) {
      return new Response(
        JSON.stringify({ error: 'Empty user message' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Retrieve relevant context
    let chunks: Awaited<ReturnType<typeof retrieveWithReranking>> = [];
    let systemPrompt = 'You are a helpful assistant that answers questions about Quilibrium.';

    try {
      chunks = await retrieveWithReranking(userQuery, {
        embeddingApiKey: apiKey,
        cohereApiKey: process.env.COHERE_API_KEY,
      });
      const context = buildContextBlock(chunks);
      systemPrompt = buildSystemPrompt(context, chunks.length);
    } catch (ragError) {
      console.error('RAG retrieval error:', ragError);
      // Continue without RAG context
    }

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

        // Convert messages to standard format for LLM
        const llmMessages = messages.map((m: Record<string, unknown>) => ({
          role: getMessageRole(m),
          content: getMessageContent(m),
        }));

        // Stream LLM response
        const result = streamText({
          model: openrouter(model),
          system: systemPrompt,
          messages: llmMessages,
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
