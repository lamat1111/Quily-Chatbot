# Transcript Cleaning Guide (Phase 2)

This guide covers **Phase 2: Clean** of the transcript workflow. It outlines how to clean raw YouTube transcripts and prepare them for deduplication.

> **Note:** This is Phase 2 only. After cleaning, run **Phase 3: Dedupe** using [DEDUPE-GUIDE.md](DEDUPE-GUIDE.md) to remove content that duplicates official documentation.

## Overview

Raw YouTube auto-generated transcripts have several issues:
- No punctuation or capitalization
- Filler words ("um", "uh", "like", "you know")
- Transcription errors (misheard words, especially technical terms)
- No paragraph structure
- No topic headings
- Contains off-topic tangents, greetings, technical difficulties

The goal is to transform these into clean, well-structured documentation that:
1. Preserves accurate technical information
2. Is easy for the RAG system to chunk meaningfully
3. Includes proper source attribution
4. Flags potentially outdated information

---

## Cleaning Workflow

### Step 1: Initial Review

Read through the raw transcript to understand:
- Main topics covered
- Approximate date context (for checking if info is outdated)
- Technical terms that may be misspelled

### Step 2: Structural Cleanup

**Standard intro to remove or condense:**
Every stream starts with similar boilerplate that can be removed or heavily condensed:
- "QM everybody" / "What's up everybody" greetings
- Legal disclaimer about QUIL being a utility token and not encouraging speculation
- Mission statement ("secure every bit of traffic on the internet...")
- "As always we start by talking about the mission..."

Keep only if there's unique content in these sections.

**Remove:**
- Stream housekeeping ("let me share my screen", "can everyone hear me")
- Technical difficulties ("hold on, OBS crashed", "Streamlabs is being a pain")
- Off-topic tangents (unless they contain valuable insights)
- Repetitive filler ("um", "uh", "like", "you know", "basically")
- Audience interaction that doesn't add content value
- Repetitive phrases ("at the end of the day", "in other words")
- Self-corrections mid-sentence

**Keep:**
- All technical explanations
- Analogies and examples (these help understanding)
- Q&A content (valuable for FAQs)
- Future roadmap discussions (but flag for verification)
- News/context that's relevant to understanding the content

### Step 3: Add Structure (Critical for RAG)

**Why this matters:**
The cleaned transcript will be chunked and embedded for RAG retrieval. Well-structured documents with clear topic sections produce better embeddings and more accurate retrieval. Each section should be:
- **Self-contained** - Makes sense on its own without needing surrounding context
- **Focused on one topic** - Don't mix unrelated subjects in the same section
- **Appropriately sized** - Not too short (loses context) or too long (dilutes the topic)

**Add descriptive section headers:**
```markdown
## Q Storage: S3-Compatible API

Content about Q Storage here...

## QKMS: Distributed Key Management

Content about QKMS here...

## Network Health Update (January 2025)

Content about current network status...
```

**Section header tips:**
- Use descriptive titles that capture the topic (not just "Update" but "Q Storage Update")
- Include context where helpful ("Network Health Update (January 2025)")
- Think: "If someone searches for this topic, would this title help them find it?"

**Create logical paragraphs:**
A new paragraph should start when:
- The topic shifts
- A new example or analogy begins
- Moving from explanation to application
- Switching from "what" to "why" or "how"

**Splitting long transcripts:**
For very long livestreams (1+ hours), consider whether it makes sense to split into multiple documents by major topic area, each with its own YAML frontmatter. This can improve retrieval precision.

### Step 4: Fix Transcription Errors

#### Version Numbers

Version numbers are almost always transcribed incorrectly. Quilibrium uses semantic versioning like `2.1.0.18` or `2.1.1-08`, but transcripts often mangle these badly.

**Why this is hard:**
Quilibrium version numbers like `2.1.0.18` have 4 parts, but transcripts concatenate all digits together (e.g., "21018" or "21108"), making it ambiguous where the dots belong.

**Common patterns:**

