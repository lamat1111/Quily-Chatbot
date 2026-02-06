'use client';

import { useEffect, useState, useCallback } from 'react';
import { ChatContainer } from '@/src/components/chat/ChatContainer';
import { Turnstile } from '@/src/components/Turnstile';
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
 *
 * Turnstile bot protection:
 * - Turnstile state lives HERE (not in ChatContainer) so it persists
 *   across chat switches. ChatContainer remounts via key={activeId},
 *   but this page component does not.
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

  // Turnstile bot protection state (lives here to persist across chat switches)
  // - null = waiting for verification (input disabled)
  // - string (even empty) = verified (input enabled)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

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
    <div className="h-full relative">
      {/* Turnstile widget lives here (outside keyed ChatContainer) so it
          persists across chat switches. Uses 'interaction-only' appearance:
          most users never see it. Server sets session cookie after first
          successful verification. */}
      <Turnstile
        onVerify={handleTurnstileVerify}
        onExpire={handleTurnstileExpire}
      />

      <ChatContainer
        key={activeId || 'new-chat'}
        providerId={providerId}
        onProviderChange={setProviderId}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        model={activeModel}
        conversationId={activeId}
        turnstileToken={turnstileToken}
      />
    </div>
  );
}
