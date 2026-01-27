import { embed } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { supabase } from '@/src/lib/supabase';
import {
  buildContextBlock,
  buildSystemPrompt,
  getOfficialDocsUrl,
} from '@/src/lib/rag/prompt';

/**
 * Debug endpoint to inspect RAG retrieval without LLM generation
 *
 * POST /api/debug/retrieve
 *
 * Request body:
 * {
 *   "query": "your question here",
 *   "apiKey": "your-openrouter-key",
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

    if (!body.apiKey || typeof body.apiKey !== 'string') {
      return Response.json({ error: 'apiKey string required' }, { status: 400 });
    }

    const query = body.query;
    const apiKey = body.apiKey;
    const initialCount = body.initialCount ?? 15;
    const similarityThreshold = body.similarityThreshold ?? 0.5;

    const startTime = Date.now();

    // Step 0: Get database stats
    const { count: totalChunks, error: countError } = await supabase
      .from('document_chunks')
      .select('*', { count: 'exact', head: true });

    const { data: sourceStats } = await supabase
      .from('document_chunks')
      .select('source_file')
      .limit(1000);

    const uniqueSourceFiles = sourceStats
      ? [...new Set(sourceStats.map((r: { source_file: string }) => r.source_file))]
      : [];

    // Step 1: Generate embedding
    const embeddingStart = Date.now();
    const openrouter = createOpenRouter({ apiKey });

    const { embedding } = await embed({
      model: openrouter.textEmbeddingModel('openai/text-embedding-3-small'),
      value: query,
    });
    const embeddingTime = Date.now() - embeddingStart;

    // Step 2: Vector search
    const searchStart = Date.now();
    const { data: rawChunks, error } = await supabase.rpc('match_document_chunks', {
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

    const { context: contextBlock, quality, avgSimilarity } = buildContextBlock(top5Chunks);
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
