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
 *   yarn eval judge     - Import manual judgments into a partial report
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { spawn, execSync, type ChildProcess } from 'child_process';
import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import YAML from 'yaml';
import { TestSuiteSchema } from './types.js';
import type { EvalReport } from './types.js';
import { runTestSuite } from './runner.js';
import { buildReport, printTerminalReport, saveJsonReport } from './reporter.js';
import { generateJudgmentFile, parseJudgmentFile, mergeJudgments } from './collector.js';

/** PID file for cleanup of orphaned dev servers */
const PID_FILE = path.join(__dirname, '.eval-server.pid');

/** Track spawned dev server so we can kill it on exit */
let spawnedServer: ChildProcess | null = null;

function killPid(pid: number) {
  if (process.platform === 'win32') {
    // On Windows, `shell: true` means kill() only kills the cmd.exe wrapper.
    // Use taskkill /T to kill the entire process tree.
    try { execSync(`taskkill //PID ${pid} //F //T`, { stdio: 'ignore' }); } catch {}
  } else {
    try { process.kill(-pid, 'SIGTERM'); } catch {}
  }
}

function cleanupServer() {
  if (!spawnedServer) return;
  const pid = spawnedServer.pid;
  spawnedServer = null;
  if (pid) killPid(pid);
  try { fs.unlinkSync(PID_FILE); } catch {}
}

/** Kill any orphaned dev server from a previous crashed run */
function cleanupOrphans() {
  try {
    const orphanPid = parseInt(fs.readFileSync(PID_FILE, 'utf-8').trim(), 10);
    if (!isNaN(orphanPid)) {
      killPid(orphanPid);
      console.log(chalk.gray(`  Cleaned up orphaned dev server (PID ${orphanPid})`));
    }
    fs.unlinkSync(PID_FILE);
  } catch {}
}

process.on('exit', cleanupServer);
process.on('SIGINT', () => { cleanupServer(); process.exit(130); });
process.on('SIGTERM', () => { cleanupServer(); process.exit(143); });

/**
 * Check if the dev server is reachable at the given URL.
 */
async function isServerReachable(url: string): Promise<boolean> {
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(3000) });
    await resp.text();
    return true; // Any response (even 404) means the server is up
  } catch {
    return false;
  }
}

/**
 * Start a Next.js dev server on the port extracted from the base URL.
 * Waits until the server responds before resolving.
 */
async function startDevServer(baseUrl: string, spinner: ReturnType<typeof ora>): Promise<void> {
  cleanupOrphans();

  const url = new URL(baseUrl);
  const port = url.port || '4000';

  spinner.start(`Starting dev server on port ${port}...`);

  spawnedServer = spawn(
    'npx',
    ['next', 'dev', '-p', port],
    { stdio: 'pipe', shell: true }
  );

  // Write PID file so orphans can be cleaned up if we crash
  if (spawnedServer.pid) {
    fs.writeFileSync(PID_FILE, String(spawnedServer.pid));
  }

  // Capture stderr for diagnostics if it fails
  let serverStderr = '';
  spawnedServer.stderr?.on('data', (data) => { serverStderr += data.toString(); });

  // Track early exit (e.g. port conflict)
  let earlyExit = false;
  spawnedServer.on('error', (err) => {
    earlyExit = true;
    spinner.fail(`Failed to start dev server: ${err.message}`);
    process.exit(1);
  });
  spawnedServer.on('exit', (code) => {
    if (code !== null && code !== 0) {
      earlyExit = true;
      spinner.fail(`Dev server exited with code ${code}`);
      if (serverStderr) console.error(chalk.gray(serverStderr.slice(-500)));
      process.exit(1);
    }
  });

  // Poll until server is ready (up to 90s — Next.js first compile can be slow)
  const maxWait = 90_000;
  const interval = 1_500;
  const deadline = Date.now() + maxWait;

  while (Date.now() < deadline && !earlyExit) {
    await new Promise((r) => setTimeout(r, interval));
    if (await isServerReachable(baseUrl)) {
      spinner.succeed(`Dev server started on port ${port}`);
      return;
    }
  }

  if (!earlyExit) {
    spinner.fail(`Dev server failed to start within ${maxWait / 1000}s`);
    cleanupServer();
    process.exit(1);
  }
}

const program = new Command();

program
  .name('eval')
  .description('QA evaluation harness for Quily chatbot')
  .version('1.0.0');

// ─── run ────────────────────────────────────────────────────────────────────

