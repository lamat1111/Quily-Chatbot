'use client';

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSubmit: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled: boolean;
  disabledMessage?: string;
  /** When true, renders without outer padding/background for embedding in empty state */
  embedded?: boolean;
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
  embedded = false,
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

  const hasText = input.trim().length > 0;

  // Sizes - larger when embedded in welcome screen, original size in normal chat
  const buttonSize = embedded ? 'h-10 w-10 p-2.5' : 'h-8 w-8 p-2';
  const iconSize = embedded ? 'w-5 h-5' : 'w-4 h-4';
  const textareaSize = embedded ? 'py-4 min-h-14' : 'py-3 min-h-12';

  const inputField = (
    <div className={`relative flex items-end rounded-xl border bg-bg-muted
                    ${disabled ? 'border-border-muted bg-bg-subtle' : 'border-border focus-within:border-border-focus'}`}>
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholderText}
        disabled={disabled || isStreaming}
        rows={1}
        className={`flex-1 resize-none bg-transparent pl-3 sm:pl-4 pr-2 text-text-base
                   placeholder-text-subtle
                   focus:outline-none
                   disabled:cursor-not-allowed disabled:opacity-50
                   max-h-48 overflow-hidden input-scrollbar ${textareaSize}`}
      />

      <div className="shrink-0 p-2 self-end">
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className="px-3 py-1.5 h-8 rounded-lg
                       bg-btn-danger hover:bg-btn-danger-hover cursor-pointer
                       text-white text-sm font-medium transition-colors
                       focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900
                       flex items-center justify-center gap-1.5"
            aria-label="Stop generation"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            <span>Stop</span>
          </button>
        ) : (
          <button
            type="submit"
            disabled={disabled || !hasText}
            className={`${buttonSize} rounded-lg transition-all
                       focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900
                       flex items-center justify-center
                       ${hasText && !disabled
                         ? 'bg-gradient-to-br from-gradient-from to-gradient-to hover:from-gradient-from-hover hover:to-gradient-to-hover text-white cursor-pointer'
                         : 'bg-btn-secondary text-text-subtle cursor-not-allowed'
                       }`}
            aria-label="Send message"
          >
            <svg
              className={iconSize}
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
    </div>
  );

  // When embedded in empty state, render just the input (no disclaimers)
  if (embedded) {
    return (
      <form onSubmit={handleSubmit} className="w-full max-w-xl">
        {inputField}
      </form>
    );
  }

  return (
    <div className="bg-bg-base p-2 sm:p-4">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        {inputField}
      </form>
    </div>
  );
}
