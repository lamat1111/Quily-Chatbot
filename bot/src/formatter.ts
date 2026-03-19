import type { SourceReference } from '../../src/lib/rag/types';

/**
 * Get a short label for the source type based on doc_type and URL.
 * Mirrors the web UI's getSourceLabel logic.
 */
function getSourceTypeLabel(source: SourceReference): string {
  const docType = source.doc_type;

  if (docType === 'livestream_transcript') {
    return 'Livestream';
  }

  if (docType === 'discord_announcement') {
    return 'Discord';
  }

  if (docType === 'discord_recap') {
    return 'Community Recap';
  }

  if (docType) {
    // Format doc_type: 'community_faq' -> 'Community Faq'
    return docType
      .replace(/_transcript$/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  if (source.url?.includes('docs.quilibrium.com')) {
    return 'Official Docs';
  }

  if (source.url?.includes('youtube.com') || source.url?.includes('youtu.be')) {
    return 'Video';
  }

  // Check file path for official docs
  if (source.file?.startsWith('quilibrium-official/')) {
    return 'Official Docs';
  }

  if (source.file?.startsWith('custom/') || source.file?.startsWith('community/')) {
    return 'Custom Docs';
  }

  return 'Docs';
}

export function formatForDiscord(text: string, sources: SourceReference[]): string {
  let formatted = text;

  // Convert markdown links [text](url) → text — <url>
  formatted = formatted.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '$1 — <$2>'
  );

  // Convert simple markdown tables to code blocks
  formatted = convertTablesToCodeBlocks(formatted);

  // Show only sources whose citation index actually appears in the response text
  if (sources.length > 0) {
    const citedIndices = new Set<number>();
    for (const match of text.matchAll(/\[(\d+)\]/g)) {
      citedIndices.add(Number(match[1]));
    }

    const citedSources = sources
      .filter((s) => citedIndices.has(s.index))
      .sort((a, b) => a.index - b.index);

    // Fall back to all sources if no citation indices matched
    const displaySources = citedSources.length > 0 ? citedSources : sources;

    const sourceLines = displaySources.map((s) => {
      const label = getSourceTypeLabel(s);
      const isLivestream = s.doc_type === 'livestream_transcript';
      const url = s.url;
      const idx = s.index;

      if (isLivestream) {
        const date = s.published_date || '';
        return url
          ? `• [${idx}] **${label}${date ? ` (${date})` : ''}:** <${url}>`
          : `• [${idx}] **${label}${date ? ` (${date})` : ''}**`;
      }

      const title = s.title || s.file;
      return url
        ? `• [${idx}] **${label}:** ${title} — <${url}>`
        : `• [${idx}] **${label}:** ${title}`;
    });
    formatted += `\n\n**Sources:**\n${sourceLines.join('\n')}`;
  }

  formatted += '\n\n-# *I\'m in beta and can make mistakes · report inaccuracies · always check official docs*';

  return formatted;
}

function convertTablesToCodeBlocks(text: string): string {
  return text.replace(
    /(?:^|\n)((?:\|[^\n]+\|\n?)+)/g,
    (match) => {
      const trimmed = match.trim();
      return `\n\`\`\`\n${trimmed}\n\`\`\`\n`;
    }
  );
}
