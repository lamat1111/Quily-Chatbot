---
type: report
title: "Frontend UI & Styling Architecture"
ai_generated: true
reviewed_by: null
created: 2026-01-29
updated: 2026-01-29
related_docs:
  - ".agents/docs/rag-knowledge-base-workflow.md"
related_tasks: []
---

# Frontend UI & Styling Architecture

> **⚠️ AI-Generated**: May contain errors. Verify before use.

## Executive Summary

The Quilibrium Chat frontend is a modern Next.js 16 application with React 19, built with **Tailwind CSS v4.1** for styling, **next-themes** for dark/light mode support, and **Zustand** for state management. The architecture emphasizes component reusability, performance optimization through memoization, and responsive mobile-first design.

**Key Technologies:**
- Next.js 16.1.4 with React 19.2.3
- Tailwind CSS v4.1.18 (PostCSS plugin)
- Zustand 5.0.10 (state management with localStorage persistence)
- next-themes 0.4.6 (class-based dark/light mode)
- Radix UI (accessible modals)
- Iconify with Feather Icons (icon system)

---

## 1. UI Components Inventory

### Component Structure Overview

**Location**: `src/components/`
**Total Components**: 19 TSX files organized in 5 subdirectories

### 1.1 Chat Components (`src/components/chat/`)

| Component | File | Purpose | Key Features |
|-----------|------|---------|--------------|
| **ChatContainer** | [ChatContainer.tsx](src/components/chat/ChatContainer.tsx) | Main orchestrator for chat UI | Manages useChat hook, message streaming, conversation loading, debounced state updates (300ms) |
| **ChatInput** | [ChatInput.tsx](src/components/chat/ChatInput.tsx) | Text input with auto-resize | Auto-expanding textarea, Shift+Enter for multiline, Enter/Cmd+Enter to submit, max-height 12rem |
| **MessageBubble** | [MessageBubble.tsx](src/components/chat/MessageBubble.tsx) | Individual message display | Role-based styling (user right-aligned, assistant full-width), copy button, source citations, memoized |
| **MessageList** | [MessageList.tsx](src/components/chat/MessageList.tsx) | Scrollable message container | Auto-scroll with throttling (100ms), typing indicator, error display, empty state with quick actions |
| **MarkdownRenderer** | [MarkdownRenderer.tsx](src/components/chat/MarkdownRenderer.tsx) | Markdown to HTML converter | Syntax highlighting (Prism), theme-aware code blocks, GFM support, debounced streaming (50ms) |
| **ProviderSetup** | [ProviderSetup.tsx](src/components/chat/ProviderSetup.tsx) | AI provider selection & auth | Multi-step flow for OpenRouter (API key) & Chutes (OAuth), API key validation |
| **SourcesCitation** | [SourcesCitation.tsx](src/components/chat/SourcesCitation.tsx) | Citation display for RAG | Lists sources with URLs from message parts |
| **TypingIndicator** | [TypingIndicator.tsx](src/components/chat/TypingIndicator.tsx) | Animated typing dots | Visual feedback during streaming |

### 1.2 Sidebar Components (`src/components/sidebar/`)

| Component | File | Purpose | Key Features |
|-----------|------|---------|--------------|
| **Sidebar** | [Sidebar.tsx](src/components/sidebar/Sidebar.tsx) | Main navigation sidebar | w-72 desktop, full-width mobile overlay, collapsible nav items on scroll |
| **ConversationList** | [ConversationList.tsx](src/components/sidebar/ConversationList.tsx) | Chat history list | Scrollable, delete capability, auto-generated titles from first user message |
| **ModelSelector** | [ModelSelector.tsx](src/components/sidebar/ModelSelector.tsx) | Model dropdown for OpenRouter | Displays RECOMMENDED_MODELS list with friendly names |
| **ApiKeyConfig** | [ApiKeyConfig.tsx](src/components/sidebar/ApiKeyConfig.tsx) | API key management | Trigger for ApiKeyModal, validation feedback |

