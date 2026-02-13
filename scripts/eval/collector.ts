/**
 * Manual judgment collector.
 *
 * Generates a Markdown file that Claude (or a human) can fill in,
 * then parses the completed file and merges judgments into partial results.
 */

import { buildJudgePrompt } from './judge.js';
import type {
  TestResult,
  EvalReport,
  CriterionResult,
  ParsedResponse,
  TestCase,
  Criterion,
} from './types.js';

export interface ManualJudgment {
  id: string;
  criterionIndex: number;
  passed: boolean;
  score: number;
  reasoning: string;
}

const DETERMINISTIC_TYPES = [
  'must_cite',
  'must_have_follow_ups',
  'must_contain_command_response',
];

function isPending(cr: CriterionResult): boolean {
  return cr.reasoning === 'Pending manual judgment';
}

function formatSources(response: ParsedResponse): string {
  if (response.sources.length === 0) return '(none)';
  return response.sources
    .map((s) => `- [${s.sourceId}] ${s.title} (${s.url})`)
    .join('\n');
}

function formatFollowUps(response: ParsedResponse): string {
  if (response.followUpQuestions.length === 0) return '(none)';
  return response.followUpQuestions.map((q) => `- ${q}`).join('\n');
}

function criterionLabel(criterion: Criterion, index: number): string {
  const num = index + 1;
  switch (criterion.type) {
    case 'must_mention':
      return `Criterion ${num}: must_mention\n**Concepts:** ${criterion.concepts.join(', ')}`;
    case 'must_not_mention':
      return `Criterion ${num}: must_not_mention\n**Forbidden concepts:** ${criterion.concepts.join(', ')}`;
    case 'must_decline':
      return `Criterion ${num}: must_decline${criterion.description ? `\n**Note:** ${criterion.description}` : ''}`;
    case 'tone':
      return `Criterion ${num}: tone\n**Expected tone:** ${criterion.expected}${criterion.description ? `\n**Note:** ${criterion.description}` : ''}`;
    default:
      return `Criterion ${num}: ${criterion.type}`;
  }
}

/**
 * Generate a Markdown judgment file from partial test results.
 */
export function generateJudgmentFile(
  results: TestResult[],
  partialResultsPath: string
): string {
  const lines: string[] = [];

  lines.push('# Quily Eval \u2014 Manual Judgment File');
  lines.push('');
  lines.push(`> Generated: ${new Date().toISOString()}`);
  lines.push(`> Partial results: ${partialResultsPath}`);
  lines.push('');
  lines.push('## Instructions');
  lines.push('');
  lines.push(
    'You are a QA evaluator for "Quily", a RAG chatbot about the Quilibrium protocol.'
  );
  lines.push(
    'For each `judgment` block below, read the chatbot\'s response and evaluate the criterion.'
  );
  lines.push('Fill in the three fields:');
  lines.push('');
  lines.push('- **passed**: `true` or `false`');
  lines.push('- **score**: a number from `0.0` to `1.0`');
  lines.push(
    '- **reasoning**: brief explanation (keep to a single line)'
  );
  lines.push('');
  lines.push('Do NOT modify anything outside the `judgment` code blocks.');
  lines.push('');

  let pendingCount = 0;

  for (const result of results) {
    const pendingCriteria = result.criterionResults
      .map((cr, i) => ({ cr, originalIndex: i }))
      .filter(({ cr }) => isPending(cr));

    if (pendingCriteria.length === 0) continue;

    lines.push('---');
    lines.push('');
    lines.push(
      `## Test: ${result.testCase.id}`
    );
    lines.push(
      `**Category:** ${result.testCase.category} | **Query:** "${result.testCase.query || (result.testCase.turns ? `[${result.testCase.turns.length} turns]` : '(none)')}"`
    );
    lines.push('');

    // Response text in a fenced block to avoid markdown conflicts
    lines.push('### Response');
    lines.push('');
    lines.push('~~~text');
    lines.push(result.response.text || '(empty response)');
    lines.push('~~~');
    lines.push('');

    // Sources
    lines.push('### Sources');
    lines.push(formatSources(result.response));
    lines.push('');

    // Follow-ups
    lines.push('### Follow-up Questions');
    lines.push(formatFollowUps(result.response));
    lines.push('');

    // Each pending criterion
    for (const { cr, originalIndex } of pendingCriteria) {
      lines.push(`### ${criterionLabel(cr.criterion, originalIndex)}`);
      lines.push('');

      // Include the evaluation prompt so the judge knows the rubric
      const prompt = buildJudgePrompt(
        cr.criterion,
        result.testCase,
        result.response
      );
      // Extract just the "Evaluation Task" section from the prompt
      const evalTaskMatch = prompt.match(
        /## Evaluation Task\n([\s\S]+)$/
      );
      if (evalTaskMatch) {
        for (const line of evalTaskMatch[1].trim().split('\n')) {
          lines.push(`> ${line}`);
        }
      }
      lines.push('');

      lines.push('```judgment');
      lines.push(`id: ${result.testCase.id}`);
      lines.push(`criterion_index: ${originalIndex}`);
      lines.push('passed: ');
      lines.push('score: ');
      lines.push('reasoning: ');
      lines.push('```');
      lines.push('');

      pendingCount++;
    }
  }

  // Summary at the top (insert after instructions)
  const summaryLine = `**${pendingCount} judgment(s)** need evaluation across ${results.filter((r) => r.criterionResults.some(isPending)).length} test(s).`;
  const insertIdx = lines.indexOf(
    'Do NOT modify anything outside the `judgment` code blocks.'
  );
  if (insertIdx >= 0) {
    lines.splice(insertIdx + 2, 0, summaryLine, '');
  }

  return lines.join('\n');
}

