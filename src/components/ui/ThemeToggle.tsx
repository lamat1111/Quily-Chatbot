'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

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
        // Sun icon - shown in dark mode, click to switch to light
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="M4.93 4.93l1.41 1.41" />
          <path d="M17.66 17.66l1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="M6.34 17.66l-1.41 1.41" />
          <path d="M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        // Moon icon - shown in light mode, click to switch to dark
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
