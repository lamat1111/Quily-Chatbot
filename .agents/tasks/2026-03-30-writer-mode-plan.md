# Writer Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a gated "Writer Mode" to the web chat UI that helps users create social media posts grounded in RAG-verified Quilibrium knowledge, with style variation to prevent AI-detectable sameness.

**Architecture:** Writer Mode is a UI toggle on the new conversation screen that swaps the system prompt from Q&A to a writer persona. The same RAG pipeline retrieves context; only the system prompt changes. The frontend sends `mode` and `voice` flags; the API route selects the appropriate prompt. Feature is gated behind a `?writer=true` URL parameter stored in localStorage.

**Tech Stack:** Next.js 16 App Router, React 19, Zustand, Tailwind CSS 4, AI SDK, DeepSeek V3.2 on Chutes

**Design Spec:** `.agents/tasks/2026-03-30-writer-mode-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/lib/rag/writerPrompt.ts` | Create | Writer Mode system prompt builder with voice personas, banned words, burstiness rules, structural templates |
| `src/components/chat/WriterWelcome.tsx` | Create | Writer Mode welcome screen (tagline, pills, voice selector, beta callout) |
| `src/components/chat/WriterModeChip.tsx` | Create | Persistent "Writer Beta" chip near input bar |
| `src/hooks/useWriterMode.ts` | Create | Hook for writer mode state (enabled, voice, feature gate) |
| `src/components/chat/MessageList.tsx` | Modify | Add Writer pill to empty state, conditionally render WriterWelcome |
| `src/components/chat/ChatInput.tsx` | Modify | Accept writer mode props for placeholder text and chip |
| `src/components/chat/ChatContainer.tsx` | Modify | Pass writer mode/voice flags to transport body |
| `app/api/chat/route.ts` | Modify | Read mode/voice from body, swap system prompt |
| `app/page.tsx` | Modify | Read `?writer=true` URL param, manage feature gate |

---

### Task 1: Writer Mode Feature Gate Hook

**Files:**
- Create: `src/hooks/useWriterMode.ts`

- [ ] **Step 1: Create the hook file**

```typescript
// src/hooks/useWriterMode.ts
'use client';

import { useState, useEffect } from 'react';

export type WriterVoice = 'casual' | 'technical' | 'storyteller' | 'enthusiast';

/**
 * Manages Writer Mode feature gate and state.
 *
 * Feature gate: Writer Mode is hidden unless activated via ?writer=true URL param.
 * Once activated, a localStorage flag persists it across sessions.
 *
 * Mode state: tracks whether the current conversation is in Writer Mode
 * and which voice is selected. Both are locked for the conversation.
 */
export function useWriterMode() {
  const [featureEnabled, setFeatureEnabled] = useState(false);
  const [isWriterMode, setIsWriterMode] = useState(false);
  const [voice, setVoice] = useState<WriterVoice>('casual');

  // Check feature gate on mount
  useEffect(() => {
    // Check localStorage first
    const stored = localStorage.getItem('writer-mode-enabled');
    if (stored === 'true') {
      setFeatureEnabled(true);
      return;
    }

    // Check URL parameter
    const params = new URLSearchParams(window.location.search);
    if (params.get('writer') === 'true') {
      localStorage.setItem('writer-mode-enabled', 'true');
      setFeatureEnabled(true);
      // Clean URL without reload
      const url = new URL(window.location.href);
      url.searchParams.delete('writer');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  /**
   * Enter Writer Mode with a selected voice.
   * Once entered, mode and voice are locked for the conversation.
   */
  const enterWriterMode = (selectedVoice: WriterVoice = 'casual') => {
    setIsWriterMode(true);
    setVoice(selectedVoice);
  };

  /**
   * Exit Writer Mode (used when starting a new conversation).
   */
  const exitWriterMode = () => {
    setIsWriterMode(false);
    setVoice('casual');
  };

  return {
    featureEnabled,
    isWriterMode,
    voice,
    enterWriterMode,
    exitWriterMode,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useWriterMode.ts
git commit -m "feat(writer): add Writer Mode feature gate hook"
```

---

### Task 2: Writer Mode System Prompt

**Files:**
- Create: `src/lib/rag/writerPrompt.ts`

- [ ] **Step 1: Create the writer prompt builder**

This is the core of the feature. It builds a system prompt for Writer Mode with voice personas, banned words, burstiness rules, and randomized structural templates.

