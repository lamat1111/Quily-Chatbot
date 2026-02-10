---
name: challenge
description: Verify a bot answer against internal documentation
allowed-tools:
  - Read
  - Glob
  - Grep
  - Task
---

<objective>
Fact-check a Quily bot response by cross-referencing it against the internal documentation in `docs/`. The user provides a question and the bot's answer, and you systematically verify each claim against the source docs.
</objective>

<process>

<step name="parse-input">
**Parse the user's input:**

The user will provide:
- The **question** a user asked the bot
- The **answer** the bot gave

These may be provided as:
- A clearly labeled Q&A pair
- A screenshot (read it)
- Pasted text with some separation between question and answer
- A single block where you need to identify which part is the question and which is the answer

Extract and confirm:
1. The original user question
2. The bot's full response
</step>

<step name="extract-claims">
**Break the bot's answer into individual verifiable claims:**

Go through the bot's response and extract every factual claim. For each claim, note:
- The specific statement made
- Whether it's a technical claim, a product claim, a process/how-to claim, or a general statement

Ignore:
- Generic filler ("I hope this helps", "Let me know if...")
- Follow-up question suggestions
- Disclaimers the bot added itself

Example extraction:
```
Claim 1: "Quilibrium uses a proof-of-work consensus mechanism"
Type: Technical claim

Claim 2: "You can check your node status with qclient node info"
Type: Process/how-to claim

Claim 3: "QConsole offers S3-compatible storage"
Type: Product claim
```
</step>

<step name="search-docs">
**Search internal docs for evidence on each claim:**

For each claim, search `docs/` using multiple strategies in parallel (use Task agents):

1. **Keyword search** — Grep for key terms from the claim
2. **File search** — Glob for files with relevant names
3. **Broad topic search** — Search for the general topic area

Search across ALL doc folders:
- `docs/quilibrium-official/` — Official documentation
- `docs/custom/` — Official content not on website
- `docs/community/` — Community-contributed docs (lower trust)
- `docs/transcriptions/` — Livestream transcripts

For each relevant file found, read the relevant sections to gather evidence.

**IMPORTANT:** Be thorough. Search for synonyms, related terms, and alternative phrasings. A claim about "consensus" might be documented under "proof mechanism" or "block validation".
</step>

<step name="verify-claims">
**Verify each claim against the documentation:**

For each claim, assign a verdict:

| Verdict | Meaning |
|---------|---------|
| **CORRECT** | Claim is directly supported by documentation |
| **PARTIALLY CORRECT** | Core idea is right but details are wrong or incomplete |
| **INCORRECT** | Claim contradicts documentation |
| **UNVERIFIABLE** | No documentation found to confirm or deny |
| **HALLUCINATED** | Claim appears fabricated — invented commands, features, or specifics not in any docs |

For each verdict, cite the specific doc file(s) and quote the relevant passage.
</step>

<step name="report">
**Present the verification report:**

```
## Challenge Report

### Question
> [The original user question]

### Bot's Answer
> [The bot's response, summarized or quoted]

---

### Claim-by-Claim Verification

#### Claim 1: "[statement]"
**Verdict: [CORRECT/PARTIALLY CORRECT/INCORRECT/UNVERIFIABLE/HALLUCINATED]**
- Evidence: [Quote from docs]
- Source: `docs/path/to/file.md`
- Notes: [Any clarification]

#### Claim 2: "[statement]"
...

---

### Summary

| Verdict | Count |
|---------|-------|
| Correct | X |
| Partially Correct | X |
| Incorrect | X |
| Unverifiable | X |
| Hallucinated | X |

### Overall Assessment
[One of: ACCURATE / MOSTLY ACCURATE / MIXED / MOSTLY INACCURATE / INACCURATE]

[Brief summary of the main issues found, if any]

### Recommendations
[If issues were found, suggest what the correct answer should have been, citing docs]
```
</step>

</process>

<guidelines>

**Search thoroughness:**
- Always search multiple folders — the answer might be in official docs, custom docs, or transcripts
- Use at least 3-5 different search terms per claim
- Read full sections, not just grep matches — context matters
- Check for contradictions across different doc sources

**Verdict guidelines:**
- Be fair — if a claim is essentially correct but uses slightly different wording than the docs, that's CORRECT
- PARTIALLY CORRECT means the claim has the right direction but gets specifics wrong (e.g., wrong command flags, wrong version numbers)
- HALLUCINATED is reserved for claims that appear completely fabricated — invented CLI commands, made-up feature names, fake URLs
- UNVERIFIABLE is not a negative verdict — it just means the docs don't cover that topic
- When docs conflict (e.g., community vs official), trust official docs

**Community docs caveat:**
- If a claim is only supported by community docs (not official), note this — it's lower confidence
- If a claim contradicts official docs but matches community docs, the claim is INCORRECT

**Date awareness:**
- If the bot cited outdated information and newer docs contradict it, flag this
- Documentation evolves — what was true 6 months ago may not be true now

</guidelines>

<examples>

**Example 1: Simple verification**
```
User: "How do I check my node's peer count?"
Bot: "You can check your node's peer count by running `qclient node info` in your terminal."

→ Search for "peer count", "qclient", "node info" in docs
→ Find docs/quilibrium-official/run-node/qclient/... confirms the command
→ Verdict: CORRECT
```

**Example 2: Mixed results**
```
User: "What consensus does Quilibrium use?"
Bot: "Quilibrium uses Proof of Meaningful Work (PoMW), which requires
nodes to perform useful computation rather than arbitrary hashing."

→ Claim 1: "uses Proof of Meaningful Work" — search docs → CORRECT
→ Claim 2: "requires useful computation" — search docs → CORRECT
→ Claim 3: "rather than arbitrary hashing" — not explicitly stated → UNVERIFIABLE
```

**Example 3: Hallucination detected**
```
User: "How do I stake QUIL tokens?"
Bot: "To stake QUIL, go to stake.quilibrium.com and connect your wallet..."

→ Search for "stake", "staking" in docs
→ No staking documentation found, no such URL exists
→ Verdict: HALLUCINATED
```

</examples>
