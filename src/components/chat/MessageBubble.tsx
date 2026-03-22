'use client';

import { memo, useMemo } from 'react';
import { hasCitations } from '@/src/lib/rag/utils';
import { MarkdownRenderer } from './MarkdownRenderer';
import { SourcesCitation } from './SourcesCitation';
import { FollowUpQuestions } from './FollowUpQuestions';
import { CopyButton } from '@/src/components/ui/CopyButton';
import { Icon } from '@/src/components/ui/Icon';
import type { UIMessage } from '@ai-sdk/react';

interface MessageBubbleProps {
  message: UIMessage;
  isStreaming?: boolean;
  followUpQuestions?: string[];
  onFollowUpSelect?: (question: string) => void;
  /** URL of auto-created GitHub issue from a correction */
  correctionIssueUrl?: string;
  /** RAG quality signal for confidence callout */
  ragQuality?: 'high' | 'low' | 'none' | null;
}

/**
 * Regex to match JSON code fence with follow-up questions at end of response.
 * Strips this from display since it's only for parsing follow-ups.
 */
const FOLLOW_UP_CODE_FENCE_REGEX = /```json\s*\n?\s*\[[\s\S]*?\]\s*\n?```\s*$/;

/**
 * Regex to match bare JSON follow-up questions (no code fence).
 * Matches: json\n["q1", "q2"] or just a bare JSON array at end of response.
 * Mirrors BARE_JSON_REGEX in followUpParser.ts.
 */
const BARE_FOLLOW_UP_REGEX = /\n\s*json\s*\n?\s*\["[\s\S]*?"\s*\]\s*$/;

/**
 * Regex to match partial/in-progress JSON code fence during streaming.
 * Catches: ```json, ```json\n[, ```json\n["..., etc.
 */
const PARTIAL_FOLLOW_UP_REGEX = /```json\s*\n?\s*\[?[\s\S]*$/;

/**
 * Regex to match partial bare JSON follow-up during streaming.
 * Catches: json\n[, json ["..., etc.
 */
const PARTIAL_BARE_FOLLOW_UP_REGEX = /\n\s*json\s*\n?\s*\[?[^\]]*$/;

/**
 * Regex to strip raw tool call text that some models output instead of structured calls.
 * Catches garbage tokens, special unicode separators, and the JSON payload.
 * Examples:
 *   "فتรfunction<｜tool▁sep｜>create_knowledge_issue json {"title": "..."}"
 *   "kontsultatua nostfunction<｜tool▁sep｜>create_knowledge_issue json {"title": "..."}"
 */
const TOOL_CALL_TEXT_REGEX = /[^\n]*create_knowledge_issue[\s\S]*$/;

/**
 * Partial tool call during streaming — catches the beginning of a tool call being typed.
 */
const PARTIAL_TOOL_CALL_REGEX = /[^\n]*create_knowledge_issue[^\n]*$/;

/**
 * Extract text content from UIMessage parts array.
 * UIMessage in AI SDK v6 uses parts[] instead of content string.
 * Also strips follow-up JSON block if present (complete or partial during streaming).
 */
function getTextContent(message: UIMessage, isStreaming: boolean = false): string {
  if (!message.parts) return '';

  const textParts = message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text);

  const fullText = textParts.join('');

  // DEBUG: log text content to diagnose follow-up stripping
  if (fullText.includes('json') && fullText.includes('[')) {
    console.log('[MessageBubble] fullText ends with:', JSON.stringify(fullText.slice(-300)));
    console.log('[MessageBubble] isStreaming:', isStreaming);
    console.log('[MessageBubble] BARE match:', /\n\s*json\s*\n?\s*\["[\s\S]*?"\s*\]\s*$/.test(fullText));
    console.log('[MessageBubble] FENCE match:', /```json\s*\n?\s*\[[\s\S]*?\]\s*\n?```\s*$/.test(fullText));
  }

  // Strip follow-up JSON block and raw tool call text from display
  // During streaming, also strip partial blocks that are being typed
  if (isStreaming) {
    return fullText
      .replace(PARTIAL_FOLLOW_UP_REGEX, '')
      .replace(PARTIAL_BARE_FOLLOW_UP_REGEX, '')
      .replace(PARTIAL_TOOL_CALL_REGEX, '')
      .trimEnd();
  }
  return fullText
    .replace(FOLLOW_UP_CODE_FENCE_REGEX, '')
    .replace(BARE_FOLLOW_UP_REGEX, '')
    .replace(TOOL_CALL_TEXT_REGEX, '')
    .trimEnd();
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
  followUpQuestions,
  onFollowUpSelect,
  correctionIssueUrl,
  ragQuality,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';

  // Memoize text extraction to avoid recalculating on every render
  // Pass isStreaming to handle partial JSON blocks during streaming
  const textContent = useMemo(() => getTextContent(message, isStreaming), [message.parts, isStreaming]);
  const sources = useMemo(() => getSources(message), [message.parts]);

  // Determine if confidence warning should show:
  // Only when response has citations AND quality is low/none
  const showConfidenceWarning = useMemo(() => {
    if (!ragQuality || ragQuality === 'high') return false;
    return hasCitations(textContent);
  }, [ragQuality, textContent]);

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

      {/* Confidence warning - only for low/none quality with citations */}
      {!isStreaming && showConfidenceWarning && (
        <div className="mt-4 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm text-text-secondary">
          <span className="mr-1">⚠️</span>
          {ragQuality === 'none'
            ? "I couldn't find strong documentation for this — take this with a grain of salt."
            : 'This answer may not be fully supported by our docs — double-check the sources below.'}
        </div>
      )}

      {/* Sources - show above footer */}
      {!isStreaming && sources.length > 0 && (
        <div className="mt-4">
          <SourcesCitation sources={sources} />
        </div>
      )}

      {/* Correction issue notification */}
      {!isStreaming && correctionIssueUrl && (
        <div className="mt-4 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-text-secondary">
          <a
            href={correctionIssueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-unstyled font-medium"
          >
            GitHub issue created
          </a>
          {' — thanks for helping me get smarter.'}
        </div>
      )}

      {/* Follow-up questions - show after sources */}
      {!isStreaming && followUpQuestions && followUpQuestions.length > 0 && onFollowUpSelect && (
        <FollowUpQuestions
          questions={followUpQuestions}
          onSelect={onFollowUpSelect}
        />
      )}

      {/* Disclaimer callout - only show after streaming completes (suppressed when confidence warning shown) */}
      {!isStreaming && !showConfidenceWarning && (
        <div className="callout-info mt-4 text-base sm:text-sm">
          <p>
            I can make mistakes, always check the{' '}
            <a
              href="https://docs.quilibrium.com"
              target="_blank"
              rel="noopener noreferrer"
              className="link-unstyled"
            >
              official docs
            </a>
            . If I&apos;m wrong, tell me the right answer and I&apos;ll flag it for review.
          </p>
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
