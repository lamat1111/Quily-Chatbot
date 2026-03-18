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

export function formatForDiscord(text: string, sources: SourceReference[], maxSources: number = 3): string {
  let formatted = text;

  // Convert markdown links [text](url) → text — <url>
  formatted = formatted.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '$1 — <$2>'
  );

  // Convert simple markdown tables to code blocks
  formatted = convertTablesToCodeBlocks(formatted);

  // Append sources as an unordered list
  if (sources.length > 0) {
    const topSources = sources.slice(0, maxSources);
    const sourceLines = topSources.map((s) => {
      const label = getSourceTypeLabel(s);
      const isLivestream = s.doc_type === 'livestream_transcript';
      const url = s.url;

      if (isLivestream) {
        // For livestreams: label already says "Livestream", so just show date + URL
        const date = s.published_date || '';
        return url
          ? `• **${label}${date ? ` (${date})` : ''}:** <${url}>`
          : `• **${label}${date ? ` (${date})` : ''}**`;
      }

      const title = s.title || s.file;
      return url
        ? `• **${label}:** ${title} — <${url}>`
        : `• **${label}:** ${title}`;
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
