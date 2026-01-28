'use client';

import { useConversationStore } from '@/src/stores/conversationStore';
import { Icon } from '@/src/components/ui/Icon';

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

interface ConversationListProps {
  onNavigate?: () => void;
  onScroll?: (scrollTop: number) => void;
}

/**
 * Scrollable conversation history list.
 *
 * Uses Zustand store for conversation state.
 * Waits for hydration before rendering to prevent SSR mismatch.
 * New Chat button and Settings are handled by parent Sidebar component.
 */
export function ConversationList({ onNavigate, onScroll }: ConversationListProps = {}) {
  const conversations = useConversationStore((s) => s.conversations);
  const activeId = useConversationStore((s) => s.activeId);
  const hasHydrated = useConversationStore((s) => s._hasHydrated);
  const setActive = useConversationStore((s) => s.setActive);
  const deleteConversation = useConversationStore((s) => s.deleteConversation);

  // Show skeleton while hydrating
  if (!hasHydrated) {
    return (
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        <div className="h-14 bg-surface/10 dark:bg-surface/15 rounded-lg animate-pulse" />
        <div className="h-14 bg-surface/10 dark:bg-surface/15 rounded-lg animate-pulse" />
        <div className="h-14 bg-surface/10 dark:bg-surface/15 rounded-lg animate-pulse" />
      </div>
    );
  }

  // Sort by updatedAt (newest first)
  const sortedConversations = [...conversations].sort(
    (a, b) => b.updatedAt - a.updatedAt
  );

  return (
    <div
      className="flex-1 overflow-y-auto p-2 space-y-1 sidebar-scrollbar"
      onScroll={(e) => onScroll?.(e.currentTarget.scrollTop)}
    >
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
                    ? 'bg-surface/15 dark:bg-surface/20'
                    : 'hover:bg-surface/8 dark:hover:bg-surface/10'
                }
              `}
              onClick={() => {
                setActive(conversation.id);
                onNavigate?.();
              }}
            >
              <div className="pr-6">
                <p className="text-sm font-medium text-text-primary truncate">
                  {truncateTitle(conversation.title)}
                </p>
              </div>

              {/* Delete button - visible on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conversation.id);
                }}
                style={{ cursor: 'pointer' }}
                className="
                  absolute right-2 top-1/2 -translate-y-1/2
                  p-1.5 rounded
                  text-gray-400 dark:text-gray-500
                  hover:text-red-500 dark:hover:text-red-400
                  hover:bg-surface/15 dark:hover:bg-surface/20
                  opacity-0 group-hover:opacity-100
                  transition-all
                "
                title="Delete conversation"
                aria-label="Delete conversation"
              >
                <Icon name="x" size={16} />
              </button>
            </div>
          ))
        )}
    </div>
  );
}