| Mistranscription | Likely Correct Version | Explanation |
|------------------|------------------------|-------------|
| "21018" / "21108" | "2.1.0.18" | 2.1.0 patch 18 |
| "2108" | "2.1.0.8" | 2.1.0 patch 8 |
| "210" / "2 10" | "2.1.0" | Major 2.1.0 release |
| "21" / "two one" | "2.1" | Shorthand for 2.1.x |
| "20" / "two oh" | "2.0" | Shorthand for 2.0.x |
| "20 era" / "twenty era" | "2.0 era" | |
| "2.10 variants" | "2.1.0 variants" | |
| ".18" / "dot 18" | ".18" (patch 18) | e.g., "2.1.0.18" |

**How to decode:**
1. First digit is always major version (currently `2`)
2. Second digit is minor version (`0`, `1`, etc.)
3. Third digit is usually `0` (patch base)
4. Remaining digits are the patch number

So "21018" → `2` + `1` + `0` + `18` → `2.1.0.18`

**Contextual clues:**
- If Cassie says "dot eighteen" or ".18", she means patch version (e.g., `2.1.0.18`)
- "the 21 update" = "the 2.1 update"
- Use the video date + release history to verify specific patch versions

**Version timeline reference:**
- 2024: Version 2.0.x era
- Early 2025: Version 2.1.x releases
- Check release notes if unsure about specific patch versions

#### Quilibrium-Specific Terms

| Mistranscription | Correct Term | Notes |
|------------------|--------------|-------|
| "equilibrium" | "Quilibrium" | Always capital Q |
| "quill" / "quil" | "QUIL" | The token (all caps) |
| "wrapped quill" | "wQUIL" or "wrapped QUIL" | The wrapped token |
| "quorum" / "corum" / "quaram" | "Quorum" | The messenger app (capital Q) |
| "Quora mobile" / "quorum mobile" | "Quorum Mobile" | Mobile app |
| "q console" / "queue console" | "Q Console" | Web management interface |
| "cue storage" / "queue storage" / "Q storage" | "Q Storage" | S3-compatible storage |
| "QKMS" / "q k m s" / "QMS" | "QKMS" | Key Management Service |
| "QNS" / "q n s" / "Q&S" / "Q&amp;s" | "QNS" | Quilibrium Name Service |
| "hyperraph" / "hyper graph" / "hypergraph" | "hypergraph" | One word, lowercase |

#### External Services & Integrations

**Be vigilant with proper nouns!** Auto-transcription frequently mangles names of:
- Blockchain projects (chains, L2s, protocols)
- Game engines (Unity, Unreal, Godot, etc.)
- Companies and services
- Technical standards and libraries
- People's names

When you encounter an unfamiliar name that looks odd, do a quick search to verify the correct spelling.

**Known examples:**

| Mistranscription | Correct Term |
|------------------|--------------|
| "Salana" | "Solana" |
| "Arbitum" | "Arbitrum" |
| "Tzos" | "Tezos" |
| "Bit Tensor" | "Bittensor" |
| "Go dot" / "go dot" | "Godot" (game engine) |
| "Fireox" | "Fyrox" (game engine) |
| "warplet" | "Warpcast wallet" |
| "Coin Gecko" | "CoinGecko" |
| "Block 8" / "Blockade" | "Blowfish" or verify actual service name |

This list is not exhaustive - always verify unfamiliar proper nouns.

#### Technical Terms

