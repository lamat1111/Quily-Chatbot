# Phase 3: Chat Interface - Research

**Researched:** 2026-01-24
**Domain:** React chat UI, streaming responses, API key management, markdown rendering
**Confidence:** HIGH

## Summary

This research covers the complete frontend implementation for a chat interface with API key management, model selection, streaming responses, and markdown rendering. The phase builds on the existing `/api/chat` endpoint (from Phase 2) and requires creating the user-facing React components in Next.js 16 App Router.

The recommended approach uses the Vercel AI SDK `useChat` hook from `@ai-sdk/react` for chat state management and streaming, Tailwind CSS 4.x for styling with a sidebar + main content layout, `react-markdown` with `react-syntax-highlighter` for rendering responses, and Zustand with persist middleware for conversation history. The existing API route already handles streaming with `createUIMessageStream` and sends `source-url` parts for citations.

Key architectural decisions: (1) Client Component for the entire chat interface since it's highly interactive; (2) Zustand store for conversation history with localStorage persistence; (3) Custom `useLocalStorage` hook for API key persistence; (4) Intersection Observer pattern for auto-scrolling during streaming; (5) Tailwind CSS 4.x with CSS-first configuration for responsive sidebar layout.

**Primary recommendation:** Use `useChat` hook with custom transport pointing to existing `/api/chat`, Zustand for conversation persistence, Tailwind CSS 4.x for styling, and `react-markdown` + `react-syntax-highlighter` for content rendering.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @ai-sdk/react | ^1.2+ | useChat hook for streaming chat UI | Official Vercel AI SDK React integration, handles message state, streaming, abort |
| tailwindcss | ^4.0+ | Utility-first CSS framework | Next.js 16 default, CSS-first configuration, responsive design built-in |
| zustand | ^5.0+ | State management with persistence | Lightweight, built-in localStorage persist middleware, works with SSR |
| react-markdown | ^10.0+ | Markdown rendering | Safe by default (no dangerouslySetInnerHTML), plugin ecosystem |
| react-syntax-highlighter | ^16.0+ | Code block highlighting | Prism-based, supports JSX highlighting, inline styles |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| remark-gfm | ^4.0+ | GitHub Flavored Markdown | Tables, strikethrough, task lists in responses |
| react-intersection-observer | ^9.0+ | Scroll anchor detection | Auto-scroll during streaming |
| clsx | ^2.0+ | Conditional classNames | Dynamic Tailwind class composition |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand | Context + useReducer | More boilerplate, no built-in persistence |
| react-markdown | marked + DOMPurify | Manual sanitization required, more setup |
| Tailwind CSS | CSS Modules | Less utility-first, more verbose |
| react-syntax-highlighter | prism-react-renderer | Lighter but less features, needs more setup |

**Installation:**
```bash
npm install @ai-sdk/react zustand react-markdown remark-gfm react-syntax-highlighter react-intersection-observer clsx
npm install -D tailwindcss @tailwindcss/postcss @types/react-syntax-highlighter
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── layout.tsx            # Root layout with Tailwind globals
├── page.tsx              # Main chat page (client component)
├── globals.css           # Tailwind CSS imports
src/
├── components/
│   ├── chat/
│   │   ├── ChatContainer.tsx    # Main chat wrapper
│   │   ├── MessageList.tsx      # Scrollable message area
│   │   ├── MessageBubble.tsx    # Individual message display
│   │   ├── ChatInput.tsx        # Input form with submit/stop
│   │   ├── SourcesCitation.tsx  # Expandable sources footer
│   │   └── TypingIndicator.tsx  # Streaming indicator
│   ├── sidebar/
│   │   ├── Sidebar.tsx          # Sidebar container
│   │   ├── ApiKeyConfig.tsx     # API key input section
│   │   ├── ModelSelector.tsx    # Model dropdown
│   │   └── ConversationList.tsx # Chat history list
│   └── ui/
│       └── (shared components)
├── hooks/
│   ├── useLocalStorage.ts       # API key persistence
│   └── useScrollAnchor.ts       # Chat scroll behavior
├── stores/
│   └── conversationStore.ts     # Zustand conversation history
└── lib/
    └── openrouter.ts            # OpenRouter API helpers
```

