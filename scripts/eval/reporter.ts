/**
 * Report generation — terminal output and JSON files.
 */

import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import type { EvalReport, TestResult, EvalReportConfig } from './types.js';

function formatScore(score: number): string {
  const pct = (score * 100).toFixed(0);
  if (score >= 0.8) return chalk.green(`${pct}%`);
  if (score >= 0.5) return chalk.yellow(`${pct}%`);
  return chalk.red(`${pct}%`);
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = (ms / 1000).toFixed(1);
  if (ms < 60_000) return `${seconds}s`;
  const minutes = Math.floor(ms / 60_000);
  const remainingSeconds = ((ms % 60_000) / 1000).toFixed(0);
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Print a colored report to the terminal.
 */
export function printTerminalReport(report: EvalReport): void {
  const { summary } = report;

  console.log(chalk.blue('\n' + '='.repeat(60)));
  console.log(chalk.blue('  Quily Eval Report'));
  console.log(chalk.blue('='.repeat(60)));

  console.log(`\n  Run ID:    ${chalk.gray(report.runId)}`);
  console.log(`  Model:     ${chalk.cyan(report.config.model || '(server default)')}`);
  console.log(`  Judge:     ${chalk.cyan(report.config.judgeModel)}`);
  console.log(`  Duration:  ${chalk.gray(formatDuration(report.durationMs))}`);

  const passRate =
    summary.total > 0 ? ((summary.passed / summary.total) * 100).toFixed(1) : '0.0';
  const passColor = summary.passed === summary.total ? chalk.green : chalk.yellow;
  console.log(
    `\n  ${passColor(`${summary.passed}/${summary.total} passed`)} (${passRate}%)  |  Avg score: ${formatScore(summary.avgScore)}`
  );

  if (summary.skipped > 0) {
    console.log(`  ${chalk.gray(`${summary.skipped} skipped`)}`);
  }

  // By category
  console.log(chalk.blue('\n  By Category:'));
  for (const [category, stats] of Object.entries(summary.byCategory)) {
    const catRate =
      stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(0) : '0';
    const icon = stats.passed === stats.total ? chalk.green('PASS') : chalk.red('FAIL');
    console.log(
      `    ${icon}  ${category.padEnd(16)} ${stats.passed}/${stats.total} (${catRate}%)  avg: ${formatScore(stats.avgScore)}`
    );
  }

  // Failures detail
  const failures = report.results.filter((r) => !r.passed);
  if (failures.length > 0) {
    console.log(chalk.red(`\n  Failures (${failures.length}):`));
    for (const f of failures) {
      console.log(chalk.red(`\n    ${f.testCase.id}`));

      // Multi-turn: show conversation flow
      if (f.turnResults && f.turnResults.length > 0) {
        console.log(chalk.gray(`    Conversation (${f.turnResults.length} turns):`));
        for (const tr of f.turnResults) {
          const userPreview = tr.userMessage.length > 60
            ? tr.userMessage.slice(0, 60) + '...' : tr.userMessage;
          const respPreview = tr.response.text
            ? (tr.response.text.length > 80
                ? tr.response.text.slice(0, 80) + '...' : tr.response.text)
            : '(empty)';
          console.log(chalk.gray(`      Turn ${tr.turnIndex + 1} [user]: ${userPreview}`));
          console.log(chalk.gray(`      Turn ${tr.turnIndex + 1} [bot]:  ${respPreview}`));
        }
      } else {
        console.log(chalk.gray(`    Query: "${f.testCase.query}"`));
      }

      console.log(chalk.gray(`    Latency: ${f.response.latencyMs}ms`));
      if (f.response.error) {
        console.log(chalk.red(`    Error: ${f.response.error}`));
      }
      for (const cr of f.criterionResults.filter((c) => !c.passed)) {
        console.log(chalk.yellow(`    [${cr.criterion.type}] ${cr.reasoning}`));
      }
      // Show truncated response for context (single-turn only, multi-turn shows it above)
      if (!f.turnResults && f.response.text) {
        const preview =
          f.response.text.length > 150
            ? f.response.text.slice(0, 150) + '...'
            : f.response.text;
        console.log(chalk.gray(`    Response: "${preview}"`));
      }
    }
  }

  console.log(chalk.blue('\n' + '='.repeat(60) + '\n'));
}

/**
 * Save the full report as JSON.
 */
export function saveJsonReport(report: EvalReport, outputDir: string): string {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const filename = `eval-${report.runId}.json`;
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
  return filepath;
}

/**
 * Aggregate individual test results into a report.
 */
export function buildReport(
  results: TestResult[],
  config: EvalReportConfig,
  durationMs: number,
  skippedCount: number
): EvalReport {
  const runId = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, 19);

  const byCategory: Record<
    string,
    { total: number; passed: number; scores: number[] }
  > = {};

  for (const r of results) {
    const cat = r.testCase.category;
    if (!byCategory[cat]) byCategory[cat] = { total: 0, passed: 0, scores: [] };
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
    runId,
    timestamp: new Date().toISOString(),
    config,
    summary: {
      total: results.length,
      passed: results.filter((r) => r.passed).length,
      failed: results.filter((r) => !r.passed).length,
      skipped: skippedCount,
      avgScore:
        results.length > 0
          ? results.reduce((sum, r) => sum + r.overallScore, 0) / results.length
          : 0,
      byCategory: categorySummary,
    },
    results,
    durationMs,
  };
}