/**
 * Parse a completed judgment file into structured judgments.
 */
export function parseJudgmentFile(content: string): ManualJudgment[] {
  const judgments: ManualJudgment[] = [];
  const blockRegex = /```judgment\s*\n([\s\S]*?)```/g;
  let match;

  while ((match = blockRegex.exec(content)) !== null) {
    const block = match[1];
    const fields: Record<string, string> = {};

    for (const line of block.split('\n')) {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const key = line.slice(0, colonIdx).trim();
        const value = line.slice(colonIdx + 1).trim();
        if (key && value) {
          fields[key] = value;
        }
      }
    }

    const id = fields['id'];
    const criterionIndex = fields['criterion_index'];

    if (!id) {
      throw new Error('Judgment block missing "id" field');
    }
    if (criterionIndex === undefined) {
      throw new Error(`Judgment for ${id} missing "criterion_index"`);
    }
    if (!fields['passed']) {
      throw new Error(
        `Judgment for ${id}[${criterionIndex}] missing "passed" — fill in true or false`
      );
    }
    if (!fields['score']) {
      throw new Error(
        `Judgment for ${id}[${criterionIndex}] missing "score" — fill in 0.0 to 1.0`
      );
    }
    if (!fields['reasoning']) {
      throw new Error(
        `Judgment for ${id}[${criterionIndex}] missing "reasoning"`
      );
    }

    const passed = fields['passed'] === 'true';
    const score = parseFloat(fields['score']);
    if (isNaN(score) || score < 0 || score > 1) {
      throw new Error(
        `Judgment for ${id}[${criterionIndex}] has invalid score "${fields['score']}" — must be 0.0 to 1.0`
      );
    }

    judgments.push({
      id,
      criterionIndex: parseInt(criterionIndex),
      passed,
      score,
      reasoning: fields['reasoning'],
    });
  }

  return judgments;
}

/**
 * Merge manual judgments into a partial eval report, producing the final report.
 */
export function mergeJudgments(
  partialReport: EvalReport,
  judgments: ManualJudgment[]
): EvalReport {
  // Index judgments by id + criterionIndex for fast lookup
  const judgmentMap = new Map<string, ManualJudgment>();
  for (const j of judgments) {
    judgmentMap.set(`${j.id}:${j.criterionIndex}`, j);
  }

  let applied = 0;

  const mergedResults: TestResult[] = partialReport.results.map((result) => {
    const criterionResults = result.criterionResults.map((cr, idx) => {
      if (!isPending(cr)) return cr;

      const key = `${result.testCase.id}:${idx}`;
      const judgment = judgmentMap.get(key);
      if (!judgment) return cr; // leave as pending if no judgment provided

      applied++;
      return {
        ...cr,
        passed: judgment.passed,
        score: judgment.score,
        reasoning: judgment.reasoning,
      };
    });

    const overallScore =
      criterionResults.length > 0
        ? criterionResults.reduce((sum, r) => sum + r.score, 0) /
          criterionResults.length
        : 0;

    return {
      ...result,
      criterionResults,
      overallScore,
      passed: criterionResults.every((r) => r.passed),
      judgeModel: 'manual',
    };
  });

  // Rebuild summary
  const byCategory: Record<
    string,
    { total: number; passed: number; scores: number[] }
  > = {};

  for (const r of mergedResults) {
    const cat = r.testCase.category;
    if (!byCategory[cat])
      byCategory[cat] = { total: 0, passed: 0, scores: [] };
    byCategory[cat].total++;
    if (r.passed) byCategory[cat].passed++;
    byCategory[cat].scores.push(r.overallScore);
  }

  const categorySummary: Record<
    string,
    { total: number; passed: number; avgScore: number }
  > = {};
  for (const [cat, stats] of Object.entries(byCategory)) {
    categorySummary[cat] = {
      total: stats.total,
      passed: stats.passed,
      avgScore:
        stats.scores.length > 0
          ? stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length
          : 0,
    };
  }

  return {
    ...partialReport,
    config: { ...partialReport.config, judgeModel: 'manual' },
    summary: {
      total: mergedResults.length,
      passed: mergedResults.filter((r) => r.passed).length,
      failed: mergedResults.filter((r) => !r.passed).length,
      skipped: partialReport.summary.skipped,
      avgScore:
        mergedResults.length > 0
          ? mergedResults.reduce((sum, r) => sum + r.overallScore, 0) /
            mergedResults.length
          : 0,
      byCategory: categorySummary,
    },
    results: mergedResults,
  };
}
