import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { DocumentChunk } from './types.js';

// Batch size for database inserts
const UPLOAD_BATCH_SIZE = 100;

/**
 * Create Supabase client with service role key
 */
function getSupabaseClient(url: string, serviceKey: string): SupabaseClient {
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Upload document chunks with embeddings to Supabase
 * Uses upsert to handle re-ingestion without duplicates
 *
 * @param chunks - Document chunks with embeddings
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase service role key
 * @param onProgress - Optional callback for progress updates
 */
export async function uploadChunks(
  chunks: DocumentChunk[],
  supabaseUrl: string,
  supabaseKey: string,
  onProgress?: (completed: number, total: number) => void
): Promise<{ inserted: number; errors: string[] }> {
  const supabase = getSupabaseClient(supabaseUrl, supabaseKey);
  const total = chunks.length;
  let inserted = 0;
  const errors: string[] = [];

  // Process in batches
  for (let i = 0; i < chunks.length; i += UPLOAD_BATCH_SIZE) {
    const batch = chunks.slice(i, i + UPLOAD_BATCH_SIZE);

    // Transform chunks to database format
    const rows = batch.map((chunk) => ({
      content: chunk.content,
      embedding: chunk.embedding,
      source_file: chunk.metadata.source_file,
      heading_path: chunk.metadata.heading_path || null,
      chunk_index: chunk.metadata.chunk_index,
      token_count: chunk.metadata.token_count,
      version: chunk.metadata.version,
      content_hash: chunk.metadata.content_hash,
    }));

    try {
      const { error } = await supabase
        .from('document_chunks')
        .upsert(rows, {
          onConflict: 'source_file,chunk_index',
          ignoreDuplicates: false, // Update existing rows
        });

      if (error) {
        errors.push(`Batch ${Math.floor(i / UPLOAD_BATCH_SIZE) + 1}: ${error.message}`);
      } else {
        inserted += batch.length;
      }
    } catch (err) {
      errors.push(
        `Batch ${Math.floor(i / UPLOAD_BATCH_SIZE) + 1}: ${err instanceof Error ? err.message : String(err)}`
      );
    }

    // Report progress
    if (onProgress) {
      onProgress(Math.min(i + UPLOAD_BATCH_SIZE, total), total);
    }
  }

  return { inserted, errors };
}

/**
 * Delete all chunks for a specific source file
 * Useful for re-ingesting a single document
 */
export async function deleteChunksForFile(
  sourceFile: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<{ deleted: number }> {
  const supabase = getSupabaseClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('document_chunks')
    .delete()
    .eq('source_file', sourceFile)
    .select('id');

  if (error) {
    throw new Error(`Failed to delete chunks for ${sourceFile}: ${error.message}`);
  }

  return { deleted: data?.length ?? 0 };
}

/**
 * Get count of chunks in database
 * Useful for verification
 */
export async function getChunkCount(
  supabaseUrl: string,
  supabaseKey: string
): Promise<number> {
  const supabase = getSupabaseClient(supabaseUrl, supabaseKey);

  const { count, error } = await supabase
    .from('document_chunks')
    .select('*', { count: 'exact', head: true });

  if (error) {
    throw new Error(`Failed to count chunks: ${error.message}`);
  }

  return count ?? 0;
}
