'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useConversationStore, Message } from '@/src/stores/conversationStore';

interface ChatContainerProps {
  apiKey: string;
  model: string;
  conversationId: string | null;
}

/**
 * Main chat container orchestrating useChat hook with UI components.
 *
 * - Manages chat state via useChat from AI SDK
 * - Syncs messages to conversation store
 * - Handles message submission and streaming
 */
export function ChatContainer({
  apiKey,
  model,
  conversationId,
}: ChatContainerProps) {
  const updateMessages = useConversationStore((state) => state.updateMessages);

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
  const { messages, status, error, stop, sendMessage } = useChat({
    id: conversationId || 'new-chat',
    transport,
  });

  // Determine if currently streaming
  const isStreaming = status === 'streaming' || status === 'submitted';

  // Check if API key is provided
  const hasApiKey = apiKey.length > 0;

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

  // Sync messages to conversation store when they change
  useEffect(() => {
    if (conversationId && messages.length > 0) {
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
    }
  }, [conversationId, messages, updateMessages]);

  return (
    <div className="flex flex-col h-full">
      <MessageList
        messages={messages}
        status={status}
        error={error || null}
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
