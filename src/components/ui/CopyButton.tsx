'use client';

import { useState, useCallback } from 'react';

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'minimal';
}

/**
 * Copy button with visual feedback.
 * Shows checkmark for 2 seconds after successful copy.
 *
 * Props:
 * - text: Content to copy
 * - className: Additional CSS classes
 * - size: Button size (sm = 16px icons, md = 20px icons)
 * - variant: default (with background) or ghost (transparent until hover)
 */
export function CopyButton({
  text,
  className = '',
  size = 'md',
  variant = 'default'
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not available');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.warn('Copy failed:', error);
    }
  }, [text]);

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-5 h-5' : 'w-5 h-5';

  const baseStyles = 'rounded transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer';
  const paddingStyles = variant === 'minimal' ? 'p-0' : 'p-1.5';
  const variantStyles = variant === 'ghost'
    ? 'opacity-0 group-hover:opacity-100 hover:bg-gray-700 dark:hover:bg-gray-600'
    : variant === 'minimal'
      ? 'hover:text-gray-600 dark:hover:text-gray-300'
      : 'bg-gray-700 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-500';

  return (
    <button
      onClick={handleCopy}
      className={`${baseStyles} ${paddingStyles} ${variantStyles} ${className}`}
      aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        // Checkmark icon
        <svg
          className={`${iconSize} text-green-400`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        // Clipboard icon
        <svg
          className={`${iconSize} ${variant === 'minimal' ? 'text-gray-400 dark:text-gray-500' : 'text-gray-300 dark:text-gray-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      )}
    </button>
  );
}
