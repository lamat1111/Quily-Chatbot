'use client';

import { useEffect, useRef, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import { ThinkingProcess, ThinkingStep } from './ThinkingProcess';
import { ChatInput } from './ChatInput';
import { useScrollAnchor } from '@/src/hooks/useScrollAnchor';
import type { UIMessage } from '@ai-sdk/react';
import { Logo } from '@/src/components/ui/Logo';

type ChatStatus = 'submitted' | 'streaming' | 'ready' | 'error';

interface MessageListProps {
  messages: UIMessage[];
  status: ChatStatus;
  error: Error | null;
  onQuickAction?: (command: string) => void;
  thinkingSteps?: ThinkingStep[];
  followUpQuestions?: string[];
  /** Input props for embedding in empty state */
  inputProps?: {
    onSubmit: (text: string) => void;
    onStop: () => void;
    isStreaming: boolean;
    disabled: boolean;
    disabledMessage?: string;
  };
}

/** Throttle interval for scroll updates during streaming (ms) */
const SCROLL_THROTTLE_MS = 100;

/**
 * Quick action buttons for the empty chat state
 */
const QUICK_ACTIONS = [
  { command: '/help', label: 'Help', description: 'See available commands' },
  { command: '/examples', label: 'Examples', description: 'Example questions' },
  { command: '/sources', label: 'Sources', description: 'View knowledge sources' },
];

/**
 * Scrollable message list with auto-scroll behavior.
 *
 * Features:
 * - Auto-scrolls during streaming (only if user is at bottom)
 * - Shows typing indicator during streaming
 * - Displays error messages
 * - Empty state for new conversations
 * - Throttled scroll updates during streaming to reduce layout thrashing
 */
export function MessageList({ messages, status, error, onQuickAction, thinkingSteps = [], followUpQuestions = [], inputProps }: MessageListProps) {
  const {
    scrollRef,
    anchorRef,
    isAtBottom,
    scrollToBottomImmediate,
  } = useScrollAnchor();

  const isStreaming = status === 'streaming' || status === 'submitted';

  // Throttle refs for scroll during streaming
  const lastScrollTime = useRef<number>(0);
  const scrollThrottleRef = useRef<NodeJS.Timeout | null>(null);

  // Throttled scroll function for streaming
  const throttledScroll = useCallback(() => {
    const now = Date.now();
    if (now - lastScrollTime.current >= SCROLL_THROTTLE_MS) {
      scrollToBottomImmediate();
      lastScrollTime.current = now;
    } else if (!scrollThrottleRef.current) {
      // Schedule a scroll at the end of the throttle window
      scrollThrottleRef.current = setTimeout(() => {
        scrollToBottomImmediate();
        lastScrollTime.current = Date.now();
        scrollThrottleRef.current = null;
      }, SCROLL_THROTTLE_MS - (now - lastScrollTime.current));
    }
  }, [scrollToBottomImmediate]);

  // Cleanup throttle timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollThrottleRef.current) {
        clearTimeout(scrollThrottleRef.current);
      }
    };
  }, []);

  // Auto-scroll when streaming and user is at bottom (throttled)
  useEffect(() => {
    if (isStreaming && isAtBottom) {
      throttledScroll();
    }
  }, [messages, isStreaming, isAtBottom, throttledScroll]);

  // Scroll to bottom when new message is added (user sends message)
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        scrollToBottomImmediate();
      }
    }
  }, [messages.length, scrollToBottomImmediate]);

  // Empty state - centered welcome with embedded input
  if (messages.length === 0 && !isStreaming) {
    return (
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col bg-bg-base chat-scrollbar"
      >
        {/* Centered content area */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-text-muted w-full max-w-xl px-4">
            <div className="flex items-start justify-center gap-1 mb-2">
              <Logo height={56} />
              <span className="text-xs font-medium text-accent mt-3">beta</span>
            </div>
            <p className="mb-6">Ask a question about Quilibrium to get started</p>

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
              </div>
            )}

            {/* Embedded chat input */}
            {inputProps && (
              <ChatInput
                onSubmit={inputProps.onSubmit}
                onStop={inputProps.onStop}
                isStreaming={inputProps.isStreaming}
                disabled={inputProps.disabled}
                disabledMessage={inputProps.disabledMessage}
                embedded
              />
            )}
          </div>
        </div>

        {/* Footer with disclaimers */}
        <div className="text-center py-4">
          <p className="text-xs text-text-subtle">
            Quily can make mistakes. Verify important info with{' '}
            <a
              href="https://docs.quilibrium.com"
              target="_blank"
              rel="noopener noreferrer"
              className="link-muted"
            >
              official docs
            </a>
            .
          </p>
          <p className="text-xs text-text-subtle mt-1">
            This app is unofficial and not endorsed by Quilibrium Inc.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 bg-bg-base chat-scrollbar"
    >
      <div className="max-w-3xl mx-auto">
        {messages.map((message, index) => {
          const isLastAssistant = index === messages.length - 1 && message.role === 'assistant';
          const isCurrentlyStreaming = isStreaming && isLastAssistant;
          // Only show follow-ups on the last assistant message when not streaming
          const showFollowUps = isLastAssistant && !isStreaming && followUpQuestions.length > 0;

          return (
            <MessageBubble
              key={message.id || index}
              message={message}
              isStreaming={isCurrentlyStreaming}
              followUpQuestions={showFollowUps ? followUpQuestions : undefined}
              onFollowUpSelect={showFollowUps ? onQuickAction : undefined}
            />
          );
        })}

        {/* Thinking process indicator during streaming (shows before assistant message appears) */}
        {isStreaming && (
          messages.length === 0 || messages[messages.length - 1].role === 'user'
        ) && (
          <ThinkingProcess steps={thinkingSteps} isVisible={true} />
        )}

        {/* Error message */}
        {error && (
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-4 py-3 max-w-md">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error.message || 'An error occurred'}</p>
            </div>
          </div>
        )}

        {/* Invisible anchor for intersection observer */}
        <div ref={anchorRef} className="h-1" />
      </div>
    </div>
  );
}
