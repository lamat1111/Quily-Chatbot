'use client';

import { useEffect, useCallback, useMemo, useState, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { UIMessage } from '@ai-sdk/react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ChatHeader } from './ChatHeader';
import { ProviderSetup } from './ProviderSetup';
import { ChatSkeleton } from '@/src/components/ui/Skeleton';
import { useConversationStore, Message } from '@/src/stores/conversationStore';
import { useChutesSession } from '@/src/hooks/useChutesSession';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { getChutesExternalApiKey } from '@/src/lib/chutesApiKey';
import type { ThinkingStep } from './ThinkingProcess';

interface ChatContainerProps {
  providerId: string;
  onProviderChange: (providerId: string) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  model: string;
  conversationId: string | null;
}

/** Debounce delay for store updates during streaming (ms) */
const STORE_UPDATE_DEBOUNCE_MS = 300;

/**
 * Status update from the API (matches server-side StatusUpdate).
 * Currently only 'search' step is shown - other steps flash too quickly to be visible.
 */
interface StatusUpdate {
  stepId: 'search';
  label: string;
  description?: string;
  status: 'pending' | 'active' | 'completed';
}

/**
 * Extract database IDs from the last assistant message's sources.
 * Format: "source-1-42" -> 42
 */
function extractPriorityDocIds(messages: UIMessage[]): number[] {
  const lastAssistant = messages.filter((m) => m.role === 'assistant').at(-1);
  if (!lastAssistant?.parts) return [];

  const docIds: number[] = [];
  for (const part of lastAssistant.parts) {
    if (part.type === 'source-url' && 'sourceId' in part) {
      const match = (part.sourceId as string).match(/^source-\d+-(\d+)$/);
      if (match) {
        const dbId = parseInt(match[1], 10);
        if (dbId > 0) docIds.push(dbId);
      }
    }
  }

  return [...new Set(docIds)];
}

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
  providerId,
  onProviderChange,
  apiKey,
  onApiKeyChange,
  model,
  conversationId,
}: ChatContainerProps) {
  const updateMessages = useConversationStore((state) => state.updateMessages);
  const conversations = useConversationStore((state) => state.conversations);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);
  const { isSignedIn: isChutesSignedIn, loading: chutesLoading, authMethod } = useChutesSession();
  const [chutesEmbeddingModel] = useLocalStorage<string>('chutes-embedding-model', '');

  // Thinking process steps state
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);

  // Follow-up questions state (keyed by message ID, but we only need the latest)
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);

  // Get external Chutes API key if available
  const chutesExternalApiKey = useMemo(() => {
    if (providerId !== 'chutes') return null;
    return getChutesExternalApiKey();
  }, [providerId, authMethod]); // Re-compute when authMethod changes

  // Debounce ref for store updates
  const storeUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle status updates from the API stream
  const handleStatusUpdate = useCallback((update: StatusUpdate) => {
    setThinkingSteps((prev) => {
      // Find if this step already exists
      const existingIndex = prev.findIndex((s) => s.id === update.stepId);

      const newStep: ThinkingStep = {
        id: update.stepId,
        label: update.label,
        description: update.description,
        status: update.status,
        icon: 'search', // Only search step is currently used
      };

      if (existingIndex >= 0) {
        // Update existing step
        const updated = [...prev];
        updated[existingIndex] = newStep;
        return updated;
      } else {
        // Add new step
        return [...prev, newStep];
      }
    });
  }, []);

  // Create transport with API endpoint and body parameters
  // Memoize to prevent recreating on every render
  // Uses prepareSendMessagesRequest to extract priority doc IDs from the current message state
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        prepareSendMessagesRequest({ messages: reqMessages }) {
          return {
            body: {
              messages: reqMessages,
              provider: providerId,
              apiKey,
              model,
              embeddingModel: providerId === 'chutes' ? chutesEmbeddingModel : undefined,
              chutesApiKey: chutesExternalApiKey || undefined,
              priorityDocIds: extractPriorityDocIds(reqMessages),
            },
          };
        },
      }),
    [apiKey, model, providerId, chutesEmbeddingModel, chutesExternalApiKey]
  );

  // Handle data parts from the stream (status updates and follow-up questions)
  const handleData = useCallback(
    (dataPart: { type: string; data: unknown }) => {
      // Check if this is a status update
      if (dataPart.type === 'data-status') {
        handleStatusUpdate(dataPart.data as StatusUpdate);
      }
      // Check if this is follow-up questions
      if (dataPart.type === 'data-follow-up') {
        const questions = dataPart.data;
        if (Array.isArray(questions) && questions.every((q) => typeof q === 'string')) {
          setFollowUpQuestions(questions as string[]);
        }
      }
    },
    [handleStatusUpdate]
  );

  // Configure useChat with the transport and data handler
  const { messages, status, error, stop, sendMessage, setMessages } = useChat({
    id: conversationId || 'new-chat',
    transport,
    onData: handleData,
  });

  // Load stored messages on mount (component remounts when conversationId changes via key prop)
  useEffect(() => {
    if (hasLoadedInitial) return;
    setHasLoadedInitial(true);

    if (!conversationId) return;

    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation || conversation.messages.length === 0) return;

    // Convert stored Message format to UIMessage format
    const uiMessages: UIMessage[] = conversation.messages.map((msg) => {
      const parts: UIMessage['parts'] = [{ type: 'text', text: msg.content }];

      // Reconstruct source-url parts if sources were saved
      if (msg.sources && msg.sources.length > 0) {
        for (const source of msg.sources) {
          parts.push({
            type: 'source-url',
            sourceId: source.sourceId,
            url: source.url,
            title: source.title,
          } as UIMessage['parts'][number]);
        }
      }

      return {
        id: msg.id,
        role: msg.role,
        parts,
      };
    });

    // Use setTimeout to ensure useChat has fully initialized
    setTimeout(() => {
      setMessages(uiMessages);
    }, 0);
  }, [conversationId, conversations, setMessages, hasLoadedInitial]);

  // Determine if currently streaming
  const isStreaming = status === 'streaming' || status === 'submitted';

  const hasAccess =
    providerId === 'openrouter'
      ? apiKey.length > 0
      : isChutesSignedIn && Boolean(model);

  // Handle provider connection from setup flow
  const handleProviderConnect = useCallback(
    (nextProviderId: string, key: string) => {
      onProviderChange(nextProviderId);
      if (nextProviderId === 'openrouter') {
        onApiKeyChange(key);
      }
    },
    [onApiKeyChange, onProviderChange]
  );

  // Handle message submission
  const handleSubmit = useCallback(
    (text: string) => {
      if (!hasAccess) return;

      // Clear thinking steps and follow-up questions for new message
      setThinkingSteps([]);
      setFollowUpQuestions([]);

      sendMessage({
        text,
      });
    },
    [hasAccess, sendMessage]
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

        // Extract sources from parts
        const sources = msg.parts
          ?.filter(
            (part): part is { type: 'source-url'; sourceId: string; url: string; title?: string } =>
              part.type === 'source-url'
          )
          .map((part) => ({
            sourceId: part.sourceId,
            url: part.url,
            title: part.title,
          }));

        return {
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: textContent,
          sources: sources && sources.length > 0 ? sources : undefined,
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

  // Show skeleton while Chutes session is loading to prevent flash of ProviderSetup
  if (providerId === 'chutes' && chutesLoading) {
    return <ChatSkeleton />;
  }

  // Show provider setup when no API key
  if (!hasAccess) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center overflow-auto">
          <ProviderSetup onConnect={handleProviderConnect} />
        </div>
      </div>
    );
  }

  // Check if in empty state (no messages and not streaming)
  const isEmpty = messages.length === 0 && !isStreaming;

  // Common input props used in both embedded and bottom positions
  const inputProps = {
    onSubmit: handleSubmit,
    onStop: handleStop,
    isStreaming,
    disabled: !hasAccess || chutesLoading,
    disabledMessage:
      providerId === 'chutes'
        ? isChutesSignedIn
          ? 'Select a Chutes model to start chatting...'
          : 'Sign in with Chutes to start chatting...'
        : 'Enter your API key to start chatting...',
  };

  return (
    <div className="flex flex-col h-full">
      {conversationId && <ChatHeader conversationId={conversationId} />}
      <MessageList
        messages={messages}
        status={status}
        error={error || null}
        onQuickAction={handleSubmit}
        thinkingSteps={thinkingSteps}
        followUpQuestions={followUpQuestions}
        inputProps={isEmpty ? inputProps : undefined}
      />

      {/* Only show bottom input when not in empty state */}
      {!isEmpty && (
        <ChatInput
          onSubmit={inputProps.onSubmit}
          onStop={inputProps.onStop}
          isStreaming={inputProps.isStreaming}
          disabled={inputProps.disabled}
          disabledMessage={inputProps.disabledMessage}
        />
      )}
    </div>
  );
}
