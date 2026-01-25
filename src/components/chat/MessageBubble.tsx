'use client';

import { MarkdownRenderer } from './MarkdownRenderer';
import { SourcesCitation } from './SourcesCitation';
import { CopyButton } from '@/src/components/ui/CopyButton';
import type { UIMessage } from '@ai-sdk/react';

interface MessageBubbleProps {
  message: UIMessage;
  isStreaming?: boolean;
}

/**
 * Extract text content from UIMessage parts array.
 * UIMessage in AI SDK v6 uses parts[] instead of content string.
 */
function getTextContent(message: UIMessage): string {
  if (!message.parts) return '';

  const textParts = message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text);

  return textParts.join('');
}

/**
 * Extract source-url parts from UIMessage.
 */
function getSources(message: UIMessage): Array<{ sourceId: string; url: string; title?: string }> {
  if (!message.parts) return [];

  return message.parts
    .filter((part): part is { type: 'source-url'; sourceId: string; url: string; title?: string } =>
      part.type === 'source-url'
    )
    .map((part) => ({
      sourceId: part.sourceId,
      url: part.url,
      title: part.title,
    }));
}

/**
 * Chat message bubble with role-based styling.
 *
 * - User messages: blue background, white text
 * - Assistant messages: gray background, dark text, with markdown rendering
 *
 * Both are left-aligned per design requirements.
 */
export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  // Extract text and sources from message parts
  const textContent = getTextContent(message);
  const sources = getSources(message);

  if (isUser) {
    return (
      <div className="flex justify-start mb-4">
        <div className="max-w-[95%] sm:max-w-[80%] bg-blue-600 text-white rounded-2xl rounded-bl-sm px-4 py-3">
          <p className="whitespace-pre-wrap">{textContent}</p>
        </div>
      </div>
    );
  }

  // Assistant message - don't render if no text content yet (sources may have arrived first)
  if (!textContent && isStreaming) {
    return null;
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[95%] sm:max-w-[80%] bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
        {/* Header with copy button */}
        <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Quily</span>
          {textContent && (
            <CopyButton
              text={textContent}
              size="sm"
              variant="default"
              className="opacity-70 hover:opacity-100"
            />
          )}
        </div>

        <MarkdownRenderer content={textContent} />

        {/* Show sources after streaming completes */}
        {!isStreaming && sources.length > 0 && (
          <SourcesCitation sources={sources} />
        )}
      </div>
    </div>
  );
}