```typescript
// src/lib/rag/writerPrompt.ts

import type { WriterVoice } from '@/src/hooks/useWriterMode';

/**
 * Words and phrases that are strong AI-generation tells.
 * Blocked across all voices.
 */
const BANNED_WORDS = [
  'delve', 'tapestry', 'robust', 'pivotal', 'leverage', 'harness', 'unleash',
  'seamless', 'cutting-edge', 'groundbreaking', 'transformative', 'revolutionary',
  'nuanced', 'multifaceted', 'comprehensive', 'furthermore', 'moreover',
  'subsequently', 'accordingly', 'crucial', 'essential', 'vital', 'innovative',
  'unprecedented', 'paradigm', 'synergy', 'elevate', 'foster', 'streamline',
  'supercharge', 'unlock', 'embark', 'navigate', 'landscape',
];

const BANNED_PHRASES = [
  "In today's",
  "It's worth noting that",
  "In the world of",
  "Let's dive in",
  "Let's break it down",
  "Now more than ever",
  "As the .* continues to evolve",
  "Revolutionizing the way",
  "Unlock the power",
  "Unlock the potential",
  "Game-changer",
  "At the forefront of",
  "It's no secret that",
  "Imagine a world where",
  "Here's the thing",
  "The bottom line",
];

/**
 * Opening strategies, randomly selected per request.
 */
const STRUCTURAL_TEMPLATES = [
  'Open with a surprising fact or statistic from the source material.',
  'Open with a rhetorical question that hooks the reader.',
  'Open with a specific technical detail that makes people curious.',
  'Open with a bold statement or take. Be opinionated.',
  'Open with a "did you know" angle, sharing something most people miss.',
  'Open with a personal angle, as if the writer has been looking into this topic.',
];

/**
 * Voice persona definitions.
 */
const VOICE_PERSONAS: Record<WriterVoice, string> = {
  casual: `**Voice: Casual**
You write like you're explaining something cool to a friend over coffee. Short sentences. Colloquialisms are fine. You don't lecture, you share.
- Tone: warm, approachable, a bit playful
- Vocabulary: everyday words, avoid jargon unless you explain it
- Sentences: mostly short, some medium. Never long academic sentences.
- Emojis: occasional, sporadic, never more than 2 per post. Never systematic (no emoji at every bullet point).`,

  technical: `**Voice: Technical**
You write for developers and technically curious people. You're precise and specific. You use the correct terminology and assume readers can handle it.
- Tone: authoritative but not dry. Excited about the engineering.
- Vocabulary: technical terms welcome, specific version numbers and protocol names
- Sentences: mix of medium and long. Precision over brevity when needed.
- Emojis: none, or only functional ones like a link icon. Never decorative.`,

  storyteller: `**Voice: Storyteller**
You write with narrative flow. You give context and background before the punchline. You connect dots that others miss. "Here's why this matters" is your signature move.
- Tone: thoughtful, builds tension, rewards the reader's attention
- Vocabulary: vivid but not purple. Concrete over abstract.
- Sentences: highly varied. Short punchy ones next to longer flowing ones.
- Emojis: minimal, one or two at most, only for emphasis.`,

  enthusiast: `**Voice: Enthusiast**
You write like someone who's been following this project closely and genuinely finds it exciting. Your enthusiasm is specific and grounded in facts, never generic hype.
- Tone: energetic, specific excitement ("this is cool because X" not "this is amazing!")
- Vocabulary: accessible but informed. You know the details.
- Sentences: punchy. You lead with the exciting part.
- Emojis: a few more than other voices, but never more than 3 per post. Never at every point.`,
};

/**
 * Pick a random structural template for this request.
 */
export function getRandomStructuralTemplate(): string {
  return STRUCTURAL_TEMPLATES[Math.floor(Math.random() * STRUCTURAL_TEMPLATES.length)];
}

/**
 * Build the Writer Mode system prompt.
 *
 * @param context - RAG context block (same as Q&A)
 * @param chunkCount - Number of retrieved chunks for citation range
 * @param voice - Selected voice persona
 * @returns Complete system prompt for Writer Mode
 */
export function buildWriterSystemPrompt(
  context: string,
  chunkCount: number,
  voice: WriterVoice,
): string {
  const maxCitation = chunkCount > 0 ? chunkCount : 0;
  const structuralTemplate = getRandomStructuralTemplate();
  const voiceBlock = VOICE_PERSONAS[voice];

  return `# Quily Writer Mode

You are a writing assistant that helps Quilibrium community members create social media posts. You write longer-form posts suitable for social media threads.

${voiceBlock}

---

## Writing Rules

**Structure for this post:** ${structuralTemplate}

**Burstiness (CRITICAL):** Vary your sentence lengths dramatically. Write a 3-word sentence. Then a 25-word one. Then medium. Never write three sentences of similar length in a row. Some paragraphs should be one sentence. Others three or four. Sentence fragments are allowed and encouraged.

