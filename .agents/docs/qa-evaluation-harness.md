---
type: doc
title: "QA Evaluation Harness"
status: done
ai_generated: true
reviewed_by: null
created: 2026-02-11
updated: 2026-02-12
related_docs:
  - .agents/docs/rag-knowledge-base-workflow.md
  - .agents/docs/system-prompt-anti-hallucination.md
related_tasks: []
---

# QA Evaluation Harness

> **⚠️ AI-Generated**: May contain errors. Verify before use.

## Overview

The QA evaluation harness is a CLI-based testing system that stress-tests the Quily chatbot's response quality. It sends real user queries to the chat API, parses streaming responses, and evaluates them against curated criteria using a combination of deterministic checks and an LLM-as-judge. The test suite contains 34 test cases across 10 categories covering factual accuracy, hallucination detection, citation quality, personality tone, adversarial robustness, and more.

### Evaluation Modes

| Mode | Command | API Key? | Cost |
|------|---------|----------|------|
| **Automated** | `yarn eval:run` | Yes (`OPENROUTER_API_KEY`) | ~$0.14/run |
| **Manual (collect + judge)** | `yarn eval:collect` then `yarn eval:judge <file>` | No | $0 |
| **Deterministic only** | `yarn eval:run --no-judge` | No | $0 |

## Architecture

### Key Components

```
scripts/eval/
├── index.ts            # CLI entry point (commander subcommands)
├── types.ts            # Zod schemas for YAML validation + result interfaces
├── stream-parser.ts    # AI SDK v6 UI Message Stream parser
├── runner.ts           # HTTP client, concurrency limiter, deterministic checks
├── judge.ts            # LLM-as-judge via OpenRouter (generateObject + Zod)
├── collector.ts        # Manual judgment file generator, parser, and merger
├── reporter.ts         # Terminal output (chalk) + JSON report files
└── test-suite.yaml     # 34 curated test cases across 10 categories
results/                # JSON report output (gitignored)
```

### Data Flow

```
test-suite.yaml
  → Zod validation (types.ts)
  → Filter by --tag / --category / --id
  → Concurrency queue (runner.ts, default 3 parallel)
    → POST /api/chat with query + provider + model
    → Parse streaming response (stream-parser.ts)
    → For each criterion:
        → Deterministic fast-path check (~40% of criteria)
        → OR LLM judge call via OpenRouter (judge.ts)
        → OR mark as "Pending manual judgment" (--collect mode)
    → Aggregate into TestResult
  → Build report (reporter.ts)
  → Print terminal summary + save JSON to results/
  → (collect mode) Save Markdown judgment file for manual evaluation
```

### Stream Parser

The chat API returns responses in AI SDK v6 UI Message Stream format — a non-standard SSE protocol where each line follows `PREFIX:JSON_PAYLOAD`. The stream parser (`stream-parser.ts`) reads the body with `getReader()` and extracts:

- **`text-delta`** events → concatenated into full response text
- **`source-url`** events → parsed into `SourceEntry` objects (title uses pipe-delimited format: `Title|doc_type|published_date`)
- **`data-follow-up`** events → follow-up question suggestions
- **`data-status`** events → status/progress messages
- Latency tracking via `Date.now()` diff from start to stream completion

### Evaluation Strategy

Each test case defines one or more criteria. The runner uses a two-tier evaluation approach:

**Deterministic Fast-Path Checks** (skip LLM judge, ~40% of criteria):
- `must_cite` — regex `\[(\d+)\]` counts unique citation references
- `must_have_follow_ups` — counts follow-up questions from parsed stream data
- `must_contain_command_response` — case-insensitive string matching for expected sections

**LLM Judge** (remaining ~60% of criteria):
- Uses `generateObject` from AI SDK with a Zod schema (`{passed, score, reasoning}`)
- Each criterion type has a specialized prompt template in `buildJudgePrompt()`
- Default judge model: `anthropic/claude-sonnet-4-5-20250929` via OpenRouter
- Criterion types evaluated by judge: `must_mention`, `must_not_mention`, `must_decline`, `tone`

### Test Categories