program
  .command('run')
  .description('Run the evaluation suite against the dev server')
  .option('-u, --url <url>', 'Base URL of the chat server', process.env.EVAL_BASE_URL || 'http://localhost:4000')
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
  .option('--collect', 'Collect responses for manual judgment (no API key needed)')
  .option('--auto-start', 'Auto-start the dev server if not already running')
  .action(async (options) => {
    const spinner = ora();

    // Validate env
    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    const needsApiKey = options.judge !== false && !options.collect;
    if (!openrouterApiKey && needsApiKey) {
      console.error(chalk.red('Error: OPENROUTER_API_KEY required for LLM judge'));
      console.error(
        chalk.gray('Set it in .env or get one at openrouter.ai/keys')
      );
      console.error(
        chalk.gray('Or use --no-judge for deterministic checks only')
      );
      console.error(
        chalk.gray('Or use --collect for manual judgment mode')
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
        `\n  Running ${activeTests.length} tests (${skippedCount} skipped)`
      )
    );

    // Cost estimate for automated judge mode
    if (needsApiKey) {
      const DETERMINISTIC_TYPES = [
        'must_cite',
        'must_have_follow_ups',
        'must_contain_command_response',
      ];
      const llmCallCount = activeTests.reduce(
        (sum, t) =>
          sum +
          t.criteria.filter((c) => !DETERMINISTIC_TYPES.includes(c.type))
            .length,
        0
      );
      if (llmCallCount > 0) {
        const estimatedCost = (llmCallCount * 0.004).toFixed(3);
        console.log(
          chalk.gray(
            `  Estimated judge cost: ~$${estimatedCost} (${llmCallCount} LLM calls via OpenRouter)`
          )
        );
      }
    } else if (options.collect) {
      console.log(chalk.cyan('  Collect mode: responses will be saved for manual judgment'));
    }

    console.log('');

    // Health check
    spinner.start('Checking dev server...');
    if (await isServerReachable(options.url)) {
      spinner.succeed('Dev server is responsive');
    } else if (options.autoStart) {
      spinner.info('Dev server not reachable — starting one automatically');
      await startDevServer(options.url, spinner);
    } else {
      spinner.fail('Dev server not reachable');
      console.error(chalk.red(`Cannot connect to ${options.url}`));
      console.error(chalk.gray('Start the dev server with: yarn dev -p 4000'));
      console.error(chalk.gray('Or use --auto-start to launch it automatically'));
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
        collectMode: options.collect || false,
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

    // Build report
    const report = buildReport(
      results,
      {
        baseUrl: options.url,
        provider: options.provider,
        model: options.model || '(server default)',
        judgeModel: options.collect ? 'pending-manual' : options.judgeModel,
      },
      durationMs,
      skippedCount
    );

    const outputDir = path.resolve(options.output);

    // Collect mode: save partial results + judgment file
    if (options.collect) {
      const partialPath = saveJsonReport(report, outputDir);
      const judgmentContent = generateJudgmentFile(results, partialPath);
      const judgmentPath = path.join(
        outputDir,
        `judgment-${report.runId}.md`
      );
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      fs.writeFileSync(judgmentPath, judgmentContent);

      console.log(chalk.green('\n  Collect mode complete!'));
      console.log(chalk.gray(`  Partial results: ${partialPath}`));
      console.log(chalk.cyan(`  Judgment file:   ${judgmentPath}`));
      console.log(chalk.gray('\n  Next steps:'));
      console.log(
        chalk.gray(
          '  1. Open the judgment file and give it to Claude (or review manually)'
        )
      );
      console.log(
        chalk.gray(
          '  2. Fill in all judgment blocks (passed, score, reasoning)'
        )
      );
      console.log(
        chalk.gray(`  3. Run: yarn eval judge ${judgmentPath}`)
      );
      console.log('');
      return;
    }

    printTerminalReport(report);

    // Save JSON report
    const reportPath = saveJsonReport(report, outputDir);
    console.log(chalk.gray(`  Report saved: ${reportPath}\n`));

    // Exit with non-zero if any failures
    if (report.summary.failed > 0) {
      process.exit(1);
    }
  });

// ─── judge ──────────────────────────────────────────────────────────────────

program
  .command('judge')
  .description('Import manual judgments and produce a final scored report')
  .argument('<judgment-file>', 'Path to completed judgment Markdown file')
  .option('--output <dir>', 'Output directory for JSON reports', './results')
  .action((judgmentFile: string, options: { output: string }) => {
    const judgmentPath = path.resolve(judgmentFile);
    if (!fs.existsSync(judgmentPath)) {
      console.error(chalk.red(`Judgment file not found: ${judgmentPath}`));
      process.exit(1);
    }

    const judgmentContent = fs.readFileSync(judgmentPath, 'utf-8');

    // Extract partial results path from the file header
    const partialPathMatch = judgmentContent.match(
      /> Partial results:\s*(.+)/
    );
    if (!partialPathMatch) {
      console.error(
        chalk.red(
          'Cannot find partial results path in judgment file header'
        )
      );
      process.exit(1);
    }
    const partialPath = path.resolve(partialPathMatch[1].trim());
    if (!fs.existsSync(partialPath)) {
      console.error(chalk.red(`Partial results not found: ${partialPath}`));
      console.error(
        chalk.gray('The partial JSON report from --collect mode is needed')
      );
      process.exit(1);
    }

    // Parse judgments
    let judgments;
    try {
      judgments = parseJudgmentFile(judgmentContent);
    } catch (err) {
      console.error(
        chalk.red(
          `Error parsing judgment file: ${err instanceof Error ? err.message : String(err)}`
        )
      );
      process.exit(1);
    }

    if (judgments.length === 0) {
      console.error(
        chalk.yellow(
          'No completed judgment blocks found. Fill in the passed/score/reasoning fields first.'
        )
      );
      process.exit(1);
    }

    console.log(
      chalk.blue(`\n  Loaded ${judgments.length} judgment(s) from ${path.basename(judgmentPath)}`)
    );

    // Load partial report and merge
    const partialReport: EvalReport = JSON.parse(
      fs.readFileSync(partialPath, 'utf-8')
    );
    const finalReport = mergeJudgments(partialReport, judgments);

    printTerminalReport(finalReport);

    const reportPath = saveJsonReport(
      finalReport,
      path.resolve(options.output)
    );
    console.log(chalk.gray(`  Final report saved: ${reportPath}\n`));

    if (finalReport.summary.failed > 0) {
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
