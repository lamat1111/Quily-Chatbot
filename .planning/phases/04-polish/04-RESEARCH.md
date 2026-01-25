# Phase 4: Polish - Research

**Researched:** 2026-01-25
**Domain:** UX polish features (clipboard, keyboard shortcuts, modals, theming, loading states)
**Confidence:** HIGH

## Summary

This phase implements quality-of-life features that improve the daily usage experience of the chat application. The research covers five main domains:

1. **Copy to Clipboard** - Using the native Clipboard API (`navigator.clipboard.writeText()`) with a custom `useCopyToClipboard` hook for code blocks and entire message copying
2. **Keyboard Shortcuts** - React useEffect pattern with `ctrlKey`/`metaKey` detection for cross-platform Ctrl/Cmd+Enter (send) and Escape (stop)
3. **Modal Dialogs** - Radix UI Dialog component (`@radix-ui/react-dialog`) for accessible API key configuration modal
4. **Dark/Light Mode** - `next-themes` package with Tailwind CSS 4.x `@custom-variant` for class-based dark mode toggle
5. **Loading Skeletons** - Tailwind's `animate-pulse` utility with matching placeholder shapes

The existing codebase already has some skeleton patterns in `app/page.tsx` that can be extended. The MarkdownRenderer component with react-syntax-highlighter will be enhanced with copy buttons.

**Primary recommendation:** Use native browser APIs (Clipboard API) and established libraries (Radix UI for dialogs, next-themes for theming) rather than hand-rolling solutions. All features rely on Tailwind CSS for styling consistency.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @radix-ui/react-dialog | ^1.1.15 | Accessible modal dialogs | Full React 19 support, WAI-ARIA compliant, focus trapping |
| next-themes | ^0.4.x | Theme management (dark/light/system) | Built for Next.js App Router, handles hydration, localStorage |
| Clipboard API | Native | Copy text to clipboard | Modern browser standard, promise-based, no dependencies |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx | ^2.1.1 | Conditional classnames | Already in project - use for theme-aware styling |
| usehooks-ts | Optional | useCopyToClipboard hook | Could use, but simple enough to implement ourselves |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @radix-ui/react-dialog | @headlessui/react | Headless UI has React 19 peer dependency issues |
| next-themes | Manual localStorage + class toggle | next-themes handles hydration edge cases, SSR, system preference |
| native Clipboard API | react-copy-to-clipboard | Adds dependency for trivial functionality |

**Installation:**
```bash
npm install @radix-ui/react-dialog next-themes
```

**Note:** The project already has Tailwind CSS 4.x, React 19, and Next.js 16 installed. No TypeScript types packages needed as Radix UI includes types.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── chat/
│   │   ├── MarkdownRenderer.tsx    # Add CodeBlock with copy button
│   │   ├── MessageBubble.tsx       # Add "copy message" button
│   │   ├── ChatInput.tsx           # Add keyboard shortcut handling
│   │   └── ChatContainer.tsx       # Add global keyboard listeners
│   ├── sidebar/
│   │   └── ApiKeyConfig.tsx        # Move to modal trigger
│   ├── ui/
│   │   ├── Modal.tsx               # Radix Dialog wrapper
│   │   ├── ThemeToggle.tsx         # Theme switch button
│   │   ├── CopyButton.tsx          # Reusable copy button
│   │   └── Skeleton.tsx            # Skeleton loading components
│   └── providers/
│       └── ThemeProvider.tsx       # next-themes provider wrapper
├── hooks/
│   └── useCopyToClipboard.ts       # Custom clipboard hook
└── app/
    ├── layout.tsx                  # Add ThemeProvider
    └── globals.css                 # Add @custom-variant for dark mode
```

### Pattern 1: Copy Button with Feedback
**What:** A button that copies text and shows visual feedback (checkmark for 2 seconds)
**When to use:** Code blocks, message copy buttons
**Example:**
```typescript
// Source: usehooks-ts pattern + native Clipboard API
'use client';

import { useState, useCallback } from 'react';

export function useCopyToClipboard() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      return true;
    } catch (error) {
      console.warn('Copy failed', error);
      setCopiedText(null);
      return false;
    }
  }, []);

  return { copiedText, copy };
}
```

### Pattern 2: Cross-Platform Keyboard Shortcuts
**What:** Detect Ctrl+Enter (Windows/Linux) or Cmd+Enter (Mac) for submit, Escape for cancel
**When to use:** Chat input, global app shortcuts
**Example:**
```typescript
// Source: MDN KeyboardEvent documentation
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Escape to stop streaming
    if (e.key === 'Escape') {
      e.preventDefault();
      handleStop();
      return;
    }

    // Ctrl/Cmd+Enter to send (when not in textarea)
    const isModifier = e.ctrlKey || e.metaKey;
    if (isModifier && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [handleStop, handleSubmit]);
```

### Pattern 3: Radix Dialog Modal
**What:** Accessible modal with overlay, focus trap, and escape-to-close
**When to use:** API key configuration, settings dialogs
**Example:**
```typescript
// Source: Radix UI Primitives documentation
import * as Dialog from '@radix-ui/react-dialog';

