'use client';

import { useMemo, useState, useEffect, useRef, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';
import { useTheme } from 'next-themes';
import { CopyButton } from '@/src/components/ui/CopyButton';

interface MarkdownRendererProps {
  content: string;
  /** Whether the content is actively streaming (enables debouncing) */
  isStreaming?: boolean;
}

/** Debounce delay for markdown parsing during streaming (ms) */
const STREAMING_DEBOUNCE_MS = 50;

/**
 * Memoized code block component to prevent re-initialization of syntax highlighter
 */
const CodeBlock = memo(function CodeBlock({
  language,
  code,
  isDark,
}: {
  language: string;
  code: string;
  isDark: boolean;
}) {
  return (
    <div className="group relative my-4 rounded-lg border border-border overflow-hidden">
      <CopyButton
        text={code}
        size="sm"
        variant="ghost"
        className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <SyntaxHighlighter
        style={isDark ? oneDark : oneLight}
        language={language}
        PreTag="div"
        className="code-scrollbar"
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'transparent',
          overflow: 'auto',
        }}
        codeTagProps={{
          style: {
            background: 'transparent',
          },
        }}
        lineProps={{
          style: {
            background: 'transparent',
          },
        }}
        wrapLines={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
});

/**
 * Renders markdown content with syntax-highlighted code blocks.
 *
 * Features:
 * - GitHub Flavored Markdown support (tables, strikethrough, etc.)
 * - Syntax highlighting for code blocks with hover-reveal copy button
 * - Inline code with gray background
 * - Styled headings, lists, links, paragraphs
 * - Debounced rendering during streaming for better performance
 */
export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  isStreaming = false,
}: MarkdownRendererProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Debounced content for streaming - only update every STREAMING_DEBOUNCE_MS
  const [debouncedContent, setDebouncedContent] = useState(content);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isStreaming) {
      // Not streaming - update immediately
      setDebouncedContent(content);
      return;
    }

    // Streaming - debounce updates
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedContent(content);
    }, STREAMING_DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, isStreaming]);

  // When streaming stops, ensure we show the final content
  useEffect(() => {
    if (!isStreaming && content !== debouncedContent) {
      setDebouncedContent(content);
    }
  }, [isStreaming, content, debouncedContent]);

  // Memoize components object to prevent recreation on every render
  const components: Components = useMemo(
    () => ({
      code({ className, children, ...props }) {
        // Detect language from className (pattern: language-xxx)
        const match = /language-(\w+)/.exec(className || '');
        const language = match ? match[1] : null;

        // Check if it's a code block (has language) vs inline code
        const isBlock = language !== null;

        if (isBlock) {
          // Pre-compute code string for both SyntaxHighlighter and CopyButton
          const codeString = String(children).replace(/\n$/, '');
          return <CodeBlock language={language} code={codeString} isDark={isDark} />;
        }

        // Inline code - theme-aware background
        return (
          <code
            className="bg-bg-inset px-1.5 py-0.5 rounded text-sm font-mono"
            {...props}
          >
            {children}
          </code>
        );
      },

      h1({ children }) {
        return (
          <h1 className="text-2xl font-bold mt-6 mb-4 first:mt-0">{children}</h1>
        );
      },

      h2({ children }) {
        return <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>;
      },

      h3({ children }) {
        return <h3 className="text-lg font-bold mt-4 mb-2">{children}</h3>;
      },

      h4({ children }) {
        return <h4 className="text-base font-bold mt-3 mb-2">{children}</h4>;
      },

      p({ children }) {
        return <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>;
      },

      ul({ children }) {
        return <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>;
      },

      ol({ children }) {
        return <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>;
      },

      li({ children }) {
        return <li className="leading-relaxed">{children}</li>;
      },

      a({ href, children }) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline break-all"
          >
            {children}
          </a>
        );
      },

      blockquote({ children }) {
        return (
          <blockquote className="border-l-4 border-border-strong pl-4 my-4 italic text-text-muted">
            {children}
          </blockquote>
        );
      },

      table({ children }) {
        return (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full border-collapse border border-border">
              {children}
            </table>
          </div>
        );
      },

      th({ children }) {
        return (
          <th className="border border-border px-4 py-2 bg-bg-subtle font-semibold text-left">
            {children}
          </th>
        );
      },

      td({ children }) {
        return (
          <td className="border border-border px-4 py-2">
            {children}
          </td>
        );
      },

      hr() {
        return <hr className="my-6 border-border" />;
      },
    }),
    [isDark]
  );

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert wrap-break-word overflow-wrap-anywhere">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {debouncedContent}
      </ReactMarkdown>
    </div>
  );
});
