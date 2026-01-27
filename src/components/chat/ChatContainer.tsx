'use client';

import { useEffect, useCallback, useMemo, useState, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { UIMessage } from '@ai-sdk/react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ProviderSetup } from './ProviderSetup';
import { useConversationStore, Message } from '@/src/stores/conversationStore';

interface ChatContainerProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  model: string;
  conversationId: string | null;
}

/** Debounce delay for store updates during streaming (ms) */
const STORE_UPDATE_DEBOUNCE_MS = 300;

/**
 * Main chat container orchestrating useChat hook with UI components.
 *
 * - Manages chat state via useChat from AI SDK
 * - Syncs messages to conversation store
 * - Handles message submission and streaming
 * - Loads stored messages when switching conversations
 *
 * Note: This component should be rendered with key={conversationId} to force
 * remount when switching conversations, ensuring a clean useChat state.
 */
export function ChatContainer({
  apiKey,
  onApiKeyChange,
  model,
  conversationId,
}: ChatContainerProps) {
  const updateMessages = useConversationStore((state) => state.updateMessages);
  const conversations = useConversationStore((state) => state.conversations);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

  // Debounce ref for store updates
  const storeUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create transport with API endpoint and body parameters
  // Memoize to prevent recreating on every render
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: {
          apiKey,
          model,
        },
      }),
    [apiKey, model]
  );

  // Configure useChat with the transport
  const { messages, status, error, stop, sendMessage, setMessages } = useChat({
    id: conversationId || 'new-chat',
    transport,
  });

  // Load stored messages on mount (component remounts when conversationId changes via key prop)
  useEffect(() => {
    if (hasLoadedInitial) return;
    setHasLoadedInitial(true);

    if (!conversationId) return;

    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation || conversation.messages.length === 0) return;

    // Convert stored Message format to UIMessage format
    const uiMessages: UIMessage[] = conversation.messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      parts: [{ type: 'text', text: msg.content }],
    }));

    // Use setTimeout to ensure useChat has fully initialized
    setTimeout(() => {
      setMessages(uiMessages);
    }, 0);
  }, [conversationId, conversations, setMessages, hasLoadedInitial]);

  // Determine if currently streaming
  const isStreaming = status === 'streaming' || status === 'submitted';

  // Check if API key is provided
  const hasApiKey = apiKey.length > 0;

  // Handle provider connection from setup flow
  const handleProviderConnect = useCallback(
    (_providerId: string, key: string) => {
      onApiKeyChange(key);
    },
    [onApiKeyChange]
  );

  // Handle message submission
  const handleSubmit = useCallback(
    (text: string) => {
      if (!hasApiKey) return;

      sendMessage({
        text,
      });
    },
    [hasApiKey, sendMessage]
  );

  // Handle stop generation
  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  // Global Escape to stop streaming
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (status === 'streaming' || status === 'submitted')) {
        e.preventDefault();
        stop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, stop]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (storeUpdateTimeoutRef.current) {
        clearTimeout(storeUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Sync messages to conversation store when they change (debounced during streaming)
  useEffect(() => {
    if (!conversationId || messages.length === 0) return;

    const doUpdate = () => {
      // Convert UIMessage to store Message format
      const storeMessages: Message[] = messages.map((msg) => {
        // Extract text from parts
        const textContent =
          msg.parts
            ?.filter(
              (part): part is { type: 'text'; text: string } =>
                part.type === 'text'
            )
            .map((part) => part.text)
            .join('') || '';

        return {
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: textContent,
        };
      });

      updateMessages(conversationId, storeMessages);
    };

    if (isStreaming) {
      // During streaming, debounce updates to reduce cascade re-renders
      if (storeUpdateTimeoutRef.current) {
        clearTimeout(storeUpdateTimeoutRef.current);
      }
      storeUpdateTimeoutRef.current = setTimeout(doUpdate, STORE_UPDATE_DEBOUNCE_MS);
    } else {
      // Not streaming - update immediately to ensure final state is saved
      if (storeUpdateTimeoutRef.current) {
        clearTimeout(storeUpdateTimeoutRef.current);
        storeUpdateTimeoutRef.current = null;
      }
      doUpdate();
    }
  }, [conversationId, messages, updateMessages, isStreaming]);

  // Show provider setup when no API key
  if (!hasApiKey) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center overflow-auto">
          <ProviderSetup onConnect={handleProviderConnect} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <MessageList
        messages={messages}
        status={status}
        error={error || null}
        onQuickAction={handleSubmit}
      />

      <ChatInput
        onSubmit={handleSubmit}
        onStop={handleStop}
        isStreaming={isStreaming}
        disabled={!hasApiKey}
      />
    </div>
  );
}
