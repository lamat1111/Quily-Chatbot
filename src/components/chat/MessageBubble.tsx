'use client';

import { memo, useMemo } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { SourcesCitation } from './SourcesCitation';
import { CopyButton } from '@/src/components/ui/CopyButton';
import { Icon } from '@/src/components/ui/Icon';
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
 * Chat message bubble with role-based styling (Claude-style layout).
 *
 * - User messages: right-aligned, in a subtle box
 * - Assistant messages: full width, no box, copy button in footer
 *
 * Memoized to prevent re-renders when other messages in the list update.
 */
export const MessageBubble = memo(function MessageBubble({
  message,
  isStreaming = false,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';

  // Memoize text extraction to avoid recalculating on every render
  const textContent = useMemo(() => getTextContent(message), [message.parts]);
  const sources = useMemo(() => getSources(message), [message.parts]);

  if (isUser) {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-[85%] sm:max-w-[70%] bg-surface/10 dark:bg-surface/15 text-text-primary rounded-2xl px-4 py-3">
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
    <div className="mb-6 text-text-primary">
      <MarkdownRenderer content={textContent} isStreaming={isStreaming} />

      {/* Sources - show above footer */}
      {!isStreaming && sources.length > 0 && (
        <div className="mt-4">
          <SourcesCitation sources={sources} />
        </div>
      )}

      {/* Footer with copy button and disclaimer - only show after streaming completes */}
      {!isStreaming && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          {textContent && (
            <CopyButton
              text={textContent}
              size="lg"
              variant="minimal"
            />
          )}
          <p className="flex items-center gap-2 text-sm text-text-muted">
            <Icon name="alert-circle" size={16} className="shrink-0" />
            <span>
              Always verify with{' '}
              <a
                href="https://docs.quilibrium.com"
                target="_blank"
                rel="noopener noreferrer"
                className="link-muted"
              >
                official docs
              </a>
            </span>
          </p>
        </div>
      )}
    </div>
  );
});
