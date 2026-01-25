'use client';

import { useState, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { validateApiKey } from '@/src/lib/openrouter';

interface ApiKeyModalProps {
  children: React.ReactNode;  // Trigger element
}

/**
 * Modal dialog for API key configuration.
 *
 * Features:
 * - OpenRouter explanation for new users
 * - Link to create account / get API key
 * - Password input with validation
 * - Accessible with proper focus trap
 */
export function ApiKeyModal({ children }: ApiKeyModalProps) {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey, isHydrated] = useLocalStorage<string>(
    'openrouter-api-key',
    ''
  );
  const [inputValue, setInputValue] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'valid' | 'invalid' | null>(null);

  // Sync input with stored key when modal opens
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && isHydrated) {
      setInputValue(apiKey);
      setValidationResult(null);
    }
  };

  const handleSave = useCallback(async () => {
    if (!inputValue.trim()) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      const isValid = await validateApiKey(inputValue);
      if (isValid) {
        setApiKey(inputValue);
        setValidationResult('valid');
        // Close modal after brief delay to show success
        setTimeout(() => setOpen(false), 500);
      } else {
        setValidationResult('invalid');
      }
    } catch {
      setValidationResult('invalid');
    } finally {
      setIsValidating(false);
    }
  }, [inputValue, setApiKey]);

  const handleClear = useCallback(() => {
    setApiKey('');
    setInputValue('');
    setValidationResult(null);
  }, [setApiKey]);

  // Display hint for existing key
  const keyHint = apiKey.length > 6 ? `Current: ••••••${apiKey.slice(-6)}` : null;

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        {children}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-800 rounded-xl p-6 z-50 shadow-xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">

          <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
            OpenRouter API Key
          </Dialog.Title>

          <Dialog.Description className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            This app uses{' '}
            <a
              href="https://openrouter.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              OpenRouter
            </a>
            {' '}to access AI models like Claude, GPT-4, and Llama. Your API key is stored locally in your browser and never sent to our servers.
          </Dialog.Description>

          {/* Form */}
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="modal-api-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                API Key
              </label>
              <input
                id="modal-api-key"
                type="password"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setValidationResult(null);
                }}
                placeholder="sk-or-..."
                className={`w-full px-3 py-2 text-sm rounded-lg border
                  bg-gray-50 dark:bg-gray-700
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-accent
                  ${validationResult === 'valid' ? 'border-green-500' : ''}
                  ${validationResult === 'invalid' ? 'border-red-500' : ''}
                  ${validationResult === null ? 'border-gray-300 dark:border-gray-600' : ''}
                `}
              />
              {keyHint && !inputValue && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{keyHint}</p>
              )}
              {validationResult === 'invalid' && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  Invalid API key. Please check and try again.
                </p>
              )}
              {validationResult === 'valid' && (
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                  API key validated successfully!
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={isValidating || !inputValue.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg cursor-pointer
                  text-accent
                  bg-transparent
                  border border-accent
                  hover:bg-accent/10 dark:hover:bg-accent/20
                  disabled:text-gray-400 disabled:border-gray-400 disabled:hover:bg-transparent
                  transition-colors
                  focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
                  dark:focus:ring-offset-gray-800
                  disabled:cursor-not-allowed"
              >
                {isValidating ? 'Validating...' : 'Save'}
              </button>
              {apiKey && (
                <button
                  onClick={handleClear}
                  className="px-4 py-2 text-sm font-medium rounded-lg cursor-pointer
                    bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600
                    text-gray-700 dark:text-gray-300 transition-colors
                    focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                    dark:focus:ring-offset-gray-800"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Get API key link */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an API key?{' '}
              <a
                href="https://openrouter.ai/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline font-medium"
              >
                Create one at OpenRouter
              </a>
            </p>
          </div>

          {/* Close button */}
          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 p-1 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
