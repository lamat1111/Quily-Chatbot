'use client';

import { useEffect } from 'react';
import { ChatContainer } from '@/src/components/chat/ChatContainer';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { useConversationStore } from '@/src/stores/conversationStore';
import { RECOMMENDED_MODELS } from '@/src/lib/openrouter';
import { getDefaultProvider } from '@/src/lib/providers';
import { ChatSkeleton } from '@/src/components/ui/Skeleton';
import { useChutesSession } from '@/src/hooks/useChutesSession';

/**
 * Main chat page integrating sidebar and chat components.
 *
 * Layout: Sidebar (w-72) | Chat (flex-1)
 *
 * State management:
 * - apiKey: useLocalStorage for persistence
 * - model: useLocalStorage for persistence
 * - activeId: Zustand conversation store
 *
 * Hydration:
 * - Shows loading skeleton until both stores hydrated
 * - Prevents hydration mismatch from localStorage values
 */
export default function HomePage() {
  // API key and model from localStorage
  const [providerId, setProviderId, providerHydrated] = useLocalStorage<string>(
    'selected-provider',
    getDefaultProvider().id
  );
  const [apiKey, setApiKey, apiKeyHydrated] = useLocalStorage<string>(
    'openrouter-api-key',
    ''
  );
  const [openrouterModel, , openrouterModelHydrated] = useLocalStorage<string>(
    'openrouter-model',
    RECOMMENDED_MODELS[0].id
  );
  const [chutesModel, , chutesModelHydrated] = useLocalStorage<string>(
    'chutes-model',
    process.env.NEXT_PUBLIC_CHUTES_DEFAULT_MODEL || ''
  );

  // Chutes session state for access checking
  const { isSignedIn: isChutesSignedIn, loading: chutesLoading } = useChutesSession();

  // Active conversation from Zustand store
  const activeId = useConversationStore((state) => state.activeId);
  const hasHydrated = useConversationStore((state) => state._hasHydrated);

  // Wait for all stores to hydrate before rendering
  const isHydrated =
    providerHydrated &&
    apiKeyHydrated &&
    openrouterModelHydrated &&
    chutesModelHydrated &&
    hasHydrated;

  // Check which providers have valid credentials
  const hasOpenRouterAccess = apiKey.length > 0;
  const hasChutesAccess = isChutesSignedIn && Boolean(chutesModel);

  // Auto-fallback: if selected provider has no access but the other does, switch
  useEffect(() => {
    if (!isHydrated || chutesLoading) return;

    const selectedHasAccess =
      providerId === 'openrouter' ? hasOpenRouterAccess : hasChutesAccess;
    const otherHasAccess =
      providerId === 'openrouter' ? hasChutesAccess : hasOpenRouterAccess;

    // If selected provider lacks access but the other one has it, auto-switch
    if (!selectedHasAccess && otherHasAccess) {
      const newProvider = providerId === 'openrouter' ? 'chutes' : 'openrouter';
      setProviderId(newProvider);
    }
  }, [
    isHydrated,
    chutesLoading,
    providerId,
    hasOpenRouterAccess,
    hasChutesAccess,
    setProviderId,
  ]);

  const activeModel = providerId === 'chutes' ? chutesModel : openrouterModel;

  // Show skeleton until localStorage is hydrated AND Chutes session check completes
  // This prevents flash of ProviderSetup when returning from OAuth
  if (!isHydrated || (providerId === 'chutes' && chutesLoading)) {
    return <ChatSkeleton />;
  }

  return (
    <ChatContainer
      key={activeId || 'new-chat'}
      providerId={providerId}
      onProviderChange={setProviderId}
      apiKey={apiKey}
      onApiKeyChange={setApiKey}
      model={activeModel}
      conversationId={activeId}
    />
  );
}
