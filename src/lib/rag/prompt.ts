import type { RetrievedChunk, SourceReference } from './types';
import { buildPersonalityBlock } from './personality';

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
      // Priority: 1) source_url from frontmatter, 2) official docs URL, 3) repo docs URL
      const url = chunk.source_url || getOfficialDocsUrl(chunk.source_file) || getRepoDocsUrl(chunk.source_file);

      // Check if this is a livestream transcript
      const isLivestream = chunk.doc_type === 'livestream_transcript';

      // For livestreams, use "Livestream" as link text (titles don't reflect varied content)
      // For other docs, use frontmatter title, then heading path, then derive from file path
      const title = isLivestream
        ? 'Livestream'
        : chunk.title || chunk.heading_path || getTitleFromPath(chunk.source_file);

      // Build metadata annotation (type + date + trust level)
      // For livestreams, only show date (type is already in the link text)
      const metaParts: string[] = [];

      // Check if this is community-contributed (unofficial) content
      const normalizedPath = chunk.source_file.replace(/\\/g, '/');
      const isCommunityDoc = normalizedPath.startsWith('community/');

      if (chunk.doc_type && !isLivestream) {
        // Format doc_type for display: 'community_faq' -> 'Community Faq'
        const typeLabel = chunk.doc_type
          .replace(/_transcript$/, '')
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        metaParts.push(typeLabel);
      } else if (!chunk.doc_type && normalizedPath.startsWith('quilibrium-official/')) {
        // Mark official documentation
        metaParts.push('Official Docs');
      }

      // Add trust level indicator for community docs
      if (isCommunityDoc) {
        metaParts.push('Unofficial');
      }
      if (chunk.published_date) {
        // Format date: '2026-01-21' -> 'Jan 21, 2026'
        const date = new Date(chunk.published_date + 'T00:00:00');
        const formatted = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        metaParts.push(formatted);
      }
      const metaAnnotation = metaParts.length > 0 ? ` (${metaParts.join(', ')})` : '';

      // Include URL in context so LLM can create proper links
      const sourceInfo = url
        ? `Source: [${title}](${url})${metaAnnotation}`
        : `Source: ${title}${metaAnnotation} (internal document)`;

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
  const personality = buildPersonalityBlock();

  return `# Quily Assistant — System Prompt

${personality}

---

## Knowledge Scope

Your knowledge is LIMITED to the documentation context provided below. This may include content from:
- The official Quilibrium whitepaper
- Official node documentation from docs.quilibrium.com
- Transcripts from official Quilibrium streams and communications
- Community-contributed documentation (marked as unofficial)

**Today's Date:** ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

**CRITICAL - Determining Recency:**
When users ask about "the last", "most recent", or "latest" livestream/content:
1. Look at ALL publication dates in the documentation context below
2. The "last" or "most recent" is the one with the date CLOSEST TO (but not after) today's date
3. A date like "Jan 21, 2026" is MORE RECENT than "Mar 10, 2025" because 2026 > 2025
4. Do NOT assume the first source listed is the most recent - CHECK THE DATES

**CRITICAL - Planned vs. Live Features:**
Documentation may describe features that are NOT yet live or available. Pay close attention to language indicating status:
- Phrases like "upcoming", "planned", "future protocol upgrade", "not yet available", "under development", "we're going to", "we'll bring out", "can't wait to publish" indicate **planned/future** features.
- If a feature is described in a roadmap or future context, you MUST clearly state it is **planned or in development** and NOT yet available on the network.
- Do NOT present planned features as if they are currently working or accessible to users.
- When in doubt, err on the side of saying a feature is planned rather than implying it is live.
- **Recency tiebreaker:** If two sources give conflicting information about a feature's status (e.g., one says "planned" and another says "launched"), trust the source with the MORE RECENT publication date.

**Product Note:**
All S3 and KMS services are offered by **QConsole**, a product by Quilibrium Inc. that runs on the Quilibrium network.

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
9. NEVER describe, explain, or characterize a product, service, or feature unless the documentation context contains at least a full sentence explaining what it does. A product name in a table cell, header, list item, or passing mention is NOT enough — treat it as unknown. This includes name-based guessing: "QPing" sounding like "ping" does not mean you know what it does.
10. If the user asks about multiple topics and you only have documentation for some of them, ONLY answer about the ones with sufficient documentation. For the rest, explicitly list them and say: "I don't have documentation on [X], [Y], and [Z] — check docs.quilibrium.com for those."
11. The documentation context below contains AT MOST ${maxCitation} source chunks. If the user's question covers more topics than that, you almost certainly have INCOMPLETE coverage. Do not assume these chunks represent everything. Only discuss what is explicitly covered.
12. For broad questions ("what are all the products?", "give me an overview"), first identify which specific topics are actually covered in the chunks below, then ONLY discuss those. Explicitly note that your answer may be incomplete.

---

## Documentation Context

${context}

---

## Follow-Up Questions

After answering, suggest 2-3 follow-up questions the user might want to ask. These questions MUST:
1. Be based ONLY on topics mentioned in the documentation context above
2. Be 10-150 characters each
3. Be questions you can actually answer from the provided context

Format them as a JSON array inside a markdown code fence at the very end of your response:

\`\`\`json
["Question 1?", "Question 2?", "Question 3?"]
\`\`\`

If there are no relevant follow-up questions possible from the context, omit this section entirely.`;
}

/**
 * GitHub repository base URL for community/custom docs
 */
const REPO_DOCS_BASE = 'https://github.com/lamat1111/Quily-Chatbot/blob/main/docs';

/**
 * Convert a community or custom doc path to a GitHub blob URL
 *
 * @param sourcePath - Relative file path from docs/ (e.g., "community/QNS-FAQ.md")
 * @returns GitHub blob URL or null if not a community/custom doc
 */
export function getRepoDocsUrl(sourcePath: string): string | null {
  const normalizedPath = sourcePath.replace(/\\/g, '/');

  // Only handle community/ and custom/ folders
  if (!normalizedPath.startsWith('community/') && !normalizedPath.startsWith('custom/')) {
    return null;
  }

  // URL-encode path segments (handles spaces and special chars)
  const encodedPath = normalizedPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `${REPO_DOCS_BASE}/${encodedPath}`;
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
    // Priority: 1) source_url from frontmatter, 2) official docs URL, 3) repo docs URL
    const url = chunk.source_url || getOfficialDocsUrl(chunk.source_file) || getRepoDocsUrl(chunk.source_file);

    return {
      id: chunk.id,
      index: chunk.citationIndex,
      file: chunk.source_file,
      heading: chunk.heading_path,
      url,
      title: chunk.title,
      published_date: chunk.published_date,
      doc_type: chunk.doc_type,
    };
  });
}