### 1.3 Layout Components (`src/components/layout/`)

| Component | File | Purpose | Key Features |
|-----------|------|---------|--------------|
| **AppLayout** | [AppLayout.tsx](src/components/layout/AppLayout.tsx) | Root layout wrapper | Flexbox layout with sidebar + main content, mobile header offset (pt-14) |

### 1.4 UI Components (`src/components/ui/`)

| Component | File | Purpose | Key Features |
|-----------|------|---------|--------------|
| **Icon** | [Icon.tsx](src/components/ui/Icon.tsx) | Icon system using Iconify | Feather Icons default (287 icons), supports custom icon sets |
| **ThemeToggle** | [ThemeToggle.tsx](src/components/ui/ThemeToggle.tsx) | Light/dark mode switcher | Hydration-safe, sun/moon icons, uses next-themes |
| **CopyButton** | [CopyButton.tsx](src/components/ui/CopyButton.tsx) | Copy to clipboard button | Three variants: default, ghost, minimal; three sizes: sm/md/lg |
| **Skeleton** | [Skeleton.tsx](src/components/ui/Skeleton.tsx) | Loading placeholder | Base Skeleton + specialized: MessageListSkeleton, ConversationListSkeleton |
| **ApiKeyModal** | [ApiKeyModal.tsx](src/components/ui/ApiKeyModal.tsx) | API key config dialog | Radix Dialog, validation feedback, stores in localStorage |

### 1.5 Provider Components (`src/components/providers/`)

| Component | File | Purpose | Key Features |
|-----------|------|---------|--------------|
| **ThemeProvider** | [ThemeProvider.tsx](src/components/providers/ThemeProvider.tsx) | Theme context provider | next-themes with class-based dark mode, default to dark theme |

---

## 2. Styling Architecture

### 2.1 Styling Framework: Tailwind CSS v4.1

**PostCSS Config**: [postcss.config.mjs](postcss.config.mjs)
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

**Key Facts**:
- Using Tailwind CSS v4.1 with PostCSS plugin
- No separate tailwind.config.js file (uses PostCSS v4 defaults)
- All styling through utility classes and custom CSS variables

### 2.2 Global Styles & Theme Variables

**File**: [globals.css](app/globals.css) (345 lines)

#### Brand Color Palette

**Light Theme (default):**
```css
:root {
  --brand-accent: #FF6000;              /* Primary orange */
  --brand-accent-hover: #E55500;        /* Darker orange */
  --brand-secondary: #40001B;           /* Deep burgundy */
  --brand-secondary-light: #5A0026;     /* Lighter burgundy */
  --brand-gradient-from: #8B2942;       /* Burgundy for gradients */
  --brand-gradient-to: #FF6000;         /* Orange gradient end */
  --brand-text-primary: #40001B;        /* Burgundy text */
  --brand-text-secondary: #5A0026;
  --brand-text-muted: #6B3344;
  --brand-surface: #40001B;
}
```

**Dark Theme:**
```css
.dark {
  --brand-accent: #D4601A;              /* Warm orange */
  --brand-accent-hover: #C05515;
  --brand-secondary: #5A0026;           /* Burgundy */
  --brand-gradient-from: #5A0026;       /* Burgundy to orange gradient */
  --brand-gradient-to: #D4601A;
  --brand-text-primary: #f3f4f6;        /* Light gray text */
  --brand-text-secondary: #e5e7eb;
  --brand-text-muted: #9ca3af;
  --brand-surface: #9ca3af;
}
```

#### Tailwind Theme Integration

Colors registered as Tailwind custom properties:
- `--color-accent` / `--color-accent-hover`
- `--color-secondary` / `--color-secondary-light`
- `--color-gradient-from/to/from-hover/to-hover`
- `--color-text-primary/secondary/muted`
- `--color-surface`
- Font: `--font-title` (Jost)

**Usage in Tailwind**: `bg-accent`, `text-accent`, `hover:bg-accent/10`, etc.

