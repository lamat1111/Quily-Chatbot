'use client';

import { ChatContainer } from '@/src/components/chat/ChatContainer';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { useConversationStore } from '@/src/stores/conversationStore';
import { RECOMMENDED_MODELS } from '@/src/lib/openrouter';
import { getDefaultProvider } from '@/src/lib/providers';
import { ChatSkeleton } from '@/src/components/ui/Skeleton';

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

  const activeModel = providerId === 'chutes' ? chutesModel : openrouterModel;

  if (!isHydrated) {
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
