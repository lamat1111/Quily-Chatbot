import type { RetrievedChunk, SourceReference } from './types';

/**
 * Build a formatted context block from retrieved chunks
 * Each chunk is numbered for citation reference
 *
 * @param chunks - Retrieved chunks with citation indices
 * @returns Formatted context string for LLM
 */
export function buildContextBlock(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return 'No relevant documentation found.';
  }

  return chunks
    .map((chunk) => {
      const source = chunk.heading_path
        ? `${chunk.source_file} > ${chunk.heading_path}`
        : chunk.source_file;

      return `[${chunk.citationIndex}] Source: ${source}
---
${chunk.content}`;
    })
    .join('\n\n');
}

/**
 * Build the system prompt with embedded context
 *
 * @param context - Formatted context block from buildContextBlock
 * @param chunkCount - Number of sources available for citation
 * @returns Complete system prompt for LLM
 */
export function buildSystemPrompt(context: string, chunkCount: number): string {
  const maxCitation = chunkCount > 0 ? chunkCount : 0;

  return `You are a helpful Quilibrium protocol assistant. Your role is to answer questions about Quilibrium based ONLY on the provided documentation context.

## Instructions

1. Answer questions using ONLY the information from the context below.
2. Use citations [1] through [${maxCitation}] to reference your sources. Place citations inline where the information is used.
3. If the context doesn't contain relevant information to answer the question, say "I don't have specific information about that in the documentation."
4. Use markdown formatting for code blocks, lists, and emphasis where appropriate.
5. NEVER invent or use citation numbers beyond [${maxCitation}].
6. Be concise but thorough in your explanations.

## Documentation Context

${context}`;
}

/**
 * Format retrieved chunks as source references for client display
 *
 * @param chunks - Retrieved chunks with citation indices
 * @returns Array of source references with URLs where available
 */
export function formatSourcesForClient(chunks: RetrievedChunk[]): SourceReference[] {
  return chunks.map((chunk) => {
    let url: string | null = null;

    // Generate URL for docs/ files
    if (chunk.source_file.startsWith('docs/')) {
      // Remove 'docs/' prefix and '.md' extension
      const path = chunk.source_file
        .replace(/^docs\//, '')
        .replace(/\.md$/, '');
      url = `https://docs.quilibrium.com/${path}`;
    }

    return {
      index: chunk.citationIndex,
      file: chunk.source_file,
      heading: chunk.heading_path,
      url,
    };
  });
}