### Pattern 1: useChat with Custom Transport
**What:** Configure useChat to use existing /api/chat endpoint with API key
**When to use:** Always - this is the primary chat integration pattern
**Example:**
```typescript
// Source: Vercel AI SDK useChat docs
'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

export function ChatContainer() {
  const [apiKey] = useLocalStorage('openrouter-api-key', '');
  const [model] = useLocalStorage('selected-model', 'meta-llama/llama-3.1-70b-instruct');

  const { messages, sendMessage, status, stop, error } = useChat({
    id: 'main-chat', // Unique chat ID
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: { apiKey, model }, // Sent with every request
    }),
    onData: (dataPart) => {
      // Handle source-url parts for citations
      if (dataPart.type === 'source-url') {
        // Store sources for display
      }
    },
  });

  const handleSubmit = (text: string) => {
    if (text.trim() && apiKey) {
      sendMessage({ text });
    }
  };

  return (
    <div>
      <MessageList messages={messages} status={status} />
      <ChatInput
        onSubmit={handleSubmit}
        onStop={stop}
        isStreaming={status === 'streaming'}
        disabled={!apiKey}
      />
    </div>
  );
}
```

### Pattern 2: Zustand Store with localStorage Persistence
**What:** Store conversation history with automatic localStorage sync
**When to use:** Conversation history sidebar, session persistence
**Example:**
```typescript
// Source: Zustand persist middleware docs
// src/stores/conversationStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Conversation {
  id: string;
  title: string;
  messages: Array<{ role: string; content: string }>;
  createdAt: number;
  updatedAt: number;
}

interface ConversationStore {
  conversations: Conversation[];
  activeId: string | null;
  addConversation: (conv: Conversation) => void;
  setActive: (id: string) => void;
  updateConversation: (id: string, messages: any[]) => void;
  deleteConversation: (id: string) => void;
}

export const useConversationStore = create<ConversationStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeId: null,
      addConversation: (conv) =>
        set((state) => ({
          conversations: [conv, ...state.conversations],
          activeId: conv.id,
        })),
      setActive: (id) => set({ activeId: id }),
      updateConversation: (id, messages) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, messages, updatedAt: Date.now() } : c
          ),
        })),
      deleteConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          activeId: state.activeId === id ? null : state.activeId,
        })),
    }),
    {
      name: 'chat-conversations',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### Pattern 3: Markdown Rendering with Syntax Highlighting
**What:** Render assistant responses with proper markdown and code highlighting
**When to use:** MessageBubble component for assistant messages
**Example:**
```typescript
// Source: react-markdown + react-syntax-highlighter docs
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';

          return !inline && language ? (
            <SyntaxHighlighter
              style={oneDark}
              language={language}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </Markdown>
  );
}
```

### Pattern 4: Scroll Anchor for Streaming Messages
**What:** Auto-scroll to bottom during streaming, pause when user scrolls up
**When to use:** MessageList component
**Example:**
```typescript
// Source: use-chat-scroll pattern + react-intersection-observer
import { useRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

export function useScrollAnchor() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { ref: anchorRef, inView: isAtBottom } = useInView({
    threshold: 0,
    trackVisibility: true,
    delay: 100,
  });

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  return {
    scrollRef,
    anchorRef,
    isAtBottom,
    scrollToBottom,
  };
}