export function ApiKeyModal({ children }: { children: React.ReactNode }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                   bg-gray-800 rounded-xl p-6 w-full max-w-md z-50
                                   focus:outline-none">
          <Dialog.Title className="text-lg font-semibold text-white">
            Configure API Key
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-400 mt-2">
            Enter your OpenRouter API key to start chatting.
          </Dialog.Description>
          {/* Form content */}
          <Dialog.Close asChild>
            <button aria-label="Close" className="absolute top-4 right-4">
              <XIcon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

### Pattern 4: next-themes with Tailwind CSS 4.x
**What:** Theme provider with class-based dark mode and localStorage persistence
**When to use:** App-wide theming
**Example:**
```typescript
// ThemeProvider.tsx - must be 'use client'
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

// In app/layout.tsx
<html lang="en" suppressHydrationWarning>
  <body>
    <ThemeProvider>{children}</ThemeProvider>
  </body>
</html>

// In app/globals.css (Tailwind CSS 4.x syntax)
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

### Pattern 5: Theme Toggle with Hydration Safety
**What:** Theme toggle button that avoids hydration mismatch
**When to use:** Header, sidebar theme controls
**Example:**
```typescript
// Source: next-themes documentation
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-9 h-9" />; // Placeholder
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-2 rounded-lg bg-gray-700 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-500"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
```

### Anti-Patterns to Avoid
- **Hardcoded colors instead of theme-aware:** Use `bg-white dark:bg-gray-900` not `bg-gray-900`
- **Checking Ctrl only for keyboard shortcuts:** Mac users expect Cmd key - always check both `ctrlKey || metaKey`
- **Rendering theme UI before hydration:** Causes hydration mismatch - use mounted check
- **execCommand for clipboard:** Deprecated - use `navigator.clipboard.writeText()`
- **Custom focus trap:** Use Radix Dialog's built-in focus management

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal dialogs | Custom div with z-index | @radix-ui/react-dialog | Focus trap, escape handling, a11y, portal rendering |
| Theme persistence | localStorage + useEffect | next-themes | Handles SSR, hydration, system preference, flash prevention |
| Keyboard shortcut conflicts | Global key listeners | Scoped event handlers | Browser reserves many shortcuts (Cmd+T, Cmd+W) |
| Clipboard fallback | execCommand fallback | navigator.clipboard only | execCommand deprecated, Clipboard API widely supported |
| Loading animations | Custom CSS keyframes | Tailwind animate-pulse | Consistent, accessible (respects prefers-reduced-motion) |

**Key insight:** Modal accessibility is notoriously complex (focus trap, screen reader announcements, escape handling, click-outside detection). Radix UI has solved these problems with extensive testing. Similarly, next-themes handles edge cases like preventing theme flash on load that are tedious to get right manually.

## Common Pitfalls

### Pitfall 1: Hydration Mismatch with Theme
**What goes wrong:** Theme toggle renders wrong icon on first paint, console shows hydration error
**Why it happens:** Server renders with no theme knowledge, client has localStorage theme
**How to avoid:** Use mounted state check, render placeholder until client-side mounted
**Warning signs:** React hydration warnings in console, flash of wrong theme

### Pitfall 2: Keyboard Shortcuts Not Working on Mac
**What goes wrong:** Ctrl+Enter works on Windows but not Mac
**Why it happens:** Mac users expect Cmd key (metaKey) not Ctrl
**How to avoid:** Check both: `e.ctrlKey || e.metaKey`
**Warning signs:** Mac user complaints, testing only on Windows

### Pitfall 3: Copy Button in Markdown Code Blocks
**What goes wrong:** Copy button steals focus, markdown re-renders lose button state
**Why it happens:** react-markdown re-renders on any prop change
**How to avoid:** Extract CodeBlock as separate component with its own state
**Warning signs:** Button state resets during streaming, focus jumps unexpectedly

### Pitfall 4: Modal Closing During Form Interaction
**What goes wrong:** Clicking inside form fields closes the modal
**Why it happens:** Click events bubbling to overlay, or misconfigured close triggers
**How to avoid:** Use Dialog.Content properly, don't put onClose on wrong element
**Warning signs:** Modal closes when trying to click input fields

### Pitfall 5: Skeleton Not Matching Content Layout
**What goes wrong:** Jarring transition when content loads
**Why it happens:** Skeleton dimensions don't match actual content
**How to avoid:** Skeleton shapes should mirror actual content structure
**Warning signs:** Layout shift when loading completes

### Pitfall 6: Copy Feedback Not Clearing
**What goes wrong:** "Copied!" stays visible forever
**Why it happens:** No timeout to reset copied state
**How to avoid:** Use setTimeout to clear feedback after 2 seconds
**Warning signs:** Multiple copy buttons showing "Copied!" simultaneously

## Code Examples

Verified patterns from official sources:

### CodeBlock with Copy Button
```typescript
// Enhanced code block for MarkdownRenderer
// Source: react-markdown components customization + Clipboard API
'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  language: string;
  children: string;
}

