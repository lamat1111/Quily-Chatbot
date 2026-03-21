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

/**
 * Wrap bare URLs in <> to suppress Discord embeds.
 * Also converts markdown links [text](url) → text — <url>.
 */
export function suppressDiscordEmbeds(text: string): string {
  // Convert markdown links [text](url) → text — <url>
  let result = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '$1 — <$2>'
  );

  // Wrap any remaining bare URLs in <> to suppress Discord embeds
  // Skip URLs already inside angle brackets <url>
  result = result.replace(
    /(?<!<)(https?:\/\/[^\s>)\]]+)/g,
    '<$1>'
  );

  return result;
}

export function formatForDiscord(text: string, sources: SourceReference[]): string {
  let formatted = text;

  // Suppress Discord embeds for all URLs in the response text
  formatted = suppressDiscordEmbeds(formatted);

  // Convert simple markdown tables to code blocks
  formatted = convertTablesToCodeBlocks(formatted);

  // Show only sources whose citation index actually appears in the response text.
  // If the response didn't cite anything (e.g. casual/banter replies), skip the
  // sources block entirely — showing unrelated sources under a joke looks weird.
  if (sources.length > 0) {
    const citedIndices = new Set<number>();
    for (const match of text.matchAll(/\[(\d+)\]/g)) {
      citedIndices.add(Number(match[1]));
    }

    const citedSources = sources
      .filter((s) => citedIndices.has(s.index))
      .sort((a, b) => a.index - b.index);

    if (citedSources.length > 0) {
      const sourceLines = citedSources.map((s) => {
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
  }

  formatted += '\n\n-# *I can make mistakes · always check official docs · if I\'m wrong, tell me the right answer and I\'ll flag it for review*';

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
