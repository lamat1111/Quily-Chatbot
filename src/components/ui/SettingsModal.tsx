'use client';

import { useState, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { validateApiKey, RECOMMENDED_MODELS } from '@/src/lib/openrouter';

interface SettingsModalProps {
  children: React.ReactNode;
}

/**
 * Unified settings modal for API key and model configuration.
 *
 * Features:
 * - API key configuration with validation
 * - Model selection dropdown
 * - Responsive design with proper mobile spacing
 * - Accessible with proper focus trap
 */
export function SettingsModal({ children }: SettingsModalProps) {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey, apiKeyHydrated] = useLocalStorage<string>(
    'openrouter-api-key',
    ''
  );
  const [selectedModel, setSelectedModel] = useLocalStorage<string>(
    'selected-model',
    RECOMMENDED_MODELS[0].id
  );
  const [inputValue, setInputValue] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'valid' | 'invalid' | null>(null);

  // Sync input with stored key when modal opens
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && apiKeyHydrated) {
      setInputValue(apiKey);
      setValidationResult(null);
    }
  };

  const handleSaveApiKey = useCallback(async () => {
    if (!inputValue.trim()) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      const isValid = await validateApiKey(inputValue);
      if (isValid) {
        setApiKey(inputValue);
        setValidationResult('valid');
      } else {
        setValidationResult('invalid');
      }
    } catch {
      setValidationResult('invalid');
    } finally {
      setIsValidating(false);
    }
  }, [inputValue, setApiKey]);

  const handleClearApiKey = useCallback(() => {
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
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 z-50 shadow-xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 max-h-[90vh] overflow-y-auto">

          <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white pr-8">
            Settings
          </Dialog.Title>

          <Dialog.Description className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Configure your API key and preferred model.
          </Dialog.Description>

          {/* Settings Form */}
          <div className="mt-4 space-y-6">
            {/* API Key Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${apiKey ? 'bg-green-500' : 'bg-red-500'}`} />
                API Key
              </h3>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                This app uses{' '}
                <a
                  href="https://openrouter.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  OpenRouter
                </a>
                {' '}to access AI models. Your key is stored locally.
              </p>

              <div>
                <input
                  id="settings-api-key"
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
                    focus:outline-none focus:ring-2 focus:ring-blue-500
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

              {/* API Key buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleSaveApiKey}
                  disabled={isValidating || !inputValue.trim()}
                  className="flex-1 px-3 py-2 text-sm font-medium rounded-lg cursor-pointer
                    bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400
                    text-white transition-colors
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    dark:focus:ring-offset-gray-800
                    disabled:cursor-not-allowed"
                >
                  {isValidating ? 'Validating...' : 'Save Key'}
                </button>
                {apiKey && (
                  <button
                    onClick={handleClearApiKey}
                    className="px-3 py-2 text-sm font-medium rounded-lg cursor-pointer
                      bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600
                      text-gray-700 dark:text-gray-300 transition-colors
                      focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                      dark:focus:ring-offset-gray-800"
                  >
                    Clear
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Don&apos;t have a key?{' '}
                <a
                  href="https://openrouter.ai/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Get one at OpenRouter
                </a>
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700" />

            {/* Model Selection Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Model
              </h3>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Select the AI model to use for conversations.
              </p>

              <div className="relative">
                <select
                  id="settings-model-select"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 pr-10 text-sm
                    border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    cursor-pointer appearance-none"
                >
                  {RECOMMENDED_MODELS.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-500 dark:text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
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
