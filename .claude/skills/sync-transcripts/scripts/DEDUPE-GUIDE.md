# Transcript Deduplication Guide

This guide covers **Phase 3: Dedupe** of the transcript workflow. Run this AFTER cleaning transcripts (Phase 2) and BEFORE copying to docs (Phase 4).

## Overview

### Why Dedupe?

Livestream transcripts often repeat explanations of core concepts that are already documented elsewhere. Without deduplication:
- The RAG system retrieves redundant chunks for the same question
- Users get repetitive, inconsistent answers
- The knowledge base becomes bloated with duplicate content

### When to Run Dedupe

- After cleaning a new transcript (Phase 2 complete)
- Before copying to `docs/transcriptions/` (Phase 4)
- Periodically when official docs are updated (to remove newly-redundant content)

### Prerequisites

- Transcript has been cleaned (Phase 2) and saved to `transcripts/cleaned/`
- Access to `docs/quilibrium-official/` for reference checking

---

## Official Docs Reference Index

This index maps topics to their authoritative source in the official documentation. When a transcript covers these topics, **remove the explanation and add a cross-reference** unless the transcript adds unique value.

### Tier 1: Remove Entirely (Comprehensive Official Docs Exist)

These topics have thorough official documentation. Remove explanations from transcripts entirely.

#### Q Storage (S3 API)

| Topic | Official Doc Path | Action |
|-------|------------------|--------|
| S3 API overview | `api/03-q-storage/01-overview.md` | Remove |
| Bucket operations | `api/03-q-storage/02-api-reference/bucket-operations/` | Remove |
| Object operations | `api/03-q-storage/02-api-reference/object-operations/` | Remove |
| Pricing details | `api/03-q-storage/01-user-manual/pricing.md` | Remove |
| Website hosting | `api/03-q-storage/02-hosting-websites-on-quilibrium.md` | Remove |
| Access control | `api/03-q-storage/01-user-manual/access-control.md` | Remove |
| Getting started | `api/03-q-storage/01-user-manual/getting-started.md` | Remove |

#### QKMS (Key Management)

| Topic | Official Doc Path | Action |
|-------|------------------|--------|
| KMS overview | `api/04-q-kms/01-overview.md` | Remove |
| Creating keys | `api/04-q-kms/01-user-manual/creating-keys.md` | Remove |
| Key operations | `api/04-q-kms/02-api-reference/key-operations/` | Remove |
| Key policies | `api/04-q-kms/01-user-manual/key-policies.md` | Remove |
| Supported key types | `api/04-q-kms/01-user-manual/getting-started.md` | Remove |

#### Architecture & Protocol

| Topic | Official Doc Path | Action |
|-------|------------------|--------|
| Hypergraph definition | `custom/RDF-Hypergraph-Query-System.md` | Remove |
| RDF/SPARQL queries | `custom/RDF-Hypergraph-Query-System.md` | Remove |
| Oblivious transfer | `custom/Oblivious-Transfer-Protocols.md` | Remove |
| Addressing scheme | `custom/Planted-Clique-Addressing-Scheme.md` | Remove |
| Consensus mechanism | `protocol/consensus.md` | Remove |
| Data structures | `protocol/data-structures.md` | Remove |
| VDFs | `learn/04-operating-system/vdfs.md` | Remove |
| Mixnet routing | `learn/04-operating-system/mixnet-routing.md` | Remove |
| E2EE | `learn/04-operating-system/e2ee.md` | Remove |
| Bloom clock | `learn/04-operating-system/bloom-clock.md` | Remove |

#### Tokenomics & Economics

| Topic | Official Doc Path | Action |
|-------|------------------|--------|
| Token emissions model | `discover/04-quilibrium-tokenomics.md` | Remove |
| Generational thresholds | `discover/04-quilibrium-tokenomics.md` | Remove |
| Gas fees / fee market | `discover/06-gas-fees-and-dynamic-fee-market-on-quilibrium.md` | Remove |
| Proof of Meaningful Work | `discover/04-quilibrium-tokenomics.md` + `protocol/consensus.md` | Remove |

#### Core Concepts

| Topic | Official Doc Path | Action |
|-------|------------------|--------|
| What is Quilibrium | `discover/01-what-is-quilibrium.md` | Remove |
| Mission statement | `discover/01-what-is-quilibrium.md` | Remove |
| Core technologies | `discover/05-core-technologies-in-quilibrium.md` | Remove |
| Decentralization | `discover/07-how-does-quilibrium-maintain-decentralization.md` | Remove |
| Privacy philosophy | `discover/08-how-quilibrium-protects-privacy-without-enabling-crime.md` | Remove |
| MPC vs ZKP | `discover/14-programmable-mpc-vs-zkp.md` | Remove |
| Alternative thesis | `discover/12-the-alternative-thesis-for-consumer-crypto.md` | Remove |
| Passkeys | `discover/10-quilibriums-innovative-use-of-passkeys.md` | Remove |
| Security audits | `discover/11-security-audits-of-quilibriums-cryptographic-protocols.md` | Remove |

