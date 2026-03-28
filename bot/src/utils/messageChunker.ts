const DEFAULT_MAX_LENGTH = 2000;

/**
 * Split a message into chunks that fit within Discord's character limit.
 * Prefers splitting at section boundaries (**<#) first, then newlines.
 * Handles unclosed code fences across chunk boundaries.
 */
export function chunkMessage(text: string, maxLength?: number): string[] {
  const limit = maxLength || parseInt(process.env.MAX_MESSAGE_LENGTH || String(DEFAULT_MAX_LENGTH), 10);
  if (text.length <= limit) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= limit) {
      chunks.push(remaining);
      break;
    }

    // Prefer splitting at a section boundary (**<#) within the limit
    let splitAt = -1;
    const sectionPattern = /\n\*\*<#/g;
    let match: RegExpExecArray | null;
    while ((match = sectionPattern.exec(remaining)) !== null) {
      if (match.index > 0 && match.index <= limit) {
        splitAt = match.index;
      }
    }

    // Fall back to newline boundary
    if (splitAt <= 0) {
      splitAt = remaining.lastIndexOf('\n', limit);
    }

    // Last resort: hard cut at limit
    if (splitAt <= 0) splitAt = limit;

    let chunk = remaining.slice(0, splitAt);
    remaining = remaining.slice(splitAt).replace(/^\n/, '');

    // Handle unclosed code fences
    const fenceCount = (chunk.match(/```/g) || []).length;
    if (fenceCount % 2 !== 0) {
      chunk += '\n```';
      remaining = '```\n' + remaining;
    }
    chunks.push(chunk);
  }
  return chunks;
}
