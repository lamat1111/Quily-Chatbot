'use client';

import { useState, useCallback, useEffect } from 'react';
import { PROVIDERS, AIProvider } from '@/src/lib/providers';
import { validateApiKeyWithCredits } from '@/src/lib/openrouter';
import { useChutesSession } from '@/src/hooks/useChutesSession';
import { useChutesModels } from '@/src/hooks/useChutesModels';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';

interface ProviderSetupProps {
  onConnect: (providerId: string, apiKey: string) => void;
}

/**
 * Provider selection and setup flow component.
 * Shows available providers as cards, then expands to setup steps when selected.
 */
export function ProviderSetup({ onConnect }: ProviderSetupProps) {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    isSignedIn,
    user,
    loading: chutesLoading,
    loginUrl,
    logout,
    isAvailable: chutesAvailable,
  } = useChutesSession();
  const [chutesModel, setChutesModel] = useLocalStorage<string>('chutes-model', '');
  const { models: chutesModels } = useChutesModels(
    'llm',
    selectedProvider?.id === 'chutes' && isSignedIn
  );

  useEffect(() => {
    if (selectedProvider?.id === 'chutes' && isSignedIn && !chutesModel && chutesModels.length > 0) {
      setChutesModel(chutesModels[0].id);
    }
  }, [selectedProvider, isSignedIn, chutesModel, chutesModels, setChutesModel]);

  const handleConnect = useCallback(async () => {
    if (!selectedProvider || selectedProvider.authType !== 'apiKey' || !apiKey.trim()) return;

    setIsValidating(true);
    setError(null);

    try {
      // Use enhanced validation for OpenRouter that checks credits
      if (selectedProvider.id === 'openrouter') {
        const result = await validateApiKeyWithCredits(apiKey);

        if (result.valid && result.hasCredits) {
          onConnect(selectedProvider.id, apiKey);
        } else if (result.error === 'invalid_key') {
          if (selectedProvider.keyPrefix && !apiKey.startsWith(selectedProvider.keyPrefix)) {
            setError(
              `API keys should start with "${selectedProvider.keyPrefix}". Check you copied the full key.`
            );
          } else {
            setError('Invalid API key. Please check and try again.');
          }
        } else if (result.error === 'no_credits') {
          setError(
            'Your API key is valid but has no credits. Add at least $5 at OpenRouter to start chatting.'
          );
        } else {
          setError('Could not validate key. Check your connection and try again.');
        }
      } else {
        // Fallback for other providers
        const isValid = await selectedProvider.validateKey(apiKey);
        if (isValid) {
          onConnect(selectedProvider.id, apiKey);
        } else {
          setError('Invalid API key. Please check and try again.');
        }
      }
    } catch {
      setError('Could not validate key. Check your connection and try again.');
    } finally {
      setIsValidating(false);
    }
  }, [selectedProvider, apiKey, onConnect]);

  const handleOAuthConnect = useCallback(() => {
    if (!selectedProvider || selectedProvider.authType !== 'oauth') return;
    if (!isSignedIn) return;
    onConnect(selectedProvider.id, '');
  }, [selectedProvider, onConnect, isSignedIn]);

  const handleBack = useCallback(() => {
    setSelectedProvider(null);
    setApiKey('');
    setError(null);
  }, []);

  // Provider selection view
  if (!selectedProvider) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 sm:p-6">
        {/* App title and description */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2 sm:mb-3">
            Quily Chat
            <sup className="ml-1.5 text-xs sm:text-sm font-medium text-accent">beta</sup>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            Your AI assistant for all things Quilibrium.
            Ask questions about the protocol, documentation, and more.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            Connect an AI Provider
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Choose how you want to access AI models.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PROVIDERS.map((provider) => {
              // Check if this provider is available
              const isChutesUnavailable = provider.id === 'chutes' && !chutesAvailable;
              const isDisabled = provider.status !== 'active' || isChutesUnavailable;

              return (
                <button
                  key={provider.id}
                  onClick={() => !isDisabled && setSelectedProvider(provider)}
                  disabled={isDisabled}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    !isDisabled
                      ? 'border-gray-200 dark:border-gray-600 hover:border-accent dark:hover:border-accent hover:bg-surface/5 dark:hover:bg-surface/10 cursor-pointer'
                      : 'border-gray-100 dark:border-gray-700 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-text-primary">{provider.name}</h3>
                    {provider.status === 'coming' && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                        Coming soon
                      </span>
                    )}
                    {isChutesUnavailable && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                        Unavailable
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isChutesUnavailable
                      ? 'Chutes integration is currently being set up. Check back soon!'
                      : provider.description}
                  </p>
                  {!isDisabled && (
                    <div className="mt-3 text-sm font-medium text-accent">
                      Set up &rarr;
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Provider setup view
  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        {/* Header with back button */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleBack}
            className="p-1 rounded hover:bg-surface/10 dark:hover:bg-surface/15 transition-colors cursor-pointer"
            aria-label="Back to providers"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-text-primary">
            {selectedProvider.name} Setup
          </h2>
        </div>

        {/* Provider explanation for new users */}
        {selectedProvider.setupDescription && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            {selectedProvider.setupDescription}
          </p>
        )}

        {/* Setup steps */}
        {selectedProvider.setupSteps.length > 0 && (
          <div className="space-y-2 mb-6">
            {selectedProvider.setupSteps.map((step, index) => (
              <div key={index} className="text-sm text-gray-600 dark:text-gray-300">
                {index + 1}.{' '}
                <a
                  href={step.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  {step.label} &rarr;
                </a>
              </div>
            ))}
          </div>
        )}

        {selectedProvider.authType === 'apiKey' ? (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-text-primary">
              {selectedProvider.setupSteps.length + 1}. Paste your API key here
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setError(null);
                }}
                placeholder={selectedProvider.keyPlaceholder}
                className={`flex-1 px-4 py-3 text-sm rounded-lg border bg-surface/5 dark:bg-surface/10 text-text-primary placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-accent dark:focus:border-accent transition-colors ${
                  error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              <button
                onClick={handleConnect}
                disabled={isValidating || !apiKey.trim()}
                className="w-full sm:w-auto px-5 py-3 text-sm font-medium rounded-lg cursor-pointer bg-gradient-to-br from-gradient-from to-gradient-to hover:from-gradient-from-hover hover:to-gradient-to-hover text-white disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all"
              >
                {isValidating ? 'Validating...' : 'Connect'}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Stored locally in your browser. We never see your key.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {isSignedIn ? (
              <div className="space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Signed in as{' '}
                  <span className="font-medium text-text-primary">
                    {user?.username || user?.name || user?.email || 'Chutes user'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleOAuthConnect}
                    className="w-full sm:w-auto px-5 py-3 text-sm font-medium rounded-lg cursor-pointer bg-gradient-to-br from-gradient-from to-gradient-to hover:from-gradient-from-hover hover:to-gradient-to-hover text-white transition-all"
                  >
                    Use Chutes
                  </button>
                  <button
                    onClick={logout}
                    disabled={chutesLoading}
                    className="w-full sm:w-auto px-5 py-3 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-text-primary hover:bg-surface/10 dark:hover:bg-surface/15 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <a
                  href={loginUrl}
                  className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-3 text-sm font-medium rounded-lg bg-[#00DC82] text-black hover:bg-[#00c474] transition-colors"
                >
                  Sign in with Chutes
                </a>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  You&apos;ll be redirected to Chutes to sign in securely.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
