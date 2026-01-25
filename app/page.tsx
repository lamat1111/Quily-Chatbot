'use client';

import { Sidebar } from '@/src/components/sidebar/Sidebar';
import { ChatContainer } from '@/src/components/chat/ChatContainer';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { useConversationStore } from '@/src/stores/conversationStore';
import { RECOMMENDED_MODELS } from '@/src/lib/openrouter';

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
  const [apiKey, , apiKeyHydrated] = useLocalStorage<string>(
    'openrouter-api-key',
    ''
  );
  const [model, , modelHydrated] = useLocalStorage<string>(
    'selected-model',
    RECOMMENDED_MODELS[0].id
  );

  // Active conversation from Zustand store
  const activeId = useConversationStore((state) => state.activeId);
  const hasHydrated = useConversationStore((state) => state._hasHydrated);

  // Wait for all stores to hydrate before rendering
  const isHydrated = apiKeyHydrated && modelHydrated && hasHydrated;

  if (!isHydrated) {
    return (
      <div className="flex h-screen">
        {/* Sidebar skeleton */}
        <div className="hidden lg:block w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="p-4 space-y-4">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="p-4 space-y-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
        {/* Chat area skeleton */}
        <main className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-500 dark:text-gray-400">Loading...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <ChatContainer
          apiKey={apiKey}
          model={model}
          conversationId={activeId}
        />
      </main>
    </div>
  );
}
