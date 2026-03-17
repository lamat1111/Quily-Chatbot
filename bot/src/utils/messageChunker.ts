const DEFAULT_MAX_LENGTH = 2000;

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
    let splitAt = remaining.lastIndexOf('\n', limit);
    if (splitAt <= 0) splitAt = limit;

    let chunk = remaining.slice(0, splitAt);
    remaining = remaining.slice(splitAt).replace(/^\n/, '');

    const fenceCount = (chunk.match(/```/g) || []).length;
    if (fenceCount % 2 !== 0) {
      chunk += '\n```';
      remaining = '```\n' + remaining;
    }
    chunks.push(chunk);
  }
  return chunks;
}
