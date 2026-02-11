/**
 * AI SDK v6 UI Message Stream parser.
 *
 * The chat API returns a streaming response where each line follows:
 *   PREFIX:JSON_PAYLOAD
 *
 * Prefixes: 0 (text events), e (data/source events), d (error), etc.
 * We extract text deltas, source URLs, follow-up questions, and status messages.
 */

import type { ParsedResponse, SourceEntry } from './types.js';

/**
 * Consume a streaming Response and extract structured data.
 */
export async function parseStreamResponse(
  response: Response
): Promise<ParsedResponse> {
  const startTime = Date.now();
  const textParts: string[] = [];
  const sources: SourceEntry[] = [];
  const followUpQuestions: string[] = [];
  const statusMessages: string[] = [];

  const body = response.body;
  if (!body) {
    return {
      text: '',
      sources: [],
      followUpQuestions: [],
      statusMessages: [],
      latencyMs: Date.now() - startTime,
      error: 'No response body',
    };
  }

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Parse "PREFIX:JSON_PAYLOAD" format
        const colonIndex = trimmed.indexOf(':');
        if (colonIndex < 0) continue;

        const jsonStr = trimmed.slice(colonIndex + 1);
        try {
          const payload = JSON.parse(jsonStr);

          switch (payload.type) {
            case 'text-delta':
              if (payload.delta) {
                textParts.push(payload.delta);
              }
              break;

            case 'source-url':
              sources.push(parseSourceEntry(payload));
              break;

            case 'data-follow-up':
              if (Array.isArray(payload.data)) {
                followUpQuestions.push(...payload.data);
              }
              break;

            case 'data-status':
              if (payload.data?.label) {
                statusMessages.push(payload.data.label);
              }
              break;

            // text-start, text-end are structural — skip
          }
        } catch {
          // Not valid JSON or unrecognized format — skip
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim()) {
      const colonIndex = buffer.indexOf(':');
      if (colonIndex >= 0) {
        try {
          const payload = JSON.parse(buffer.slice(colonIndex + 1));
          if (payload.type === 'text-delta' && payload.delta) {
            textParts.push(payload.delta);
          }
        } catch {
          // ignore
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return {
    text: textParts.join(''),
    sources,
    followUpQuestions,
    statusMessages,
    latencyMs: Date.now() - startTime,
  };
}

/**
 * Parse a source-url payload into a SourceEntry.
 * Title format from chat route: "Title|doc_type|published_date"
 */
function parseSourceEntry(payload: {
  sourceId?: string;
  url?: string;
  title?: string;
}): SourceEntry {
  const titleParts = (payload.title || '').split('|');
  return {
    sourceId: payload.sourceId || '',
    url: payload.url || '',
    title: titleParts[0] || '',
    docType: titleParts[1] || undefined,
    publishedDate: titleParts[2] || undefined,
  };
}