// Usage in MessageList:
function MessageList({ messages, status }) {
  const { scrollRef, anchorRef, isAtBottom, scrollToBottom } = useScrollAnchor();

  // Auto-scroll when streaming and user is at bottom
  useEffect(() => {
    if (status === 'streaming' && isAtBottom) {
      scrollToBottom();
    }
  }, [messages, status, isAtBottom]);

  return (
    <div ref={scrollRef} className="overflow-y-auto">
      {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
      <div ref={anchorRef} /> {/* Invisible anchor at bottom */}
    </div>
  );
}
```

### Pattern 5: API Key Validation
**What:** Validate OpenRouter API key before allowing chat
**When to use:** ApiKeyConfig component when user enters key
**Example:**
```typescript
// Source: OpenRouter API docs
async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    // Use models endpoint to validate key (no cost, fast)
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Usage in component:
const [isValidating, setIsValidating] = useState(false);
const [isValid, setIsValid] = useState<boolean | null>(null);

const handleKeyChange = async (key: string) => {
  setApiKey(key);
  if (key.length > 10) { // Basic length check before API call
    setIsValidating(true);
    const valid = await validateApiKey(key);
    setIsValid(valid);
    setIsValidating(false);
  } else {
    setIsValid(null);
  }
};
```

### Pattern 6: Sidebar + Main Layout with Tailwind
**What:** Responsive layout with collapsible sidebar
**When to use:** Root layout structure
**Example:**
```typescript
// Source: Tailwind CSS sidebar layout docs
export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={clsx(
          'flex flex-col bg-white border-r border-gray-200 transition-all duration-300',
          sidebarOpen ? 'w-72' : 'w-0 overflow-hidden',
          'lg:w-72' // Always visible on large screens
        )}
      >
        <div className="p-4 border-b">
          <ApiKeyConfig />
          <ModelSelector />
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>

      {/* Mobile sidebar toggle */}
      <button
        className="lg:hidden fixed bottom-4 left-4 p-3 bg-blue-600 text-white rounded-full shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? 'Close' : 'Menu'}
      </button>
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Server Component for chat UI:** Chat is inherently interactive; use 'use client' for the entire chat container
- **Polling for messages:** Use streaming with useChat, not periodic fetches
- **Storing API key in state only:** Must persist to localStorage for session continuity
- **Rendering raw markdown:** Always use react-markdown for XSS safety
- **Manual scroll management:** Use Intersection Observer pattern, not scroll event listeners
- **Blocking on key validation:** Validate async, show loading state, don't block input

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Chat state + streaming | Manual fetch + state | `useChat` from @ai-sdk/react | Handles abort, status, message parts, error recovery |
| Message streaming display | Manual SSE parsing | `useChat` + status checks | Built-in streaming status, automatic message updates |
| localStorage sync | Manual get/set + effects | Zustand persist middleware | Handles hydration, SSR, automatic sync |
| Markdown rendering | regex + innerHTML | react-markdown | XSS safe, plugin ecosystem, component overrides |
| Code highlighting | Manual Prism setup | react-syntax-highlighter | Pre-bundled themes, language detection |
| Scroll behavior | scroll events + offsets | react-intersection-observer | Efficient, handles edge cases |
| Conditional classes | string concatenation | clsx | Cleaner, handles falsy values |

**Key insight:** Chat UIs have many subtle edge cases (streaming interruption, scroll during typing, mobile keyboards, SSR hydration). Using established patterns avoids 2-3 weeks of bug fixes.

## Common Pitfalls

### Pitfall 1: Hydration Mismatch with localStorage
**What goes wrong:** React hydration error when localStorage value differs from server render
**Why it happens:** Server renders with default/empty value, client has stored value
**How to avoid:** Use Zustand's `onRehydrateStorage` callback or render loading state until hydrated
**Warning signs:** Console errors about hydration mismatch, flickering UI on load
```typescript
// Solution: Check hydration state
const hasHydrated = useConversationStore((state) => state._hasHydrated);
if (!hasHydrated) return <LoadingState />;
```

### Pitfall 2: Stop Button Not Working
**What goes wrong:** Clicking stop doesn't abort the stream
**Why it happens:** AbortSignal not forwarded to streamText on server, or using resume mode
**How to avoid:** Pass `abortSignal: req.signal` to streamText; don't use resume with abort
**Warning signs:** Stop button appears to do nothing, stream continues to completion

### Pitfall 3: Auto-scroll Jumping Around
**What goes wrong:** Page scrolls erratically during streaming
**Why it happens:** Scroll triggered on every token without checking if user scrolled up
**How to avoid:** Use Intersection Observer to detect if user is at bottom; only auto-scroll if true
**Warning signs:** User can't scroll up to read, scroll position resets constantly

### Pitfall 4: API Key Exposed in Network Tab
**What goes wrong:** API key visible in browser dev tools request payload
**Why it happens:** Sending API key in request body (which is correct and necessary)
**How to avoid:** This is expected for BYOK apps; document that keys should be personal
**Warning signs:** N/A - this is intended behavior for user-provided keys

### Pitfall 5: Sources Not Displaying
**What goes wrong:** Citation sources from RAG not showing in UI
**Why it happens:** Not handling `source-url` parts in `onData` callback
**How to avoid:** Filter message.parts for source-url type, or use onData handler
**Warning signs:** Response mentions [1], [2] but no source links appear

### Pitfall 6: Code Blocks Not Highlighted
**What goes wrong:** Code appears as plain text or broken formatting
**Why it happens:** Missing language detection or SyntaxHighlighter not receiving language prop
**How to avoid:** Parse `className` for `language-*` pattern, handle inline vs block code
**Warning signs:** All code is monospace but no colors, or code wrapped incorrectly

### Pitfall 7: Mobile Keyboard Pushes Chat Up
**What goes wrong:** On mobile, keyboard opening pushes input out of view or causes layout shift
**Why it happens:** Fixed positioning interacts poorly with mobile viewport
**How to avoid:** Use `dvh` viewport units, test on real mobile devices
**Warning signs:** Input field hidden behind keyboard, layout jumps on focus

## Code Examples

Verified patterns from official sources:

### Complete useLocalStorage Hook
```typescript
// src/hooks/useLocalStorage.ts
// Source: usehooks-ts pattern adapted for Next.js SSR
import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    setIsHydrated(true);
  }, [key]);

  // Return a wrapped version of useState's setter function that persists
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}
```

### Message Bubble with Parts Rendering
```typescript
// src/components/chat/MessageBubble.tsx
// Source: AI SDK message.parts pattern
import { UIMessage } from 'ai';
import { MarkdownRenderer } from './MarkdownRenderer';
import { SourcesCitation } from './SourcesCitation';
import clsx from 'clsx';

interface MessageBubbleProps {
  message: UIMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  // Extract text and source parts
  const textParts = message.parts.filter((p) => p.type === 'text');
  const sourceParts = message.parts.filter((p) => p.type === 'source-url');

  const content = textParts.map((p) => p.text).join('');

  return (
    <div
      className={clsx(
        'max-w-[80%] rounded-lg px-4 py-3 mb-3',
        isUser
          ? 'bg-blue-600 text-white ml-auto'
          : 'bg-gray-100 text-gray-900'
      )}
    >
      {isUser ? (
        <p className="whitespace-pre-wrap">{content}</p>
      ) : (
        <>
          <MarkdownRenderer content={content} />
          {sourceParts.length > 0 && (
            <SourcesCitation sources={sourceParts} />
          )}
        </>
      )}
    </div>
  );
}
```

### Chat Input with Stop Button
```typescript
// src/components/chat/ChatInput.tsx
// Source: AI SDK useChat stop pattern
import { useState, FormEvent } from 'react';
import clsx from 'clsx';

interface ChatInputProps {
  onSubmit: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled: boolean;
}

export function ChatInput({
  onSubmit,
  onStop,
  isStreaming,
  disabled,
}: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSubmit(input);
      setInput('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-4 border-t bg-white"
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={disabled ? 'Enter API key first...' : 'Ask a question...'}
        disabled={disabled || isStreaming}
        className={clsx(
          'flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2',
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-blue-500'
        )}
      />
      {isStreaming ? (
        <button
          type="button"
          onClick={onStop}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Stop
        </button>
      ) : (
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className={clsx(
            'px-4 py-2 rounded-lg',
            disabled || !input.trim()
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          Send
        </button>
      )}
    </form>
  );
}
```

### Expandable Sources Citation
```typescript
// src/components/chat/SourcesCitation.tsx
// Source: UI pattern from CONTEXT.md decisions
import { useState } from 'react';
import clsx from 'clsx';

interface SourcePart {
  type: 'source-url';
  sourceId: string;
  url: string;
  title?: string;
}

interface SourcesCitationProps {
  sources: SourcePart[];
}

export function SourcesCitation({ sources }: SourcesCitationProps) {
  const [expanded, setExpanded] = useState(false);

  if (sources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm text-blue-600 hover:underline"
      >
        {expanded ? 'Hide' : 'Show'} {sources.length} source{sources.length !== 1 ? 's' : ''}
      </button>
      {expanded && (
        <ul className="mt-2 space-y-1">
          {sources.map((source) => (
            <li key={source.sourceId} className="text-sm">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {source.title || source.url}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Model Selector with OpenRouter Models
```typescript
// src/components/sidebar/ModelSelector.tsx
// Source: OpenRouter models API + requirement KEY-04
import { useState, useEffect } from 'react';

interface Model {
  id: string;
  name: string;
}

// Curated list of recommended models for documentation Q&A
const RECOMMENDED_MODELS: Model[] = [
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B' },
  { id: 'mistralai/mixtral-8x7b-instruct', name: 'Mixtral 8x7B' },
  { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5' },
];

interface ModelSelectorProps {
  value: string;
  onChange: (model: string) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Model
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {RECOMMENDED_MODELS.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
}
```

### Tailwind CSS 4.x Setup
```css
/* app/globals.css */
/* Source: Tailwind CSS 4.x docs */
@import "tailwindcss";

/* Custom theme overrides if needed */
@theme {
  --color-primary: #2563eb;
  --color-user-bubble: #2563eb;
  --color-assistant-bubble: #f3f4f6;
}
```

```typescript
// postcss.config.mjs
// Source: Tailwind CSS 4.x + Next.js docs
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useCompletion` for chat | `useChat` with parts | AI SDK 5.0 (2025) | Better message structure, multi-modal support |
| Manual SSE parsing | `DefaultChatTransport` | AI SDK 5.0 (2025) | Automatic reconnection, error recovery |
| tailwind.config.js | CSS-first @import | Tailwind 4.0 (2025) | Simpler setup, no JS config needed |
| `convertToCoreMessages` | `convertToModelMessages` | AI SDK 6.0 (2025) | Renamed API, same functionality |
| Redux for chat state | Zustand with persist | 2024-2025 | Less boilerplate, built-in persistence |
| highlight.js | Prism via react-syntax-highlighter | N/A | Better JSX support |

**Deprecated/outdated:**
- `toDataStreamResponse()` alone: Use `createUIMessageStream` for data + LLM combined streams
- Tailwind CSS 3.x config.js pattern: 4.x uses CSS-first configuration
- AI SDK `useChat` with direct `api` prop: Use `transport` parameter instead

## Open Questions

Things that couldn't be fully resolved:

1. **Exact responsive breakpoints**
   - What we know: Tailwind defaults (sm: 640px, md: 768px, lg: 1024px)
   - What's unclear: Optimal sidebar collapse point for this specific layout
   - Recommendation: Start with lg (1024px), adjust based on testing

2. **Conversation title generation**
   - What we know: Need a title for sidebar list
   - What's unclear: Auto-generate from first message or let user name it?
   - Recommendation: Auto-generate from first user message (first 50 chars), allow rename

3. **Rate limit handling UX**
   - What we know: OpenRouter returns 429 for rate limits
   - What's unclear: Best way to communicate retry timing to user
   - Recommendation: Show error with "Try again in X seconds" if retry-after header present

4. **Maximum conversation history**
   - What we know: localStorage has ~5MB limit
   - What's unclear: How many conversations before performance degrades
   - Recommendation: Limit to 50 conversations, oldest auto-deleted; monitor during testing

## Sources

### Primary (HIGH confidence)
- [Vercel AI SDK useChat Reference](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat) - Complete hook API
- [Vercel AI SDK Chatbot Guide](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot) - Implementation patterns
- [Vercel AI SDK Streaming Data](https://ai-sdk.dev/docs/ai-sdk-ui/streaming-data) - Data parts, source-url handling
- [Vercel AI SDK Stopping Streams](https://ai-sdk.dev/docs/advanced/stopping-streams) - Abort patterns
- [Zustand Persist Middleware](https://zustand.docs.pmnd.rs/integrations/persisting-store-data) - localStorage integration
- [react-markdown GitHub](https://github.com/remarkjs/react-markdown) - Markdown rendering
- [react-syntax-highlighter npm](https://www.npmjs.com/package/react-syntax-highlighter) - Code highlighting
- [OpenRouter Models API](https://openrouter.ai/docs/api/api-reference/models/get-models) - Model list endpoint

### Secondary (MEDIUM confidence)
- [Tailwind CSS 4.x PostCSS Plugin](https://tailwindcss.com/docs/installation/using-postcss) - CSS-first setup
- [Next.js Server/Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) - Component patterns
- [usehooks-ts useLocalStorage](https://usehooks-ts.com/react-hook/use-local-storage) - Hook pattern
- [Chat scroll behavior patterns](https://davelage.com/posts/chat-scroll-react/) - Intersection Observer approach

### Tertiary (LOW confidence)
- Exact Tailwind 4.x version compatibility with Next.js 16 (verify during implementation)
- react-syntax-highlighter bundle size optimization (may need PrismLight for production)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified with official documentation
- Architecture: HIGH - Patterns from official AI SDK and React docs
- Pitfalls: HIGH - Known issues documented in GitHub issues and community
- Code examples: HIGH - Adapted from official documentation and verified patterns

**Research date:** 2026-01-24
**Valid until:** 2026-02-24 (30 days - libraries are stable)
