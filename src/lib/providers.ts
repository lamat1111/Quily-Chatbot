/**
 * AI Provider configuration for multi-provider support.
 * Designed to easily add new providers (OpenRouter, Chutes, etc.)
 */

import { validateApiKey as validateOpenRouterKey } from './openrouter';

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
  /** Authentication type for provider setup */
  authType: 'apiKey' | 'oauth';
  keyPrefix?: string;
  keyPlaceholder?: string;
  storageKey: string;
  setupSteps: SetupStep[];
  validateKey: (key: string) => Promise<boolean>;
  /** Factory to create the AI SDK provider */
  createProvider: (options: { apiKey?: string; accessToken?: string }) => any;
}

/**
 * Registry of available AI providers
 */
export const PROVIDERS: AIProvider[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Pay-as-you-go AI models via API key',
    setupDescription:
      'OpenRouter is a service that gives you access to many AI models with a single API key. You only pay for what you use.',
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
    validateKey: validateOpenRouterKey,
    createProvider: ({ apiKey }) => {
      const { createOpenRouter } = require('@openrouter/ai-sdk-provider');
      return createOpenRouter({ apiKey });
    },
  },
  {
    id: 'chutes',
    name: 'Chutes',
    description: 'Sign in with Chutes to use their AI models',
    setupDescription:
      'Chutes lets you authenticate with OAuth so your app can use AI models without managing API keys.',
    status: 'active',
    authType: 'oauth',
    keyPlaceholder: '',
    storageKey: 'chutes-session',
    setupSteps: [{ label: 'Sign in with Chutes', url: 'https://chutes.ai' }],
    validateKey: async () => true,
    createProvider: ({ accessToken }) => {
      const { createChutes } = require('@chutes-ai/ai-sdk-provider');
      return createChutes({ apiKey: accessToken });
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
