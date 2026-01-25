'use client';

import { useEffect, useRef, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { useScrollAnchor } from '@/src/hooks/useScrollAnchor';
import type { UIMessage } from '@ai-sdk/react';

type ChatStatus = 'submitted' | 'streaming' | 'ready' | 'error';

interface MessageListProps {
  messages: UIMessage[];
  status: ChatStatus;
  error: Error | null;
  onQuickAction?: (command: string) => void;
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
export function MessageList({ messages, status, error, onQuickAction }: MessageListProps) {
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

  // Empty state
  if (messages.length === 0 && !isStreaming) {
    return (
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 flex items-center justify-center bg-gray-50 dark:bg-gray-900"
      >
        <div className="text-center text-gray-500 dark:text-gray-400 max-w-md">
          <p className="text-2xl font-semibold mb-2 text-gray-700 dark:text-gray-200">
            Quily Chat
            <sup className="ml-1 text-xs font-medium text-accent">beta</sup>
          </p>
          <p className="mb-6">Ask a question about Quilibrium to get started</p>

          {/* Quick action buttons */}
          {onQuickAction && (
            <div className="flex flex-wrap justify-center gap-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.command}
                  onClick={() => onQuickAction(action.command)}
                  className="px-4 py-2 text-sm rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-colors text-gray-700 dark:text-gray-300 cursor-pointer"
                  title={action.description}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900"
    >
      <div className="max-w-3xl mx-auto">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id || index}
            message={message}
            isStreaming={isStreaming && index === messages.length - 1 && message.role === 'assistant'}
          />
        ))}

        {/* Typing indicator during streaming */}
        {isStreaming && (
          messages.length === 0 || messages[messages.length - 1].role === 'user'
        ) && (
          <div className="flex justify-start mb-4">
            <div className="max-w-[95%] sm:max-w-[80%] bg-gray-200 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-2">
              <TypingIndicator />
            </div>
          </div>
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
