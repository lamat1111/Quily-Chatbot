# Documentation Index

This is the main index for all documentation, bug reports, and task management.

## 📖 Documentation

- [Daily Recap Posting](docs/2026-03-24-daily-recap-posting.md)
- [Automated Documentation Sync Pipeline](docs/automated-docs-sync-pipeline.md) — Daily GitHub Actions pipeline that syncs official docs, scrapes Discord announcements, and generates general channel recaps into the RAG knowledge base
- [Automated Versioning and Release System](docs/versioning-release-system.md) — Semantic versioning with conventional commit analysis, changelog generation, git tagging, and /release skill integration
- [Cloudflare Turnstile Bot Protection](docs/cloudflare-turnstile-bot-protection.md) — Invisible bot verification using Cloudflare Turnstile with session cookies, fail-open design, and client/server integration
- [Cloudflare Workers AI Reranker](docs/cloudflare-workers-ai-reranker.md) — Free semantic reranking via Cloudflare's BGE-reranker-base model, used as fallback when Cohere is unavailable
- [Daily General Channel Recap](docs/daily-general-recap.md) — Automated daily summaries of Discord #general discussion via LLM, with noise filtering and @Quily recap command
- [Discord Bot Architecture](docs/discord-bot-architecture.md) — Discord bot design: @mention handler, shared RAG service, rate limiting, conversation memory, and VPS deployment via pm2
- [Knowledge Update Pipeline — Processing GitHub Issues into Docs](docs/knowledge-update-pipeline.md) — Auto-correction flow (Discord & web chat), deterministic issue creation, and the /process-issues skill for applying changes to docs
- [Model-Specific Instruction Handling](docs/model-specific-instruction-handling.md) — How frontier models (Claude/GPT/Gemini) vs open-source models are handled differently on low-relevance RAG results to prevent hallucination
- [QA Evaluation Harness](docs/qa-evaluation-harness.md) — CLI testing suite with 34 test cases across 10 categories, using deterministic checks and LLM-as-judge to evaluate chatbot response quality
- [RAG Knowledge Base Workflow](docs/rag-knowledge-base-workflow.md) — End-to-end RAG pipeline: document ingestion, BGE-M3 embeddings, Supabase pgvector storage, two-stage retrieval with reranking, and runtime query flow
- [RAG Query Decomposition](docs/rag-query-decomposition.md) — Multi-entity query splitting into per-product sub-queries with Reciprocal Rank Fusion for broad or multi-topic retrieval
- [System Prompt & Anti-Hallucination Strategy](docs/system-prompt-anti-hallucination.md) — Four-layer defense against hallucination: retrieval thresholds, system prompt rules 1-12, personality override, and knowledge scope guards
- [Update News Skill — Obsolescence Management](docs/update-news-skill.md) — The /update-news skill that finds and annotates outdated information in community docs, Discord scrapes, and transcripts

### Features
- [RAG Confidence Indicator](docs/features/rag-confidence-indicator.md)

## 🐛 Bug Reports

### Solved Issues
- [RAG retrieval surfaces outdated sharding/milestone info despite recency improvements](bugs/.solved/2026-03-21-rag-outdated-sharding-sources.md)
- [Sidebar Scroll Snaps Back When Collapsible Nav Items Change Height](bugs/.solved/sidebar-scroll-snapback-collapsible-nav.md)
- [Turnstile Token Reuse Causes Verification Failure](bugs/.solved/turnstile-token-reuse-verification-failure.md)

## 📋 Tasks

### Pending Tasks

- [Monorepo Integration for Release Context](tasks/2026-03-23-monorepo-integration.md)
- [Monorepo Release Sync — Design Spec](tasks/2026-03-23-monorepo-release-sync-design.md)
- [Monorepo Release Sync — Implementation Plan](tasks/2026-03-23-monorepo-release-sync-plan.md)
- [Daily Recap Posting — Implementation Plan](tasks/2026-03-24-daily-recap-posting-plan.md)
- [Design Spec: Automated Daily Recap Posting](tasks/2026-03-24-daily-recap-posting.md)
- [Task: Deduplicate Source Citations in Bot Responses](tasks/2026-03-24-deduplicate-source-citations.md)
- [Add Self-Review / Fact Check Button to Bot Replies](tasks/self-review-fact-check-button.md)
- [Add Web Fetching Capability to Chatbot](tasks/web-fetching-capability.md)
- [Cross-Reference Verification Against Source Docs](tasks/cross-reference-verification.md)
- [Discord Announcements Scraper with Automated RAG Ingestion](tasks/discord-announcements-scraper.md)
- [Discord Follow-Up Questions Dropdown](tasks/discord-followup-dropdown.md)
- [Harden /process-issues Skill](tasks/automated-process-issues-cron.md)
- [Implement AI-Powered Chat Renaming Feature](tasks/ai-chat-renaming-feature.md)
- [Implement Data Export/Import Feature](tasks/data-export-import-feature.md)
- [Implement File Upload & Chat Attachments](tasks/file-upload-chat-attachments.md)
- [Implement Image Support in RAG Responses](tasks/rag-image-support.md)
- [Query-Failure Logging → Automatic Doc Gap Detection](tasks/query-failure-logging.md)
- [User Profile Avatar Upload](tasks/user-profile-avatar.md)

### .Archived
- [Implement Jina Reranker as Free Alternative to Cohere](tasks/.archived/implement-jina-reranker.md)

## 📋 Completed Tasks

