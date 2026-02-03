'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Icon } from '@/src/components/ui/Icon';
import { useConversationStore, Conversation } from '@/src/stores/conversationStore';
import { getTimeGroup } from '@/src/lib/utils/time';

interface GroupedResults {
  today: Conversation[];
  past7Days: Conversation[];
  past30Days: Conversation[];
  older: Conversation[];
}

/**
 * Truncate text to max length with ellipsis.
 */
function truncateTitle(title: string, maxLength: number = 40): string {
  if (title.length <= maxLength) return title;
  return title.slice(0, maxLength) + '...';
}

/**
 * Format a timestamp as relative time (e.g., "2h ago", "3d ago")
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return 'now';
  }

  if (diff < hour) {
    const mins = Math.floor(diff / minute);
    return `${mins}m ago`;
  }

  if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours}h ago`;
  }

  const days = Math.floor(diff / day);
  if (days < 30) {
    return `${days}d ago`;
  }

  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

interface SearchResultItemProps {
  conversation: Conversation;
  onSelect: () => void;
  onToggleStarred: () => void;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
}

function SearchResultItem({
  conversation,
  onSelect,
  onToggleStarred,
  onRename,
  onDelete,
}: SearchResultItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(conversation.title);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRenameSubmit = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== conversation.title) {
      onRename(trimmed);
    }
    setIsRenaming(false);
    setRenameValue(conversation.title);
  };

  const handleRenameCancel = () => {
    setIsRenaming(false);
    setRenameValue(conversation.title);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleRenameCancel();
    }
  };

  return (
    <div
      className="
        group relative
        px-4 py-3
        cursor-pointer
        transition-colors
        hover:bg-surface/8 dark:hover:bg-surface/10
        border-b border-surface/10
      "
      onClick={() => !isRenaming && onSelect()}
    >
      <div className="pr-10">
        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <input
              ref={inputRef}
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="
                w-full
                text-sm font-medium
                bg-transparent
                border-b border-text-primary/30
                text-text-primary
                outline-none
                focus:border-text-primary
              "
            />
          ) : (
            <p className="text-base sm:text-sm font-medium text-text-primary truncate">
              {truncateTitle(conversation.title)}
            </p>
          )}
          <p className="text-sm sm:text-xs text-text-muted mt-0.5">
            Last message {formatRelativeTime(conversation.updatedAt)}
          </p>
        </div>
      </div>

      {/* Dropdown menu */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="
                p-1.5 rounded
                text-gray-400 dark:text-gray-500
                hover:text-text-primary
                hover:bg-surface/15 dark:hover:bg-surface/20
                transition-all
              "
              aria-label="Chat options"
            >
              <Icon name="more-horizontal" size={18} />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="
                min-w-40 p-1
                bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700
                rounded-lg shadow-xl
                animate-in fade-in-0 zoom-in-95
                z-50
              "
              sideOffset={5}
              align="end"
            >
              <DropdownMenu.Item
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStarred();
                }}
                className="
                  flex items-center gap-2 px-2 py-1.5
                  text-base sm:text-sm text-text-primary
                  rounded cursor-pointer
                  outline-none
                  hover:bg-surface/10 dark:hover:bg-surface/15
                  focus:bg-surface/10 dark:focus:bg-surface/15
                "
              >
                <Icon
                  name={conversation.starred ? 'lucide:star-off' : 'star'}
                  size={16}
                />
                {conversation.starred ? 'Unstar' : 'Star'}
              </DropdownMenu.Item>

              <DropdownMenu.Item
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRenaming(true);
                }}
                className="
                  flex items-center gap-2 px-2 py-1.5
                  text-base sm:text-sm text-text-primary
                  rounded cursor-pointer
                  outline-none
                  hover:bg-surface/10 dark:hover:bg-surface/15
                  focus:bg-surface/10 dark:focus:bg-surface/15
                "
              >
                <Icon name="edit-2" size={16} />
                Rename
              </DropdownMenu.Item>

              <DropdownMenu.Item
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (deleteConfirm) {
                    onDelete();
                    setDeleteConfirm(false);
                  } else {
                    setDeleteConfirm(true);
                    if (deleteTimeoutRef.current) {
                      clearTimeout(deleteTimeoutRef.current);
                    }
                    deleteTimeoutRef.current = setTimeout(() => {
                      setDeleteConfirm(false);
                    }, 3000);
                  }
                }}
                onSelect={(e) => e.preventDefault()}
                className={`
                  flex items-center gap-2 px-2 py-1.5
                  text-base sm:text-sm
                  rounded cursor-pointer
                  outline-none
                  transition-colors
                  ${deleteConfirm
                    ? 'text-white bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700'
                    : 'text-red-500 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-400/10 focus:bg-red-500/10 dark:focus:bg-red-400/10'
                  }
                `}
              >
                <Icon name="trash-2" size={16} />
                {deleteConfirm ? 'Sure?' : 'Delete'}
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  );
}

