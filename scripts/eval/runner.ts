/**
 * Test execution engine.
 *
 * Sends queries to the real chat API, parses streaming responses,
 * and evaluates criteria via deterministic checks or LLM judge.
 *
 * Supports both single-turn (query + criteria) and multi-turn
 * (turns[]) test cases. Multi-turn tests chain real API calls,
 * feeding actual bot responses into subsequent turns.
 */

import { parseStreamResponse } from './stream-parser.js';
import { evaluateCriterion } from './judge.js';
import type {
  TestCase,
  TestResult,
  TurnResult,
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
 * Send a single request to the chat API and parse the streaming response.
 */
async function sendChatRequest(
  messages: { role: string; content: string }[],
  config: RunnerConfig
): Promise<ParsedResponse> {
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
      return {
        text: '',
        sources: [],
        followUpQuestions: [],
        statusMessages: [],
        latencyMs: 0,
        error: `HTTP ${httpResponse.status}: ${errorBody}`,
      };
    }
    return await parseStreamResponse(httpResponse);
  } catch (err) {
    return {
      text: '',
      sources: [],
      followUpQuestions: [],
      statusMessages: [],
      latencyMs: 0,
      error: err instanceof Error ? err.message : String(err),
    };
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
 * Evaluate a list of criteria against a response.
 */
async function evaluateCriteria(
  criteria: Criterion[],
  testCase: TestCase,
  response: ParsedResponse,
  config: RunnerConfig
): Promise<CriterionResult[]> {
  const results: CriterionResult[] = [];

  for (const criterion of criteria) {
    const fastResult = tryDeterministicCheck(criterion, response);
    if (fastResult) {
      results.push(fastResult);
      continue;
    }

    if (config.collectMode) {
      results.push({
        criterion,
        passed: false,
        score: 0,
        reasoning: 'Pending manual judgment',
      });
      continue;
    }

    if (config.skipJudge) {
      results.push({
        criterion,
        passed: true,
        score: 0.5,
        reasoning: 'Skipped (--no-judge mode)',
      });
      continue;
    }

    try {
      const result = await evaluateCriterion(
        criterion,
        testCase,
        response,
        config.openrouterApiKey,
        config.judgeModel
      );
      results.push(result);
    } catch (err) {
      results.push({
        criterion,
        passed: false,
        score: 0,
        reasoning: `Judge error: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  return results;
}

/**
 * Run a single-turn test case against the chat API.
 */
async function runSingleTurnTest(
  testCase: TestCase,
  config: RunnerConfig
): Promise<TestResult> {
  const timestamp = new Date().toISOString();

  // Build messages (including multi-turn context if provided)
  const messages: { role: string; content: string }[] = [];
  if (testCase.context_messages) {
    messages.push(...testCase.context_messages);
  }
  messages.push({ role: 'user', content: testCase.query! });

  const response = await sendChatRequest(messages, config);

  const criterionResults = await evaluateCriteria(
    testCase.criteria!,
    testCase,
    response,
    config
  );

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
 * Run a multi-turn test case. Each turn sends the accumulated
 * conversation history (with real bot responses) to the chat API.
 */
async function runMultiTurnTest(
  testCase: TestCase,
  config: RunnerConfig
): Promise<TestResult> {
  const timestamp = new Date().toISOString();
  const turns = testCase.turns!;
  const conversationHistory: { role: string; content: string }[] = [];
  const turnResults: TurnResult[] = [];
  const allCriterionResults: CriterionResult[] = [];

  for (let i = 0; i < turns.length; i++) {
    const turn = turns[i];

    // Add user message to history
    conversationHistory.push({ role: 'user', content: turn.user });

    // Send entire conversation to API
    const response = await sendChatRequest([...conversationHistory], config);

    // Add bot response to history for next turn
    if (response.text && !response.error) {
      conversationHistory.push({ role: 'assistant', content: response.text });
    }

    // Evaluate per-turn criteria (if any)
    let turnCriterionResults: CriterionResult[] | undefined;
    if (turn.criteria && turn.criteria.length > 0) {
      // Build a synthetic single-turn TestCase for the judge prompt context
      const turnTestCase: TestCase = {
        ...testCase,
        query: turn.user,
        criteria: turn.criteria,
        description: turn.description || `Turn ${i + 1} of ${testCase.id}`,
      };

      turnCriterionResults = await evaluateCriteria(
        turn.criteria,
        turnTestCase,
        response,
        config
      );
      allCriterionResults.push(...turnCriterionResults);
    }

    turnResults.push({
      turnIndex: i,
      userMessage: turn.user,
      response,
      criterionResults: turnCriterionResults,
    });
  }

  // Final response and criteria come from the last turn (backward-compatible)
  const lastTurnResult = turnResults[turnResults.length - 1];

  const overallScore =
    allCriterionResults.length > 0
      ? allCriterionResults.reduce((sum, r) => sum + r.score, 0) /
        allCriterionResults.length
      : 0;

  return {
    testCase,
    response: lastTurnResult.response,
    criterionResults: lastTurnResult.criterionResults || [],
    turnResults,
    overallScore,
    passed: allCriterionResults.every((r) => r.passed),
    judgeModel: config.judgeModel,
    timestamp,
  };
}

/**
 * Run a test case (dispatches to single-turn or multi-turn).
 */
export async function runTest(
  testCase: TestCase,
  config: RunnerConfig
): Promise<TestResult> {
  if (testCase.turns && testCase.turns.length >= 2) {
    return runMultiTurnTest(testCase, config);
  }
  return runSingleTurnTest(testCase, config);
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
