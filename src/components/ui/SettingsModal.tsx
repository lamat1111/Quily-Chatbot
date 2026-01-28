'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { getRecommendedModels, DEFAULT_MODEL_ID, ModelMetadata } from '@/src/lib/openrouter';
import { getProvider, getActiveProviders, getDefaultProvider } from '@/src/lib/providers';
import { useChutesSession } from '@/src/hooks/useChutesSession';
import { useChutesModels } from '@/src/hooks/useChutesModels';

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
  const { isOpen: storeIsOpen, closeSettings } = useSettingsStore();
  const [providerId, setProviderId] = useLocalStorage<string>(
    'selected-provider',
    getDefaultProvider().id
  );
  const [apiKey, setApiKey, apiKeyHydrated] = useLocalStorage<string>(
    'openrouter-api-key',
    ''
  );
  const [openrouterModel, setOpenrouterModel] = useLocalStorage<string>(
    'openrouter-model',
    DEFAULT_MODEL_ID
  );
  const [chutesModel, setChutesModel] = useLocalStorage<string>(
    'chutes-model',
    process.env.NEXT_PUBLIC_CHUTES_DEFAULT_MODEL || ''
  );
  const [chutesEmbeddingModel, setChutesEmbeddingModel] = useLocalStorage<string>(
    'chutes-embedding-model',
    process.env.NEXT_PUBLIC_CHUTES_EMBEDDING_MODEL || ''
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [modelListOpen, setModelListOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'valid' | 'invalid' | null>(null);

  const provider = getProvider('openrouter');
  const isOpenRouter = providerId === 'openrouter';
  const isChutes = providerId === 'chutes';
  const recommendedModels = useMemo(() => getRecommendedModels(), []);

  const { isSignedIn: isChutesSignedIn, user: chutesUser, loading: chutesLoading, loginUrl, logout } =
    useChutesSession();
  const { models: chutesModels, loading: chutesModelsLoading, error: chutesModelsError } =
    useChutesModels('llm', isChutes && isChutesSignedIn);
  const { models: chutesEmbeddingModels } =
    useChutesModels('embedding', isChutes && isChutesSignedIn);

  useEffect(() => {
    if (isChutes && isChutesSignedIn && chutesModels.length > 0 && !chutesModel) {
      setChutesModel(chutesModels[0].id);
    }
  }, [isChutes, isChutesSignedIn, chutesModels, chutesModel, setChutesModel]);

  // Sync with store - allow opening from anywhere
  useEffect(() => {
    if (storeIsOpen && !open) {
      setOpen(true);
      if (apiKeyHydrated && isOpenRouter) {
        setInputValue(apiKey);
        setValidationResult(null);
      }
    }
  }, [storeIsOpen, open, apiKey, apiKeyHydrated, isOpenRouter]);

  // Sync input with stored key when modal opens
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      closeSettings(); // Sync store when closing
    }
    if (isOpen && apiKeyHydrated && isOpenRouter) {
      setInputValue(apiKey);
      setValidationResult(null);
    }
  };

  useEffect(() => {
    if (isOpenRouter && apiKeyHydrated) {
      setInputValue(apiKey);
      setValidationResult(null);
    }
  }, [isOpenRouter, apiKeyHydrated, apiKey]);

  useEffect(() => {
    if (!isOpenRouter) {
      setModelListOpen(false);
    }
  }, [isOpenRouter]);

  const handleSaveApiKey = useCallback(async () => {
    if (!inputValue.trim() || !provider || !isOpenRouter) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      const isValid = await provider.validateKey(inputValue);
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
  }, [inputValue, setApiKey, provider, isOpenRouter]);

  const handleClearApiKey = useCallback(() => {
    setApiKey('');
    setInputValue('');
    setValidationResult(null);
  }, [setApiKey]);

  // Display hint for existing key
  const keyHint =
    isOpenRouter && apiKey.length > 6 ? `Current: ••••••${apiKey.slice(-6)}` : null;

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        {children}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 z-50 shadow-xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 max-h-[90vh] overflow-y-auto">

          <Dialog.Title className="text-lg font-semibold text-text-primary pr-8">
            Settings
          </Dialog.Title>

          <Dialog.Description className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Configure your API key and preferred model.
          </Dialog.Description>

          {/* Settings Form */}
          <div className="mt-4 space-y-6">
            {/* Provider Selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-text-primary">
                Provider
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {getActiveProviders().map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProviderId(p.id)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors text-left
                      ${providerId === p.id
                        ? 'border-accent bg-accent/10 text-text-primary'
                        : 'border-gray-200 dark:border-gray-700 text-text-secondary hover:bg-surface/5 dark:hover:bg-surface/10'
                      }`}
                  >
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {p.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* OpenRouter API Key Section */}
            {isOpenRouter && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${apiKey ? 'bg-green-500' : 'bg-red-500'}`} />
                  {provider?.name || 'Provider'} API Key
                </h3>

                <div>
                  <input
                    id="settings-api-key"
                    type="password"
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      setValidationResult(null);
                    }}
                    placeholder={provider?.keyPlaceholder || 'API key...'}
                    className={`w-full px-3 py-2 text-sm rounded-lg border
                      bg-surface/5 dark:bg-surface/10
                      text-text-primary
                      placeholder-gray-400 dark:placeholder-gray-500
                      focus:outline-none focus:border-secondary dark:focus:border-gray-400
                      transition-colors
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
                      Invalid API key. Make sure you have credits in your account.
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
                      text-accent
                      bg-transparent
                      border border-accent
                      hover:bg-accent/10 dark:hover:bg-accent/20
                      disabled:text-gray-400 disabled:border-gray-400 disabled:hover:bg-transparent
                      transition-colors
                      focus:outline-none focus:bg-accent/10 dark:focus:bg-accent/20
                      disabled:cursor-not-allowed"
                  >
                    {isValidating ? 'Validating...' : 'Save Key'}
                  </button>
                  {apiKey && (
                    <button
                      onClick={handleClearApiKey}
                      className="px-3 py-2 text-sm font-medium rounded-lg cursor-pointer
                        bg-surface/10 dark:bg-surface/15 hover:bg-surface/15 dark:hover:bg-surface/20
                        text-text-secondary transition-colors
                        focus:outline-none focus:bg-surface/15 dark:focus:bg-surface/20"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Help text with single link */}
                {provider && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Need a key? Go to{' '}
                    <a
                      href="https://openrouter.ai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      openrouter.ai
                    </a>
                    , create an account, add credits, and grab an API key.
                  </p>
                )}
              </div>
            )}

            {/* Chutes Session Section */}
            {isChutes && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isChutesSignedIn ? 'bg-green-500' : 'bg-red-500'}`} />
                  Chutes Account
                </h3>
                {chutesLoading ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">Checking session...</p>
                ) : isChutesSignedIn ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Signed in as{' '}
                      <span className="font-medium text-text-primary">
                        {chutesUser?.username || chutesUser?.name || chutesUser?.email || 'Chutes user'}
                      </span>
                    </p>
                    <button
                      onClick={logout}
                      className="w-full px-3 py-2 text-sm font-medium rounded-lg cursor-pointer
                        bg-surface/10 dark:bg-surface/15 hover:bg-surface/15 dark:hover:bg-surface/20
                        text-text-secondary transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <a
                    href={loginUrl}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-[#00DC82] text-black hover:bg-[#00c474] transition-colors"
                  >
                    Sign in with Chutes
                  </a>
                )}
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700" />

            {/* Model Selection Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-text-primary">
                Model
              </h3>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Select the AI model to use for conversations.
              </p>

              {isOpenRouter && (
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setModelListOpen(!modelListOpen)}
                    className="w-full px-3 py-3 flex items-center justify-between bg-surface/5 dark:bg-surface/10 hover:bg-surface/10 dark:hover:bg-surface/15 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">
                        {recommendedModels.find((m: ModelMetadata) => m.id === openrouterModel)?.name || 'Select a model'}
                      </span>
                      {recommendedModels.find((m: ModelMetadata) => m.id === openrouterModel)?.isOpenSource && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          Open Source
                        </span>
                      )}
                      {recommendedModels.find((m: ModelMetadata) => m.id === openrouterModel)?.isRecommended && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-accent/10 dark:bg-accent/20 text-accent">
                          Recommended
                        </span>
                      )}
                    </div>
                    <svg
                      className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${modelListOpen ? 'rotate-180' : ''}`}
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
                  </button>

                  {modelListOpen && (
                    <div className="border-t border-gray-200 dark:border-gray-600 max-h-64 overflow-y-auto">
                      {recommendedModels.map((model: ModelMetadata) => (
                        <label
                          key={model.id}
                          className={`flex items-start gap-3 px-3 py-2.5 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0
                            ${openrouterModel === model.id
                              ? 'bg-surface/10 dark:bg-surface/15'
                              : 'hover:bg-surface/5 dark:hover:bg-surface/10'
                            }`}
                        >
                          <input
                            type="radio"
                            name="model-select"
                            value={model.id}
                            checked={openrouterModel === model.id}
                            onChange={(e) => {
                              setOpenrouterModel(e.target.value);
                              setModelListOpen(false);
                            }}
                            className="mt-0.5 h-4 w-4 text-accent accent-accent focus:ring-accent"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-text-primary">
                                {model.name}
                              </span>
                              {model.isRecommended && (
                                <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-accent/10 dark:bg-accent/20 text-accent">
                                  Recommended
                                </span>
                              )}
                              {model.isOpenSource && (
                                <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                  Open Source
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                              {model.description}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {isChutes && (
                <div className="space-y-2">
                  {!isChutesSignedIn && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Sign in with Chutes to load available models.
                    </p>
                  )}
                  {isChutesSignedIn && chutesModelsLoading && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">Loading models...</p>
                  )}
                  {isChutesSignedIn && chutesModelsError && (
                    <p className="text-xs text-red-600 dark:text-red-400">{chutesModelsError}</p>
                  )}
                  {isChutesSignedIn && !chutesModelsLoading && chutesModels.length > 0 && (
                    <div className="relative">
                      <select
                        value={chutesModel}
                        onChange={(e) => setChutesModel(e.target.value)}
                        className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer appearance-none"
                      >
                        {chutesModels.map((model) => (
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
                  )}
                  {isChutesSignedIn && !chutesModelsLoading && chutesModels.length === 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      No Chutes models available for this account.
                    </p>
                  )}
                  {isChutesSignedIn && (chutesModelsError || chutesModels.length === 0) && (
                    <div className="pt-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Chute URL or slug
                      </label>
                      <input
                        type="text"
                        value={chutesModel}
                        onChange={(e) => setChutesModel(e.target.value)}
                        placeholder="https://your-chute.chutes.ai"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  )}

                  {/* Advanced Settings for Chutes */}
                  {isChutesSignedIn && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                      <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-accent transition-colors"
                      >
                        <svg
                          className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Advanced Settings (Embeddings)
                      </button>

                      {showAdvanced && (
                        <div className="mt-3 space-y-4">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                              Embedding Model
                            </label>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
                              Warning: This must match the model used for documentation indexing.
                            </p>
                            {chutesEmbeddingModels.length > 0 ? (
                              <div className="relative">
                                <select
                                  value={chutesEmbeddingModel}
                                  onChange={(e) => setChutesEmbeddingModel(e.target.value)}
                                  className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer appearance-none"
                                >
                                  <option value="">Default (OpenRouter or Env)</option>
                                  {chutesEmbeddingModels.map((model) => (
                                    <option key={model.id} value={model.id}>
                                      {model.name}
                                    </option>
                                  ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                  <svg className="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                            ) : (
                              <input
                                type="text"
                                value={chutesEmbeddingModel}
                                onChange={(e) => setChutesEmbeddingModel(e.target.value)}
                                placeholder="https://embeddings.chutes.ai"
                                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent"
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Close button */}
          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 p-1 rounded cursor-pointer hover:bg-surface/10 dark:hover:bg-surface/15 transition-colors"
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
