'use client';

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSubmit: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled: boolean;
  disabledMessage?: string;
}

/**
 * Chat input form with submit and stop functionality.
 *
 * - Submit button when not streaming
 * - Stop button (red) when streaming
 * - Input disabled during streaming
 * - Fixed at bottom of chat area
 */
export function ChatInput({
  onSubmit,
  onStop,
  isStreaming,
  disabled,
  disabledMessage,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set height to scrollHeight (content height)
      const newHeight = textarea.scrollHeight;
      textarea.style.height = `${newHeight}px`;
      // Only enable scrolling when content exceeds max-height (192px = 12rem = max-h-48)
      textarea.style.overflowY = newHeight > 192 ? 'auto' : 'hidden';
    }
  }, [input]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (trimmedInput && !disabled && !isStreaming) {
      onSubmit(trimmedInput);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift) OR Ctrl/Cmd+Enter
    const isModifierEnter = (e.ctrlKey || e.metaKey) && e.key === 'Enter';
    const isPlainEnter = e.key === 'Enter' && !e.shiftKey;

    if (isModifierEnter || isPlainEnter) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const placeholderText = disabled
    ? disabledMessage || 'Enter your API key to start chatting...'
    : isStreaming
      ? 'Waiting for response...'
      : 'Ask a question about Quilibrium...';

  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-2 sm:p-4">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="flex gap-2 sm:gap-3 items-end mb-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            disabled={disabled || isStreaming}
            rows={1}
            className="flex-1 min-w-0 resize-none rounded-xl border border-gray-300 dark:border-gray-600
                       bg-surface/5 dark:bg-surface/10 px-3 sm:px-4 py-3 text-text-primary
                       placeholder-gray-400
                       focus:outline-none focus:border-gray-400 dark:focus:border-gray-500
                       disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50
                       min-h-12 max-h-48 overflow-hidden input-scrollbar"
          />

          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className="flex-shrink-0 px-3 sm:px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 cursor-pointer
                         text-white font-medium transition-colors
                         focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900"
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                <span className="hidden sm:inline">Stop</span>
              </span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={disabled || !input.trim()}
              className="flex-shrink-0 p-3 h-12 w-12 rounded-xl cursor-pointer
                         bg-gradient-to-br from-gradient-from to-gradient-to hover:from-gradient-from-hover hover:to-gradient-to-hover disabled:bg-gray-600 disabled:from-gray-600 disabled:to-gray-600
                         text-white font-medium transition-colors
                         focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900
                         disabled:cursor-not-allowed flex items-center justify-center"
              aria-label="Send message"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </button>
          )}
        </div>
        <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2">
          Quily can make mistakes. Verify important info with{' '}
          <a
            href="https://docs.quilibrium.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600 dark:hover:text-gray-400"
          >
            official docs
          </a>
          .
        </p>
      </form>
    </div>
  );
}
