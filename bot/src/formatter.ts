import type { SourceReference } from '../../src/lib/rag/types';

export function formatForDiscord(text: string, sources: SourceReference[], maxSources: number = 3): string {
  let formatted = text;

  // Convert markdown links [text](url) → text — <url>
  formatted = formatted.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '$1 — <$2>'
  );

  // Convert simple markdown tables to code blocks
  formatted = convertTablesToCodeBlocks(formatted);

  // Append sources
  if (sources.length > 0) {
    const topSources = sources.slice(0, maxSources);
    const sourceLines = topSources.map((s, i) => {
      const title = s.title || s.file;
      const url = s.url;
      return url ? `[${i + 1}] ${title} — <${url}>` : `[${i + 1}] ${title}`;
    });
    formatted += `\n\n**Sources:** ${sourceLines.join(' | ')}`;
  }

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
