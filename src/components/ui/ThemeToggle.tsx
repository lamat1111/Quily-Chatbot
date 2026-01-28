'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Icon } from '@/src/components/ui/Icon';

/**
 * Theme toggle button with sun/moon icons.
 *
 * Features:
 * - Hydration-safe with mounted state pattern
 * - Uses resolvedTheme for correct system theme handling
 * - Accessible with aria-label
 * - Theme-aware styling
 */
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Placeholder with same dimensions to prevent layout shift
  if (!mounted) {
    return (
      <div
        className="p-2 rounded-lg w-10 h-10"
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      style={{ cursor: 'pointer' }}
      className="
        p-2 rounded-lg
        text-gray-600 dark:text-gray-400
        hover:bg-gray-200 dark:hover:bg-gray-700
        hover:text-gray-900 dark:hover:text-gray-100
        transition-colors
      "
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Icon name="sun" size={20} />
      ) : (
        <Icon name="moon" size={20} />
      )}
    </button>
  );
}