#### Node Operations

| Topic | Official Doc Path | Action |
|-------|------------------|--------|
| Node setup | `run-node/quick-start.md` | Remove |
| System requirements | `run-node/system-requirements.md` | Remove |
| Shard enrollment | `run-node/shard-enrollment-process.md` | Remove |
| qclient commands | `run-node/qclient/` | Remove |
| RPC interface | `run-node/RPC.md` | Remove |

---

### Tier 2: Keep (Unique Value in Transcripts)

These content types should be KEPT even if related topics exist in official docs:

| Content Type | Why Keep | Example |
|--------------|----------|---------|
| **Analogies & metaphors** | Different learning style, memorable | "Think of sharding like a library card catalog..." |
| **Q&A answers** | Specific community questions | "Someone asked about running on ARM..." |
| **Historical context** | Timeline, decision rationale | "Seven years ago when we started..." |
| **Origin story** | Unique narrative content | "We built Howler as a Discord alternative..." |
| **Roadmap & future plans** | Time-specific, not in docs | "By Q3 we expect to have..." |
| **Comparisons to competitors** | Opinion/analysis | "Unlike Solana which does X, we do Y because..." |
| **Real-world examples** | Practical applications | "A game developer could use this to..." |
| **Behind-the-scenes** | Team insights | "We spent three months debugging..." |
| **Current status updates** | Time-specific progress | "Enrollment is now at 85%..." |
| **Demos & walkthroughs** | Practical tutorials | Step-by-step Q Console usage |

---

### Tier 3: Flag for Extraction (Missing from Official Docs)

These topics appear in transcripts but have NO official documentation. Flag them for potential extraction into new official docs:

| Topic | Notes |
|-------|-------|
| **QNS (Name Service)** | Mentioned frequently, no official doc |
| **Quorum Mobile/Wallet** | Product updates in transcripts only |
| **Q Console UI** | Walkthrough content, sparse in docs |
| **Bridge to Ethereum** | wQUIL bridge details |
| **Farcaster integration** | Social integration details |
| **Game engine integrations** | Unity, Godot, Fyrox mentions |

When you find substantial content on these topics, add a note:

```markdown
> **📝 Documentation Gap:** This section covers [topic] which is not yet in official docs.
> Consider extracting to `docs/quilibrium-official/[appropriate-section]/`.
```

---

## Obsolete Content Rules

Livestream transcripts often contain version-specific content that becomes obsolete as the protocol evolves. This content should be **removed entirely** (not just flagged) because it can confuse users and the RAG system.

### What Makes Content Obsolete?

**Current Version Reference:** Quilibrium is currently at version **2.1.0.18**. Update this reference as new versions release.

Content is obsolete if it:
1. Discusses a past version as "upcoming" or "future"
2. Contains specific dates/timelines that have passed
3. Describes features as "coming soon" that have since launched
4. Contains network statistics from past periods
5. References deadlines that have expired

### Obsolete Content Categories

#### Category 1: Past Versions Discussed as Future (REMOVE)

| Pattern | Example | Action |
|---------|---------|--------|
| "In 2.0 we will..." | "In 2.0 we will have the hypergraph online" | Remove entire section |
| "Version 2.1 will have..." | "2.1 will deploy to mainnet after testing" | Remove entire section |
| "When X launches..." | "When Q Console launches, you'll be able to..." | Remove (Q Console has launched) |
| "We're working on..." (for released features) | "We're working on the S3 API" | Remove (S3 is live) |

#### Category 2: Expired Timelines and Deadlines (REMOVE)

| Pattern | Example | Action |
|---------|---------|--------|
| Specific past dates | "On July 20th we will launch 2.0" | Remove |
| Past quarters/years | "By Q2 2025 we expect..." | Remove if date passed |
| Cutoff deadlines | "Andomints cutoff is January 28th" | Remove (deadline passed) |
| "This week/tomorrow" | "Quorum beta is coming out tomorrow" | Remove |

#### Category 3: Outdated Network Statistics (REMOVE)

