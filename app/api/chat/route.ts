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
 * Command responses for Quily assistant
 */
const COMMAND_RESPONSES: Record<string, string> = {
  '/help': `# Quily Commands

Here are the available commands:

- \`/help\` — Display this help message with all available commands
- \`/examples\` — See example questions you can ask me
- \`/sources\` — View information about my knowledge sources

---

**What can I help you with?**

I'm Quily, your Quilibrium protocol assistant. I can help you with:
- Understanding Quilibrium's architecture and core concepts
- Node setup and operation questions
- Technical details from the whitepaper
- Writing content related to Quilibrium

Just ask me anything about Quilibrium!`,

  '/examples': `# Example Questions

Here are some questions you can ask me:

**Getting Started:**
- "What is Quilibrium?"
- "How do I set up a Quilibrium node?"
- "What are the system requirements for running a node?"

**Technical Concepts:**
- "How does Quilibrium's consensus mechanism work?"
- "What is the role of the MPC (Multi-Party Computation) in Quilibrium?"
- "Explain Quilibrium's approach to privacy"

**Node Operations:**
- "How do I check if my node is running correctly?"
- "What ports need to be open for a Quilibrium node?"
- "How do I update my node to the latest version?"

**Ecosystem:**
- "What is QConsole?"
- "How does S3 storage work on Quilibrium?"

---

Feel free to ask me any of these or your own questions about Quilibrium!`,

  '/sources': `# Knowledge Sources

My knowledge comes from the following official sources:

**Primary Documentation:**
- [Official Quilibrium Whitepaper](https://quilibrium.com/quilibrium.pdf) — Core concepts, architecture, and technical details
- [Quilibrium Documentation](https://docs.quilibrium.com) — Node operation guides and tutorials

**Key Topics Covered:**
- Quilibrium protocol architecture
- Consensus mechanisms
- Node setup and operation
- MPC (Multi-Party Computation)
- Privacy and security features
- QConsole services (S3, KMS)

---

**Important Note:**
> Use critical thinking — I do my best, but I can still make mistakes! Quilibrium is a complex and evolving technology. For the most accurate and up-to-date answers, I recommend consulting the official documentation at [docs.quilibrium.com](https://docs.quilibrium.com) and engaging with the community channels.`,
};

/**
 * Check if message is a command and return the response if so
 */
function getCommandResponse(message: string): string | null {
  const trimmed = message.trim().toLowerCase();
  return COMMAND_RESPONSES[trimmed] || null;
}

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

    // Check if this is a command
    const commandResponse = getCommandResponse(userQuery);
    if (commandResponse) {
      // Return command response as a streamed message (for consistency with normal responses)
      const stream = createUIMessageStream({
        execute: async ({ writer }) => {
          const textId = 'command-response';
          // Must send text-start before text-delta
          writer.write({
            type: 'text-start',
            id: textId,
          });
          // Write the command response as text chunk
          writer.write({
            type: 'text-delta',
            id: textId,
            delta: commandResponse,
          });
          // End the text block
          writer.write({
            type: 'text-end',
            id: textId,
          });
        },
      });
      return createUIMessageStreamResponse({ stream });
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

    // Create UI message stream with LLM response, then sources after completion
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        // Convert messages to standard format for LLM
        const llmMessages = messages.map((m: Record<string, unknown>) => ({
          role: getMessageRole(m),
          content: getMessageContent(m),
        }));

        // Prepare sources for sending after stream completes
        const sources = formatSourcesForClient(chunks);

        // Stream LLM response with onFinish callback to send sources
        const result = streamText({
          model: openrouter(model),
          system: systemPrompt,
          messages: llmMessages,
          onFinish: () => {
            // Send sources AFTER LLM stream completes
            // This ensures sources are part of the same message as the text
            // Use empty string for non-linkable sources (custom/transcriptions)
            for (const source of sources) {
              writer.write({
                type: 'source-url',
                sourceId: `source-${source.index}`,
                url: source.url ?? '',
                title: source.heading || source.file,
              });
            }
          },
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
