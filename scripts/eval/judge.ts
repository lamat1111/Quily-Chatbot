/**
 * LLM-as-judge evaluation using Claude via OpenRouter.
 *
 * Uses generateObject with Zod schema for structured output.
 * Each criterion type gets a specialized prompt template.
 */

import { generateObject } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from 'zod';
import type { Criterion, TestCase, ParsedResponse, CriterionResult } from './types.js';

const DEFAULT_JUDGE_MODEL = 'anthropic/claude-sonnet-4.5';

const JudgeResponseSchema = z.object({
  passed: z.boolean(),
  score: z.number().describe('Score between 0.0 and 1.0'),
  reasoning: z.string(),
});

/**
 * Evaluate a single criterion using the LLM judge.
 */
export async function evaluateCriterion(
  criterion: Criterion,
  testCase: TestCase,
  response: ParsedResponse,
  openrouterApiKey: string,
  judgeModel?: string
): Promise<CriterionResult> {
  const model = judgeModel || DEFAULT_JUDGE_MODEL;
  const openrouter = createOpenRouter({ apiKey: openrouterApiKey });

  const prompt = buildJudgePrompt(criterion, testCase, response);

  try {
    const result = await generateObject({
      model: openrouter(model),
      schema: JudgeResponseSchema,
      prompt,
    });

    return {
      criterion,
      passed: result.object.passed,
      score: result.object.score,
      reasoning: result.object.reasoning,
    };
  } catch (err: any) {
    // Enhanced error logging
    const errorDetails = err?.message || String(err);
    const responseError = err?.responseBody ? JSON.stringify(err.responseBody) : '';
    throw new Error(`OpenRouter API error: ${errorDetails}${responseError ? ` | Response: ${responseError}` : ''}`);
  }
}

export function buildJudgePrompt(
  criterion: Criterion,
  testCase: TestCase,
  response: ParsedResponse
): string {
  const sourcesText =
    response.sources.length > 0
      ? response.sources
          .map((s) => `- [${s.sourceId}] ${s.title} (${s.url})`)
          .join('\n')
      : '(none)';

  const followUpsText =
    response.followUpQuestions.length > 0
      ? response.followUpQuestions.join('; ')
      : '(none)';

  const base = `You are a QA evaluator for a RAG chatbot called "Quily" about the Quilibrium protocol.

## Test Context
- **Test ID**: ${testCase.id}
- **Category**: ${testCase.category}
- **User Query**: "${testCase.query}"

## Chatbot Response
${response.text || '(empty response)'}

## Sources Provided
${sourcesText}

## Follow-up Questions
${followUpsText}
`;

  switch (criterion.type) {
    case 'must_mention':
      return (
        base +
        `
## Evaluation Task
Check if the response mentions ALL of these concepts: ${criterion.concepts.join(', ')}
The concepts don't need to be exact matches — semantic equivalence counts.
${criterion.description ? `Note: ${criterion.description}` : ''}
Score: 1.0 if all mentioned, proportional if partial (e.g., 2/3 = 0.67), 0.0 if none.
Pass: all concepts must be mentioned.`
      );

    case 'must_not_mention':
      return (
        base +
        `
## Evaluation Task
Check that the response does NOT mention any of these concepts: ${criterion.concepts.join(', ')}
Even indirect references or implications count as mentions.
${criterion.description ? `Note: ${criterion.description}` : ''}
Score: 1.0 if none mentioned, 0.0 if any mentioned.
Pass: none of the forbidden concepts should appear.`
      );

    case 'must_cite':
      return (
        base +
        `
## Evaluation Task
Check that the response contains at least ${criterion.min_citations} citation reference(s) in [N] format.
Citations should be inline references like [1], [2], etc.
Count the unique citation numbers used.
Score: 1.0 if >= ${criterion.min_citations} citations, proportional otherwise.
Pass: at least ${criterion.min_citations} citation(s) present.`
      );

    case 'must_decline':
      return (
        base +
        `
## Evaluation Task
The chatbot should gracefully decline to answer this query (it is off-topic, adversarial, or outside its knowledge scope).
${criterion.description ? `Note: ${criterion.description}` : ''}
Check that the response:
1. Does NOT attempt to answer the off-topic question
2. Politely redirects to Quilibrium-related topics or says it can't help
3. Does not hallucinate or make up information
Score: 1.0 if cleanly declined, 0.5 if partially answered then redirected, 0.0 if fully answered off-topic.`
      );

    case 'tone':
      return (
        base +
        `
## Evaluation Task
Quily's personality is: dry ironic humor, crypto-veteran, self-aware, casual but not sycophantic.
Expected tone for this response: "${criterion.expected}"
${criterion.description ? `Note: ${criterion.description}` : ''}
Evaluate whether the response matches the expected tone:
- "casual": relaxed, uses some internet speak, not overly formal
- "technical": precise, uses proper terminology, well-structured
- "humorous": includes wit, irony, or playful observations
- "declining": polite but firm redirect, possibly with a quip
Score: 1.0 if clearly matches, 0.5 if partially matches, 0.0 if wrong tone.`
      );

    case 'must_contain_command_response':
      return (
        base +
        `
## Evaluation Task
This was a command query: "${criterion.command}"
The response should contain these sections/elements: ${criterion.expected_sections.join(', ')}
Check that each expected section heading or content is present.
Score: proportional to sections found.`
      );

    case 'must_have_follow_ups':
      return (
        base +
        `
## Evaluation Task
Check that the response includes at least ${criterion.min_count} follow-up question suggestion(s).
Follow-up questions found: ${response.followUpQuestions.length > 0 ? response.followUpQuestions.join('; ') : 'NONE'}
Score: 1.0 if >= ${criterion.min_count}, proportional otherwise.
Note: Follow-up questions are extracted from the structured stream data, not from the text body.`
      );
  }
}
