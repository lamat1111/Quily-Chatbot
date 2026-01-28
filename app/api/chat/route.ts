import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
} from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createChutes } from '@chutes-ai/ai-sdk-provider';
import { retrieveWithReranking } from '@/src/lib/rag/retriever';
import {
  buildContextBlock,
  buildSystemPrompt,
  formatSourcesForClient,
} from '@/src/lib/rag/prompt';
import { normalizeQuery } from '@/src/lib/rag/queryNormalizer';
import { getOAuthConfig, refreshTokens } from '@/src/lib/chutesAuth';
import { getProvider } from '@/src/lib/providers';
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
  cookieOptions,
  getServerAccessToken,
  getServerRefreshToken,
} from '@/src/lib/serverAuth';

/**
 * Models known to follow system prompt instructions reliably
 * These models can be trusted to say "I don't know" when RAG quality is low
 */
const INSTRUCTION_FOLLOWING_MODELS = [
  'anthropic/', // All Claude models
  'google/',    // All Gemini models
  'openai/',    // All GPT models
];

/**
 * Check if a model is known to follow instructions reliably
 */
function isInstructionFollowingModel(model: string): boolean {
  return INSTRUCTION_FOLLOWING_MODELS.some(prefix => model.startsWith(prefix));
}

/**
 * Canned response for low-relevance queries on models that don't follow instructions well
 */
const LOW_RELEVANCE_FALLBACK_RESPONSE = `I don't have specific documentation about that topic in my knowledge base.

While Quilibrium supports various capabilities including token operations, compute deployment via QCL, and hypergraph storage, I don't have the detailed instructions for what you're asking about.

For the most accurate and up-to-date information, please check:
- **Official Documentation**: https://docs.quilibrium.com
- **Community Channels**: The Quilibrium Discord community can help with specific questions

Is there something else about Quilibrium I can help you with?`;

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
 * Refresh Chutes access token if missing and refresh token is available.
 */
async function ensureChutesAccessToken(): Promise<{
  accessToken: string | null;
  refreshed: boolean;
  refreshToken?: string;
  expiresIn?: number;
}> {
  const accessToken = await getServerAccessToken();
  if (accessToken) {
    return { accessToken, refreshed: false };
  }

  const refreshToken = await getServerRefreshToken();
  if (!refreshToken) {
    return { accessToken: null, refreshed: false };
  }

  try {
    const config = getOAuthConfig();
    const refreshedTokens = await refreshTokens({ refreshToken, config });
    return {
      accessToken: refreshedTokens.access_token,
      refreshed: Boolean(refreshedTokens.access_token),
      refreshToken: refreshedTokens.refresh_token || refreshToken,
      expiresIn: refreshedTokens.expires_in ?? 3600,
    };
  } catch {
    return { accessToken: null, refreshed: false };
  }
}