export function CodeBlock({ language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  return (
    <div className="relative group my-4">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 p-2 rounded bg-gray-700 hover:bg-gray-600
                   opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Copy code"
      >
        {copied ? (
          <CheckIcon className="w-4 h-4 text-green-400" />
        ) : (
          <ClipboardIcon className="w-4 h-4 text-gray-300" />
        )}
      </button>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        className="rounded-md"
      >
        {children.replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
}
```

### Skeleton Loading Component
```typescript
// Source: Tailwind CSS animation docs + Flowbite patterns
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      role="status"
      className={`animate-pulse bg-gray-700 dark:bg-gray-600 rounded ${className}`}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Usage for message list skeleton
export function MessageListSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {/* User message skeleton */}
      <div className="flex justify-start">
        <Skeleton className="h-12 w-48 rounded-2xl" />
      </div>
      {/* Assistant message skeleton */}
      <div className="flex justify-start">
        <div className="space-y-2 max-w-[80%]">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}
```

### API Key Modal with OpenRouter Info
```typescript
// Source: Radix UI Dialog documentation
import * as Dialog from '@radix-ui/react-dialog';

export function ApiKeyModal() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="text-sm text-blue-400 hover:underline">
          Configure API Key
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50
                                   data-[state=open]:animate-in
                                   data-[state=closed]:animate-out" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                   w-full max-w-md bg-gray-800 rounded-xl p-6 z-50
                                   shadow-xl focus:outline-none">
          <Dialog.Title className="text-lg font-semibold text-white">
            OpenRouter API Key
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-400 mt-2 mb-4">
            This app uses{' '}
            <a
              href="https://openrouter.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              OpenRouter
            </a>
            {' '}to access AI models. Create a free account to get your API key.
          </Dialog.Description>

          {/* API Key Input Form */}
          <ApiKeyForm />

          <div className="mt-4 text-sm text-gray-400">
            <a
              href="https://openrouter.ai/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Get your API key from OpenRouter
            </a>
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 p-1 rounded hover:bg-gray-700"
              aria-label="Close"
            >
              <XIcon className="w-5 h-5 text-gray-400" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| document.execCommand('copy') | navigator.clipboard.writeText() | Deprecated ~2020 | execCommand still works but not recommended |
| Tailwind darkMode: 'class' in config | @custom-variant dark (&:where(.dark, .dark *)) | Tailwind CSS 4.0 | CSS-based config, no JS config file needed |
| @headlessui/react for dialogs | @radix-ui/react-dialog | React 19 compatibility issues with Headless UI | Radix has full React 19 support |
| Custom theme context | next-themes | next-themes handles SSR/hydration | Avoids flash of wrong theme |

**Deprecated/outdated:**
- `document.execCommand('copy')`: Deprecated, use Clipboard API instead
- Tailwind CSS 3.x `darkMode: 'class'` config: In Tailwind 4.x, use `@custom-variant` in CSS
- `navigator.platform` for OS detection: Deprecated, but still works; alternatively check both modifier keys

## Open Questions

Things that couldn't be fully resolved:

1. **Animation duration for theme transitions**
   - What we know: next-themes has `disableTransitionOnChange` option
   - What's unclear: Whether to animate theme changes or make them instant
   - Recommendation: Start with `disableTransitionOnChange: true` for snappier feel

2. **Skeleton during streaming vs just for initial load**
   - What we know: Current page.tsx shows skeleton during hydration
   - What's unclear: Should streaming messages also show partial skeletons?
   - Recommendation: Only skeleton for initial load; streaming shows actual partial content

3. **Where to place theme toggle**
   - What we know: Needs to be accessible, not buried in settings
   - What's unclear: Sidebar header vs main header vs floating button
   - Recommendation: Add to sidebar header near API key config section

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS Dark Mode Documentation](https://tailwindcss.com/docs/dark-mode) - @custom-variant syntax
- [Radix UI Dialog Primitives](https://www.radix-ui.com/primitives/docs/components/dialog) - Dialog component API
- [Headless UI Dialog](https://headlessui.com/react/dialog) - Alternative reference (not recommended due to React 19 issues)
- [next-themes GitHub](https://github.com/pacocoursey/next-themes) - ThemeProvider setup
- [MDN Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText) - Native clipboard
- [usehooks-ts useCopyToClipboard](https://usehooks-ts.com/react-hook/use-copy-to-clipboard) - Hook pattern

### Secondary (MEDIUM confidence)
- [Flowbite Skeleton Components](https://flowbite.com/docs/components/skeleton/) - Tailwind skeleton patterns
- [Radix UI React 19 Compatibility](https://github.com/radix-ui/primitives/issues/2900) - Version compatibility confirmed

### Tertiary (LOW confidence)
- Various blog posts on keyboard shortcuts - patterns consistent but verify with MDN

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All recommendations from official docs
- Architecture: HIGH - Patterns from library documentation
- Pitfalls: MEDIUM - Based on documented issues and common patterns

**Research date:** 2026-01-25
**Valid until:** 2026-02-25 (30 days - stable domain, no fast-moving changes expected)