- [Design: Discord Bot Integration for Quily](tasks/.done/2026-03-17-discord-bot-design.md)
- [Discord Bot Integration — Implementation Plan](tasks/.done/2026-03-17-discord-bot-plan.md)
- [Discord Announcements Scraper Implementation Plan](tasks/.done/2026-03-18-discord-announcements-scraper.md)
- [Add discord_announcement to RAG temporal query logic](tasks/.done/2026-03-18-retriever-discord-announcement-support.md)
- [Auto-Correction GitHub Issues — Implementation Plan](tasks/.done/2026-03-19-auto-correction-issues-plan.md)
- [Auto-Correction GitHub Issues — Design Spec](tasks/.done/2026-03-19-auto-correction-issues.md)
- [Daily General Channel Recap — Implementation Plan](tasks/.done/2026-03-19-daily-general-recap-plan.md)
- [Daily General Channel Recap](tasks/.done/2026-03-19-daily-general-recap.md)
- [Issue-to-Knowledge Pipeline Implementation Plan](tasks/.done/2026-03-19-issue-to-knowledge-pipeline-plan.md)
- [Automated Issue-to-Knowledge Pipeline](tasks/.done/2026-03-19-issue-to-knowledge-pipeline.md)
- [Process Issues Skill](tasks/.done/2026-03-19-process-issues-skill.md)
- [Repo Transfer: lamat1111 → Quilibrium-Community](tasks/.done/2026-03-20-repo-transfer-to-org.md)
- [RAG Confidence Indicator — Implementation Plan](tasks/.done/2026-03-22-rag-confidence-indicator-plan.md)
- [RAG Confidence Indicator](tasks/.done/2026-03-22-rag-confidence-indicator.md)
- [Real-time Network Health Data Storage](tasks/.done/2026-03-23-network-health-data-storage.md)
- [Add Conversational Context to RAG Retrieval](tasks/.done/rag-conversational-context-memory.md)
- [Add External Chutes API Key Option](tasks/.done/external-chutes-api-key-option.md)
- [Convert Settings Modal to Standalone Settings Page](tasks/.done/convert-settings-modal-to-page.md)
- [Discord Bot — Remaining Manual Steps](tasks/.done/discord-bot-remaining-steps.md)
- [Implement Automated Daily Documentation Sync via GitHub Actions](tasks/.done/automated-weekly-docs-sync.md)
- [Implement Cloudflare Workers AI Reranker](tasks/.done/implement-cloudflare-reranker.md)
- [Implement Conversation Search Modal](tasks/.done/conversation-search-modal.md)
- [Implement Dual Embedding Storage for OpenRouter and Chutes Providers](tasks/.done/dual-embedding-storage-openrouter-chutes.md)
- [Implement Follow-Up Question Suggestions](tasks/.done/follow-up-question-suggestions.md)
- [Implement Insufficient Credits Detection for Chutes and OpenRouter](tasks/.done/insufficient-credits-detection.md)
- [Implement Query Decomposition for Broad RAG Queries](tasks/.done/rag-query-decomposition.md)
- [PRD: Discord Bot Integration for Quily](tasks/.done/prd-discord-bot-integration.md)
- [Research: Consolidate to Single BGE-M3 Embedding Model](tasks/.done/research-unified-bge-m3-embedding.md)
- [Starred Chats and Chat Management UI](tasks/.done/starred-chats-management-ui.md)
- [User Profile Customization (Username)](tasks/.done/user-profile-customization.md)

## 📊 Reports

### Active Reports

- [Frontend UI & Styling Architecture](reports/2026-01-29_frontend-ui-styling-architecture.md)
- [Multilingual Support Analysis for RAG Chatbot](reports/2026-01-30_multilingual-rag-support-analysis.md)
- [Quily Chatbot Security Audit](reports/2026-02-05_chatbot-security-audit.md)
- [Free and Low-Cost Reranking Solutions for RAG](reports/2026-02-05_free-reranking-solutions-for-rag.md)
- [Migration Analysis: Vercel to Quilibrium QStorage](reports/2026-02-09_vercel-to-qstorage-migration-analysis.md)
- [QCL Feasibility Analysis: Can QCL Replace Server-Side Functionality for Quily?](reports/2026-02-11_qcl-feasibility-for-quily-migration.md)
- [Documentation Gap Analysis for RAG Quality](reports/2026-02-24_doc-gap-analysis.md)
- [Discord Bot Integration Research — Quily Chatbot](reports/2026-03-16_discord-bot-integration-research.md)
- [Model Scout — LLM Benchmark Results](reports/2026-03-21-model-scout-benchmark.md)
- [Model Benchmark — Full Eval Suite Results](reports/2026-03-22-model-benchmark.md)

### Archived
- [LLM Provider Pricing Research](reports/archived/2026-01-30_llm-provider-pricing-research.md)
- [Starred Chats Management UI - Code Quality Analysis](reports/archived/2026-01-30_starred-chats-management-ui-analysis.md)
- [Chutes TEE (Trusted Execution Environment) Model Availability & Strategy](reports/archived/2026-02-09_chutes-tee-model-availability.md)
- [Documentation Gap Analysis for RAG Quality](reports/archived/2026-02-11_doc-gap-analysis.md)
- [Documentation Gap Analysis — February 13, 2026](reports/archived/2026-02-13_doc-gap-analysis.md)

### Competitors Research
- [Akash Network: Comprehensive Research Report](reports/competitors-research/2026-02-25_akash-network-research.md)
- [Arweave Deep Research Report](reports/competitors-research/2026-02-25_arweave-research.md)
- [IPFS & Filecoin: Deep Research Report for Quilibrium Comparison](reports/competitors-research/2026-02-25_ipfs-filecoin-research.md)
- [Secret Network: Deep Research Report](reports/competitors-research/2026-02-25_secret-network-research.md)

---

**Last Updated**: 2026-03-24 16:17:32