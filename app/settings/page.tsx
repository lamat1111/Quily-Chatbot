'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Icon } from '@/src/components/ui/Icon';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { getRecommendedModels, DEFAULT_MODEL_ID, ModelMetadata } from '@/src/lib/openrouter';
import { getProvider, getActiveProviders, getDefaultProvider } from '@/src/lib/providers';
import { useChutesSession } from '@/src/hooks/useChutesSession';
import { useChutesModels } from '@/src/hooks/useChutesModels';

/**
 * Settings page for API key and model configuration.
 *
 * Features:
 * - Provider selection (OpenRouter, Chutes)
 * - API key configuration with validation
 * - OAuth sign in/out for Chutes
 * - Model selection dropdowns
 * - Advanced settings for Chutes
 */
export default function SettingsPage() {
  // Provider and API key state
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

  // UI state
  const [inputValue, setInputValue] = useState('');
  const [modelListOpen, setModelListOpen] = useState(false);
  const [chutesModelListOpen, setChutesModelListOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'valid' | 'invalid' | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const provider = getProvider('openrouter');
  const isOpenRouter = providerId === 'openrouter';
  const isChutes = providerId === 'chutes';
  const recommendedModels = useMemo(() => getRecommendedModels(), []);

  // Chutes session and models
  const {
    isSignedIn: isChutesSignedIn,
    user: chutesUser,
    loading: chutesLoading,
    loginUrl,
    logout,
    isAvailable: chutesAvailable,
  } = useChutesSession();
  const { models: chutesModels, loading: chutesModelsLoading, error: chutesModelsError } =
    useChutesModels('llm', isChutes && isChutesSignedIn);

  // Set default Chutes model when signed in and models are loaded
  useEffect(() => {
    if (isChutes && isChutesSignedIn && chutesModels.length > 0 && !chutesModel) {
      setChutesModel(chutesModels[0].id);
    }
  }, [isChutes, isChutesSignedIn, chutesModels, chutesModel, setChutesModel]);

  // Sync input with stored key on mount
  useEffect(() => {
    if (isOpenRouter && apiKeyHydrated) {
      setInputValue(apiKey);
      setValidationResult(null);
    }
  }, [isOpenRouter, apiKeyHydrated, apiKey]);

  // Close OpenRouter model list when switching providers
  useEffect(() => {
    if (!isOpenRouter) {
      setModelListOpen(false);
    }
  }, [isOpenRouter]);

  // API key handlers
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
    setShowClearConfirm(true);
  }, []);

  const confirmClearApiKey = useCallback(() => {
    setApiKey('');
    setInputValue('');
    setValidationResult(null);
    setShowClearConfirm(false);
  }, [setApiKey]);

  // Display hint for existing key
  const keyHint =
    isOpenRouter && apiKey.length > 6 ? `Current: ••••••${apiKey.slice(-6)}` : null;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-12 w-full">
          {/* Page Header */}
          <h1 className="text-3xl font-bold text-text-primary mb-2 font-title">Settings</h1>
          <p className="text-text-secondary mb-8">
            Configure your AI provider, API key, and preferred model.
          </p>

          {/* Provider Selection Card */}
          <section className="mb-8">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Icon name="zap" size={20} className="text-accent" />
                Provider
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {getActiveProviders().map((p) => {
                  const isChutesUnavailable = p.id === 'chutes' && !chutesAvailable;
                  const isDisabled = isChutesUnavailable;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => !isDisabled && setProviderId(p.id)}
                      disabled={isDisabled}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors text-left
                        ${isDisabled
                          ? 'border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed'
                          : providerId === p.id
                            ? 'border-accent bg-accent/10 text-text-primary'
                            : 'border-gray-200 dark:border-gray-700 text-text-secondary hover:bg-surface/5 dark:hover:bg-surface/10'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{p.name}</span>
                        {p.isRecommended && !isDisabled && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-accent/10 text-accent">
                            Recommended
                          </span>
                        )}
                        {isChutesUnavailable && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                            Unavailable
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {isChutesUnavailable
                          ? 'Coming soon'
                          : p.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Authentication Card */}
          <section className="mb-8">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
              {isOpenRouter && (
                <>
                  <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Icon name="key" size={20} className="text-accent" />
                    <span className={`w-2 h-2 rounded-full ${apiKey ? 'bg-green-500' : 'bg-red-500'}`} />
                    {provider?.name || 'Provider'} API Key
                  </h2>

                  <div className="space-y-3">
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
                      {keyHint && (
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

                    {/* Clear Confirmation Inline Banner */}
                    {showClearConfirm && (
                      <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <h3 className="text-sm font-semibold text-text-primary mb-1">Clear API Key?</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Are you sure you want to remove your API key? You&apos;ll need to enter it again to use the chat.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowClearConfirm(false)}
                            className="flex-1 px-3 py-2 text-sm font-medium rounded-lg
                              bg-surface/10 dark:bg-surface/15 hover:bg-surface/15 dark:hover:bg-surface/20
                              text-text-secondary transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={confirmClearApiKey}
                            className="flex-1 px-3 py-2 text-sm font-medium rounded-lg
                              bg-red-500 hover:bg-red-600 text-white transition-colors"
                          >
                            Clear Key
                          </button>
                        </div>
                      </div>
                    )}

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
                </>
              )}

              {isChutes && (
                <>
                  <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Icon name="user" size={20} className="text-accent" />
                    <span className={`w-2 h-2 rounded-full ${isChutesSignedIn ? 'bg-green-500' : 'bg-red-500'}`} />
                    Chutes Account
                  </h2>
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
                      className="link-unstyled inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-[#00DC82] text-black hover:bg-[#00c474] transition-colors"
                    >
                      Sign in with Chutes
                    </a>
                  )}
                </>
              )}
            </div>
          </section>

          {/* Model Selection Card */}
          <section className="mb-8">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Icon name="cpu" size={20} className="text-accent" />
                Model
              </h2>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
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
                    <Icon
                      name="chevron-down"
                      size={16}
                      className={`text-gray-500 dark:text-gray-400 transition-transform ${modelListOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {modelListOpen && (
                    <div className="border-t border-gray-200 dark:border-gray-600 max-h-96 overflow-y-auto modal-scrollbar">
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
                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                      {/* Selected model header */}
                      <button
                        type="button"
                        onClick={() => setChutesModelListOpen(!chutesModelListOpen)}
                        className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-text-primary">
                            {chutesModels.find((m) => m.id === chutesModel)?.name || 'Select a model'}
                          </span>
                          {chutesModels.find((m) => m.id === chutesModel)?.isOpenSource && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                              Open Source
                            </span>
                          )}
                          {chutesModels.find((m) => m.id === chutesModel)?.isRecommended && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-accent/10 dark:bg-accent/20 text-accent">
                              Recommended
                            </span>
                          )}
                        </div>
                        <Icon
                          name="chevron-down"
                          size={16}
                          className={`text-gray-500 dark:text-gray-400 transition-transform ${chutesModelListOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {/* Model list dropdown */}
                      {chutesModelListOpen && (
                        <div className="border-t border-gray-200 dark:border-gray-600 max-h-96 overflow-y-auto modal-scrollbar">
                          {chutesModels.map((model) => (
                            <label
                              key={model.id}
                              className={`flex items-start gap-3 px-3 py-2.5 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0
                                ${chutesModel === model.id
                                  ? 'bg-surface/10 dark:bg-surface/15'
                                  : 'hover:bg-surface/5 dark:hover:bg-surface/10'
                                }`}
                            >
                              <input
                                type="radio"
                                name="chutes-model-select"
                                value={model.id}
                                checked={chutesModel === model.id}
                                onChange={(e) => {
                                  setChutesModel(e.target.value);
                                  setChutesModelListOpen(false);
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
                                {model.description && (
                                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                    {model.description}
                                  </p>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {isChutesSignedIn && !chutesModelsLoading && chutesModels.length === 0 && !chutesModelsError && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      No Chutes models available for this account.
                    </p>
                  )}

                  {/* Custom model URL input */}
                  {isChutesSignedIn && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Or enter a custom Chute URL to use any model:
                      </p>
                      <input
                        type="text"
                        value={chutesModel}
                        onChange={(e) => setChutesModel(e.target.value)}
                        placeholder="https://your-chute.chutes.ai"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
  );
}
