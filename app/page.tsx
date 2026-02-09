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
import { useTurnstileSession } from '@/src/hooks/useTurnstileSession';

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
const isFreeMode = process.env.NEXT_PUBLIC_FREE_MODE === 'true';

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

  // Check if user already has a verified Turnstile session cookie.
  // The cookie is HttpOnly so the client can't read it directly.
  const { verified: hasExistingSession, loading: turnstileLoading } = useTurnstileSession();

  // Turnstile bot protection state (lives here to persist across chat switches)
  // - null = waiting for verification (input disabled)
  // - string (even empty) = verified (input enabled)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // When session check confirms existing cookie, skip the widget entirely
  useEffect(() => {
    if (!turnstileLoading && hasExistingSession) {
      setTurnstileToken(''); // empty string = verified (no fresh token needed)
    }
  }, [turnstileLoading, hasExistingSession]);

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

  // In free mode, auto-set provider to chutes
  useEffect(() => {
    if (isFreeMode && isHydrated && providerId !== 'chutes') {
      setProviderId('chutes');
    }
  }, [isHydrated, providerId, setProviderId]);

  // Check which providers have valid credentials
  const hasOpenRouterAccess = apiKey.length > 0;
  const hasChutesAccess = isFreeMode || (isChutesSignedIn && Boolean(chutesModel));

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

  // Show skeleton until localStorage is hydrated, Turnstile session check completes,
  // AND Chutes session check completes. This prevents flash of "Verifying..." or
  // ProviderSetup when returning from OAuth.
  // In free mode, skip waiting for chutesLoading (no OAuth check needed)
  if (!isHydrated || turnstileLoading || (!isFreeMode && providerId === 'chutes' && chutesLoading)) {
    return <ChatSkeleton />;
  }

  return (
    <div className="h-full relative">
      {/* Turnstile widget lives here (outside keyed ChatContainer) so it
          persists across chat switches. Uses 'interaction-only' appearance:
          most users never see it. Server sets session cookie after first
          successful verification. Skip entirely if session cookie exists. */}
      {!hasExistingSession && (
        <Turnstile
          onVerify={handleTurnstileVerify}
          onExpire={handleTurnstileExpire}
        />
      )}

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
