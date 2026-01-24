'use client';

import { useState, FormEvent, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSubmit: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled: boolean;
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
}: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (trimmedInput && !disabled && !isStreaming) {
      onSubmit(trimmedInput);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const placeholderText = disabled
    ? 'Enter your API key to start chatting...'
    : isStreaming
      ? 'Waiting for response...'
      : 'Ask a question about Quilibrium...';

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            disabled={disabled || isStreaming}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-gray-100
                       placeholder-gray-500 dark:placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
                       min-h-[48px] max-h-[200px]"
            style={{
              height: 'auto',
              overflow: 'auto',
            }}
          />

          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className="flex-shrink-0 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700
                         text-white font-medium transition-colors
                         focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                Stop
              </span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={disabled || !input.trim()}
              className="flex-shrink-0 px-4 py-3 rounded-xl
                         bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600
                         text-white font-medium transition-colors
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                         disabled:cursor-not-allowed"
            >
              <span className="flex items-center gap-2">
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
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                Send
              </span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
