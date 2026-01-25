'use client';

import { useState, useCallback } from 'react';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { validateApiKey } from '@/src/lib/openrouter';

/**
 * API key configuration component for OpenRouter.
 *
 * Features:
 * - Password input (always masked, no reveal option per CONTEXT.md)
 * - Shows last 6 chars as hint when key exists
 * - Validates on blur via OpenRouter API
 * - Persists to localStorage
 */
export function ApiKeyConfig() {
  const [apiKey, setApiKey, isHydrated] = useLocalStorage<string>(
    'openrouter-api-key',
    ''
  );
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const handleBlur = useCallback(async () => {
    // Only validate if key is substantial (> 10 chars)
    if (apiKey.length <= 10) {
      setIsValid(null);
      return;
    }

    setIsValidating(true);
    try {
      const valid = await validateApiKey(apiKey);
      setIsValid(valid);
    } catch {
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  }, [apiKey]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    // Reset validation state when key changes
    setIsValid(null);
  };

  // Get last 6 chars for hint display
  const keyHint =
    apiKey.length > 6 ? `Key: ••••••${apiKey.slice(-6)}` : null;

  return (
    <div className="space-y-2">
      <label
        htmlFor="api-key"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        OpenRouter API Key
      </label>

      <div className="relative">
        <input
          id="api-key"
          type="password"
          value={isHydrated ? apiKey : ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="sk-or-..."
          className={`
            w-full px-3 py-2 text-sm
            bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100
            border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-accent
            placeholder-gray-400 dark:placeholder-gray-500
            ${isValid === true ? 'border-green-500' : ''}
            ${isValid === false ? 'border-red-500' : ''}
            ${isValid === null ? 'border-gray-300 dark:border-gray-600' : ''}
          `}
        />

        {/* Validation indicator */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isValidating && (
            <svg
              className="h-5 w-5 animate-spin text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {!isValidating && isValid === true && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
              <svg
                className="h-3 w-3 text-white"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          )}
          {!isValidating && isValid === false && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500">
              <svg
                className="h-3 w-3 text-white"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          )}
        </div>
      </div>

      {/* Key hint */}
      {keyHint && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{keyHint}</p>
      )}

      {/* Error message */}
      {isValid === false && (
        <p className="text-xs text-red-500 dark:text-red-400">
          Invalid API key. Please check your key and try again.
        </p>
      )}
    </div>
  );
}
