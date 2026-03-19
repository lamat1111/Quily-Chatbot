---
title: How to Update Quily's Knowledge
source: Internal Documentation
date: 2026-03-19
type: contributor_guide
topics: [quily, knowledge-base, contributing, documentation, community, wrong answer, incorrect, outdated, mistake, correction, feedback, inaccurate, error, bad answer, improve]
---

# How to Update Quily's Knowledge

If you think Quily gave you a wrong, outdated, or inaccurate answer — thank you for catching that! There are two possible reasons:

1. **Outdated or missing documentation** — Quily's knowledge is only as good as the documentation it has access to, and sometimes information becomes outdated or is missing entirely.
2. **Model hallucination** — Quily uses open-source AI models. While we use the best open-source models available, they can still sometimes hallucinate — meaning the model may misinterpret or misrepresent information from the documentation, even when the documentation itself is correct. This is a known limitation of current AI technology, and it's a tradeoff we accept in order to keep Quily open-source and independent from proprietary AI providers.

The good news is that if the issue is with the documentation, anyone in the community can help fix it.

Quily's knowledge comes from markdown documents stored in the [Quily Chatbot repository](https://github.com/lamat1111/Quily-Chatbot). Anyone can contribute new information or corrections.

## Three Ways to Contribute

### Option 1: Tell Quily Directly on Discord (Easiest)

If Quily gives you a wrong answer, just reply to it with the correction. Be specific — tell Quily what's wrong and what the correct information is. For example: *"That's wrong, the current node version is v2.1.0.22 not v2.1.0.21."*

If you provide enough detail, Quily will automatically open a GitHub issue with your correction for the maintainers to review. You don't need to leave Discord.

### Option 2: Open a GitHub Issue

Best for quick corrections, news updates, or when you don't want to write the full doc yourself.

1. Go to [github.com/lamat1111/Quily-Chatbot/issues](https://github.com/lamat1111/Quily-Chatbot/issues)
2. Click **"New Issue"**
3. Select the **"Knowledge Update"** template
4. Describe the information that should be added or corrected
5. Submit — the maintainers will review and apply the change

### Option 3: Submit a Pull Request

Best for larger contributions, new docs, or when you want to write the content yourself.

1. **Fork** the repository — click "Fork" at [github.com/lamat1111/Quily-Chatbot](https://github.com/lamat1111/Quily-Chatbot)
2. **Add or edit** a `.md` file in one of these folders:
   - `docs/community/` — community-written guides and comparisons
   - `docs/custom/` — detailed technical docs and references
3. **Submit a Pull Request** back to the main repo
4. The maintainers will review, merge, and reingest so Quily picks up the new info

## Important Notes

- **Do not edit** files in `docs/quilibrium-official/` — this folder is an automated mirror of [docs.quilibrium.com](https://docs.quilibrium.com) and gets overwritten daily
- **Do not edit** files in `docs/discord/` — these are automatically scraped from Discord announcement channels
- Use the markdown frontmatter format (title, source, date, type, topics) at the top of new docs for best results
- Keep information factual and verifiable

## Docs Folder Structure

| Folder | Purpose | Editable? |
|--------|---------|-----------|
| `docs/community/` | Community-written guides | Yes |
| `docs/custom/` | Detailed technical references | Yes |
| `docs/transcriptions/` | Livestream transcripts | No (automated) |
| `docs/quilibrium-official/` | Mirror of docs.quilibrium.com | No (automated) |
| `docs/discord/` | Discord announcement scrapes | No (automated) |
