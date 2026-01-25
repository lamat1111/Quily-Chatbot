'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

/**
 * Renders markdown content with syntax-highlighted code blocks.
 *
 * Features:
 * - GitHub Flavored Markdown support (tables, strikethrough, etc.)
 * - Syntax highlighting for code blocks
 * - Inline code with gray background
 * - Styled headings, lists, links, paragraphs
 */
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const components: Components = {
    code({ className, children, ...props }) {
      // Detect language from className (pattern: language-xxx)
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : null;

      // Check if it's a code block (has language) vs inline code
      const isBlock = language !== null;

      if (isBlock) {
        return (
          <SyntaxHighlighter
            style={oneDark}
            language={language}
            PreTag="div"
            className="rounded-md my-4"
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        );
      }

      // Inline code
      return (
        <code
          className="bg-gray-300 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono"
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
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          {children}
        </a>
      );
    },

    blockquote({ children }) {
      return (
        <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic text-gray-500 dark:text-gray-400">
          {children}
        </blockquote>
      );
    },

    table({ children }) {
      return (
        <div className="overflow-x-auto my-4">
          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
            {children}
          </table>
        </div>
      );
    },

    th({ children }) {
      return (
        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-100 dark:bg-gray-700 font-semibold text-left">
          {children}
        </th>
      );
    },

    td({ children }) {
      return (
        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
          {children}
        </td>
      );
    },

    hr() {
      return <hr className="my-6 border-gray-300 dark:border-gray-600" />;
    },
  };

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
