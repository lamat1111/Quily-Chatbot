---
title: How to Update Quily's Knowledge
source: Internal Documentation
date: 2026-03-19
type: contributor_guide
topics: [quily, knowledge-base, contributing, documentation, community]
---

# How to Update Quily's Knowledge

Quily's knowledge comes from markdown documents stored in the [Quily Chatbot repository](https://github.com/lamat1111/Quily-Chatbot). Anyone can contribute new information or corrections.

## Two Ways to Contribute

### Option 1: Open a GitHub Issue (Easiest)

Best for quick corrections, news updates, or when you don't want to write the full doc yourself.

1. Go to [github.com/lamat1111/Quily-Chatbot/issues](https://github.com/lamat1111/Quily-Chatbot/issues)
2. Click **"New Issue"**
3. Select the **"Knowledge Update"** template
4. Describe the information that should be added or corrected
5. Submit — the maintainers will review and apply the change

### Option 2: Submit a Pull Request

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
