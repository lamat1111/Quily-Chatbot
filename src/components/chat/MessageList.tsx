'use client';

import { useEffect } from 'react';
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
 */
export function MessageList({ messages, status, error, onQuickAction }: MessageListProps) {
  const {
    scrollRef,
    anchorRef,
    isAtBottom,
    scrollToBottom,
    scrollToBottomImmediate,
  } = useScrollAnchor();

  const isStreaming = status === 'streaming' || status === 'submitted';

  // Auto-scroll when streaming and user is at bottom
  useEffect(() => {
    if (isStreaming && isAtBottom) {
      scrollToBottomImmediate();
    }
  }, [messages, isStreaming, isAtBottom, scrollToBottomImmediate]);

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
          <div className="text-4xl mb-4">Q</div>
          <p className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-200">Quily Chat</p>
          <p className="mb-6">Ask a question about Quilibrium to get started</p>

          {/* Quick action buttons */}
          {onQuickAction && (
            <div className="flex flex-wrap justify-center gap-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.command}
                  onClick={() => onQuickAction(action.command)}
                  className="px-4 py-2 text-sm rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-gray-700 dark:text-gray-300 cursor-pointer"
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