| Pattern | Example | Action |
|---------|---------|--------|
| Node/peer counts | "We have 29,000 live peers" | Remove (stats change) |
| Shard counts | "500 peers have upgraded to 2.1" | Remove (enrollment complete) |
| Emissions predictions | "Roughly 102 QUIL per interval" | Remove (actual may differ) |
| Version-specific metrics | "Average 20-30 provers per node" | Remove |

#### Category 4: Released Features Described as Upcoming

**How to verify if a feature has launched:**

A feature is considered "released" ONLY if it has documentation in `docs/quilibrium-official/`. Do NOT assume a feature has launched based on memory or assumptions.

**Verification steps before removing "coming soon" content:**
1. Check if the feature has official docs in `docs/quilibrium-official/`
2. If YES (docs exist) → Remove the "coming soon" content
3. If NO (no docs) → KEEP the content (it may still be upcoming)

**Features with official documentation (verified released - safe to remove "coming soon" content):**

| Feature | Official Doc Path | Safe to Remove |
|---------|-------------------|----------------|
| Q Storage (S3) | `api/03-q-storage/` | Yes |
| QKMS | `api/04-q-kms/` | Yes |
| Node Operations | `run-node/` | Yes |
| Protocol/Consensus | `protocol/` | Yes |

**Features WITHOUT official docs (do NOT assume released - keep "coming soon" content):**

| Feature | Status | Action |
|---------|--------|--------|
| Quorum Mobile | No docs found | KEEP upcoming references |
| Q Name Service (QNS) | No docs found | KEEP upcoming references |
| Q Console UI details | Sparse docs | KEEP upcoming references |
| JS SDK | No dedicated docs | KEEP upcoming references |
| FFX (Lambda equivalent) | No docs found | KEEP upcoming references |

**When in doubt:** If you're unsure whether a feature has launched, KEEP the content. It's better to have slightly outdated "coming soon" content than to incorrectly remove valid information about unreleased features.

### What to Keep (Even If Time-Specific)

**DO keep** time-specific content that provides historical context:

| Keep | Example | Why |
|------|---------|-----|
| Origin story | "Seven years ago we started building Howler..." | Historical narrative |
| Decision rationale | "We chose MPC over TEEs because..." | Explains design choices |
| Retrospectives | "The 2.0 launch taught us..." | Lessons learned |
| Completed milestones (as past) | "In 2024, we successfully launched 2.0" | Historical record |

### How to Handle Obsolete Content

**Option 1: Remove Entirely (Preferred)**

If the section is entirely obsolete, delete it completely. Do not leave a stub or cross-reference.

**Option 2: Keep Historical Framing**

If the content has historical value, reframe it as past tense:

```markdown
## Before (Obsolete)
"We're working on getting 2.1 ready for mainnet. The S3 API will be available after launch."

## After (Reframed)
[Remove entirely - this information is now covered in official docs for the released features]
```

**Option 3: Extract Still-Relevant Insights**

If there's a unique insight buried in obsolete content:

```markdown
## Before
"In 2.0, we'll have the hypergraph online. The reason we chose a hypergraph
over a traditional blockchain is that it can represent multiple data structures
natively - key-value, relational, graph - all in one unified model."

## After
[Remove the "In 2.0" framing, but the explanation of why hypergraph was chosen
is valuable and should be kept if not covered in official docs]
```

---

## Deduplication Rules

### Rule 1: Check Official Docs First

Before keeping any technical explanation, check if it exists in official docs:

```
1. Identify the topic being explained
2. Look up the topic in the Reference Index above
3. If found in Tier 1 → Remove and cross-reference
4. If found in Tier 2 → Keep the unique value parts
5. If found in Tier 3 → Flag for extraction
```

### Rule 2: Keep Unique Insights Only

When removing content, preserve anything that adds value beyond the official docs:

**Remove:**
```markdown
## How Q Storage Works

Q Storage is an S3-compatible object storage service. It uses verifiable
encryption to ensure your data is encrypted at rest. You can create buckets,
upload objects, and manage access control through standard S3 API calls...
[500 words of technical details]
```

**Keep:**
```markdown
## Q Storage in Practice

For technical details on Q Storage, see the [official documentation](docs/quilibrium-official/api/03-q-storage/).

What's exciting about Q Storage is how developers are already using it. One team
built a decentralized image hosting service in a weekend. Another is using it
for game save files that players truly own. The 5GB free tier means you can
experiment without any commitment.
```

### Rule 3: Preserve Time Context

Always keep content that is time-specific:

**Keep:**
```markdown
## Network Status (March 2025)

As of this stream, we have 847 nodes enrolled across 156 shards. The enrollment
process is about 85% complete. We expect to open public enrollment by Q2.
```

