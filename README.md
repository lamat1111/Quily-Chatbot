# Quilibrium AI Assistant

A self-hosted RAG chatbot that answers questions about the Quilibrium protocol using official documentation and livestream transcriptions.

**Zero operational cost** — users bring their own API keys via OpenRouter.

## Features

- **RAG-powered answers** with source citations from official Quilibrium docs
- **Streaming responses** via OpenRouter (supports Llama, Mixtral, Claude, GPT-4, etc.)
- **Two-stage retrieval** with optional Cohere reranking for improved accuracy
- **Conversation history** persisted in browser localStorage
- **Dark mode** support
- **Mobile responsive** design

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account (free tier works)
- OpenRouter API key

### 1. Clone and Install

```bash
git clone https://github.com/QuilibriumNetwork/Quilibrium-Assistant.git
cd Quilibrium-Assistant
npm install
```

### 2. Configure Environment

Create a `.env.local` file:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cohere reranking (optional, improves retrieval quality)
COHERE_API_KEY=your_cohere_key

# For ingestion only (users provide their own for chat)
OPENROUTER_API_KEY=your_openrouter_key
```

### 3. Set Up Supabase

Create a new Supabase project and run this SQL to set up the vector database:

```sql
-- Enable pgvector extension
create extension if not exists vector;

-- Create document chunks table
create table document_chunks (
  id bigserial primary key,
  content text not null,
  embedding vector(1536),
  source_file text not null,
  heading_path text,
  token_count integer,
  version_tag text,
  created_at timestamptz default now()
);

-- Create similarity search function
create or replace function match_document_chunks(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  source_file text,
  heading_path text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    dc.id,
    dc.content,
    dc.source_file,
    dc.heading_path,
    1 - (dc.embedding <=> query_embedding) as similarity
  from document_chunks dc
  where 1 - (dc.embedding <=> query_embedding) > match_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Create index for fast similarity search
create index on document_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);
```

### 4. Ingest Documentation

Clone the Quilibrium docs and ingest them:

```bash
# Clone docs
git clone https://github.com/QuilibriumNetwork/docs.git ./docs-source

# Preview ingestion (dry run)
npm run ingest run -d ./docs-source/docs --dry-run

# Run full ingestion
npm run ingest run -d ./docs-source/docs
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and enter your OpenRouter API key to start chatting.

## Usage

1. **Enter API Key** — Get one from [OpenRouter](https://openrouter.ai/keys)
2. **Select Model** — Choose from recommended models (Llama 3.1, Claude, GPT-4, etc.)
3. **Ask Questions** — About node operation, protocol details, development, etc.
4. **View Sources** — Click citation links to see original documentation

## Project Structure

```
├── app/
│   ├── api/chat/route.ts    # Streaming chat endpoint with RAG
│   ├── layout.tsx           # Root layout with theme provider
│   └── page.tsx             # Main chat page
├── src/
│   ├── components/
│   │   ├── chat/            # ChatContainer, MessageList, MessageBubble, etc.
│   │   ├── sidebar/         # Sidebar, ConversationList, ApiKeyConfig
│   │   └── ui/              # Shared UI components
│   ├── hooks/               # useLocalStorage, useScrollAnchor, useCopyToClipboard
│   ├── lib/
│   │   ├── rag/             # Retriever, prompt builder, types
│   │   ├── openrouter.ts    # Model definitions
│   │   └── supabase.ts      # Database client
│   └── stores/              # Zustand conversation store
└── scripts/
    └── ingest/              # CLI for ingesting docs into Supabase
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **State**: Zustand + localStorage
- **AI**: Vercel AI SDK + OpenRouter
- **Vector DB**: Supabase pgvector
- **Reranking**: Cohere (optional)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript type checking |
| `npm run ingest run -d <path>` | Ingest markdown docs |
| `npm run ingest count` | Count chunks in database |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (server-side) |
| `COHERE_API_KEY` | No | Enables reranking for better retrieval |
| `OPENROUTER_API_KEY` | Ingestion only | Used to generate embeddings during ingestion |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

The free tier is sufficient for most use cases.

### Docker

```bash
docker build -t quilibrium-assistant .
docker run -p 3000:3000 --env-file .env.local quilibrium-assistant
```

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT
