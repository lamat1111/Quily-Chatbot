'use client';

/**
 * Animated typing indicator shown while the assistant is generating a response.
 *
 * Displays "Thinking..." with animated bouncing dots.
 */
export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 py-2">
      <span className="text-sm">Thinking</span>
      <span className="flex gap-1">
        <span
          className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </span>
    </div>
  );
}