| Category | Count | Purpose |
|----------|-------|---------|
| `factual` | 10 | Core Quilibrium knowledge accuracy |
| `hallucination` | 4 | Detects fabricated info (staking, smart contracts, etc.) |
| `citation` | 2 | Inline `[N]` citation format and source quality |
| `off_topic` | 2 | Graceful rejection of unrelated questions |
| `adversarial` | 3 | Jailbreak attempts, prompt extraction, manipulation |
| `personality` | 3 | Tone matching (casual, humorous, technical) |
| `command` | 3 | Slash command responses (/help, /examples, /sources) |
| `multi_hop` | 2 | Multi-concept synthesis (storage vs compute, product vs protocol) |
| `temporal` | 1 | Time-sensitive questions (latest livestream) |
| `edge_case` | 4 | Typos, shorthand, minimal input, very long queries |

Four tests are tagged `smoke` for quick iteration runs.

### Criterion Types

| Type | Evaluation | Description |
|------|-----------|-------------|
| `must_mention` | LLM judge | Checks that specific concepts appear (semantic matching) |
| `must_not_mention` | LLM judge | Ensures forbidden concepts are absent |
| `must_cite` | Deterministic | Counts unique `[N]` citation references |
| `must_decline` | LLM judge | Verifies graceful refusal of off-topic/adversarial queries |
| `tone` | LLM judge | Evaluates tone match (casual, technical, humorous, declining) |
| `must_contain_command_response` | Deterministic | Checks for expected section headings in command responses |
| `must_have_follow_ups` | Deterministic | Counts follow-up question suggestions from stream data |

## Usage Examples

### CLI Commands

```bash
# List all test cases
yarn eval:list

# Run the full 34-test suite (automated judge, needs OPENROUTER_API_KEY)
yarn eval:run

# Run only smoke tests (4 quick tests)
yarn eval:smoke

# Run a single test by ID
yarn eval:run --id factual-what-is-quilibrium

# Run tests in a specific category
yarn eval:run --category hallucination

# Run without LLM judge (deterministic checks only, free)
yarn eval:run --no-judge

# Collect mode: save responses for manual judgment (free, no API key)
yarn eval:collect

# Import manual judgments into a final report
yarn eval:judge results/judgment-2026-02-12T14-30-00.md

# Use a different judge model
yarn eval:run --judge-model anthropic/claude-sonnet-4-5-20250929

# Re-display a saved JSON report
yarn eval:report results/eval-2026-02-11T14-30-00.json
```

### Run Options

| Option | Default | Description |
|--------|---------|-------------|
| `-u, --url` | `http://localhost:3000` | Base URL of the chat server |
| `-p, --provider` | `chutes` | Chat provider |
| `-m, --model` | Server default | Model to test |
| `--judge-model` | `anthropic/claude-sonnet-4-5-20250929` | Judge model (via OpenRouter) |
| `-c, --concurrency` | `3` | Max parallel tests |
| `-t, --timeout` | `60000` | Per-test timeout (ms) |
| `--suite` | `scripts/eval/test-suite.yaml` | Path to test suite YAML |
| `--tag` | — | Filter by tag (e.g., `smoke`) |
| `--category` | — | Filter by category |
| `--id` | — | Run a single test by ID |
| `--output` | `./results` | Output directory for JSON reports |
| `--no-judge` | — | Skip LLM judge (deterministic only) |
| `--collect` | — | Collect responses for manual judgment (no API key) |

### Manual Judgment Workflow

The collect-and-judge workflow lets you evaluate responses using your existing Claude subscription (claude.ai, Claude Code, etc.) instead of paying for API calls:

1. **Collect** — Run tests and save a Markdown judgment file:
   ```bash
   yarn eval:collect
   ```
   This produces two files in `results/`:
   - `eval-<timestamp>.json` — partial results (deterministic scores filled in)
   - `judgment-<timestamp>.md` — Markdown file with all context + empty judgment blocks

2. **Judge** — Give the `.md` file to Claude (via claude.ai or Claude Code). Claude fills in the `passed`, `score`, and `reasoning` fields in each judgment block.

3. **Import** — Feed the completed file back:
   ```bash
   yarn eval:judge results/judgment-<timestamp>.md
   ```
   This merges the manual judgments into the partial results and produces the final scored report.

### Adding a Test Case

Add entries to `scripts/eval/test-suite.yaml`:

```yaml
- id: factual-new-topic
  category: factual
  query: "What is the new Quilibrium feature?"
  tags: [core]
  criteria:
    - type: must_mention
      concepts: ["feature name", "key detail"]
    - type: must_cite
      min_citations: 1
    - type: must_have_follow_ups
      min_count: 2
```

