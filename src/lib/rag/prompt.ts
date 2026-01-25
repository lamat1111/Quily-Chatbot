import type { RetrievedChunk, SourceReference } from './types';

/**
 * Build a formatted context block from retrieved chunks
 * Each chunk is numbered for citation reference and includes URL when available
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
      const url = getOfficialDocsUrl(chunk.source_file);
      const title = chunk.heading_path || getTitleFromPath(chunk.source_file);

      // Include URL in context so LLM can create proper links
      const sourceInfo = url
        ? `Source: [${title}](${url})`
        : `Source: ${title} (internal document)`;

      return `[${chunk.citationIndex}] ${sourceInfo}
---
${chunk.content}`;
    })
    .join('\n\n');
}

/**
 * Extract a human-readable title from a file path
 */
function getTitleFromPath(filePath: string): string {
  // Normalize path separators and get filename without extension
  const normalizedPath = filePath.replace(/\\/g, '/');
  const filename = normalizedPath.split('/').pop()?.replace(/\.md$/, '').replace(/\.txt$/, '') || filePath;
  // Convert kebab-case to Title Case and remove numeric prefixes
  return filename
    .replace(/^\d+-/, '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
2. Use citation numbers [1] through [${maxCitation}] to reference your sources. Place citations inline where the information is used, like this: "The qclient is a CLI tool [1]."
3. Do NOT create clickable links for sources in your response - just use the citation numbers like [1], [2], etc. The source links will be displayed separately below your response.
4. If the context doesn't contain relevant information to answer the question, say "I don't have specific information about that in the documentation. You might find more details at https://docs.quilibrium.com"
5. Use markdown formatting for code blocks, lists, and emphasis where appropriate.
6. NEVER invent or use citation numbers beyond [${maxCitation}].
7. Be concise but thorough in your explanations.

---

## Documentation Context

${context}`;
}

/**
 * Convert a local file path to the official docs website URL
 *
 * Transformation rules:
 * 1. Normalize path separators (Windows uses backslashes)
 * 2. Only works for quilibrium-official/ files (path is relative to docs/)
 * 3. Strip "quilibrium-official/" prefix
 * 4. Strip numeric prefixes from each path segment (e.g., "03-q-storage" -> "q-storage")
 * 5. Strip ".md" extension
 * 6. Prepend "https://docs.quilibrium.com/docs/"
 *
 * @param sourcePath - Relative file path from docs/ (e.g., "quilibrium-official/run-node/qclient/qclient-101.md")
 * @returns Website URL or null if not an official doc
 */
export function getOfficialDocsUrl(sourcePath: string): string | null {
  // Normalize path separators (Windows uses backslashes)
  const normalizedPath = sourcePath.replace(/\\/g, '/');
  const prefix = 'quilibrium-official/';

  if (!normalizedPath.startsWith(prefix)) {
    return null;
  }

  // Remove prefix and .md extension
  const relativePath = normalizedPath.slice(prefix.length).replace(/\.md$/, '');

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
