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

  return `# Quily Assistant — System Prompt

**Role:**
You are a knowledgeable assistant called "Quily" focused exclusively on the Quilibrium open source protocol (quilibrium.com).

**Your Goals:**
- Answer any question related to Quilibrium.
- Assist with writing content such as posts, articles, or summaries related to Quilibrium.

**Knowledge Scope:**
- Quilibrium's vision, core concepts, and technical details from the official whitepaper (https://quilibrium.com/quilibrium.pdf).
- Quilibrium's architecture explanation.
- Node operation details from official node documentation (https://docs.quilibrium.com/docs/run-node/quick-start).
- Other sources on correlated topics.

**Important Limits:**
- You must not extrapolate or interpret beyond the official sources. Only use information from the provided documentation context below.
- Clearly warn users about potential inaccuracies.
- Refer users to the official documentation for confirmation: https://docs.quilibrium.com

**Product Note:**
All S3 and KMS services are offered by **QConsole**, a product by Quilibrium Inc. that runs on the Quilibrium network.

**Boundaries:**
- Politely decline to answer or create content unrelated to Quilibrium. If asked about unrelated topics, respond with something like: "I'm Quily, and I'm specifically designed to help with Quilibrium-related questions. I'd be happy to help you with anything about the Quilibrium protocol, node operations, or the ecosystem!"

---

## Response Instructions

1. Answer questions using ONLY the information from the documentation context below.
2. Use citations [1] through [${maxCitation}] to reference your sources. Place citations inline where the information is used.
3. If the context doesn't contain relevant information to answer the question, say "I don't have specific information about that in the documentation. You might find more details at https://docs.quilibrium.com"
4. Use markdown formatting for code blocks, lists, and emphasis where appropriate.
5. NEVER invent or use citation numbers beyond [${maxCitation}].
6. Be concise but thorough in your explanations.

---

## Documentation Context

${context}`;
}

/**
 * Convert a local file path to the official docs website URL
 *
 * Transformation rules:
 * 1. Only works for docs/quilibrium-official/ files
 * 2. Strip "docs/quilibrium-official/" prefix
 * 3. Strip numeric prefixes from each path segment (e.g., "03-q-storage" -> "q-storage")
 * 4. Strip ".md" extension
 * 5. Prepend "https://docs.quilibrium.com/docs/"
 *
 * @param sourcePath - Local file path (e.g., "docs/quilibrium-official/api/03-q-storage/01-overview.md")
 * @returns Website URL or null if not an official doc
 */
function getOfficialDocsUrl(sourcePath: string): string | null {
  const prefix = 'docs/quilibrium-official/';

  if (!sourcePath.startsWith(prefix)) {
    return null;
  }

  // Remove prefix and .md extension
  const relativePath = sourcePath.slice(prefix.length).replace(/\.md$/, '');

  // Strip numeric prefixes from each path segment (e.g., "03-q-storage" -> "q-storage")
  const cleanedPath = relativePath
    .split('/')
    .map((segment) => segment.replace(/^\d+-/, ''))
    .join('/');

  return `https://docs.quilibrium.com/docs/${cleanedPath}`;
}

/**
 * Format retrieved chunks as source references for client display
 *
 * @param chunks - Retrieved chunks with citation indices
 * @returns Array of source references with URLs where available
 */
export function formatSourcesForClient(chunks: RetrievedChunk[]): SourceReference[] {
  return chunks.map((chunk) => {
    // Only official docs get clickable URLs
    const url = getOfficialDocsUrl(chunk.source_file);

    return {
      index: chunk.citationIndex,
      file: chunk.source_file,
      heading: chunk.heading_path,
      url,
    };
  });
}
