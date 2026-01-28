'use client';

import { useState, useCallback } from 'react';
import { Icon } from '@/src/components/ui/Icon';

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

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 20 : 20;

  const baseStyles = 'rounded transition-all focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer';
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
        <Icon
          name="check"
          size={iconSize}
          className="text-green-400"
        />
      ) : (
        <Icon
          name="copy"
          size={iconSize}
          className={variant === 'minimal' ? 'text-gray-400 dark:text-gray-500' : 'text-gray-300 dark:text-gray-400'}
        />
      )}
    </button>
  );
}
