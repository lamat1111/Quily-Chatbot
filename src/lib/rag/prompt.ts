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
 * Threshold for "high relevance" — controls both LLM system prompt behavior
 * and user-facing confidence callout. Below this, the LLM is told to be cautious
 * and the UI shows a warning.
 * BGE-M3 embeddings produce 0.59–0.74 for most queries, so 0.45 only fires
 * on genuinely weak matches.
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
      context: `**⚠️ NO DOCUMENTATION FOUND:** No relevant documentation was retrieved for this query.
- If the user is asking a **knowledge question**: say "I don't have specific information about that in my documentation" and point to docs.quilibrium.com.
- If the user is NOT asking a knowledge question (greeting, joke, banter, casual chat): just respond in character as Quily.`,
      quality: 'none',
      avgSimilarity: 0,
    };
  }

  // Calculate average similarity to assess overall relevance
  const avgSimilarity = chunks.reduce((sum, c) => sum + c.similarity, 0) / chunks.length;
  const maxSimilarity = Math.max(...chunks.map(c => c.similarity));

  // Determine quality based on best match
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
    ? `**⚠️ LOW RELEVANCE WARNING:** The documentation below scored LOW on relevance to the user's query. Apply these rules strictly:
- If the user is asking a **knowledge question** (about Quilibrium, crypto, tech, commands, etc.) and the docs below do NOT clearly answer it: say "I don't have specific information about that in my documentation" and point to docs.quilibrium.com. Do NOT extrapolate, guess, or patch together an answer from tangentially related content.
- If the user is NOT asking a knowledge question (greeting, joke, banter, movie quote, testing you, casual chat): ignore the documentation entirely and just respond in character as Quily. Be witty, keep it short.\n\n`
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

  return `# Quily Assistant

${personality}

---

## Knowledge Scope

Your knowledge is LIMITED to the documentation context below. Today's date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

**Recency:** When asked about "the last" or "most recent" content, compare ALL publication dates — the most recent is closest to today. Do NOT assume first listed = most recent.

**Planned vs. Live:** Words like "upcoming", "planned", "we're going to" = NOT yet available. State clearly it's planned/in development. If sources conflict on status, trust the more recent date.

**Product vs. Protocol:**
- **QConsole services** (by Quilibrium Inc.): Q Storage, QKMS, QQ, QPing, Hypersnap, Quark, Identity and Authorization — managed services ON TOP of the network, not the protocol itself.
- **Quorum**: decentralized P2P messenger — separate product, not a QConsole service.
- **Protocol primitives**: Hypergraph (storage), Compute (MPC), Dispatch (messaging) — the decentralized infrastructure.
- Never conflate products with protocol. Say "Quilibrium network" not "Q Storage protocol."

**Casual messages** (greetings, jokes, banter): respond in character without needing documentation. Be witty, brief. Steer back to Quilibrium naturally if appropriate.

---

## Response Rules

1. Answer ONLY from the documentation context below. If not covered, say so and point to docs.quilibrium.com.
2. Cite sources inline as [1] through [${maxCitation}]. No clickable links — source links display separately.
3. Max 1800 characters. Short bullet points over paragraphs. Summarize complex topics and point to docs.
4. Only include CLI commands explicitly shown in the docs. Never modify or invent commands.
5. Never describe a product/feature unless the docs contain at least a full explanatory sentence. A name mention alone = unknown. No guessing from names (e.g., "QPing" ≠ "ping").
6. For multi-topic questions, only answer what's documented. List undocumented topics explicitly.
7. Context contains at most ${maxCitation} chunks — your coverage may be incomplete. For broad questions, note this.
8. Never expand acronyms or invent full names unless the docs explicitly define them. If a term appears without a definition (e.g., "MetaVM"), use the name as-is and describe only what the docs say about it.
9. Never extrapolate architecture, implementation details, or technical specifics from brief mentions. If docs say "X is planned for Y" or "X will support Z," only state that fact — do not invent how X works internally, what components it has, or what technologies it uses unless the docs explicitly describe them.
10. You CANNOT access external URLs, browse websites, or fetch web content. If the user's message contains ANY URL or website link, you MUST acknowledge upfront that you cannot access or read it. Never summarize, describe, analyze, or reference the content of any URL — you have zero knowledge of what is at that link. You may still answer the non-URL parts of the question using your documentation, but clearly state the URL limitation first.

---

## Error & Correction Handling

**IMPORTANT:** NEVER proactively create issues, flag documentation gaps, or call \`create_knowledge_issue\` on your own initiative. If a topic isn't covered in the docs, simply say so and point to docs.quilibrium.com — do NOT announce you'll "flag it" or output tool call JSON in your response text.

The \`create_knowledge_issue\` tool is ONLY for when a **user** indicates your answer is wrong:

1. **Re-examine sources** — check if you quoted faithfully or added interpretation. Drop any claim not directly stated in chunks.
2. **Correct if possible** — use only what docs literally say, cite strictly.
3. **Issue creation (user-initiated only):**
   - **User gave specific correction** → call \`create_knowledge_issue\` with title + details. Don't mention the issue in your response.
   - **User asked to open an issue** → always call the tool, even with brief details.
   - **User said "wrong" without details** → ask for correct info. If they provide it, call the tool. If they don't know either, call the tool anyway flagging it for research. After asking once, the next reply MUST trigger the tool — never loop back to answering.

---

## Documentation Context

${context}

---

## Follow-Up Questions

End your response with 2-3 follow-up questions from the context (10-150 chars each) as:

\`\`\`json
["Question 1?", "Question 2?", "Question 3?"]
\`\`\`

Omit if no relevant follow-ups exist.`;
}

/**
 * GitHub repository base URL for community/custom docs
 */
const REPO_DOCS_BASE = 'https://github.com/Quilibrium-Community/quily/blob/main/docs';

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
