---
name: eval
description: Run the QA evaluation harness to test chatbot response quality
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
---

<objective>
Run the QA evaluation harness against the Quily chatbot dev server. Offers three modes: automated (LLM judge via OpenRouter), manual (collect + judge with Claude), or deterministic-only.
</objective>

<process>

<step name="choose-mode">
**Ask the user which evaluation mode to use:**

Use AskUserQuestion:
- **Automated** — Full LLM judge via OpenRouter (~$0.14/run, needs OPENROUTER_API_KEY)
- **Manual (collect)** — Collect responses, then judge manually with Claude ($0)
- **Deterministic only** — Run deterministic checks only, skip subjective criteria ($0)

Also ask about scope:
- **Full suite** — All 34 tests
- **Smoke tests** — 4 quick tests
- **Custom** — Specific category or test ID
</step>

<step name="check-server">
**Verify the dev server is running:**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/chat -X POST -H "Content-Type: application/json" -d "{\"messages\":[{\"role\":\"user\",\"content\":\"/help\"}],\"provider\":\"chutes\"}"
```

If the server is not running, tell the user:
- "Dev server is not running. Start it with: `yarn dev`"
- Wait for them to confirm before proceeding.
</step>

<step name="run-eval">
**Execute the chosen evaluation mode:**

For **Automated**:
```bash
yarn eval:run
```
(or with filters: `yarn eval:smoke`, `yarn eval:run --category <cat>`, `yarn eval:run --id <id>`)

For **Manual (collect)**:
```bash
yarn eval:collect
```
(or with filters: `yarn eval:collect --tag smoke`, etc.)

For **Deterministic only**:
```bash
yarn eval:run --no-judge
```
</step>

<step name="handle-collect-mode">
**If collect mode was chosen, guide the manual judgment flow:**

1. Read the generated judgment file path from the command output.
2. Tell the user: "The judgment file has been saved. You can now:
   - Open it and give it to Claude (via claude.ai or a new Claude Code session)
   - Claude will fill in the passed/score/reasoning fields
   - Then run: `yarn eval:judge <path-to-judgment-file>`"
3. Ask if they'd like you to read the judgment file and act as the judge right now.

If the user wants you to judge:
- Read the judgment file
- For each empty judgment block, evaluate the criterion based on the response and rubric
- Fill in passed (true/false), score (0.0-1.0), and reasoning
- Write the completed file back
- Run: `yarn eval:judge <path-to-completed-file>`
</step>

<step name="report-results">
**Show results summary:**

If the eval run produced a report, summarize:
- Pass rate and average score
- Any failing tests with brief explanations
- Category-level breakdown

If there were failures, ask if the user wants to investigate specific failing tests.
</step>

</process>

<success_criteria>
- [ ] User chose evaluation mode
- [ ] Dev server verified running
- [ ] Evaluation executed without errors
- [ ] Results clearly summarized
- [ ] (collect mode) Judgment file path communicated
</success_criteria>

<notes>
- The dev server must be running: `yarn dev` with `NEXT_PUBLIC_FREE_MODE=true`
- Automated mode requires `OPENROUTER_API_KEY` in `.env`
- Cost: ~$0.14 per full automated run (34 LLM calls via OpenRouter)
- Manual mode is free — uses the judgment file workflow
- A full 34-test run takes 3-5 minutes depending on model latency
- See `.agents/docs/qa-evaluation-harness.md` for full documentation
</notes>
