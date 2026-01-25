'use client';

import { useConversationStore } from '@/src/stores/conversationStore';

/**
 * Format timestamp as relative time string.
 * Returns "today", "yesterday", or formatted date.
 */
function formatRelativeTime(timestamp: number): string {
  const now = new Date();
  const date = new Date(timestamp);

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const dateDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (dateDay.getTime() === today.getTime()) {
    return 'today';
  } else if (dateDay.getTime() === yesterday.getTime()) {
    return 'yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
}

/**
 * Truncate text to max length with ellipsis.
 */
function truncateTitle(title: string, maxLength: number = 30): string {
  if (title.length <= maxLength) return title;
  return title.slice(0, maxLength) + '...';
}

/**
 * Conversation history list with new/switch/delete functionality.
 *
 * Uses Zustand store for conversation state.
 * Waits for hydration before rendering to prevent SSR mismatch.
 */
export function ConversationList() {
  const conversations = useConversationStore((s) => s.conversations);
  const activeId = useConversationStore((s) => s.activeId);
  const hasHydrated = useConversationStore((s) => s._hasHydrated);
  const addConversation = useConversationStore((s) => s.addConversation);
  const setActive = useConversationStore((s) => s.setActive);
  const deleteConversation = useConversationStore((s) => s.deleteConversation);

  // Show skeleton while hydrating
  if (!hasHydrated) {
    return (
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    );
  }

  // Sort by updatedAt (newest first)
  const sortedConversations = [...conversations].sort(
    (a, b) => b.updatedAt - a.updatedAt
  );

  const handleNewChat = () => {
    addConversation();
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* New Chat button */}
      <div className="p-2">
        <button
          onClick={handleNewChat}
          style={{ cursor: 'pointer' }}
          className="
            w-full px-4 py-2
            text-sm font-medium text-white
            bg-blue-600 hover:bg-blue-700
            rounded-lg
            transition-colors
            flex items-center justify-center gap-2
          "
        >
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          New Chat
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sortedConversations.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No conversations yet
          </p>
        ) : (
          sortedConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`
                group relative
                px-3 py-2
                rounded-lg
                cursor-pointer
                transition-colors
                ${
                  activeId === conversation.id
                    ? 'bg-gray-200 dark:bg-gray-700'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }
              `}
              onClick={() => setActive(conversation.id)}
            >
              <div className="pr-6">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {truncateTitle(conversation.title)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatRelativeTime(conversation.updatedAt)}
                </p>
              </div>

              {/* Delete button - visible on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conversation.id);
                }}
                className="
                  absolute right-2 top-1/2 -translate-y-1/2
                  p-1 cursor-pointer
                  text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400
                  opacity-0 group-hover:opacity-100
                  transition-opacity
                "
                aria-label="Delete conversation"
              >
                <svg
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