| Mistranscription | Correct Term | Notes |
|------------------|--------------|-------|
| "MPC" / "and PC" / "multi-party compute" | "MPC" | Multi-Party Computation |
| "sha mir" / "shamir" | "Shamir" | As in Shamir Secret Sharing |
| "feldman" / "felt man" | "Feldman" | As in Feldman VSS |
| "te" / "tee" / "T E" | "TEE" | Trusted Execution Environment |
| "VSS" / "v s s" | "VSS" | Verifiable Secret Sharing |
| "QCL" / "q c l" | "QCL" | Quilibrium's language/runtime |
| "mainet" / "main net" | "mainnet" | One word |
| "testnet" / "test net" | "testnet" | One word |
| "read Solomon" | "Reed-Solomon" | Error correction encoding |
| "SECP 256 256K1" / "SECP256k1" | "secp256k1" | Elliptic curve |
| "Edwards curves" | "Edwards curves" | Usually correct |
| "oblivious transfer" | "oblivious transfer" | Usually correct |
| "alt fee basis" / "all fee basis" | "alt-fee basis" | Alternative fee mechanism |
| "appshards" / "app shards" | "app shards" | Two words |

### Step 5: Flag Outdated Information

> **Important:** During Phase 2 (cleaning), preserve ALL technical content. Do NOT remove duplicates yet - that happens in **Phase 3: Dedupe** using [DEDUPE-GUIDE.md](DEDUPE-GUIDE.md). Better to include too much than lose valuable information.

If the transcript discusses:
- Specific version numbers (2.0, 2.1, etc.)
- Upcoming features or timelines
- Token economics or emissions
- Specific technical implementations

Add a note:
```markdown
> **Note (Review Required):** This information was accurate as of [DATE].
> Verify current status in the official documentation.
```

### Step 6: Add YAML Frontmatter

```yaml
---
title: "Descriptive Title Based on Content"
source: youtube
youtube_url: https://www.youtube.com/watch?v=VIDEO_ID
author: Cassandra Heart
date: YYYY-MM-DD
type: livestream_transcript
topics:
  - topic1
  - topic2
---
```

**Topics** should be high-level categories like:
- tokenomics
- q-storage
- q-console
- quorum
- mpc
- security
- roadmap
- architecture
- node-operation

---

## Quality Checklist (Phase 2)

Before marking a transcript as cleaned (ready for Phase 3 dedupe):

- [ ] All technical terms are correctly spelled (especially version numbers, proper nouns)
- [ ] Content is organized with clear, descriptive section headings
- [ ] Sections are self-contained and focused on single topics (RAG-friendly)
- [ ] Filler words, tangents, and boilerplate intro removed
- [ ] Paragraphs are logical groupings
- [ ] All technical content preserved (duplicates handled in Phase 3)
- [ ] Outdated info is flagged with notes
- [ ] YAML frontmatter is complete with correct video URL and date
- [ ] File saved to `transcripts/cleaned/` (within skill folder)

**Next step:** Run Phase 3 (Dedupe) using [DEDUPE-GUIDE.md](DEDUPE-GUIDE.md)

---

## Example: Before and After

### Before (Raw)
```
so um what I want to talk about is is basically the way that
equilibrium handles uh you know the the storage of data on the
network so when you're um when you're storing data to the hyper
graph that that directly corresponds to a fee and like you know
the the way that works is is through verifiable encryption so
basically like your data is encrypted and um it's stored in a
way that is like provably encrypted
```

### After (Cleaned)
```markdown
## How Data Storage Works on Quilibrium

When you store data to the hypergraph, it directly corresponds to a fee.
The storage mechanism uses verifiable encryption, meaning your data is
encrypted and stored in a way that is provably encrypted. This ensures
that even node operators cannot access your unencrypted data.
```

---

## Notes for RAG Integration

The `youtube_url` field in the YAML frontmatter should be extracted by the RAG loader and included in chunk metadata. This allows the chatbot to cite the original video when using information from transcripts.

Example bot response format:
```
[Answer based on transcript content]

Sources:
- Quilibrium Live Stream (Jan 15, 2025): https://youtube.com/watch?v=xxxxx
```

---

---

## Next Steps

After completing Phase 2 (cleaning):

1. **Run Phase 3: Dedupe** - Follow [DEDUPE-GUIDE.md](DEDUPE-GUIDE.md) to remove content that duplicates official documentation
2. **Copy to docs** - Move deduped files to `docs/transcriptions/`
3. **Run ingestion** - `npm run ingest run`

---

*Last updated: 2026-01-29*
