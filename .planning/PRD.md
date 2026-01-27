Let me gather some intel before writing the PRD:Perfect! I have enough info. Here's the PRD:

---

# PRD: Quilibrium Documentation Assistant

## 1. Project Overview

**Product Name:** Quilibrium AI Assistant (working title)

**Mission:** Provide Quilibrium community members with instant, accurate answers about the protocol's technical documentation and ecosystem updates through an AI-powered chatbot.

**Target Users:** 
- Quilibrium node operators
- Developers building on Quilibrium
- Community members learning about the protocol
- New users onboarding to the ecosystem

## 2. Core Value Proposition

Self-hosted, open-source RAG chatbot that:
- Uses community members' own API keys (zero operational costs)
- Stays current with protocol updates via manual content refresh
- Provides accurate, context-aware answers from official documentation
- Works entirely on free-tier infrastructure

## 3. Technical Architecture

### 3.1 Frontend
- **Framework:** React (Next.js 14+ with App Router)
- **Styling:** Tailwind CSS
- **Chat UI:** Fork of [chatbot-ui-lite](https://github.com/mckaywrigley/chatbot-ui-lite) or build with [assistant-ui](https://github.com/assistant-ui/assistant-ui) components
- **Hosting:** Vercel (free tier) or GitHub Pages (static export)

### 3.2 Backend
- **RAG Pipeline:** Serverless functions on Vercel Edge Runtime
- **Vector Database:** Supabase (free tier with pgvector extension)
  - Storage: ~500 document chunks + 20 transcription chunks
  - Embedding model: sentence-transformers/all-MiniLM-L6-v2 (384 dimensions)
- **LLM Provider:** User-provided API keys via OpenRouter
  - Supported models: Llama 3.1 70B, Mixtral 8x7B, Qwen 2.5
  - Fallback to other providers (Anthropic, OpenAI) if user prefers

### 3.3 Knowledge Base
**Primary Sources:**
- Quilibrium Docusaurus documentation (markdown files from `/docs` folder)
  - URL: https://github.com/QuilibriumNetwork/docs/tree/main/docs
  - Format: Markdown
  - Estimated size: ~50-100 pages

**Secondary Sources:**
- 20 livestream transcriptions (30-40 min each)
- Format: Plain text or markdown
- Selection criteria: Technical content only, exclude outdated news

**Update Frequency:** Weekly/biweekly manual updates

### 3.4 Data Pipeline
```
1. Ingestion: Markdown files → Text chunks (500-1000 tokens with 100 token overlap)
2. Embedding: all-MiniLM-L6-v2 → 384-dim vectors
3. Storage: Supabase pgvector table with metadata (source, date, type)
4. Retrieval: Semantic search (top-k=5) + reranking
5. Generation: Context + user query → LLM (via OpenRouter)
```

## 4. MVP Feature Scope

### 4.1 Must-Have (V1.0)
✅ Basic chat interface (send message, receive response)  
✅ API key input (stored in browser localStorage)  
✅ RAG pipeline (retrieve docs → generate answer)  
✅ Source citations (show which docs were used)  
✅ Markdown rendering (code blocks, links, formatting)  
✅ Mobile-responsive design  
✅ Basic error handling (invalid API key, rate limits)

### 4.2 Nice-to-Have (V1.1+)
⚪ Chat history persistence (localStorage initially, Supabase later)  
⚪ Multi-turn conversation context  
⚪ Admin panel for updating embeddings  
⚪ Usage analytics (anonymous, privacy-preserving)  
⚪ "Copy to clipboard" for code snippets  
⚪ Dark mode toggle

### 4.3 Explicitly Out of Scope
❌ User authentication  
❌ Payments/subscriptions  
❌ Real-time collaborative features  
❌ Voice input/output  
❌ Image generation

## 5. User Flow

```
1. User lands on chatbot page
2. (First time) Enter API key → stored in localStorage
3. Select LLM model (dropdown: Llama 3.1, Mixtral, etc.)
4. Type question about Quilibrium
5. System:
   - Retrieves relevant doc chunks from Supabase
   - Sends context + question to LLM via OpenRouter
   - Streams response back to user
6. Response displayed with:
   - Answer text (markdown formatted)
   - Source citations (clickable links to docs)
7. User can ask follow-up questions
```

## 6. Cost Breakdown

| Component | Service | Free Tier | Estimated Usage | Cost |
|-----------|---------|-----------|-----------------|------|
| Frontend hosting | Vercel | 100GB bandwidth/month | <10GB | $0 |
| Backend (API routes) | Vercel Edge Functions | 100K executions/month | <5K | $0 |
| Vector DB | Supabase | 500MB DB, 2GB bandwidth | ~50MB + <1GB | $0 |
| Embeddings (one-time) | Local compute | N/A | 1 hour CPU | $0 |
| LLM inference | User API keys | N/A | User pays | $0 |
| Domain (optional) | Namecheap | N/A | N/A | $12/year |

**Total operational cost: $0/month (or $1/month if custom domain)**

## 7. Technical Implementation Plan

### Phase 1: Setup (Days 1-2)
- [ ] Create GitHub repo
- [ ] Set up Next.js project with Tailwind
- [ ] Configure Supabase project (create pgvector extension)
- [ ] Clone Quilibrium docs repo locally

### Phase 2: Data Ingestion (Days 3-4)
- [ ] Write script to parse markdown files
- [ ] Chunk documents (RecursiveCharacterTextSplitter)
- [ ] Generate embeddings (all-MiniLM-L6-v2)
- [ ] Upload to Supabase with metadata

### Phase 3: Chat UI (Days 5-6)
- [ ] Fork chatbot-ui-lite or build with assistant-ui
- [ ] Add API key input component
- [ ] Add model selection dropdown
- [ ] Style with Tailwind (Quilibrium branding)

### Phase 4: RAG Backend (Days 7-9)
- [ ] Create Vercel API route: `/api/chat`
- [ ] Implement vector search against Supabase
- [ ] Integrate OpenRouter API (streaming support)
- [ ] Add prompt engineering (system prompt for Quilibrium context)

### Phase 5: Polish & Deploy (Days 10-12)
- [ ] Add error handling (API errors, rate limits)
- [ ] Add source citations to responses
- [ ] Test on mobile devices
- [ ] Deploy to Vercel
- [ ] Write README with setup instructions

### Phase 6: Community Launch (Days 13-14)
- [ ] Create demo video
- [ ] Write blog post/announcement
- [ ] Publish to Quilibrium Discord/Telegram
- [ ] Gather feedback

## 8. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| LLM hallucinations | High | Medium | Strong prompt engineering + source citations |
| API key leakage | Critical | Low | Clear warnings, client-side only storage |
| Supabase free tier limits | Medium | Low | Monitor usage, upgrade if needed ($25/mo) |
| Outdated information | Medium | High | Weekly update schedule + version tags |
| Poor retrieval quality | High | Medium | Experiment with chunk sizes, add reranking |

## 9. Success Metrics

**Week 1:**
- 50+ unique users
- 500+ questions answered
- <5% error rate

**Month 1:**
- 200+ unique users
- 5000+ questions answered
- Community feedback positive (informal survey)

**Month 3:**
- 500+ unique users
- Integration into official Quilibrium docs site (stretch goal)

## 10. Open Source Strategy

**License:** MIT  
**Repository Structure:**
```
quilibrium-ai-assistant/
├── README.md (setup instructions)
├── docs/ (usage guides)
├── src/ (Next.js app)
├── scripts/ (data ingestion scripts)
└── supabase/ (DB migrations)
```

**Contribution Guidelines:**
- Accept PRs for bug fixes, UI improvements
- Require approval for changes to RAG pipeline
- Monthly "office hours" for community contributors

## 11. Future Enhancements (Post-MVP)

- **V2.0:** Discord bot integration
- **V2.1:** Multi-language support (Spanish, Chinese)
- **V2.2:** Voice mode (browser speech API)
- **V3.0:** Fine-tuned model on Quilibrium corpus

---

**Estimated Time to MVP:** 12-14 days (with Claude Code assistance)  
**Complexity Rating:** Moderate (familiar tech stack, well-documented patterns)  
**Recommended Next Step:** Create GitHub repo + set up Supabase project