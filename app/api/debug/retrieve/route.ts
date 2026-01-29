import { embed } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { supabase } from '@/src/lib/supabase';
import {
  buildContextBlock,
  buildSystemPrompt,
  getOfficialDocsUrl,
} from '@/src/lib/rag/prompt';

// Unified embedding model - BGE-M3 (1024 dims)
const OPENROUTER_EMBEDDING_MODEL = 'baai/bge-m3';
const CHUTES_EMBEDDING_MODEL_SLUG = 'chutes-baai-bge-m3';

type Provider = 'openrouter' | 'chutes';

// Chutes API response type
interface ChutesEmbeddingResponse {
  data: Array<{
    embedding: number[];
    index: number;
  }>;
  model: string;
}

/**
 * Call Chutes embedding API directly
 * The AI SDK provider has a bug where it routes to api.chutes.ai instead of the chute URL
 */
async function getChutesEmbedding(text: string, apiKey: string): Promise<number[]> {
  const url = `https://${CHUTES_EMBEDDING_MODEL_SLUG}.chutes.ai/v1/embeddings`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: [text],
      model: 'BAAI/bge-m3',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Chutes API error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as ChutesEmbeddingResponse;
  return data.data[0].embedding;
}

/**
 * Debug endpoint to inspect RAG retrieval without LLM generation
 *
 * POST /api/debug/retrieve
 *
 * Request body:
 * {
 *   "query": "your question here",
 *   "provider": "openrouter" | "chutes", // uses env var for API key
 *   "initialCount": 15,        // optional, default 15
 *   "similarityThreshold": 0.5 // optional, default 0.5
 * }
 *
 * Returns detailed retrieval diagnostics including:
 * - Raw chunks with similarity scores
 * - The actual context that would be sent to LLM
 * - The full system prompt
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.query || typeof body.query !== 'string') {
      return Response.json({ error: 'query string required' }, { status: 400 });
    }

    const provider: Provider = body.provider || 'openrouter';
    if (provider !== 'openrouter' && provider !== 'chutes') {
      return Response.json({ error: 'provider must be "openrouter" or "chutes"' }, { status: 400 });
    }

    // Get API key from environment based on provider
    const apiKey = provider === 'openrouter'
      ? process.env.OPENROUTER_API_KEY
      : process.env.CHUTES_API_KEY;

    if (!apiKey) {
      return Response.json({
        error: `${provider.toUpperCase()}_API_KEY not configured in environment`
      }, { status: 500 });
    }

    const query = body.query;
    const initialCount = body.initialCount ?? 15;
    const similarityThreshold = body.similarityThreshold ?? 0.5;

    const startTime = Date.now();

    // Step 0: Get database stats
    const { count: totalChunks } = await supabase
      .from('document_chunks_chutes')
      .select('*', { count: 'exact', head: true });

    const { data: sourceStats } = await supabase
      .from('document_chunks_chutes')
      .select('source_file')
      .limit(1000);

    const uniqueSourceFiles = sourceStats
      ? [...new Set(sourceStats.map((r: { source_file: string }) => r.source_file))]
      : [];

    // Step 1: Generate embedding
    const embeddingStart = Date.now();

    let embedding: number[];
    if (provider === 'chutes') {
      // Use direct API call (AI SDK provider has routing bug)
      embedding = await getChutesEmbedding(query, apiKey);
    } else {
      const openrouter = createOpenRouter({ apiKey });
      const embeddingResult = await embed({
        model: openrouter.textEmbeddingModel(OPENROUTER_EMBEDDING_MODEL),
        value: query,
      });
      embedding = embeddingResult.embedding;
    }
    const embeddingTime = Date.now() - embeddingStart;

    // Step 2: Vector search (use unified BGE-M3 table for both providers)
    const searchStart = Date.now();
    const { data: rawChunks, error } = await supabase.rpc('match_document_chunks_chutes', {
      query_embedding: embedding,
      match_threshold: similarityThreshold,
      match_count: initialCount,
    });
    const searchTime = Date.now() - searchStart;

    if (error) {
      return Response.json(
        { error: 'Supabase RPC error', details: error.message },
        { status: 500 }
      );
    }

    // Step 3: Format chunks with additional debug info
    const chunksWithDebug = (rawChunks || []).map(
      (
        chunk: {
          id: number;
          content: string;
          source_file: string;
          heading_path: string | null;
          similarity: number;
        },
        index: number
      ) => ({
        rank: index + 1,
        id: chunk.id,
        similarity: chunk.similarity,
        similarityPercent: `${(chunk.similarity * 100).toFixed(1)}%`,
        source_file: chunk.source_file,
        heading_path: chunk.heading_path,
        url: getOfficialDocsUrl(chunk.source_file),
        content_preview: chunk.content.slice(0, 200) + (chunk.content.length > 200 ? '...' : ''),
        content_length: chunk.content.length,
        full_content: chunk.content,
      })
    );

    // Step 4: Build what would be sent to LLM
    const top5Chunks = (rawChunks || []).slice(0, 5).map(
      (
        chunk: {
          id: number;
          content: string;
          source_file: string;
          heading_path: string | null;
          similarity: number;
        },
        idx: number
      ) => ({
        ...chunk,
        citationIndex: idx + 1,
      })
    );

    const { context: contextBlock } = buildContextBlock(top5Chunks);
    const systemPrompt = buildSystemPrompt(contextBlock, top5Chunks.length);

    const totalTime = Date.now() - startTime;

    // Return comprehensive debug info
    return Response.json({
      database: {
        total_chunks: totalChunks ?? 0,
        unique_source_files: uniqueSourceFiles.length,
        source_files: uniqueSourceFiles.slice(0, 20), // First 20 for preview
        warning: (totalChunks ?? 0) < 50 ? 'LOW CHUNK COUNT - Have you run the ingestion script?' : null,
      },
      query,
      provider, // Include which provider was used
      timing: {
        embedding_ms: embeddingTime,
        search_ms: searchTime,
        total_ms: totalTime,
      },
      retrieval: {
        threshold: similarityThreshold,
        requested: initialCount,
        returned: rawChunks?.length ?? 0,
        chunks: chunksWithDebug,
      },
      llm_input: {
        top_k: 5,
        chunks_used: top5Chunks.length,
        context_block: contextBlock,
        system_prompt_length: systemPrompt.length,
        system_prompt: systemPrompt,
      },
      analysis: {
        has_results: (rawChunks?.length ?? 0) > 0,
        top_similarity: chunksWithDebug[0]?.similarity ?? null,
        lowest_similarity: chunksWithDebug[chunksWithDebug.length - 1]?.similarity ?? null,
        avg_similarity:
          chunksWithDebug.length > 0
            ? chunksWithDebug.reduce(
                (sum: number, c: { similarity: number }) => sum + c.similarity,
                0
              ) / chunksWithDebug.length
            : null,
        unique_sources: [...new Set(chunksWithDebug.map((c: { source_file: string }) => c.source_file))],
      },
    });
  } catch (error) {
    console.error('Debug retrieve error:', error);
    return Response.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
