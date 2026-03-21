import { tool, zodSchema } from 'ai';
import { z } from 'zod';

/**
 * Tools available to the RAG LLM during response generation.
 * These are NOT auto-executed — the caller inspects toolCalls and acts on them.
 */
export const ragTools = {
  create_knowledge_issue: tool({
    description:
      'Create a GitHub issue to report a factual correction or inaccuracy in the knowledge base. ' +
      'Call this when: (1) the user provides a specific correction, (2) the user explicitly asks to open an issue, ' +
      'or (3) the user confirmed something is wrong but does not know the correct answer (flag as needs-research).',
    inputSchema: zodSchema(
      z.object({
        title: z
          .string()
          .describe('Short issue title summarizing the correction, e.g. "Node version outdated: should be v2.1.0.22"'),
        correction: z
          .string()
          .describe('What is wrong in the current answer and what the correct information should be'),
      }),
    ),
    // No execute function — handled manually in the Discord mention handler
  }),
};
