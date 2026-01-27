import type { RetrievedChunk, SourceReference } from './types';

/**
 * Relevance quality levels based on similarity scores
 */
export type RelevanceQuality = 'high' | 'low' | 'none';

/**
 * Result of building context block, includes quality assessment
 */
export interface ContextBlockResult {
  /** Formatted context string for LLM */
  context: string;
  /** Quality assessment of retrieved chunks */
  quality: RelevanceQuality;
  /** Average similarity score of chunks */
  avgSimilarity: number;
}

/**
 * Threshold for "high relevance" - chunks above this are likely directly relevant
 * text-embedding-3-small typically produces 0.3-0.6 for related content
 */
const HIGH_RELEVANCE_THRESHOLD = 0.45;

/**
 * Build a formatted context block from retrieved chunks
 * Each chunk is numbered for citation reference and includes URL when available
 *
 * @param chunks - Retrieved chunks with citation indices
 * @returns Context block result with quality assessment
 */
export function buildContextBlock(chunks: RetrievedChunk[]): ContextBlockResult {
  if (chunks.length === 0) {
    return {
      context: 'No relevant documentation found for this query.',
      quality: 'none',
      avgSimilarity: 0,
    };
  }

  // Calculate average similarity to assess overall relevance
  const avgSimilarity = chunks.reduce((sum, c) => sum + c.similarity, 0) / chunks.length;
  const maxSimilarity = Math.max(...chunks.map(c => c.similarity));

  // Determine quality based on best match and average
  const quality: RelevanceQuality =
    maxSimilarity >= HIGH_RELEVANCE_THRESHOLD ? 'high' : 'low';

  const formattedChunks = chunks
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

  // Add quality warning for low-relevance results
  const qualityWarning = quality === 'low'
    ? `**⚠️ LOW RELEVANCE WARNING:** The documentation chunks below may not be directly relevant to the user's question. If the content below does not clearly answer the question, you MUST say "I don't have specific information about that in my documentation" rather than attempting to extrapolate or guess.\n\n`
    : '';

  return {
    context: qualityWarning + formattedChunks,
    quality,
    avgSimilarity,
  };
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
- Answer questions related to Quilibrium using ONLY the documentation context provided below.
- Assist with writing content such as posts, articles, or summaries related to Quilibrium.

**Knowledge Scope:**
Your knowledge is LIMITED to the documentation context provided below. This may include content from:
- The official Quilibrium whitepaper
- Official node documentation from docs.quilibrium.com
- Other verified Quilibrium sources

**Product Note:**
All S3 and KMS services are offered by **QConsole**, a product by Quilibrium Inc. that runs on the Quilibrium network.

**Boundaries:**
- Politely decline to answer or create content unrelated to Quilibrium. If asked about unrelated topics, respond with something like: "I'm Quily, and I'm specifically designed to help with Quilibrium-related questions. I'd be happy to help you with anything about the Quilibrium protocol, node operations, or the ecosystem!"

---

## CRITICAL: Do Not Guess or Hallucinate

**NEVER invent, guess, or extrapolate technical information that is not explicitly stated in the documentation context below.** This includes:

- CLI commands, flags, or arguments
- File paths or configuration options
- API endpoints or parameters
- Version numbers or release dates
- Code examples or scripts
- Specific numeric values (ports, limits, etc.)

If the documentation context does not contain the specific technical information needed to answer a question:
1. **Say so clearly** — e.g., "I don't see this specific command documented in my sources."
2. **Do NOT attempt to guess** what the command/syntax/value might be.
3. **Direct the user** to the official documentation: https://docs.quilibrium.com

It is FAR better to say "I don't have that information" than to provide incorrect technical details that could mislead users.

---

## Response Instructions

1. Answer questions using ONLY the information from the documentation context below. If the answer isn't in the context, say so.
2. Use citation numbers [1] through [${maxCitation}] to reference your sources. Place citations inline where the information is used, like this: "The qclient is a CLI tool [1]."
3. Do NOT create clickable links for sources in your response - just use the citation numbers like [1], [2], etc. The source links will be displayed separately below your response.
4. If the context doesn't contain the information needed, clearly state: "I don't have specific information about that in my documentation. Please check the official docs at https://docs.quilibrium.com"
5. Use markdown formatting for code blocks, lists, and emphasis where appropriate.
6. NEVER invent or use citation numbers beyond [${maxCitation}].
7. Be concise but thorough in your explanations.
8. When providing CLI commands or code, ONLY include commands that are explicitly shown in the documentation context. Do not modify, extend, or "improve" documented commands.

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
