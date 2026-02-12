/**
 * Test execution engine.
 *
 * Sends queries to the real chat API, parses streaming responses,
 * and evaluates criteria via deterministic checks or LLM judge.
 */

import { parseStreamResponse } from './stream-parser.js';
import { evaluateCriterion } from './judge.js';
import type {
  TestCase,
  TestResult,
  ParsedResponse,
  CriterionResult,
  Criterion,
  RunnerConfig,
} from './types.js';

/**
 * Fetch with a timeout. Rejects if the request takes longer than `ms`.
 */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  ms: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Try to evaluate a criterion deterministically (no LLM call).
 * Returns null if the criterion needs the LLM judge.
 */
function tryDeterministicCheck(
  criterion: Criterion,
  response: ParsedResponse
): CriterionResult | null {
  if (criterion.type === 'must_cite') {
    const citationPattern = /\[(\d+)\]/g;
    const citations = new Set<string>();
    let match;
    while ((match = citationPattern.exec(response.text)) !== null) {
      citations.add(match[1]);
    }
    const count = citations.size;
    const needed = criterion.min_citations;
    return {
      criterion,
      passed: count >= needed,
      score: Math.min(count / needed, 1),
      reasoning: `Found ${count} unique citation(s) (need ${needed}): ${[...citations].map((n) => `[${n}]`).join(', ') || 'none'}`,
    };
  }

  if (criterion.type === 'must_have_follow_ups') {
    const count = response.followUpQuestions.length;
    const needed = criterion.min_count;
    return {
      criterion,
      passed: count >= needed,
      score: Math.min(count / needed, 1),
      reasoning: `Found ${count} follow-up question(s) (need ${needed})`,
    };
  }

  if (criterion.type === 'must_contain_command_response') {
    const lowerText = response.text.toLowerCase();
    const found = criterion.expected_sections.filter((s) =>
      lowerText.includes(s.toLowerCase())
    );
    const total = criterion.expected_sections.length;
    return {
      criterion,
      passed: found.length === total,
      score: total > 0 ? found.length / total : 0,
      reasoning: `Found ${found.length}/${total} expected sections: ${found.join(', ') || 'none'}`,
    };
  }

  return null;
}

/**
 * Run a single test case against the chat API.
 */
export async function runTest(
  testCase: TestCase,
  config: RunnerConfig
): Promise<TestResult> {
  const timestamp = new Date().toISOString();

  // Build messages (including multi-turn context if provided)
  const messages: { role: string; content: string }[] = [];
  if (testCase.context_messages) {
    messages.push(...testCase.context_messages);
  }
  messages.push({ role: 'user', content: testCase.query });

  // Hit the real chat endpoint
  let response: ParsedResponse;
  try {
    const httpResponse = await fetchWithTimeout(
      `${config.baseUrl}/api/chat`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          provider: config.provider,
          model: config.model || undefined,
        }),
      },
      config.timeout
    );

    if (!httpResponse.ok) {
      const errorBody = await httpResponse.text();
      response = {
        text: '',
        sources: [],
        followUpQuestions: [],
        statusMessages: [],
        latencyMs: 0,
        error: `HTTP ${httpResponse.status}: ${errorBody}`,
      };
    } else {
      response = await parseStreamResponse(httpResponse);
    }
  } catch (err) {
    response = {
      text: '',
      sources: [],
      followUpQuestions: [],
      statusMessages: [],
      latencyMs: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  // Evaluate each criterion
  const criterionResults: CriterionResult[] = [];

  for (const criterion of testCase.criteria) {
    // Fast-path: deterministic checks
    const fastResult = tryDeterministicCheck(criterion, response);
    if (fastResult) {
      criterionResults.push(fastResult);
      continue;
    }

    // Collect mode: mark for manual judgment
    if (config.collectMode) {
      criterionResults.push({
        criterion,
        passed: false,
        score: 0,
        reasoning: 'Pending manual judgment',
      });
      continue;
    }

    // Skip LLM judge if --no-judge flag
    if (config.skipJudge) {
      criterionResults.push({
        criterion,
        passed: true,
        score: 0.5,
        reasoning: 'Skipped (--no-judge mode)',
      });
      continue;
    }

    // LLM judge
    try {
      const result = await evaluateCriterion(
        criterion,
        testCase,
        response,
        config.openrouterApiKey,
        config.judgeModel
      );
      criterionResults.push(result);
    } catch (err) {
      criterionResults.push({
        criterion,
        passed: false,
        score: 0,
        reasoning: `Judge error: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  const overallScore =
    criterionResults.length > 0
      ? criterionResults.reduce((sum, r) => sum + r.score, 0) /
        criterionResults.length
      : 0;

  return {
    testCase,
    response,
    criterionResults,
    overallScore,
    passed: criterionResults.every((r) => r.passed),
    judgeModel: config.judgeModel,
    timestamp,
  };
}

/**
 * Run the full test suite with concurrency control.
 */
export async function runTestSuite(
  tests: TestCase[],
  config: RunnerConfig,
  onProgress: (completed: number, total: number, result: TestResult) => void
): Promise<TestResult[]> {
  const activeTests = tests.filter((t) => !t.skip);
  const results: TestResult[] = [];
  let completed = 0;

  const queue = [...activeTests];
  const running = new Set<Promise<void>>();

  const processNext = async (): Promise<void> => {
    const test = queue.shift();
    if (!test) return;

    const result = await runTest(test, config);
    results.push(result);
    completed++;
    onProgress(completed, activeTests.length, result);
  };

  while (queue.length > 0 || running.size > 0) {
    while (running.size < config.concurrency && queue.length > 0) {
      const p = processNext().then(() => {
        running.delete(p);
      });
      running.add(p);
    }
    if (running.size > 0) {
      await Promise.race(running);
    }
  }

  return results;
}