function buildSetCookieHeader(name: string, value: string, maxAge?: number): string {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (cookieOptions.secure) {
    parts.push('Secure');
  }
  if (typeof maxAge === 'number') {
    parts.push(`Max-Age=${maxAge}`);
  }
  return parts.join('; ');
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

    // Basic validation without zod
    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response(
        JSON.stringify({ error: 'messages array required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const provider = body.provider || 'openrouter';
    console.log('Chat request:', {
      provider,
      model: body.model || null,
      messageCount: Array.isArray(body.messages) ? body.messages.length : 0,
    });
    if (provider !== 'openrouter' && provider !== 'chutes') {
      return new Response(
        JSON.stringify({ error: 'Unsupported provider' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const apiKey = body.apiKey;

    const messages = body.messages;
    const model =
      body.model ||
      (provider === 'chutes'
        ? process.env.CHUTES_DEFAULT_MODEL || ''
        : 'anthropic/claude-3.5-sonnet');

    if (provider === 'openrouter') {
      if (!apiKey || typeof apiKey !== 'string') {
        return new Response(
          JSON.stringify({ error: 'apiKey string required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    if (provider === 'chutes' && (!model || typeof model !== 'string')) {
      return new Response(
        JSON.stringify({ error: 'Chutes model required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find last user message for retrieval
    const lastUserMessage = [...messages].reverse().find((m: Record<string, unknown>) => getMessageRole(m) === 'user');
    if (!lastUserMessage) {
      return new Response(
        JSON.stringify({ error: 'No user message found' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const rawUserQuery = getMessageContent(lastUserMessage);
    if (!rawUserQuery) {
      return new Response(
        JSON.stringify({ error: 'Empty user message' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if this is a command (use raw query for exact command matching)
    const commandResponse = getCommandResponse(rawUserQuery);

    // Normalize query for RAG retrieval (handles "Q" → "Quilibrium", misspellings, etc.)
    const userQuery = normalizeQuery(rawUserQuery);
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
    let ragQuality: 'high' | 'low' | 'none' = 'none';
    let chutesAccessToken: string | null = null;
    let refreshedTokenInfo:
      | { refreshToken?: string; expiresIn?: number }
      | null = null;

    try {
      const openrouterKey = typeof apiKey === 'string' && apiKey.trim().length > 0 ? apiKey : null;
      // Use Chutes embeddings if explicitly configured OR if on Chutes provider with no OR key
      const useChutesEmbeddings =
        provider === 'chutes' && (Boolean(process.env.CHUTES_EMBEDDING_MODEL) || !openrouterKey);

      if (provider === 'chutes' || useChutesEmbeddings) {
        const ensured = await ensureChutesAccessToken();
        chutesAccessToken = ensured.accessToken;
        if (ensured.refreshed) {
          refreshedTokenInfo = {
            refreshToken: ensured.refreshToken,
            expiresIn: ensured.expiresIn,
          };
        }
        if (provider === 'chutes' && !chutesAccessToken) {
          return new Response(
            JSON.stringify({ error: 'Not authenticated with Chutes' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      const embeddingProvider = useChutesEmbeddings ? 'chutes' : 'openrouter';
      // Default to BGE-M3 for Chutes embeddings (1024-dim, matches document_chunks_chutes table)
      const embeddingModel =
        body.embeddingModel ||
        (useChutesEmbeddings
          ? process.env.CHUTES_EMBEDDING_MODEL || 'chutes-baai-bge-m3'
          : undefined);

      if (embeddingProvider === 'openrouter' && !openrouterKey) {
        console.warn('Skipping RAG retrieval: OpenRouter API key missing for embeddings.');
      } else {
        chunks = await retrieveWithReranking(userQuery, {
          embeddingProvider,
          embeddingApiKey: embeddingProvider === 'openrouter' ? openrouterKey || undefined : undefined,
          chutesAccessToken: embeddingProvider === 'chutes' ? chutesAccessToken || undefined : undefined,
          embeddingModel,
          cohereApiKey: process.env.COHERE_API_KEY,
        });
      }
      const { context, quality, avgSimilarity } = buildContextBlock(chunks);
      ragQuality = quality;
      console.log(
        `RAG retrieval: ${chunks.length} chunks, quality=${quality}, avgSimilarity=${avgSimilarity.toFixed(3)}, model=${model}, provider=${provider}`
      );
      const systemPrompt = buildSystemPrompt(context, chunks.length);
  } catch (ragError) {
    console.error('RAG retrieval error:', ragError);
  }

  // Fallback response for low-relevance queries on non-instruction-following models
  if (ragQuality !== 'high' && !isInstructionFollowingModel(model)) {
    return createUIMessageStreamResponse({
      stream: createUIMessageStream({
        execute: async ({ writer }) => {
          const textId = 'fallback-response';
          writer.write({ type: 'text-start', id: textId });
          writer.write({ type: 'text-delta', id: textId, delta: LOW_RELEVANCE_FALLBACK_RESPONSE });
          writer.write({ type: 'text-end', id: textId });
        },
      }),
    });
  }

  // Create provider using registry factory
  const providerConfig = getProvider(provider);
  if (!providerConfig) {
    return new Response(JSON.stringify({ error: 'Provider not found' }), { status: 404 });
  }

  const modelProvider = providerConfig.createProvider({
    apiKey: provider === 'openrouter' ? apiKey : undefined,
    accessToken: provider === 'chutes' ? chutesAccessToken || undefined : undefined,
  });

  // Create UI message stream with LLM response
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const llmMessages = messages.map((m: Record<string, unknown>) => ({
        role: getMessageRole(m),
        content: getMessageContent(m),
      }));

      const sources = formatSourcesForClient(chunks);
      const result = streamText({
        model: modelProvider(model) as any,
        system: systemPrompt,
        messages: llmMessages,
        onFinish: () => {
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

      writer.merge(result.toUIMessageStream());
    },
  });

    const response = createUIMessageStreamResponse({ stream });

    // If we refreshed Chutes token, update cookies on response
    if (provider === 'chutes' && refreshedTokenInfo?.expiresIn && chutesAccessToken) {
      response.headers.append(
        'Set-Cookie',
        buildSetCookieHeader(COOKIE_ACCESS_TOKEN, chutesAccessToken, refreshedTokenInfo.expiresIn)
      );
      if (refreshedTokenInfo.refreshToken) {
        response.headers.append(
          'Set-Cookie',
          buildSetCookieHeader(COOKIE_REFRESH_TOKEN, refreshedTokenInfo.refreshToken, 60 * 60 * 24 * 30)
        );
      }
    }

    return response;
  } catch (error) {
    console.error('Chat API error:', error);

    // Check for OpenRouter insufficient credits error (402)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isInsufficientCredits =
      errorMessage.includes('402') ||
      errorMessage.toLowerCase().includes('insufficient') ||
      errorMessage.toLowerCase().includes('credit');

    const isChutesUnauthorized =
      errorMessage.toLowerCase().includes('unauthorized') ||
      errorMessage.toLowerCase().includes('invalid token') ||
      errorMessage.includes('401');

    if (isInsufficientCredits) {
      return new Response(
        JSON.stringify({
          error: 'Insufficient credits',
          message:
            'Your OpenRouter account has run out of credits. Please add more credits at openrouter.ai/settings/billing to continue chatting.',
        }),
        {
          status: 402,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (isChutesUnauthorized) {
      return new Response(
        JSON.stringify({
          error: 'Not authenticated with Chutes',
          message: 'Your Chutes session expired. Please sign in again.',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: errorMessage,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