### Multi-Turn Test Case

Use `context_messages` for conversation history:

```yaml
- id: multi-turn-followup
  category: factual
  query: "Can you elaborate on the consensus mechanism?"
  context_messages:
    - role: user
      content: "What is Quilibrium?"
    - role: assistant
      content: "Quilibrium is a decentralized protocol..."
  criteria:
    - type: must_mention
      concepts: ["consensus", "proof of meaningful work"]
```

## Cost Breakdown

The automated mode displays an estimated cost before each run. Here is the breakdown for the current 34-test suite:

| Criterion Type | Count | Evaluation | Cost |
|----------------|-------|------------|------|
| `must_mention` | 16 | LLM judge | ~$0.004/call |
| `must_not_mention` | 7 | LLM judge | ~$0.004/call |
| `must_decline` | 7 | LLM judge | ~$0.004/call |
| `tone` | 4 | LLM judge | ~$0.004/call |
| `must_cite` | 14 | Deterministic | $0 |
| `must_have_follow_ups` | 2 | Deterministic | $0 |
| `must_contain_command_response` | 3 | Deterministic | $0 |

**Total: ~$0.14 per full automated run** (34 LLM calls at ~$0.004 each via OpenRouter Claude Sonnet).

To avoid API costs entirely, use `--collect` mode or `--no-judge`.

## Technical Decisions

- **Real HTTP endpoint over direct handler import** — Tests the full stack including middleware, streaming, auth fallback chain, and rate limiting. The trade-off is requiring a running dev server, but this ensures the tests match real user experience.

- **LLM judge via OpenRouter** — Provides access to Claude Sonnet for high-quality subjective evaluation at ~$0.14 per full run. OpenRouter was chosen over direct Anthropic API because the project already uses `@openrouter/ai-sdk-provider` as a dependency and the user has an existing API key configured.

- **Manual judgment via collect + judge** — Allows evaluation using any Claude interface (claude.ai, Claude Code) with zero API cost. The Markdown format is designed to be both human-readable and machine-parseable, using fenced `judgment` code blocks that are easy to fill in and trivial to parse back.

- **Deterministic fast-paths** — ~40% of criteria (citations, follow-ups, command sections) use regex or string matching instead of the LLM judge. This saves cost, improves speed, and enables the `--no-judge` mode for completely free runs.

- **YAML test suite** — More readable than JSON for hand-curated test cases with multi-line queries and descriptions. Validated at load time with Zod schemas.

- **Concurrency of 3** — Balances speed against overwhelming the dev server. A full 34-test run completes in roughly 3-5 minutes depending on model latency.

- **`generateObject` with Zod schema** — Forces the judge to return structured `{passed, score, reasoning}` output, eliminating parsing failures and ensuring consistent evaluation format.

## Environment Requirements

- **Dev server running**: `yarn dev` with `NEXT_PUBLIC_FREE_MODE=true`
- **`OPENROUTER_API_KEY`** in `.env` for the automated LLM judge (from openrouter.ai/keys)
- **Cost**: ~$0.14 per full 34-test run via OpenRouter Claude Sonnet
- Use `--collect` for free manual judgment mode (no API key needed)
- Use `--no-judge` for free deterministic-only checks

## Known Limitations

- **Requires running dev server** — Tests hit `localhost:3000/api/chat`, so the server must be up. The CLI performs a health check before running and exits with a clear message if the server is unreachable.
- **LLM judge variance** — Subjective criteria (tone, must_mention, must_decline) may score differently across runs due to LLM non-determinism. Multiple runs and averaging help mitigate this.
- **No test isolation** — Tests share the same server state. If the RAG knowledge base changes between runs, results may vary.
- **Stream format coupling** — The parser is tightly coupled to AI SDK v6 UI Message Stream format. If the SDK version changes the wire protocol, `stream-parser.ts` needs updating.
- **Single-provider testing** — Tests run against one provider/model at a time. To compare models, run the suite multiple times with different `--model` flags.

## Related Documentation

- [RAG Knowledge Base Workflow](.agents/docs/rag-knowledge-base-workflow.md) — Source documents that the chatbot retrieves from
- [System Prompt Anti-Hallucination](.agents/docs/system-prompt-anti-hallucination.md) — Citation rules and hallucination guardrails tested by the harness

---

_Updated: 2026-02-12_
