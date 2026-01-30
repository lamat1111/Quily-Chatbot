/**
 * AI Provider configuration for multi-provider support.
 * Designed to easily add new providers (OpenRouter, Chutes, etc.)
 */

/**
 * Setup step with label and URL for external link
 */
export interface SetupStep {
  label: string;
  url: string;
}

/**
 * AI Provider configuration
 */
export interface AIProvider {
  id: string;
  name: string;
  description: string;
  /** Longer explanation shown during setup for inexperienced users */
  setupDescription?: string;
  status: 'active' | 'coming';
  /** Whether this provider is recommended */
  isRecommended?: boolean;
  /** Authentication type for provider setup */
  authType: 'apiKey' | 'oauth';
  keyPrefix?: string;
  keyPlaceholder?: string;
  storageKey: string;
  setupSteps: SetupStep[];
  /** URL for signing up (used for OAuth providers without setup steps) */
  signupUrl?: string;
  validateKey: (key: string) => Promise<boolean>;
  /** Factory to create the AI SDK provider */
  createProvider: (options: { apiKey?: string; accessToken?: string }) => any;
}

/**
 * Registry of available AI providers
 */
export const PROVIDERS: AIProvider[] = [
  {
    id: 'chutes',
    name: 'Chutes',
    description: 'Decentralized AI on Bittensor. Pay-as-you-go.',
    setupDescription:
      'Your Chutes subscription also gives you access to image generation, video, audio, and more.',
    status: 'active',
    isRecommended: true,
    authType: 'oauth',
    keyPlaceholder: '',
    storageKey: 'chutes-session',
    setupSteps: [],
    signupUrl: 'https://chutes.ai',
    validateKey: async () => true,
    createProvider: ({ accessToken }) => {
      const { createChutes } = require('@chutes-ai/ai-sdk-provider');
      return createChutes({ apiKey: accessToken });
    },
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Centralized API gateway. Pay-as-you-go.',
    setupDescription:
      'Your OpenRouter credits work across many AI apps and services, not just Quily Chat.',
    status: 'active',
    authType: 'apiKey',
    keyPrefix: 'sk-or-',
    keyPlaceholder: 'sk-or-...',
    storageKey: 'openrouter-api-key',
    setupSteps: [
      { label: 'Create account', url: 'https://openrouter.ai' },
      { label: 'Add credits', url: 'https://openrouter.ai/settings/billing' },
      { label: 'Get API key', url: 'https://openrouter.ai/settings/keys' },
    ],
    validateKey: async (apiKey: string) => {
      const res = await fetch('/api/auth/openrouter/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });
      const data = await res.json();
      return data.valid && data.hasCredits;
    },
    createProvider: ({ apiKey }) => {
      const { createOpenRouter } = require('@openrouter/ai-sdk-provider');
      return createOpenRouter({ apiKey });
    },
  },
];

/**
 * Get provider by ID
 */
export function getProvider(id: string): AIProvider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

/**
 * Get all active providers
 */
export function getActiveProviders(): AIProvider[] {
  return PROVIDERS.filter((p) => p.status === 'active');
}

/**
 * Get default provider (first active one)
 */
export function getDefaultProvider(): AIProvider {
  return getActiveProviders()[0] || PROVIDERS[0];
}