### 2.3 Custom Scrollbar Classes

Five specialized scrollbar classes with WebKit and Firefox support:

| Class | Purpose | Light Theme | Dark Theme |
|-------|---------|-------------|------------|
| `.code-scrollbar` | Code block scrollbars | gray-400 | gray-700 |
| `.sidebar-scrollbar` | Sidebar scrollbars | gray-300 | gray-600 |
| `.chat-scrollbar` | Message list scrollbars | gray-300 | gray-600 |
| `.input-scrollbar` | Input textarea scrollbars | transparent | gray-600 |
| `.modal-scrollbar` | Modal scrollbars | gray-300 | gray-600 |

---

## 3. Theming Implementation

### 3.1 Theme Provider Setup

**File**: [ThemeProvider.tsx](src/components/providers/ThemeProvider.tsx)

```typescript
<NextThemesProvider
  attribute="class"           // Uses class-based theming
  defaultTheme="dark"         // Dark mode by default
  enableSystem                // Respects OS system preference
  disableTransitionOnChange   // No color flash during switch
/>
```

**How it works**:
- Adds `.dark` class to `<html>` element
- All dark theme styles trigger from `.dark` selector
- localStorage persists user's theme choice
- System preference detection via `enableSystem`

### 3.2 Dark Mode Pattern

Throughout the codebase, dark mode uses `.dark:` prefixes:

```typescript
// Common patterns
bg-gray-50 dark:bg-gray-900           // Backgrounds
border-gray-200 dark:border-gray-700  // Borders
text-gray-900 dark:text-gray-100      // Text
hover:bg-surface/10 dark:hover:bg-surface/15  // Interactive states
```

---

## 4. Component Styling Patterns

### 4.1 Button Styles

**Primary Gradient Button** (ChatInput, ProviderSetup)
```typescript
className="bg-gradient-to-br from-gradient-from to-gradient-to
           hover:from-gradient-from-hover hover:to-gradient-to-hover
           disabled:bg-gray-600 disabled:from-gray-600 disabled:to-gray-600
           text-white font-medium transition-colors"
```

**Secondary Button**
```typescript
className="border border-gray-300 dark:border-gray-600
           hover:bg-surface/10 dark:hover:bg-surface/15
           rounded-lg transition-colors cursor-pointer"
```

**Accent Button** (New Chat)
```typescript
className="text-accent hover:bg-accent/10 dark:hover:bg-accent/15
           rounded-lg transition-colors"
```

### 4.2 Input Styles

**Standard Text Input**
```typescript
className="px-4 py-3 text-sm rounded-lg border bg-surface/5 dark:bg-surface/10
           text-text-primary placeholder-gray-400 dark:placeholder-gray-500
           focus:outline-none focus:border-accent dark:focus:border-accent
           transition-colors"
```

**Textarea with Auto-resize** (ChatInput)
```typescript
className="flex-1 min-w-0 resize-none rounded-xl border
           bg-surface/5 dark:bg-surface/10 px-3 sm:px-4 py-3
           focus:outline-none focus:border-gray-400 dark:focus:border-gray-500
           min-h-12 max-h-48 overflow-hidden input-scrollbar"
```

### 4.3 Message Bubbles

