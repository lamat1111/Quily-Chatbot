const MEMORY_TTL_MS = 5 * 60 * 1000;
const MAX_PAIRS = 5;

interface ConversationEntry {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  /** Chunk IDs retrieved in the most recent assistant turn (for RAG continuity) */
  lastChunkIds: number[];
  lastActivity: number;
}

const store = new Map<string, ConversationEntry>();

function makeKey(userId: string, channelId: string): string {
  return `${userId}:${channelId}`;
}

function evictStale(): void {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now - entry.lastActivity > MEMORY_TTL_MS) store.delete(key);
  }
}

export function getHistory(userId: string, channelId: string): Array<{ role: 'user' | 'assistant'; content: string }> {
  evictStale();
  const key = makeKey(userId, channelId);
  const entry = store.get(key);
  if (!entry) return [];
  return entry.messages;
}

/** Returns chunk IDs from the last assistant turn for RAG priority boosting */
export function getLastChunkIds(userId: string, channelId: string): number[] {
  evictStale();
  const key = makeKey(userId, channelId);
  const entry = store.get(key);
  if (!entry) return [];
  return entry.lastChunkIds;
}

export function addExchange(userId: string, channelId: string, userMessage: string, botResponse: string, chunkIds: number[] = []): void {
  evictStale();
  const key = makeKey(userId, channelId);
  const entry = store.get(key) || { messages: [], lastChunkIds: [], lastActivity: 0 };
  entry.messages.push(
    { role: 'user', content: userMessage },
    { role: 'assistant', content: botResponse },
  );
  if (entry.messages.length > MAX_PAIRS * 2) {
    entry.messages = entry.messages.slice(-MAX_PAIRS * 2);
  }
  entry.lastChunkIds = chunkIds;
  entry.lastActivity = Date.now();
  store.set(key, entry);
}