### Rule 4: Cross-Reference Between Transcripts

When the same topic appears in multiple transcripts, keep the best explanation and reference it from others:

**In the canonical transcript (keep full content):**
```markdown
## Understanding Sharding in Quilibrium

[Full detailed explanation...]
```

**In other transcripts (replace with reference):**
```markdown
## Sharding

For a detailed explanation of Quilibrium's sharding architecture, see
[2025-02-03: Quilibrium 2.1 Architecture](2025-02-03_quilibrium-2.1-architecture-quorum-development.md#understanding-sharding-in-quilibrium).

In this stream, Cassie mentioned that sharding helps prevent miner consolidation
because [unique insight from this specific stream]...
```

### Rule 5: Canonical Sources for Transcript-Only Topics

When multiple transcripts cover a topic NOT in official docs, designate one as canonical:

| Topic | Canonical Transcript | Reason |
|-------|---------------------|--------|
| Origin story (Howler) | 2024-06-19 | Most complete narrative |
| Historical parallels (Apple/Nintendo) | 2025-02-03_alternative-thesis | Entire focus of stream |
| QNS overview | 2026-01-21 | Most recent/complete |
| Quorum Mobile features | 2026-01-21 | Most recent/complete |
| Q Console walkthrough | 2025-04-02 | Dedicated tutorial |
| Token launch tutorial | 2025-04-07 | Step-by-step guide |

---

## Replacement Templates

### Template 1: Topic Fully Covered in Official Docs

Use when removing a section entirely:

```markdown
## [Topic Name]

For comprehensive information about [topic], see the [official documentation](../../../docs/quilibrium-official/[path]).
```

### Template 2: Topic Covered, But Transcript Has Unique Insights

Use when keeping partial content:

```markdown
## [Topic Name]

For technical details, see the [official documentation](../../../docs/quilibrium-official/[path]).

[Keep unique insights, examples, or context below...]

In this stream, Cassie explained [unique perspective/example/analogy]...
```

### Template 3: Cross-Reference to Another Transcript

Use when another transcript has the canonical explanation:

```markdown
## [Topic Name]

For a detailed explanation, see [Transcript Title](YYYY-MM-DD_transcript-name.md#section-anchor).

[Keep any unique insights from THIS stream...]
```

### Template 4: Documentation Gap Flag

Use when content should be extracted to official docs:

```markdown
## [Topic Name]

> **📝 Documentation Gap:** This topic is not yet covered in official documentation.

[Full content preserved...]
```

---

## Deduplication Workflow

### Step 1: Load Context

```
1. Read the cleaned transcript from transcripts/cleaned/
2. List all section headers (## headings)
3. Identify the main topics covered
```

### Step 2: Check Each Section

For each section in the transcript:

```
1. Look up the topic in the Reference Index
2. Determine the tier (1, 2, or 3)
3. Apply the appropriate rule
4. Note any changes to make
```

### Step 3: Apply Changes

```
1. Remove Tier 1 content, add cross-references
2. Keep Tier 2 content (unique value)
3. Flag Tier 3 content (documentation gaps)
4. Update cross-references between transcripts if needed
```

### Step 4: Quality Check

Before saving, verify:

- [ ] All removed content has a cross-reference to official docs or another transcript
- [ ] Unique insights, analogies, and examples are preserved
- [ ] Time-specific content (dates, status updates) is preserved
- [ ] Q&A content is preserved
- [ ] Documentation gaps are flagged
- [ ] YAML frontmatter is still valid
- [ ] File still has meaningful content (not just cross-references)

---

## Quality Checklist

Before marking a transcript as deduped:

- [ ] Checked all sections against Official Docs Reference Index
- [ ] Removed redundant technical explanations (Tier 1)
- [ ] Preserved unique insights, analogies, examples (Tier 2)
- [ ] Flagged documentation gaps (Tier 3)
- [ ] Added cross-references for all removed content
- [ ] Preserved all time-specific content
- [ ] Preserved all Q&A content
- [ ] Verified cross-references link to correct files/sections
- [ ] File has substantial remaining content (not hollow)

---

## Maintaining This Guide

### When to Update the Reference Index

1. **New official docs added** → Add to Tier 1 list
2. **Official docs removed** → Remove from Tier 1 list
3. **Transcript content extracted to docs** → Move from Tier 3 to Tier 1
4. **New canonical transcript designated** → Update canonical sources table

### Periodic Review

Every 3-6 months, review:
- Are there new documentation gaps to flag?
- Have official docs expanded to cover previously-gap topics?
- Are the canonical transcript designations still accurate?

---

*Last updated: 2026-01-29*
