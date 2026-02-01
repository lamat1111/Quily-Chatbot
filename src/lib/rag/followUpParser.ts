import { z } from 'zod';

/**
 * Zod schema for validating follow-up questions
 * - Array of 1-5 strings
 * - Each string 1-200 characters
 */
const FollowUpSchema = z.array(z.string().min(1).max(200)).min(1).max(5);

/**
 * Result of parsing follow-up questions from LLM response
 */
export interface FollowUpParseResult {
  /** Response text with follow-up block removed */
  cleanText: string;
  /** Extracted follow-up questions, or null if none found/valid */
  questions: string[] | null;
}

/**
 * Regex to match JSON code fence at end of response
 * Matches: ```json\n["q1", "q2"]\n```
 * Non-greedy, looks for array content
 */
const JSON_CODE_FENCE_REGEX = /```json\s*\n?\s*(\[[\s\S]*?\])\s*\n?```\s*$/;

/**
 * Parse follow-up questions from LLM response.
 *
 * Extracts JSON array from markdown code fence at end of response,
 * validates with Zod schema, and returns cleaned text + questions.
 *
 * @param text - Raw LLM response text
 * @returns Object with cleanText (block removed) and questions (validated array or null)
 *
 * @example
 * const result = parseFollowUpQuestions(`
 *   Here's the answer...
 *
 *   \`\`\`json
 *   ["What is X?", "How does Y work?"]
 *   \`\`\`
 * `);
 * // result.cleanText = "Here's the answer..."
 * // result.questions = ["What is X?", "How does Y work?"]
 */
export function parseFollowUpQuestions(text: string): FollowUpParseResult {
  const match = text.match(JSON_CODE_FENCE_REGEX);

  if (!match) {
    return { cleanText: text, questions: null };
  }

  const jsonString = match[1];
  const cleanText = text.replace(match[0], '').trimEnd();

  try {
    const parsed = JSON.parse(jsonString);
    const validated = FollowUpSchema.safeParse(parsed);

    if (!validated.success) {
      // Log validation failure for monitoring
      console.warn('[FollowUpParser] Validation failed:', validated.error.message);
      return { cleanText, questions: null };
    }

    // Additional sanitization: strip any HTML-like characters for XSS protection
    const sanitized = validated.data.map((q) =>
      q.replace(/[<>]/g, '').trim()
    ).filter((q) => q.length > 0);

    if (sanitized.length === 0) {
      return { cleanText, questions: null };
    }

    return { cleanText, questions: sanitized };
  } catch (error) {
    // JSON parse failed - log and return null questions
    console.warn('[FollowUpParser] JSON parse failed:', error instanceof Error ? error.message : 'Unknown error');
    return { cleanText, questions: null };
  }
}
