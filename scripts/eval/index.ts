#!/usr/bin/env node
/**
 * QA evaluation harness for Quily chatbot.
 *
 * Commands:
 *   yarn eval           - Show help
 *   yarn eval run       - Run the evaluation suite
 *   yarn eval:smoke     - Run smoke tests only
 *   yarn eval list      - List all test cases
 *   yarn eval report    - Re-display a saved JSON report
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import YAML from 'yaml';
import { TestSuiteSchema } from './types.js';
import { runTestSuite } from './runner.js';
import { buildReport, printTerminalReport, saveJsonReport } from './reporter.js';

const program = new Command();

program
  .name('eval')
  .description('QA evaluation harness for Quily chatbot')
  .version('1.0.0');

// ─── run ────────────────────────────────────────────────────────────────────

program
  .command('run')
  .description('Run the evaluation suite against the dev server')
  .option('-u, --url <url>', 'Base URL of the chat server', 'http://localhost:3000')
  .option('-p, --provider <provider>', 'Chat provider', 'chutes')
  .option('-m, --model <model>', 'Model to test (uses server default if omitted)')
  .option(
    '--judge-model <model>',
    'Judge model for evaluation (via OpenRouter)',
    'anthropic/claude-sonnet-4-5-20250929'
  )
  .option('-c, --concurrency <n>', 'Max parallel tests', '3')
  .option('-t, --timeout <ms>', 'Per-test timeout', '60000')
  .option(
    '--suite <path>',
    'Path to test suite YAML',
    path.join(__dirname, 'test-suite.yaml')
  )
  .option('--tag <tag>', 'Only run tests with this tag')
  .option('--category <cat>', 'Only run tests in this category')
  .option('--id <id>', 'Run a single test by ID')
  .option('--output <dir>', 'Output directory for JSON reports', './results')
  .option('--no-judge', 'Skip LLM judge (deterministic checks only)')
  .action(async (options) => {
    const spinner = ora();

    // Validate env
    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterApiKey && options.judge !== false) {
      console.error(chalk.red('Error: OPENROUTER_API_KEY required for LLM judge'));
      console.error(
        chalk.gray('Set it in .env or get one at openrouter.ai/keys')
      );
      console.error(
        chalk.gray('Or use --no-judge for deterministic checks only')
      );
      process.exit(1);
    }

    // Load and validate test suite
    spinner.start('Loading test suite...');
    const suitePath = path.resolve(options.suite);
    if (!fs.existsSync(suitePath)) {
      spinner.fail(`Test suite not found: ${suitePath}`);
      process.exit(1);
    }

    const rawYaml = fs.readFileSync(suitePath, 'utf-8');
    const parsed = YAML.parse(rawYaml);
    const validationResult = TestSuiteSchema.safeParse(parsed);

    if (!validationResult.success) {
      spinner.fail('Invalid test suite');
      console.error(chalk.red(validationResult.error.message));
      process.exit(1);
    }

    let tests = validationResult.data.tests;
    spinner.succeed(`Loaded ${tests.length} test cases from ${path.basename(suitePath)}`);

    // Apply filters
    if (options.id) {
      tests = tests.filter((t) => t.id === options.id);
    }
    if (options.tag) {
      tests = tests.filter((t) => t.tags?.includes(options.tag));
    }
    if (options.category) {
      tests = tests.filter((t) => t.category === options.category);
    }

    if (tests.length === 0) {
      console.log(chalk.yellow('\n  No tests match the given filters.\n'));
      process.exit(0);
    }

    const skippedCount = tests.filter((t) => t.skip).length;
    const activeTests = tests.filter((t) => !t.skip);

    console.log(
      chalk.blue(
        `\n  Running ${activeTests.length} tests (${skippedCount} skipped)\n`
      )
    );

    // Health check
    spinner.start('Checking dev server...');
    try {
      const healthResp = await fetch(`${options.url}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: '/help' }],
          provider: options.provider,
          model: options.model || undefined,
        }),
      });
      // Consume body to avoid leak
      await healthResp.text();

      if (!healthResp.ok) {
        throw new Error(`HTTP ${healthResp.status}`);
      }
      spinner.succeed('Dev server is responsive');
    } catch (err) {
      spinner.fail('Dev server not reachable');
      console.error(chalk.red(`Cannot connect to ${options.url}`));
      console.error(chalk.gray('Start the dev server with: yarn dev'));
      process.exit(1);
    }

    // Run evaluation
    const startTime = Date.now();
    const results = await runTestSuite(
      activeTests,
      {
        baseUrl: options.url,
        provider: options.provider,
        model: options.model || '',
        openrouterApiKey: openrouterApiKey || '',
        judgeModel: options.judgeModel,
        concurrency: parseInt(options.concurrency),
        timeout: parseInt(options.timeout),
        skipJudge: options.judge === false,
      },
      (completed, total, result) => {
        const icon = result.passed ? chalk.green('PASS') : chalk.red('FAIL');
        const score = (result.overallScore * 100).toFixed(0);
        console.log(
          `  ${icon} [${completed}/${total}] ${result.testCase.id} (${score}%, ${result.response.latencyMs}ms)`
        );
      }
    );
    const durationMs = Date.now() - startTime;

    // Build and display report
    const report = buildReport(
      results,
      {
        baseUrl: options.url,
        provider: options.provider,
        model: options.model || '(server default)',
        judgeModel: options.judgeModel,
      },
      durationMs,
      skippedCount
    );

    printTerminalReport(report);

    // Save JSON report
    const reportPath = saveJsonReport(report, path.resolve(options.output));
    console.log(chalk.gray(`  Report saved: ${reportPath}\n`));

    // Exit with non-zero if any failures
    if (report.summary.failed > 0) {
      process.exit(1);
    }
  });

// ─── list ───────────────────────────────────────────────────────────────────

program
  .command('list')
  .description('List all test cases in the suite')
  .option(
    '--suite <path>',
    'Path to test suite YAML',
    path.join(__dirname, 'test-suite.yaml')
  )
  .option('--category <cat>', 'Filter by category')
  .option('--tag <tag>', 'Filter by tag')
  .action((options) => {
    const suitePath = path.resolve(options.suite);
    if (!fs.existsSync(suitePath)) {
      console.error(chalk.red(`Test suite not found: ${suitePath}`));
      process.exit(1);
    }

    const rawYaml = fs.readFileSync(suitePath, 'utf-8');
    const parsed = YAML.parse(rawYaml);
    const validation = TestSuiteSchema.safeParse(parsed);
    if (!validation.success) {
      console.error(chalk.red('Invalid test suite'));
      console.error(chalk.red(validation.error.message));
      process.exit(1);
    }

    let tests = validation.data.tests;
    if (options.category) {
      tests = tests.filter((t) => t.category === options.category);
    }
    if (options.tag) {
      tests = tests.filter((t) => t.tags?.includes(options.tag));
    }

    console.log(chalk.blue(`\n  Test Suite: ${tests.length} tests\n`));
    for (const t of tests) {
      const skip = t.skip ? chalk.gray(' [SKIP]') : '';
      const tags = t.tags ? chalk.gray(` [${t.tags.join(', ')}]`) : '';
      const queryPreview =
        t.query.length > 50 ? t.query.slice(0, 50) + '...' : t.query;
      console.log(
        `  ${chalk.cyan(t.id.padEnd(32))} ${t.category.padEnd(14)} ${queryPreview}${skip}${tags}`
      );
    }
    console.log('');
  });

// ─── report ─────────────────────────────────────────────────────────────────

program
  .command('report')
  .description('Re-display a previous evaluation report')
  .argument('<path>', 'Path to eval JSON report')
  .action((reportPath: string) => {
    const fullPath = path.resolve(reportPath);
    if (!fs.existsSync(fullPath)) {
      console.error(chalk.red(`Report not found: ${fullPath}`));
      process.exit(1);
    }
    const report = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
    printTerminalReport(report);
  });

program.parse();
