'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';
import * as Dialog from '@radix-ui/react-dialog';
import { Icon } from '@/src/components/ui/Icon';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { getRecommendedModels, DEFAULT_MODEL_ID, ModelMetadata } from '@/src/lib/openrouter';
import { getProvider, getActiveProviders, getDefaultProvider } from '@/src/lib/providers';
import { useChutesSession } from '@/src/hooks/useChutesSession';
import { useChutesModels } from '@/src/hooks/useChutesModels';
import {
  getChutesExternalApiKey,
  setChutesExternalApiKey,
  removeChutesExternalApiKey,
  isValidChutesKeyFormat,
  getMaskedApiKey,
  setChutesAuthPreference,
} from '@/src/lib/chutesApiKey';

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

  // Profile state
  const [profileName, setProfileName, profileNameHydrated] = useLocalStorage<string>('user-profile-name', 'You');
  const [profileCustomSet, setProfileCustomSet] = useLocalStorage<boolean>('user-profile-custom-set', false);

  // UI state
  const [inputValue, setInputValue] = useState('');
  const [modelListOpen, setModelListOpen] = useState(false);
  const [chutesModelListOpen, setChutesModelListOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'valid' | 'invalid' | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showWipeDataConfirm, setShowWipeDataConfirm] = useState(false);

  const isFreeMode = process.env.NEXT_PUBLIC_FREE_MODE === 'true';
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
    authMethod,
    hasBothMethods,
    hasOAuthSession,
    hasApiKey,
    setActiveMethod,
    refresh: refreshChutesSession,
  } = useChutesSession();

  // Chutes API key state
  const [chutesApiKeyInput, setChutesApiKeyInput] = useState('');
  const [isValidatingChutesKey, setIsValidatingChutesKey] = useState(false);
  const [chutesKeyError, setChutesKeyError] = useState<string | null>(null);
  const [chutesKeySuccess, setChutesKeySuccess] = useState(false);
  const [showChutesApiKeySection, setShowChutesApiKeySection] = useState(false);
  const [showClearChutesKeyConfirm, setShowClearChutesKeyConfirm] = useState(false);

  // Get current external API key
  const currentChutesExternalKey = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return getChutesExternalApiKey();
  }, [authMethod]); // Re-compute when authMethod changes
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

  // Sync Chutes API key input with stored key on mount (like OpenRouter does)
  useEffect(() => {
    if (isChutes && currentChutesExternalKey) {
      setChutesApiKeyInput(currentChutesExternalKey);
      setChutesKeyError(null);
    }
  }, [isChutes, currentChutesExternalKey]);

  // Close OpenRouter model list when switching providers
  useEffect(() => {
    if (!isOpenRouter) {
      setModelListOpen(false);
    }
  }, [isOpenRouter]);

  // Auto-populate profile name from Chutes OAuth (only if not manually set)
  useEffect(() => {
    if (!profileNameHydrated || profileCustomSet) return;
    if (chutesUser?.username && profileName === 'You') {
      setProfileName(chutesUser.username);
      // Don't set profileCustomSet - allow re-population if they clear it
    }
  }, [chutesUser, profileName, profileNameHydrated, profileCustomSet, setProfileName]);

  // API key handlers
  const handleSaveApiKey = useCallback(async () => {
    if (!inputValue.trim() || !isOpenRouter) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      const res = await fetch('/api/auth/openrouter/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: inputValue }),
      });

      const data = await res.json();

      if (data.valid && data.hasCredits) {
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
  }, [inputValue, setApiKey, isOpenRouter]);

  const handleClearApiKey = useCallback(() => {
    setShowClearConfirm(true);
  }, []);

  const confirmClearApiKey = useCallback(() => {
    setApiKey('');
    setInputValue('');
    setValidationResult(null);
    setShowClearConfirm(false);
  }, [setApiKey]);

  // Chutes API key handlers
  const handleSaveChutesApiKey = useCallback(async () => {
    if (!chutesApiKeyInput.trim()) return;

    if (!isValidChutesKeyFormat(chutesApiKeyInput)) {
      setChutesKeyError('API keys should start with "cpk_". Check you copied the full key.');
      return;
    }

    setIsValidatingChutesKey(true);
    setChutesKeyError(null);
    setChutesKeySuccess(false);

    try {
      const res = await fetch('/api/auth/chutes/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: chutesApiKeyInput }),
      });

      const data = await res.json();

      if (data.valid) {
        setChutesExternalApiKey(chutesApiKeyInput);
        // Set preference to apiKey - "last action wins"
        setChutesAuthPreference('apiKey');
        // Keep the key in the input field (shown as dots)
        setChutesKeySuccess(true);
        await refreshChutesSession();
        // Auto-hide success after 3s
        setTimeout(() => setChutesKeySuccess(false), 3000);
      } else if (data.error === 'invalid_key') {
        setChutesKeyError('Invalid API key. Please check and try again.');
      } else {
        setChutesKeyError('Could not validate key. Check your connection and try again.');
      }
    } catch {
      setChutesKeyError('Could not validate key. Check your connection and try again.');
    } finally {
      setIsValidatingChutesKey(false);
    }
  }, [chutesApiKeyInput, refreshChutesSession]);

  const handleClearChutesApiKey = useCallback(() => {
    setShowClearChutesKeyConfirm(true);
  }, []);

  const confirmClearChutesApiKey = useCallback(async () => {
    removeChutesExternalApiKey();
    // Set preference to oauth so if OAuth session exists, it becomes active
    setChutesAuthPreference('oauth');
    setChutesApiKeyInput('');
    setChutesKeyError(null);
    setChutesKeySuccess(false);
    setShowClearChutesKeyConfirm(false);
    await refreshChutesSession();
  }, [refreshChutesSession]);

  // Display hint for existing key
  const keyHint =
    isOpenRouter && apiKey.length > 6 ? `Current: ••••••${apiKey.slice(-6)}` : null;

  // Theme state
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Avoid hydration mismatch for theme
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-12 w-full">
          {/* Page Header */}
          <h1 className="text-3xl font-bold text-text-primary mb-2 font-title">Settings</h1>
          <p className="text-text-secondary mb-8">
            Configure your AI provider, API key, and preferred model.
          </p>

          {/* Profile Settings Card */}
          <section className="mb-8">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2 font-title">
                <Icon name="user" size={20} className="text-accent" />
                Your Profile
              </h2>

              <div className="space-y-3">
                <div>
                  <label htmlFor="profile-name" className="block text-sm font-medium text-text-primary mb-2">
                    Display Name
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    value={profileName}
                    onChange={(e) => {
                      setProfileName(e.target.value);
                      setProfileCustomSet(true);
                    }}
                    placeholder="You"
                    className="w-full px-3 py-2 text-sm rounded-lg border
                      bg-surface/5 dark:bg-surface/10
                      text-text-primary
                      placeholder-gray-400 dark:placeholder-gray-500
                      border-gray-300 dark:border-gray-600
                      focus:outline-none focus:border-secondary dark:focus:border-gray-400
                      transition-colors"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Provider Card - unified container for provider, auth, and model */}
          <section className="mb-8">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
              {/* Provider Selection */}
              <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2 font-title">
                <Icon name="zap" size={20} className="text-accent" />
                Provider
              </h2>

              {isFreeMode ? (
                <div className="callout-success">
                  <p className="text-sm">
                    <strong>Free mode is active.</strong> We&apos;re covering AI costs for
                    everyone right now. No setup needed.
                  </p>
                </div>
              ) : (
              <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                      <div className="text-sm sm:text-xs text-gray-500 dark:text-gray-400">
                        {isChutesUnavailable
                          ? 'Coming soon'
                          : p.description}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Authentication Section - internal divider */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              {isOpenRouter && (
                <>
                  <h3 className="text-base font-medium text-text-primary mb-4 flex items-center gap-2">
                    <Icon name="key" size={18} className="text-gray-400" />
                    <span className={`w-2 h-2 rounded-full ${apiKey ? 'bg-green-500' : 'bg-red-500'}`} />
                    {provider?.name || 'Provider'} API Key
                  </h3>

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
                        <p className="mt-1 text-sm sm:text-xs text-gray-500 dark:text-gray-400">{keyHint}</p>
                      )}
                      {validationResult === 'invalid' && (
                        <p className="mt-1 text-sm sm:text-xs text-red-600 dark:text-red-400">
                          Invalid API key. Make sure you have credits in your account.
                        </p>
                      )}
                      {validationResult === 'valid' && (
                        <p className="mt-1 text-sm sm:text-xs text-green-600 dark:text-green-400">
                          API key validated successfully!
                        </p>
                      )}
                    </div>

                    {/* API Key buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveApiKey}
                        disabled={isValidating || !inputValue.trim()}
                        className="px-4 py-2 text-sm font-medium rounded-lg cursor-pointer
                          text-accent
                          bg-accent/10 dark:bg-accent/15
                          border border-accent/30
                          hover:bg-accent/20 dark:hover:bg-accent/25
                          disabled:text-gray-400 disabled:bg-gray-500/10 disabled:border-gray-400/30 disabled:hover:bg-gray-500/10
                          transition-colors
                          focus:outline-none focus:bg-accent/20 dark:focus:bg-accent/25
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

                    {/* Clear Confirmation Inline */}
                    {showClearConfirm && (
                      <div className="mt-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <p className="text-sm text-text-secondary mb-3">
                          Clear your API key? You&apos;ll need to enter it again to use the chat.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={confirmClearApiKey}
                            className="px-4 py-2 text-sm font-medium rounded-lg
                              text-red-400
                              bg-red-500/10 dark:bg-red-500/15
                              border border-red-500/30
                              hover:bg-red-500/20 dark:hover:bg-red-500/25
                              transition-colors"
                          >
                            Clear Key
                          </button>
                          <button
                            onClick={() => setShowClearConfirm(false)}
                            className="px-4 py-2 text-sm font-medium rounded-lg
                              bg-surface/10 dark:bg-surface/15 hover:bg-surface/15 dark:hover:bg-surface/20
                              text-text-secondary transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Help text with single link */}
                    {provider && (
                      <p className="text-sm sm:text-xs text-gray-500 dark:text-gray-400">
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
                  <h3 className="text-base font-medium text-text-primary mb-4 flex items-center gap-2">
                    <Icon name={authMethod === 'oauth' ? 'user' : 'key'} size={18} className="text-gray-400" />
                    <span className={`w-2 h-2 rounded-full ${isChutesSignedIn ? 'bg-green-500' : 'bg-red-500'}`} />
                    {authMethod === 'oauth' ? 'Chutes Account' : authMethod === 'apiKey' ? 'Chutes API Key' : 'Chutes Authentication'}
                  </h3>

                  {chutesLoading ? (
                    <p className="text-sm sm:text-xs text-gray-500 dark:text-gray-400">Checking session...</p>
                  ) : hasBothMethods ? (
                    /* CASE: Both OAuth and API key exist - show toggle */
                    <div className="space-y-4">
                      {/* Auth Method Toggle */}
                      <div className="space-y-2">
                        <p className="text-sm sm:text-xs text-gray-500 dark:text-gray-400">
                          You have both authentication methods available. Choose which to use:
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveMethod('oauth')}
                            className={`px-3 py-2 text-sm rounded-lg border transition-colors text-left
                              ${authMethod === 'oauth'
                                ? 'border-accent bg-accent/10 text-text-primary'
                                : 'border-gray-200 dark:border-gray-700 text-text-secondary hover:bg-surface/5 dark:hover:bg-surface/10'
                              }`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon name="user" size={16} />
                              <span className="font-medium">Account</span>
                            </div>
                            <p className="text-sm sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {chutesUser?.username || chutesUser?.email || 'Signed in'}
                            </p>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveMethod('apiKey')}
                            className={`px-3 py-2 text-sm rounded-lg border transition-colors text-left
                              ${authMethod === 'apiKey'
                                ? 'border-accent bg-accent/10 text-text-primary'
                                : 'border-gray-200 dark:border-gray-700 text-text-secondary hover:bg-surface/5 dark:hover:bg-surface/10'
                              }`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon name="key" size={16} />
                              <span className="font-medium">API Key</span>
                            </div>
                            <p className="text-sm sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {getMaskedApiKey(currentChutesExternalKey || '')}
                            </p>
                          </button>
                        </div>
                      </div>

                      {/* Active method details */}
                      {authMethod === 'oauth' ? (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                          <p className="text-base sm:text-sm text-gray-600 dark:text-gray-300">
                            Using account:{' '}
                            <span className="font-medium text-text-primary">
                              {chutesUser?.username || chutesUser?.name || chutesUser?.email || 'Chutes user'}
                            </span>
                          </p>
                          <button
                            onClick={logout}
                            className="px-4 py-2 text-sm font-medium rounded-lg cursor-pointer
                              bg-surface/10 dark:bg-surface/15 hover:bg-surface/15 dark:hover:bg-surface/20
                              text-text-secondary transition-colors"
                          >
                            Sign out
                          </button>
                        </div>
                      ) : (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                          <div>
                            <input
                              type="password"
                              value={chutesApiKeyInput}
                              onChange={(e) => {
                                setChutesApiKeyInput(e.target.value);
                                setChutesKeyError(null);
                                setChutesKeySuccess(false);
                              }}
                              placeholder="cpk_..."
                              className={`w-full px-3 py-2 text-sm rounded-lg border bg-surface/5 dark:bg-surface/10 text-text-primary placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-secondary dark:focus:border-gray-400 transition-colors
                                ${chutesKeySuccess ? 'border-green-500' : ''}
                                ${chutesKeyError ? 'border-red-500' : ''}
                                ${!chutesKeySuccess && !chutesKeyError ? 'border-gray-300 dark:border-gray-600' : ''}
                              `}
                            />
                            {currentChutesExternalKey && (
                              <p className="mt-1 text-sm sm:text-xs text-gray-500 dark:text-gray-400">
                                Current: {getMaskedApiKey(currentChutesExternalKey)}
                              </p>
                            )}
                            {chutesKeyError && (
                              <p className="mt-1 text-sm sm:text-xs text-red-600 dark:text-red-400">{chutesKeyError}</p>
                            )}
                            {chutesKeySuccess && (
                              <p className="mt-1 text-sm sm:text-xs text-green-600 dark:text-green-400">
                                API key validated successfully!
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveChutesApiKey}
                              disabled={isValidatingChutesKey || !chutesApiKeyInput.trim()}
                              className="px-4 py-2 text-sm font-medium rounded-lg cursor-pointer
                                text-accent bg-accent/10 dark:bg-accent/15 border border-accent/30
                                hover:bg-accent/20 dark:hover:bg-accent/25
                                disabled:text-gray-400 disabled:bg-gray-500/10 disabled:border-gray-400/30
                                disabled:cursor-not-allowed transition-colors"
                            >
                              {isValidatingChutesKey ? 'Validating...' : 'Save Key'}
                            </button>
                            <button
                              onClick={handleClearChutesApiKey}
                              className="px-3 py-2 text-sm font-medium rounded-lg cursor-pointer
                                bg-surface/10 dark:bg-surface/15 hover:bg-surface/15 dark:hover:bg-surface/20
                                text-text-secondary transition-colors"
                            >
                              Clear
                            </button>
                          </div>
                          {showClearChutesKeyConfirm && (
                            <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <p className="text-base sm:text-sm text-text-secondary mb-3">
                                Clear your API key? Account will become the only auth method.
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={confirmClearChutesApiKey}
                                  className="px-4 py-2 text-sm font-medium rounded-lg
                                    text-red-400 bg-red-500/10 dark:bg-red-500/15
                                    border border-red-500/30 hover:bg-red-500/20 dark:hover:bg-red-500/25
                                    transition-colors"
                                >
                                  Clear Key
                                </button>
                                <button
                                  onClick={() => setShowClearChutesKeyConfirm(false)}
                                  className="px-4 py-2 text-sm font-medium rounded-lg
                                    bg-surface/10 dark:bg-surface/15 hover:bg-surface/15 dark:hover:bg-surface/20
                                    text-text-secondary transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : hasApiKey ? (
                    /* CASE: Only API key exists */
                    <div className="space-y-3">
                      <div>
                        <input
                          type="password"
                          value={chutesApiKeyInput}
                          onChange={(e) => {
                            setChutesApiKeyInput(e.target.value);
                            setChutesKeyError(null);
                            setChutesKeySuccess(false);
                          }}
                          placeholder="cpk_..."
                          className={`w-full px-3 py-2 text-sm rounded-lg border
                            bg-surface/5 dark:bg-surface/10
                            text-text-primary
                            placeholder-gray-400 dark:placeholder-gray-500
                            focus:outline-none focus:border-secondary dark:focus:border-gray-400
                            transition-colors
                            ${chutesKeySuccess ? 'border-green-500' : ''}
                            ${chutesKeyError ? 'border-red-500' : ''}
                            ${!chutesKeySuccess && !chutesKeyError ? 'border-gray-300 dark:border-gray-600' : ''}
                          `}
                        />
                        {currentChutesExternalKey && (
                          <p className="mt-1 text-sm sm:text-xs text-gray-500 dark:text-gray-400">
                            Current: {getMaskedApiKey(currentChutesExternalKey)}
                          </p>
                        )}
                        {chutesKeyError && (
                          <p className="mt-1 text-sm sm:text-xs text-red-600 dark:text-red-400">{chutesKeyError}</p>
                        )}
                        {chutesKeySuccess && (
                          <p className="mt-1 text-sm sm:text-xs text-green-600 dark:text-green-400">
                            API key validated successfully!
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveChutesApiKey}
                          disabled={isValidatingChutesKey || !chutesApiKeyInput.trim()}
                          className="px-4 py-2 text-sm font-medium rounded-lg cursor-pointer
                            text-accent bg-accent/10 dark:bg-accent/15 border border-accent/30
                            hover:bg-accent/20 dark:hover:bg-accent/25
                            disabled:text-gray-400 disabled:bg-gray-500/10 disabled:border-gray-400/30
                            disabled:cursor-not-allowed transition-colors"
                        >
                          {isValidatingChutesKey ? 'Validating...' : 'Save Key'}
                        </button>
                        <button
                          onClick={handleClearChutesApiKey}
                          className="px-3 py-2 text-sm font-medium rounded-lg cursor-pointer
                            bg-surface/10 dark:bg-surface/15 hover:bg-surface/15 dark:hover:bg-surface/20
                            text-text-secondary transition-colors"
                        >
                          Clear
                        </button>
                      </div>

                      {showClearChutesKeyConfirm && (
                        <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <p className="text-base sm:text-sm text-text-secondary mb-3">
                            Clear your API key? You&apos;ll need to enter it again to use Chutes.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={confirmClearChutesApiKey}
                              className="px-4 py-2 text-sm font-medium rounded-lg
                                text-red-400 bg-red-500/10 dark:bg-red-500/15
                                border border-red-500/30 hover:bg-red-500/20 dark:hover:bg-red-500/25
                                transition-colors"
                            >
                              Clear Key
                            </button>
                            <button
                              onClick={() => setShowClearChutesKeyConfirm(false)}
                              className="px-4 py-2 text-sm font-medium rounded-lg
                                bg-surface/10 dark:bg-surface/15 hover:bg-surface/15 dark:hover:bg-surface/20
                                text-text-secondary transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      <p className="text-sm sm:text-xs text-gray-500 dark:text-gray-400">
                        Need a key? Go to{' '}
                        <a
                          href="https://chutes.ai"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline"
                        >
                          chutes.ai
                        </a>
                        , create an account, add credits, and grab an API key.
                      </p>

                      {/* OAuth alternative */}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm sm:text-xs text-gray-500 dark:text-gray-400 mb-2">
                          Or sign in with your Chutes account:
                        </p>
                        <a
                          href={loginUrl}
                          className="link-unstyled inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-[#00DC82] text-black hover:bg-[#00c474] transition-colors"
                        >
                          Sign in with Chutes
                        </a>
                      </div>
                    </div>
                  ) : hasOAuthSession ? (
                    /* CASE: Only OAuth exists */
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-base sm:text-sm text-gray-600 dark:text-gray-300">
                          Signed in as{' '}
                          <span className="font-medium text-text-primary">
                            {chutesUser?.username || chutesUser?.name || chutesUser?.email || 'Chutes user'}
                          </span>
                        </p>
                        <button
                          onClick={logout}
                          className="px-4 py-2 text-sm font-medium rounded-lg cursor-pointer
                            bg-surface/10 dark:bg-surface/15 hover:bg-surface/15 dark:hover:bg-surface/20
                            text-text-secondary transition-colors"
                        >
                          Sign out
                        </button>
                      </div>

                      {/* API Key Option */}
                      <div className="pt-4">
                        <button
                          type="button"
                          onClick={() => setShowChutesApiKeySection(!showChutesApiKeySection)}
                          className="flex items-center gap-1 text-base sm:text-sm text-gray-600 dark:text-gray-400 hover:text-text-primary transition-colors"
                        >
                          <Icon
                            name="chevron-down"
                            size={16}
                            className={`transition-transform ${showChutesApiKeySection ? 'rotate-180' : ''}`}
                          />
                          Use API Key instead
                        </button>

                        {showChutesApiKeySection && (
                          <div className="mt-3 space-y-3">
                            <p className="text-sm sm:text-xs text-gray-500 dark:text-gray-400">
                              Add an API key for custom scopes or permissions.
                            </p>
                            <input
                              type="password"
                              value={chutesApiKeyInput}
                              onChange={(e) => {
                                setChutesApiKeyInput(e.target.value);
                                setChutesKeyError(null);
                                setChutesKeySuccess(false);
                              }}
                              placeholder="cpk_..."
                              className={`w-full px-3 py-2 text-sm rounded-lg border bg-surface/5 dark:bg-surface/10 text-text-primary placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-accent transition-colors ${
                                chutesKeyError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                              }`}
                            />
                            {chutesKeyError && (
                              <p className="text-sm sm:text-xs text-red-600 dark:text-red-400">{chutesKeyError}</p>
                            )}
                            {chutesKeySuccess && (
                              <p className="text-sm sm:text-xs text-green-600 dark:text-green-400">API key saved!</p>
                            )}
                            <button
                              onClick={handleSaveChutesApiKey}
                              disabled={isValidatingChutesKey || !chutesApiKeyInput.trim()}
                              className="px-4 py-2 text-sm font-medium rounded-lg cursor-pointer
                                text-accent bg-accent/10 dark:bg-accent/15 border border-accent/30
                                hover:bg-accent/20 dark:hover:bg-accent/25
                                disabled:text-gray-400 disabled:bg-gray-500/10 disabled:border-gray-400/30
                                disabled:cursor-not-allowed transition-colors"
                            >
                              {isValidatingChutesKey ? 'Validating...' : 'Save Key'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* CASE: Not signed in at all */
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <a
                          href={loginUrl}
                          className="link-unstyled inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-[#00DC82] text-black hover:bg-[#00c474] transition-colors"
                        >
                          Sign in with Chutes
                        </a>
                        <p className="text-sm sm:text-xs text-gray-500 dark:text-gray-400">
                          Don&apos;t have an account?{' '}
                          <a
                            href="https://chutes.ai"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline"
                          >
                            Sign up
                          </a>
                        </p>
                      </div>

                      {/* API Key Option */}
                      <div>
                        <button
                          type="button"
                          onClick={() => setShowChutesApiKeySection(!showChutesApiKeySection)}
                          className="flex items-center gap-1 text-base sm:text-sm text-gray-600 dark:text-gray-400 hover:text-text-primary transition-colors"
                        >
                          <Icon
                            name="chevron-down"
                            size={16}
                            className={`transition-transform ${showChutesApiKeySection ? 'rotate-180' : ''}`}
                          />
                          Use API Key instead
                        </button>

                        {showChutesApiKeySection && (
                          <div className="mt-3 space-y-3">
                            <input
                              type="password"
                              value={chutesApiKeyInput}
                              onChange={(e) => {
                                setChutesApiKeyInput(e.target.value);
                                setChutesKeyError(null);
                                setChutesKeySuccess(false);
                              }}
                              placeholder="cpk_..."
                              className={`w-full px-3 py-2 text-sm rounded-lg border bg-surface/5 dark:bg-surface/10 text-text-primary placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-accent transition-colors ${
                                chutesKeyError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                              }`}
                            />
                            {chutesKeyError && (
                              <p className="text-sm sm:text-xs text-red-600 dark:text-red-400">{chutesKeyError}</p>
                            )}
                            {chutesKeySuccess && (
                              <p className="text-sm sm:text-xs text-green-600 dark:text-green-400">API key saved!</p>
                            )}
                            <button
                              onClick={handleSaveChutesApiKey}
                              disabled={isValidatingChutesKey || !chutesApiKeyInput.trim()}
                              className="px-4 py-2 text-sm font-medium rounded-lg cursor-pointer
                                text-accent bg-accent/10 dark:bg-accent/15 border border-accent/30
                                hover:bg-accent/20 dark:hover:bg-accent/25
                                disabled:text-gray-400 disabled:bg-gray-500/10 disabled:border-gray-400/30
                                disabled:cursor-not-allowed transition-colors"
                            >
                              {isValidatingChutesKey ? 'Validating...' : 'Validate & Connect'}
                            </button>
                            <p className="text-sm sm:text-xs text-gray-500 dark:text-gray-400">
                              Get a key at{' '}
                              <a
                                href="https://chutes.ai"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent hover:underline"
                              >
                                chutes.ai
                              </a>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
              </div>

              {/* Model Section - internal divider */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-medium text-text-primary mb-4 flex items-center gap-2">
                <Icon name="cpu" size={18} className="text-gray-400" />
                Model
              </h3>

              <p className="text-sm sm:text-xs text-gray-500 dark:text-gray-400 mb-4">
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
                    <div className="mt-4 pt-4">
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
              </>
              )}
            </div>
          </section>

          {/* Appearance Card */}
          <section className="mb-8">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2 font-title">
                <Icon name="sun" size={20} className="text-accent" />
                Appearance
              </h2>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Choose your preferred color theme.
              </p>

              {mounted && (
                <div className="grid grid-cols-3 gap-2">
                  {(['light', 'dark', 'system'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setTheme(option)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors text-center capitalize
                        ${theme === option
                          ? 'border-accent bg-accent/10 text-text-primary'
                          : 'border-gray-200 dark:border-gray-700 text-text-secondary hover:bg-surface/5 dark:hover:bg-surface/10'
                        }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Icon
                          name={option === 'light' ? 'sun' : option === 'dark' ? 'moon' : 'monitor'}
                          size={16}
                        />
                        <span className="font-medium">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!mounted && (
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="px-3 py-2 h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-surface/5"
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Danger Zone */}
          <section className="mb-8">
            <div className="bg-white dark:bg-gray-800 border border-red-300 dark:border-red-900 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2 font-title">
                <Icon name="alert-triangle" size={20} className="text-red-500" />
                Danger Zone
              </h2>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-sm font-medium text-text-primary">Wipe All Data</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Delete all local data including conversations, settings, and API keys.
                    This action cannot be undone.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWipeDataConfirm(true)}
                  className="px-4 py-2 text-sm font-medium rounded-lg cursor-pointer
                    text-red-600 dark:text-red-400
                    bg-red-500/10 dark:bg-red-500/15
                    border border-red-500/30
                    hover:bg-red-500/20 dark:hover:bg-red-500/25
                    transition-colors whitespace-nowrap"
                >
                  Wipe Data
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Wipe Data Confirmation Dialog */}
      <Dialog.Root open={showWipeDataConfirm} onOpenChange={setShowWipeDataConfirm}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-in fade-in-0 z-50" />
          <Dialog.Content
            className="
              fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              w-full max-w-sm p-6
              bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700
              rounded-xl shadow-xl
              animate-in fade-in-0 zoom-in-95
              z-50
            "
          >
            <Dialog.Title className="text-lg font-semibold text-text-primary">
              Wipe all data?
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This will permanently delete all your conversations, API keys, preferences, and cached data.
              The page will reload after wiping. This action cannot be undone.
            </Dialog.Description>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowWipeDataConfirm(false)}
                className="
                  px-4 py-2
                  text-sm font-medium text-text-primary
                  bg-btn-secondary hover:bg-btn-secondary-hover
                  rounded-lg
                  transition-colors
                "
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="
                  px-4 py-2
                  text-sm font-medium text-white
                  bg-btn-danger hover:bg-btn-danger-hover
                  rounded-lg
                  transition-colors
                "
              >
                Wipe Everything
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