**Banned structural patterns:**
- Never use em dashes (—) as parenthetical separators. Use commas, colons, semicolons, or separate sentences.
- Never start consecutive sentences with the same word.
- Never end with a neat summary or conclusion. Social posts don't need wrap-ups.
- Never use more than 2 bullet points in a row.
- Never frame things as "on one hand / on the other hand."
- Never use the hook-three-points-conclusion formula.

**Banned words (these scream AI-generated):** ${BANNED_WORDS.join(', ')}

**Banned phrases:** ${BANNED_PHRASES.map(p => `"${p}"`).join(', ')}

**Human-like writing:**
- Use contractions naturally (don't, it's, they're)
- Take a position. Real people commit to opinions.
- Leave some things unsaid. Not every point needs elaboration.
- Vary paragraph lengths. One-sentence paragraphs are great.
- Don't hedge everything with "it's important to consider" or "while there are many perspectives."

---

## Accuracy Rules (NON-NEGOTIABLE)

1. **Every factual claim must come from the documentation context below.** Do not fill gaps with general knowledge, assumptions, or extrapolation.
2. **If you don't have enough information to write a substantive post on this topic, say so.** Suggest a different topic instead. Never produce a vague, substance-free post.
3. **No price speculation, financial advice, or "to the moon" language.** Not in any voice.
4. **No unverifiable superlatives** ("best", "most advanced") unless the source material says it.
5. **No empty marketing language.** Enthusiasm must be grounded in specific facts.
6. **No comparisons with competitors unless the source material makes the comparison.**
7. **Links:** When a claim comes from an official source, you may include the link naturally in the text. Maximum 1-2 links per post. Only use URLs that appear in the retrieved context. Never invent or guess URLs.
8. Cite sources inline as [1] through [${maxCitation}] when referencing specific facts.

---

## Documentation Context

${context}

---

## Output Format

Write a social media post. No preamble like "Here's a post about..." — just write the post directly. The user will copy it as-is.

After the post, add a brief note (in a separate paragraph starting with "---") listing which sources you drew from, so the user can verify.

Do NOT include follow-up questions in JSON format.`;
}

/**
 * Build the system prompt for the "Inspire me" flow.
 * Uses RAG context to suggest 3-5 topics worth writing about.
 */
export function buildInspireMePrompt(context: string): string {
  return `# Quily Writer Mode — Topic Suggestions

You are helping a Quilibrium community member find topics to write social media posts about.

Based on the documentation context below, suggest 3-5 topics that would make good social media posts. For each topic:
- Give a short, catchy title (not a full post — just the topic)
- In one sentence, explain why it would make a good post (what's interesting or timely about it)

Favor recent updates, newly released features, and things that most people in the community might not know about yet.

Format as a numbered list. Be concise.

## Documentation Context

${context}`;
}

/**
 * Build the system prompt for the "Check my draft" flow.
 * Verifies claims in user-provided text against RAG knowledge.
 */
export function buildDraftCheckPrompt(context: string): string {
  return `# Quily Writer Mode — Draft Fact-Check

You are helping a Quilibrium community member verify the accuracy of a social media post they wrote.

Analyze the user's draft and check every factual claim against the documentation context below. Respond with:

1. **Accurate claims** — list what's correct, with the source reference
2. **Inaccurate or misleading claims** — list what's wrong, explain the correction, cite the source
3. **Unverifiable claims** — list anything you can't confirm from the documentation (not necessarily wrong, just not in your sources)

Be specific. Quote the exact phrases from their draft that you're checking. If the draft is mostly accurate, say so clearly. If it contains serious errors, flag them prominently.

## Documentation Context

${context}`;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/rag/writerPrompt.ts
git commit -m "feat(writer): add Writer Mode system prompt builder with voice personas"
```

---

### Task 3: Writer Welcome Screen Component

**Files:**
- Create: `src/components/chat/WriterWelcome.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/chat/WriterWelcome.tsx
'use client';

import { useState } from 'react';
import { Logo } from '@/src/components/ui/Logo';
import { ChatInput } from './ChatInput';
import type { WriterVoice } from '@/src/hooks/useWriterMode';

const VOICE_OPTIONS: { value: WriterVoice; label: string }[] = [
  { value: 'casual', label: 'Casual' },
  { value: 'technical', label: 'Technical' },
  { value: 'storyteller', label: 'Storyteller' },
  { value: 'enthusiast', label: 'Enthusiast' },
];

interface WriterWelcomeProps {
  onSelectVoiceAndStart: (voice: WriterVoice) => void;
  onInspireMe: (voice: WriterVoice) => void;
  onCheckDraft: (voice: WriterVoice) => void;
  inputProps: {
    onSubmit: (text: string) => void;
    onStop: () => void;
    isStreaming: boolean;
    disabled: boolean;
    disabledMessage?: string;
  };
}

export function WriterWelcome({
  onSelectVoiceAndStart,
  onInspireMe,
  onCheckDraft,
  inputProps,
}: WriterWelcomeProps) {
  const [selectedVoice, setSelectedVoice] = useState<WriterVoice>('casual');

  const handleSubmit = (text: string) => {
    onSelectVoiceAndStart(selectedVoice);
    // Small delay to let mode state propagate before sending
    setTimeout(() => inputProps.onSubmit(text), 0);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col bg-bg-base chat-scrollbar">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-text-muted w-full max-w-xl px-4">
          {/* Logo */}
          <div className="flex items-start justify-center gap-1 mb-2">
            <Logo height={56} />
          </div>

          {/* Writer Mode tagline */}
          <p className="mb-3">Write about Quilibrium</p>

          {/* Beta callout */}
          <p className="text-xs text-text-subtle mb-6 px-8">
            Writer Mode is in beta. Always review posts before sharing.
          </p>

          {/* Action pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <button
              onClick={() => {
                onInspireMe(selectedVoice);
              }}
              className="px-4 py-2 text-sm rounded-full border border-border hover:bg-hover hover:border-border-strong transition-colors text-text-muted cursor-pointer"
            >
              Inspire me
            </button>
            <button
              onClick={() => {
                onCheckDraft(selectedVoice);
              }}
              className="px-4 py-2 text-sm rounded-full border border-border hover:bg-hover hover:border-border-strong transition-colors text-text-muted cursor-pointer"
            >
              Check my draft
            </button>
          </div>

          {/* Voice selector */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {VOICE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedVoice(opt.value)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors cursor-pointer ${
                  selectedVoice === opt.value
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border-muted text-text-subtle hover:border-border hover:text-text-muted'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Embedded input */}
          <ChatInput
            onSubmit={handleSubmit}
            onStop={inputProps.onStop}
            isStreaming={inputProps.isStreaming}
            disabled={inputProps.disabled}
            disabledMessage={inputProps.disabledMessage}
            embedded
            placeholder="What do you want to write about?"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-xs text-text-subtle">
          This app is unofficial and not endorsed by Quilibrium Inc.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chat/WriterWelcome.tsx
git commit -m "feat(writer): add Writer Mode welcome screen component"
```

---

### Task 4: Writer Mode Chip Component

**Files:**
- Create: `src/components/chat/WriterModeChip.tsx`

- [ ] **Step 1: Create the chip component**

```tsx
// src/components/chat/WriterModeChip.tsx
'use client';

/**
 * Persistent chip shown near the input bar when in Writer Mode.
 * Signals to the user that they're in a writing session.
 */
export function WriterModeChip() {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs">
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
        />
      </svg>
      <span>Writer</span>
      <span className="text-accent/60">Beta</span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chat/WriterModeChip.tsx
git commit -m "feat(writer): add Writer Mode chip indicator component"
```

---

### Task 5: Add `placeholder` Prop to ChatInput

**Files:**
- Modify: `src/components/chat/ChatInput.tsx`

The ChatInput currently has a hardcoded placeholder. Writer Mode needs to override it.

- [ ] **Step 1: Add optional `placeholder` prop**

In `src/components/chat/ChatInput.tsx`, add the prop to the interface and use it:

```typescript
// In ChatInputProps interface (line 8), add:
interface ChatInputProps {
  onSubmit: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled: boolean;
  disabledMessage?: string;
  /** When true, renders without outer padding/background for embedding in empty state */
  embedded?: boolean;
  /** Override the default placeholder text */
  placeholder?: string;
}
```

Then update the destructuring (line 26) to include `placeholder`:

```typescript
export function ChatInput({
  onSubmit,
  onStop,
  isStreaming,
  disabled,
  disabledMessage,
  embedded = false,
  placeholder,
}: ChatInputProps) {
```

And update the `placeholderText` logic (line 81):

```typescript
  const placeholderText = disabled
    ? disabledMessage || 'Enter your API key to start chatting...'
    : isStreaming
      ? 'Waiting for response...'
      : placeholder || 'Ask a question about Quilibrium...';
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chat/ChatInput.tsx
git commit -m "feat(writer): add placeholder prop to ChatInput component"
```

---

### Task 6: Add Writer Pill to MessageList Empty State

**Files:**
- Modify: `src/components/chat/MessageList.tsx`

- [ ] **Step 1: Add Writer pill and writer mode state to props**

Add to the `MessageListProps` interface (around line 18):

```typescript
interface MessageListProps {
  messages: UIMessage[];
  status: ChatStatus;
  error: Error | null;
  rateLimitError?: RateLimitError | null;
  onQuickAction?: (command: string) => void;
  thinkingSteps?: ThinkingStep[];
  followUpQuestions?: string[];
  correctionIssueUrl?: string | null;
  ragQuality?: 'high' | 'low' | 'none' | null;
  inputProps?: {
    onSubmit: (text: string) => void;
    onStop: () => void;
    isStreaming: boolean;
    disabled: boolean;
    disabledMessage?: string;
  };
  /** Whether the Writer Mode feature gate is enabled */
  writerFeatureEnabled?: boolean;
  /** Callback when user clicks the Writer pill */
  onEnterWriterMode?: () => void;
}
```

- [ ] **Step 2: Add the Writer pill to the quick actions area**

In the empty state rendering (around line 134), add the Writer pill after the existing quick action buttons:

```tsx
{/* Quick action buttons */}
{onQuickAction && (
  <div className="flex flex-wrap justify-center gap-2 mb-10">
    {QUICK_ACTIONS.map((action) => (
      <button
        key={action.command}
        onClick={() => onQuickAction(action.command)}
        className="px-4 py-2 text-sm rounded-full border border-border hover:bg-hover hover:border-border-strong transition-colors text-text-muted cursor-pointer"
        title={action.description}
      >
        {action.label}
      </button>
    ))}
    {writerFeatureEnabled && onEnterWriterMode && (
      <button
        onClick={onEnterWriterMode}
        className="px-4 py-2 text-sm rounded-full border border-border hover:bg-hover hover:border-border-strong transition-colors text-text-muted cursor-pointer flex items-center gap-1.5"
        title="Write social posts about Quilibrium"
      >
        Writer
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/15 text-accent leading-none">
          Beta
        </span>
      </button>
    )}
  </div>
)}
```

- [ ] **Step 3: Update the function signature to destructure new props**

```typescript
export function MessageList({
  messages, status, error, rateLimitError, onQuickAction,
  thinkingSteps = [], followUpQuestions = [], correctionIssueUrl,
  ragQuality, inputProps, writerFeatureEnabled, onEnterWriterMode,
}: MessageListProps) {
```

- [ ] **Step 4: Commit**

```bash
git add src/components/chat/MessageList.tsx
git commit -m "feat(writer): add Writer pill to empty state in MessageList"
```

---

### Task 7: Wire Writer Mode into ChatContainer

**Files:**
- Modify: `src/components/chat/ChatContainer.tsx`

This is the central integration task. ChatContainer needs to:
1. Accept writer mode state from the parent
2. Show WriterWelcome when in writer mode with no messages
3. Pass mode/voice flags in the transport body
4. Show the WriterModeChip in the input area

- [ ] **Step 1: Add writer mode props to ChatContainerProps**

```typescript
interface ChatContainerProps {
  providerId: string;
  onProviderChange: (providerId: string) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  model: string;
  conversationId: string | null;
  turnstileToken: string | null;
  /** Writer Mode state */
  isWriterMode?: boolean;
  writerVoice?: string;
  writerFeatureEnabled?: boolean;
  onEnterWriterMode?: () => void;
}
```

- [ ] **Step 2: Pass mode/voice flags in the transport body**

In the `prepareSendMessagesRequest` function (around line 165), add the writer mode flags to the body:

```typescript
prepareSendMessagesRequest({ messages: reqMessages }) {
  return {
    body: {
      messages: reqMessages,
      provider: providerId,
      apiKey,
      model,
      embeddingModel: providerId === 'chutes' ? chutesEmbeddingModel : undefined,
      chutesApiKey: chutesExternalApiKey || undefined,
      priorityDocIds: extractPriorityDocIds(reqMessages),
      turnstileToken: turnstileTokenRef.current || undefined,
      // Writer Mode flags
      mode: isWriterMode ? 'writer' : undefined,
      writerVoice: isWriterMode ? writerVoice : undefined,
    },
  };
},
```

Note: `isWriterMode` and `writerVoice` need to be accessed via refs (like `turnstileToken`) to avoid stale closure issues in the memoized transport. Add refs:

```typescript
const writerModeRef = useRef(isWriterMode);
const writerVoiceRef = useRef(writerVoice);
useEffect(() => { writerModeRef.current = isWriterMode; }, [isWriterMode]);
useEffect(() => { writerVoiceRef.current = writerVoice; }, [writerVoice]);
```

Then use `writerModeRef.current` and `writerVoiceRef.current` in the transport body.

- [ ] **Step 3: Pass writer props to MessageList**

In the MessageList rendering (around line 481), pass the writer props:

```tsx
<MessageList
  messages={messages}
  status={status}
  error={error}
  rateLimitError={rateLimitError}
  onQuickAction={handleQuickAction}
  thinkingSteps={thinkingSteps}
  followUpQuestions={followUpQuestions}
  correctionIssueUrl={correctionIssueUrl}
  ragQuality={ragQuality}
  inputProps={inputProps}
  writerFeatureEnabled={writerFeatureEnabled}
  onEnterWriterMode={onEnterWriterMode}
/>
```

- [ ] **Step 4: Add WriterModeChip to the bottom input area**

In the bottom ChatInput section (around line 485), add the chip when in writer mode:

```tsx
{messages.length > 0 && (
  <div>
    {isWriterMode && (
      <div className="flex justify-center py-1">
        <WriterModeChip />
      </div>
    )}
    <ChatInput
      onSubmit={handleInputSubmit}
      onStop={handleStop}
      isStreaming={isStreaming}
      disabled={!hasAccess}
      disabledMessage={disabledMessage}
      placeholder={isWriterMode ? 'What do you want to write about?' : undefined}
    />
  </div>
)}
```

Add import at top of file:

```typescript
import { WriterModeChip } from './WriterModeChip';
```

- [ ] **Step 5: Commit**

```bash
git add src/components/chat/ChatContainer.tsx
git commit -m "feat(writer): wire Writer Mode state into ChatContainer"
```

---

### Task 8: Wire Writer Mode into page.tsx

**Files:**
- Modify: `app/page.tsx`

The page component is the top-level orchestrator. It needs to initialize the writer mode hook and pass state down.

- [ ] **Step 1: Import and use the hook**

Add to imports:

```typescript
import { useWriterMode } from '@/src/hooks/useWriterMode';
import { WriterWelcome } from '@/src/components/chat/WriterWelcome';
```

Inside the component, add:

```typescript
const { featureEnabled, isWriterMode, voice, enterWriterMode, exitWriterMode } = useWriterMode();
```

- [ ] **Step 2: Reset writer mode when creating a new conversation**

In the handler where a new conversation is created (look for `addConversation` calls), add `exitWriterMode()`:

```typescript
// When user clicks "New Chat" or similar
const handleNewConversation = () => {
  exitWriterMode();
  // ... existing new conversation logic
};
```

- [ ] **Step 3: Pass writer props to ChatContainer**

```tsx
<ChatContainer
  providerId={providerId}
  onProviderChange={handleProviderChange}
  apiKey={apiKey}
  onApiKeyChange={handleApiKeyChange}
  model={currentModel}
  conversationId={activeId}
  turnstileToken={turnstileToken}
  isWriterMode={isWriterMode}
  writerVoice={voice}
  writerFeatureEnabled={featureEnabled}
  onEnterWriterMode={() => enterWriterMode('casual')}
/>
```

- [ ] **Step 4: Handle Writer Mode welcome screen**

The WriterWelcome screen needs to be shown when the user clicks the Writer pill but hasn't sent a message yet. This needs to be coordinated between page.tsx and ChatContainer.

The approach: when `onEnterWriterMode` is called from the Writer pill, set `isWriterMode` to true. In ChatContainer, when `isWriterMode` is true and there are no messages, render WriterWelcome instead of the normal empty state.

In ChatContainer, add the WriterWelcome rendering logic in the MessageList area. When `isWriterMode && messages.length === 0`:

```tsx
{isWriterMode && messages.length === 0 && !isStreaming ? (
  <WriterWelcome
    onSelectVoiceAndStart={(v) => {
      // Voice already set via enterWriterMode, just start
    }}
    onInspireMe={(v) => {
      handleInputSubmit('[INSPIRE_ME]');
    }}
    onCheckDraft={(v) => {
      // Set placeholder to "Paste your draft below..." and focus input
      // The user types/pastes their draft and submits
    }}
    inputProps={{
      onSubmit: handleInputSubmit,
      onStop: handleStop,
      isStreaming: false,
      disabled: !hasAccess,
      disabledMessage: disabledMessage,
    }}
  />
) : (
  <MessageList ... />
)}
```

Note: The `[INSPIRE_ME]` marker is handled in the API route as a special case that triggers the "Inspire me" prompt. Similarly, "Check my draft" just focuses the input with a different placeholder.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx src/components/chat/ChatContainer.tsx
git commit -m "feat(writer): wire Writer Mode into page.tsx and handle welcome screen"
```

---

### Task 9: Handle Writer Mode in the Chat API Route

**Files:**
- Modify: `app/api/chat/route.ts`

- [ ] **Step 1: Import the writer prompt builders**

Add at top of file:

```typescript
import {
  buildWriterSystemPrompt,
  buildInspireMePrompt,
  buildDraftCheckPrompt,
} from '@/src/lib/rag/writerPrompt';
import type { WriterVoice } from '@/src/hooks/useWriterMode';
```

- [ ] **Step 2: Extract mode/voice from request body**

After the existing body parsing (around line 546), add:

```typescript
const writerMode = body.mode === 'writer';
const writerVoice: WriterVoice = writerMode
  ? (['casual', 'technical', 'storyteller', 'enthusiast'].includes(body.writerVoice)
    ? body.writerVoice
    : 'casual')
  : 'casual';
```

- [ ] **Step 3: Detect special writer commands**

After the existing command handling (around line 602), add writer mode command detection:

```typescript
// Writer Mode special commands
const isInspireMe = writerMode && rawUserQuery === '[INSPIRE_ME]';
const isDraftCheck = writerMode && rawUserQuery.startsWith('[CHECK_DRAFT]');
```

Override the query sent to RAG based on mode:

```typescript
// For Inspire Me: broad retrieval for diverse topics
// For Draft Check: use the actual draft text (strip prefix) as the retrieval query
// For normal writer requests: use the topic as-is
const draftText = isDraftCheck ? rawUserQuery.replace('[CHECK_DRAFT]', '').trim() : '';
const ragQuery = isInspireMe
  ? 'recent Quilibrium updates features announcements releases new'
  : isDraftCheck
    ? draftText
    : userQuery;
```

Use `ragQuery` instead of `userQuery` when calling `prepareQuery()`. For draft checks, also pass `draftText` as the user message content to the LLM (not the prefixed version).

- [ ] **Step 4: Swap system prompt based on mode**

After `prepareQuery()` returns (around line 788), swap the system prompt if in writer mode:

```typescript
if (writerMode) {
  const { context } = buildContextBlock(chunks);
  if (isInspireMe) {
    systemPrompt = buildInspireMePrompt(context);
  } else if (isDraftCheck) {
    systemPrompt = buildDraftCheckPrompt(context);
  } else {
    systemPrompt = buildWriterSystemPrompt(context, chunks.length, writerVoice);
  }
}
```

Note: We rebuild the context from chunks because `prepareQuery` already gives us the chunks. We need the raw context string for the writer prompt builders. Import `buildContextBlock` if not already imported (it's in `prompt.ts` which is already imported).

- [ ] **Step 5: Skip follow-up question parsing for writer mode**

In the response stream processing, the follow-up question JSON extraction should be skipped for writer mode since the writer prompt doesn't generate them. The simplest way is to not parse follow-up JSON from writer mode responses.

After the LLM response text is accumulated, add a guard:

```typescript
// Skip follow-up question parsing for writer mode
if (!writerMode) {
  // existing follow-up question parsing logic
}
```

- [ ] **Step 6: Commit**

```bash
git add app/api/chat/route.ts
git commit -m "feat(writer): handle Writer Mode in chat API route with prompt swapping"
```

---

### Task 10: Handle "Inspire Me" and "Check My Draft" Flows in ChatContainer

**Files:**
- Modify: `src/components/chat/ChatContainer.tsx`

- [ ] **Step 1: Implement the Inspire Me and Check Draft handlers**

In ChatContainer, the WriterWelcome component needs proper handlers:

```typescript
const handleInspireMe = useCallback(() => {
  // Send the special inspire-me marker
  handleInputSubmit('[INSPIRE_ME]');
}, [handleInputSubmit]);

const handleCheckDraft = useCallback(() => {
  // For "Check my draft", we don't send anything yet.
  // We just need to signal that the next user message is a draft to check.
  // Set a state flag that changes the placeholder text.
  setCheckDraftMode(true);
}, []);
```

Add state:

```typescript
const [checkDraftMode, setCheckDraftMode] = useState(false);
```

When `checkDraftMode` is true, the ChatInput placeholder changes to "Paste your draft below..." and when the user submits, prefix the message with `[CHECK_DRAFT]`:

```typescript
const handleInputSubmit = useCallback((text: string) => {
  let finalText = text;
  if (checkDraftMode && isWriterMode) {
    finalText = '[CHECK_DRAFT]' + text;
    setCheckDraftMode(false);
  }
  // ... existing submit logic using finalText
}, [checkDraftMode, isWriterMode]);
```

Update the ChatInput placeholder in the bottom input:

```typescript
placeholder={
  isWriterMode
    ? checkDraftMode
      ? 'Paste your draft below...'
      : 'What do you want to write about?'
    : undefined
}
```

- [ ] **Step 2: Update WriterWelcome rendering with proper handlers**

```tsx
<WriterWelcome
  onSelectVoiceAndStart={enterWriterMode}
  onInspireMe={handleInspireMe}
  onCheckDraft={handleCheckDraft}
  inputProps={{
    onSubmit: (text) => {
      enterWriterMode(selectedVoice); // lock voice
      handleInputSubmit(text);
    },
    onStop: handleStop,
    isStreaming: false,
    disabled: !hasAccess,
    disabledMessage: disabledMessage,
  }}
/>
```

- [ ] **Step 3: Handle [CHECK_DRAFT] prefix in API route**

In `app/api/chat/route.ts`, detect the `[CHECK_DRAFT]` prefix and strip it:

```typescript
const isDraftCheck = writerMode && rawUserQuery.startsWith('[CHECK_DRAFT]');
const cleanedQuery = isDraftCheck ? rawUserQuery.replace('[CHECK_DRAFT]', '') : rawUserQuery;
```

Use `cleanedQuery` for RAG retrieval (the draft text itself becomes the retrieval query, which will match against claims in the draft).

- [ ] **Step 4: Commit**

```bash
git add src/components/chat/ChatContainer.tsx app/api/chat/route.ts
git commit -m "feat(writer): implement Inspire Me and Check Draft flows"
```

---

### Task 11: Integration Testing

**Files:**
- No new files. Manual testing.

- [ ] **Step 1: Start dev server**

```bash
yarn dev
```

- [ ] **Step 2: Test feature gate**

1. Open `http://localhost:3000` — verify Writer pill is NOT visible
2. Open `http://localhost:3000?writer=true` — verify Writer pill appears with Beta badge
3. Refresh the page without `?writer` — verify Writer pill still appears (localStorage gate)
4. Clear localStorage and refresh — verify Writer pill disappears

- [ ] **Step 3: Test Writer Mode flow**

1. Click Writer pill — verify screen transforms (tagline, pills, voice selector)
2. Select "Technical" voice — verify it highlights
3. Type "Write about MegaRPC" — verify bot generates a post (not a Q&A answer)
4. Verify the post doesn't contain banned words (search for "delve", "robust", etc.)
5. Verify the post has varied sentence lengths (burstiness)
6. Verify source citations appear
7. Copy button works on the generated post

- [ ] **Step 4: Test Inspire Me flow**

1. Enter Writer Mode
2. Click "Inspire me" — verify bot suggests 3-5 topics
3. Type one of the suggested topics — verify bot writes a post about it

- [ ] **Step 5: Test Check Draft flow**

1. Enter Writer Mode
2. Click "Check my draft" — verify placeholder changes to "Paste your draft below..."
3. Paste a draft with a mix of correct and incorrect claims about Quilibrium
4. Verify bot identifies accurate, inaccurate, and unverifiable claims

- [ ] **Step 6: Test voice variation**

1. Generate a post about the same topic with each voice (Casual, Technical, Storyteller, Enthusiast)
2. Verify each sounds distinctly different in tone, vocabulary, and sentence structure

- [ ] **Step 7: Test anti-hallucination**

1. Ask Writer Mode to write about a topic with very little in the knowledge base
2. Verify the bot refuses or clearly states it doesn't have enough information

- [ ] **Step 8: Test Writer Mode persistence**

1. Enter Writer Mode and send a message
2. Verify "Writer Beta" chip appears near input
3. Verify the chip persists throughout the conversation
4. Click "New Chat" — verify Writer Mode resets (back to normal Q&A with Writer pill available)

- [ ] **Step 9: Commit any fixes from testing**

```bash
git add -A
git commit -m "fix(writer): fixes from integration testing"
```

---

### Task 12: Update .agents Documentation

**Files:**
- Modify: `.agents/INDEX.md`

- [ ] **Step 1: Add Writer Mode to the docs index**

Add under the Features section in `.agents/INDEX.md`:

```markdown
### Features
- [RAG Confidence Indicator](docs/features/rag-confidence-indicator.md)
- [Writer Mode](tasks/2026-03-30-writer-mode-design.md) — Gated beta feature for generating social media posts with voice variation and strict anti-hallucination
```

- [ ] **Step 2: Commit**

```bash
git add -f .agents/INDEX.md
git commit -m "docs: add Writer Mode to .agents index"
```

---

*Last updated: 2026-03-30*