/**
 * Mobile search page for finding conversations.
 *
 * Features:
 * - Search by title and message content
 * - Time-based grouping (Today, Past 7 days, Past 30 days, Older)
 * - Three-dot menu for each result (star, rename, delete)
 * - 300ms debounced search
 */
export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const conversations = useConversationStore((s) => s.conversations);
  const hasHydrated = useConversationStore((s) => s._hasHydrated);
  const setActive = useConversationStore((s) => s.setActive);
  const deleteConversation = useConversationStore((s) => s.deleteConversation);
  const toggleStarred = useConversationStore((s) => s.toggleStarred);
  const updateTitle = useConversationStore((s) => s.updateTitle);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // Filter conversations by title and message content
  const filteredConversations = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return conversations;
    }

    const query = debouncedQuery.toLowerCase();

    return conversations.filter((conv) => {
      if (conv.title.toLowerCase().includes(query)) {
        return true;
      }

      const messagesToSearch = conv.messages.slice(0, 100);
      return messagesToSearch.some((msg) =>
        msg.content.toLowerCase().includes(query)
      );
    });
  }, [conversations, debouncedQuery]);

  // Sort: title matches first, then by updatedAt
  const sortedConversations = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return filteredConversations;
    }

    const query = debouncedQuery.toLowerCase();

    return [...filteredConversations].sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(query);
      const bTitle = b.title.toLowerCase().includes(query);

      if (aTitle && !bTitle) return -1;
      if (!aTitle && bTitle) return 1;

      return b.updatedAt - a.updatedAt;
    });
  }, [filteredConversations, debouncedQuery]);

  // Group by time period
  const groupedResults = useMemo((): GroupedResults => {
    const groups: GroupedResults = {
      today: [],
      past7Days: [],
      past30Days: [],
      older: [],
    };

    sortedConversations.forEach((conv) => {
      const group = getTimeGroup(conv.updatedAt);
      switch (group) {
        case 'Today':
          groups.today.push(conv);
          break;
        case 'Past 7 days':
          groups.past7Days.push(conv);
          break;
        case 'Past 30 days':
          groups.past30Days.push(conv);
          break;
        default:
          groups.older.push(conv);
      }
    });

    return groups;
  }, [sortedConversations]);

  // Flat list for counting
  const flatResults = useMemo(() => {
    return [
      ...groupedResults.today,
      ...groupedResults.past7Days,
      ...groupedResults.past30Days,
      ...groupedResults.older,
    ];
  }, [groupedResults]);

  const handleSelect = (conversationId: string) => {
    setActive(conversationId);
    router.push('/');
  };

  const renderGroup = (title: string, items: Conversation[]) => {
    if (items.length === 0) return null;

    return (
      <div key={title}>
        <div className="text-base sm:text-sm text-text-muted uppercase tracking-wide px-4 py-2 font-medium bg-bg-muted sticky top-0">
          {title}
        </div>
        {items.map((conv) => (
          <SearchResultItem
            key={conv.id}
            conversation={conv}
            onSelect={() => handleSelect(conv.id)}
            onToggleStarred={() => toggleStarred(conv.id)}
            onRename={(newTitle) => updateTitle(conv.id, newTitle)}
            onDelete={() => deleteConversation(conv.id)}
          />
        ))}
      </div>
    );
  };

  // Show loading state while hydrating
  if (!hasHydrated) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full">
          <div className="p-4 border-b border-surface/10">
            <div className="h-10 bg-surface/10 rounded-lg animate-pulse" />
          </div>
          <div className="p-4 space-y-2">
            <div className="h-16 bg-surface/10 rounded-lg animate-pulse" />
            <div className="h-16 bg-surface/10 rounded-lg animate-pulse" />
            <div className="h-16 bg-surface/10 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full">
        {/* Page title */}
        <div className="px-4 pt-8 pb-4">
          <h1 className="text-3xl font-bold text-text-primary font-title">
            Chats
          </h1>
        </div>

        {/* Search input */}
        <div className="sticky top-0 bg-bg-base border-b border-surface/10 px-4 py-3 z-10">
          <div className="flex items-center gap-2 bg-surface/10 rounded-lg px-3 py-2 border border-transparent focus-within:border-input-focus focus-within:bg-surface/15 transition-colors">
            <Icon name="search" size={18} className="text-text-muted" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="flex-1 bg-transparent text-base sm:text-sm text-text-primary placeholder-text-muted focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 hover:bg-surface/20 rounded cursor-pointer"
                aria-label="Clear search"
              >
                <Icon name="x" size={16} className="text-text-subtle" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="pb-8">
          {flatResults.length === 0 ? (
            <div className="text-center py-12 text-base sm:text-sm text-text-muted">
              {debouncedQuery ? 'No results found' : 'No conversations yet'}
            </div>
          ) : (
            <>
              {renderGroup('Today', groupedResults.today)}
              {renderGroup('Past 7 days', groupedResults.past7Days)}
              {renderGroup('Past 30 days', groupedResults.past30Days)}
              {renderGroup('Older', groupedResults.older)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