**User Message** ([MessageBubble.tsx:67](src/components/chat/MessageBubble.tsx#L67))
```typescript
className="max-w-[85%] sm:max-w-[70%] bg-surface/10 dark:bg-surface/15
           text-text-primary rounded-2xl px-4 py-3"
```

**Assistant Message**
- Full width, no background box
- Markdown rendered content
- Copy button in footer after streaming ends

### 4.4 Modal & Dialog Styling

**ApiKeyModal** (Radix Dialog)
```typescript
// Overlay
className="fixed inset-0 bg-black/70 z-50"

// Content
className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
           w-full max-w-md bg-white dark:bg-gray-800 rounded-xl p-6 z-50
           shadow-xl"
```

---

## 5. Responsive Design & Layout

### 5.1 Mobile-First Breakpoints

Using Tailwind defaults:
- **sm**: 640px (tablets)
- **lg**: 1024px (desktops)
- **xl/2xl**: Larger screens

### 5.2 Layout Examples

**Sidebar Responsive** ([Sidebar.tsx](src/components/sidebar/Sidebar.tsx))
```typescript
// Mobile: fixed overlay, w-72
// Desktop (lg+): static, always visible
className="fixed lg:static inset-y-0 left-0 z-40 w-72
           transform transition-transform duration-200"
```

**Mobile Header** ([Sidebar.tsx](src/components/sidebar/Sidebar.tsx))
```typescript
// Only shows on mobile, pt-14 offset in main layout
className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14"
```

**Chat Layout** ([ChatInput.tsx](src/components/chat/ChatInput.tsx))
```typescript
className="flex gap-2 sm:gap-3 items-end"  // Responsive gap
className="px-3 sm:px-4 py-3"               // Responsive padding
className="hidden sm:inline"                 // Hide on mobile
```

---

## 6. Typography Configuration

### 6.1 Font Setup

**File**: [layout.tsx:7-17](app/layout.tsx#L7-L17)

```typescript
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jost = Jost({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jost',
});

// Applied to <html> element:
<html className={`${inter.variable} ${jost.variable}`}>
```

**CSS Variables Created**:
- `--font-inter`: Inter font for body text
- `--font-jost`: Jost font for titles

### 6.2 Typography Scale

| Element | Classes | Size | Weight |
|---------|---------|------|--------|
| h1 | `text-2xl font-bold` | 24px | 700 |
| h2 | `text-xl font-bold` | 20px | 700 |
| h3 | `text-lg font-bold` | 18px | 700 |
| Body | `text-sm` or `text-base` | 14-16px | 400 |
| Button | `text-sm font-medium` | 14px | 500 |
| Small | `text-xs` | 12px | 400 |

---

## 7. Icon System

### 7.1 Icon Component

**File**: [Icon.tsx](src/components/ui/Icon.tsx)
**Library**: Iconify with Feather Icons default

**Icon Sets Available**:
1. **Feather Icons** (default, 287 icons) - e.g., `<Icon name="plus" />`
2. **Streamline Logos** - e.g., `<Icon name="streamline-logos:discord" />`
3. **Simple Icons** - e.g., `<Icon name="simple-icons:github" />`

**Icons Used in App**:
- `plus`, `menu`, `x`, `info`, `link`, `settings` (feather:*)
- `sun`, `moon`, `check`, `copy`, `alert-circle` (feather:*)
- `chevron-right`, `chevron-left` (feather:*)

---

## 8. Custom Hooks

| Hook | File | Purpose |
|------|------|---------|
| **useScrollAnchor** | [useScrollAnchor.ts](src/hooks/useScrollAnchor.ts) | Manages auto-scroll in chat, respects user scroll position, throttles updates |
| **useLocalStorage** | [useLocalStorage.ts](src/hooks/useLocalStorage.ts) | Persistent state with hydration safety |
| **useCopyToClipboard** | [useCopyToClipboard.ts](src/hooks/useCopyToClipboard.ts) | Clipboard operations with feedback |
| **useChutesSession** | [useChutesSession.ts](src/hooks/useChutesSession.ts) | Chutes OAuth session management |
| **useChutesModels** | [useChutesModels.ts](src/hooks/useChutesModels.ts) | Fetch available Chutes models |

---

## 9. State Management

### 9.1 Zustand Store - Conversation Management

**File**: [conversationStore.ts](src/stores/conversationStore.ts) (191 lines)

```typescript
interface ConversationStore {
  conversations: Conversation[];
  activeId: string | null;
  _hasHydrated: boolean;

  // Actions
  addConversation(title?: string): string;
  setActive(id: string | null): void;
  updateMessages(id: string, messages: Message[]): void;
  updateTitle(id: string, title: string): void;
  deleteConversation(id: string): void;
  getActiveConversation(): Conversation | null;
}
```

**Features**:
- Persists to localStorage with `persist` middleware
- Max 50 conversations (auto-removes oldest)
- Auto-generates titles from first user message
- Debounced message updates during streaming (300ms)

---

## 10. Performance Optimizations

### 10.1 Memoization Patterns

**MessageBubble** ([MessageBubble.tsx:54](src/components/chat/MessageBubble.tsx#L54))
```typescript
export const MessageBubble = memo(function MessageBubble({ ... }) {
  // Prevent re-renders when sibling messages update
});
```

**MarkdownRenderer** ([MarkdownRenderer.tsx:80](src/components/chat/MarkdownRenderer.tsx#L80))
```typescript
export const MarkdownRenderer = memo(function MarkdownRenderer({ ... }) {
  // Debounced rendering during streaming (50ms)
});
```

**CodeBlock** ([MarkdownRenderer.tsx:24](src/components/chat/MarkdownRenderer.tsx#L24))
```typescript
const CodeBlock = memo(function CodeBlock({ ... }) {
  // Prevent syntax highlighter reinitialize on every render
});
```

### 10.2 Debouncing Strategies

| Feature | Debounce Time | Purpose |
|---------|---------------|---------|
| Store updates during streaming | 300ms | Reduce cascade re-renders |
| Markdown rendering during streaming | 50ms | Smooth live preview |
| Scroll updates during streaming | 100ms (throttle) | Reduce layout thrashing |

### 10.3 Lazy Loading & Hydration

- **hydration-safe pattern**: Components wait for `_hasHydrated` flag
- **localStorage hydration**: `useLocalStorage` returns hydration status
- **Skeleton loading**: ChatSkeleton shown during initial hydration

---

## 11. Accessibility Features

### 11.1 ARIA Labels & Semantic HTML
- `aria-label` on icon buttons (theme toggle, menu, etc.)
- `role="status"` on loading skeletons
- `aria-hidden="true"` on decorative elements

### 11.2 Focus Management
- Focus trap in modals (Radix Dialog)
- Focus ring styling with `focus:ring-2 focus:ring-accent`
- Accessible form labels with `htmlFor`

### 11.3 Keyboard Navigation
- Escape key stops streaming
- Enter submits message (Shift+Enter for multiline)
- Cmd+Enter also submits (Mac users)

---

## 12. Design Tokens Reference

### 12.1 Color System

**Brand Colors**:
| Token | Light | Dark |
|-------|-------|------|
| Accent | #FF6000 | #D4601A |
| Secondary | #40001B | #5A0026 |
| Gradient From | #8B2942 | #5A0026 |
| Gradient To | #FF6000 | #D4601A |

**Neutral Grays** (Tailwind):
| Token | Light | Dark |
|-------|-------|------|
| Background | gray-50 (#f9fafb) | gray-900 (#111827) |
| Borders | gray-200 | gray-700 |

### 12.2 Spacing Scale (Tailwind)
- **p-2, p-3, p-4, p-6**: Padding variants
- **gap-2, gap-3**: Flexbox gaps
- **mb-2, mb-4, mb-6**: Margin bottom
- **space-y-2, space-y-4**: Vertical spacing between children

### 12.3 Border Radius
| Class | Value | Usage |
|-------|-------|-------|
| `rounded-lg` | 8px | Buttons, inputs |
| `rounded-xl` | 12px | Cards, modals |
| `rounded-2xl` | 16px | Message bubbles |
| `rounded-full` | 100% | Pills, badges |

---

## 13. File Organization & Conventions

### 13.1 Directory Structure

```
src/
├── components/
│   ├── chat/              # Chat UI components
│   ├── sidebar/           # Navigation & history
│   ├── layout/            # Layout wrappers
│   ├── ui/                # Reusable UI elements
│   └── providers/         # Context providers
├── hooks/                 # Custom React hooks
├── stores/                # Zustand stores
├── lib/                   # Utility functions & APIs
└── styles/                # (None: all in globals.css)

app/
├── layout.tsx             # Root layout with fonts & theme
├── globals.css            # Theme & global styles
├── page.tsx               # Home page
└── api/                   # API routes
```

### 13.2 Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `ChatContainer.tsx` |
| Hooks | camelCase with `use` prefix | `useLocalStorage.ts` |
| Stores | camelCase | `conversationStore.ts` |
| CSS Classes | kebab-case | `.sidebar-scrollbar` |

---

## 14. Component Composition Examples

### 14.1 Chat Message Rendering Pipeline

```
ChatContainer (orchestrates streaming)
  ↓
MessageList (scrollable container)
  ├─ Empty state (with quick actions)
  ├─ MessageBubble (for each message)
  │  ├─ User message (right-aligned box)
  │  └─ Assistant message
  │     ├─ MarkdownRenderer (renders content)
  │     │  ├─ CodeBlock (with syntax highlighting)
  │     │  ├─ Headings, lists, blockquotes (styled)
  │     │  └─ Links (accent colored)
  │     ├─ SourcesCitation (RAG sources)
  │     └─ CopyButton + disclaimer footer
  ├─ TypingIndicator (during streaming)
  └─ Error message (if applicable)
```

### 14.2 Sidebar Composition

```
Sidebar
  ├─ Mobile header bar (lg:hidden)
  │  ├─ Menu button
  │  ├─ Title "Quily Chat"
  │  └─ ThemeToggle
  ├─ Sidebar (aside element)
  │  ├─ Header
  │  │  ├─ Title + beta badge
  │  │  └─ ThemeToggle (desktop)
  │  ├─ Navigation
  │  │  ├─ New Chat button (always visible)
  │  │  └─ Links: About, Quilibrium Links (collapse on scroll)
  │  ├─ ConversationList (scrollable, fills space)
  │  └─ Settings button (fixed at bottom)
  └─ Mobile backdrop (z-30)
```

---

## 15. Key Dependencies

### UI & Styling
| Package | Version | Purpose |
|---------|---------|---------|
| tailwindcss | 4.1.18 | Styling framework |
| next-themes | 0.4.6 | Dark mode support |
| @radix-ui/react-dialog | 1.1.15 | Accessible modals |
| @iconify/react | 6.0.2 | Icon system |

### Markdown & Code
| Package | Version | Purpose |
|---------|---------|---------|
| react-markdown | 10.1.0 | Markdown rendering |
| remark-gfm | 4.0.1 | GitHub Flavored Markdown |
| react-syntax-highlighter | 16.1.0 | Code highlighting |

### State & Data
| Package | Version | Purpose |
|---------|---------|---------|
| zustand | 5.0.10 | State management |
| @ai-sdk/react | 3.0.51 | Chat integration |
| react-intersection-observer | 10.0.2 | Scroll detection |

---

## Summary

| Aspect | Implementation |
|--------|----------------|
| **Framework** | Next.js 16.1.4 with React 19.2.3 |
| **Styling** | Tailwind CSS v4.1 |
| **State Management** | Zustand (with localStorage persistence) |
| **Theme** | next-themes (class-based dark/light) |
| **Components** | 19 React components (memoized where needed) |
| **Typography** | Inter (body) + Jost (titles) |
| **Icon System** | Iconify with Feather Icons default |
| **Markdown** | react-markdown + Prism syntax highlighting |
| **Modals** | Radix UI Dialog |
| **Hooks** | 5 custom hooks for common patterns |
| **Color Palette** | Orange (#FF6000) + Burgundy (#40001B) brand |
| **Accessibility** | ARIA labels, semantic HTML, keyboard nav |
| **Performance** | Memoization, debouncing, lazy hydration |

---

_Created: 2026-01-29_
_Report Type: Architecture Documentation_
