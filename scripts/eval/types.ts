/**
 * Type definitions for the Quily evaluation harness.
 *
 * Zod schemas validate the YAML test suite at load time.
 * TypeScript interfaces define the evaluation result shapes.
 */

import { z } from 'zod';

// ─── Test Suite Schemas (YAML input validation) ─────────────────────────────

export const TestCategory = z.enum([
  'factual',
  'hallucination',
  'citation',
  'off_topic',
  'adversarial',
  'personality',
  'command',
  'multi_hop',
  'edge_case',
  'temporal',
]);

export type TestCategory = z.infer<typeof TestCategory>;

export const CriterionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('must_mention'),
    concepts: z.array(z.string()).min(1),
    description: z.string().optional(),
  }),
  z.object({
    type: z.literal('must_not_mention'),
    concepts: z.array(z.string()).min(1),
    description: z.string().optional(),
  }),
  z.object({
    type: z.literal('must_cite'),
    min_citations: z.number().int().min(1).default(1),
    description: z.string().optional(),
  }),
  z.object({
    type: z.literal('must_decline'),
    description: z.string().optional(),
  }),
  z.object({
    type: z.literal('tone'),
    expected: z.enum(['casual', 'technical', 'humorous', 'declining']),
    description: z.string().optional(),
  }),
  z.object({
    type: z.literal('must_contain_command_response'),
    command: z.string(),
    expected_sections: z.array(z.string()),
    description: z.string().optional(),
  }),
  z.object({
    type: z.literal('must_have_follow_ups'),
    min_count: z.number().int().min(1).default(1),
    description: z.string().optional(),
  }),
]);

export type Criterion = z.infer<typeof CriterionSchema>;

// ─── Multi-Turn Schema ──────────────────────────────────────────────────────

export const TurnSchema = z.object({
  user: z.string().min(1),
  criteria: z.array(CriterionSchema).optional(),
  description: z.string().optional(),
});

export type Turn = z.infer<typeof TurnSchema>;

// ─── Test Case Schema ───────────────────────────────────────────────────────

export const TestCaseSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9_-]+$/),
    category: TestCategory,
    description: z.string().optional(),
    skip: z.boolean().default(false),
    tags: z.array(z.string()).optional(),

    // Single-turn mode (existing)
    query: z.string().min(1).optional(),
    criteria: z.array(CriterionSchema).min(1).optional(),
    context_messages: z
      .array(
        z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })
      )
      .optional(),

    // Multi-turn mode
    turns: z.array(TurnSchema).min(2).optional(),
  })
  .refine(
    (data) => {
      const hasSingleTurn = !!data.query && !!data.criteria && data.criteria.length > 0;
      const hasMultiTurn = !!data.turns && data.turns.length >= 2;
      return hasSingleTurn || hasMultiTurn;
    },
    { message: 'Test case must have either (query + criteria) for single-turn or (turns) for multi-turn' }
  )
  .refine(
    (data) => {
      if (data.turns && data.turns.length >= 2) {
        const lastTurn = data.turns[data.turns.length - 1];
        return lastTurn.criteria && lastTurn.criteria.length > 0;
      }
      return true;
    },
    { message: 'Multi-turn test: the last turn must have criteria' }
  );

export type TestCase = z.infer<typeof TestCaseSchema>;

export const TestSuiteSchema = z.object({
  version: z.string().default('1'),
  tests: z.array(TestCaseSchema).min(1),
});

export type TestSuite = z.infer<typeof TestSuiteSchema>;

// ─── Result Types (evaluation output) ───────────────────────────────────────

export interface SourceEntry {
  sourceId: string;
  url: string;
  title: string;
  docType?: string;
  publishedDate?: string;
}

export interface ParsedResponse {
  text: string;
  sources: SourceEntry[];
  followUpQuestions: string[];
  statusMessages: string[];
  latencyMs: number;
  error?: string;
}

export interface CriterionResult {
  criterion: Criterion;
  passed: boolean;
  score: number;
  reasoning: string;
}

export interface TurnResult {
  turnIndex: number;
  userMessage: string;
  response: ParsedResponse;
  criterionResults?: CriterionResult[];
}

export interface TestResult {
  testCase: TestCase;
  response: ParsedResponse;
  criterionResults: CriterionResult[];
  turnResults?: TurnResult[];
  overallScore: number;
  passed: boolean;
  judgeModel: string;
  timestamp: string;
}

export interface EvalReportConfig {
  baseUrl: string;
  provider: string;
  model: string;
  judgeModel: string;
}

export interface CategorySummary {
  total: number;
  passed: number;
  avgScore: number;
}

export interface EvalReport {
  runId: string;
  timestamp: string;
  config: EvalReportConfig;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    avgScore: number;
    byCategory: Record<string, CategorySummary>;
  };
  results: TestResult[];
  durationMs: number;
}

// ─── Runner Config ──────────────────────────────────────────────────────────

export interface RunnerConfig {
  baseUrl: string;
  provider: string;
  model: string;
  openrouterApiKey: string;
  judgeModel: string;
  concurrency: number;
  timeout: number;
  skipJudge: boolean;
  collectMode: boolean;
}
