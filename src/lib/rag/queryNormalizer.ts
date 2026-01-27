/**
 * Query normalization for Quilibrium-related terms
 *
 * Handles common misspellings, abbreviations, and shorthand
 * to improve RAG retrieval and LLM understanding.
 */

/**
 * Common misspellings and variations of "Quilibrium"
 * Maps to the correct spelling
 */
const QUILIBRIUM_VARIATIONS: string[] = [
  // Double letters
  'quillibrium',
  'quillibruim',
  'quilibriuum',
  'quililibrium',
  // Common phonetic misspellings
  'quilbrium',
  'quilibrum',
  'quilibirum',
  'quilbrum',
  'quilibrim',
  'quilibriom',
  // Typos
  'quilibriu',
  'qulibrium',
  'quilbirium',
  'quilibruim',
  'quillibirum',
  'quilibriun',
  'quilibriim',
];

/**
 * Normalize a user query to handle Quilibrium-related terms
 *
 * - Replaces standalone "Q" with "Quilibrium"
 * - Fixes common misspellings of "Quilibrium"
 *
 * @param query - Raw user query
 * @returns Normalized query with proper Quilibrium references
 */
export function normalizeQuery(query: string): string {
  let normalized = query;

  // Replace standalone "Q" (case-insensitive) with "Quilibrium"
  // Matches Q when:
  // - At start of string followed by space/punctuation/end
  // - Preceded by space/punctuation and followed by space/punctuation/end
  // Uses word boundary but also handles "Q?" "Q!" "Q," etc.
  normalized = normalized.replace(
    /(?<![a-zA-Z])Q(?![a-zA-Z])/gi,
    'Quilibrium'
  );

  // Fix common misspellings (case-insensitive, preserves some casing context)
  for (const variant of QUILIBRIUM_VARIATIONS) {
    const regex = new RegExp(`\\b${variant}\\b`, 'gi');
    normalized = normalized.replace(regex, 'Quilibrium');
  }

  return normalized;
}

/**
 * Check if a query mentions Quilibrium (including variations)
 * Useful for determining if a query is on-topic
 *
 * @param query - User query to check
 * @returns true if query references Quilibrium in some form
 */
export function mentionsQuilibrium(query: string): boolean {
  const lowerQuery = query.toLowerCase();

  // Check for standalone Q
  if (/(?<![a-z])q(?![a-z])/i.test(query)) {
    return true;
  }

  // Check for Quilibrium or any variation
  if (lowerQuery.includes('quilibrium')) {
    return true;
  }

  for (const variant of QUILIBRIUM_VARIATIONS) {
    if (lowerQuery.includes(variant)) {
      return true;
    }
  }

  return false;
}
